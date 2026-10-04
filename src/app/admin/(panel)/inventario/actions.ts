"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { TipoProductoInventario } from "@/generated/prisma/client";
import { inferirCategoria } from "@/lib/taxonomia";
import { parseCsv } from "@/lib/csv";

export type ProductoFormState = { error: string };

const IMAGEN_MAX_BYTES = 5 * 1024 * 1024;

export async function guardarProducto(
  id: string | null,
  _prevState: ProductoFormState,
  formData: FormData
): Promise<ProductoFormState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const unidad = String(formData.get("unidad") ?? "unidad").trim();
  const tipo = String(formData.get("tipo") ?? "SIMPLE") as TipoProductoInventario;
  const stockMinimoRaw = String(formData.get("stockMinimo") ?? "0").trim();
  const costoUnitarioRaw = String(formData.get("costoUnitario") ?? "").trim();
  const margenPctRaw = String(formData.get("margenPct") ?? "").trim();
  const proveedorId = String(formData.get("proveedorId") ?? "").trim();
  const imagenFile = formData.get("imagen");
  const quitarImagen = formData.get("quitarImagen") === "on";

  if (!nombre || !categoria) return { error: "Nombre y categoría son obligatorios" };

  let nuevaImagenUrl: string | null | undefined;

  if (imagenFile instanceof File && imagenFile.size > 0) {
    if (!imagenFile.type.startsWith("image/")) {
      return { error: "El archivo de imagen debe ser una imagen (JPG, PNG, WEBP...)" };
    }
    if (imagenFile.size > IMAGEN_MAX_BYTES) {
      return { error: "La imagen no puede superar los 5 MB" };
    }
    const ext = imagenFile.name.includes(".") ? imagenFile.name.split(".").pop() : "jpg";
    const blob = await put(`productos/${randomUUID()}.${ext}`, imagenFile, {
      access: "public",
      addRandomSuffix: false,
    });
    nuevaImagenUrl = blob.url;
  } else if (quitarImagen) {
    nuevaImagenUrl = null;
  }

  const data = {
    nombre,
    categoria,
    sku: sku || null,
    unidad: unidad || "unidad",
    tipo,
    stockMinimo: stockMinimoRaw === "" ? 0 : Number(stockMinimoRaw),
    costoUnitario: costoUnitarioRaw === "" ? null : Number(costoUnitarioRaw),
    margenPct: margenPctRaw === "" ? null : Number(margenPctRaw),
    proveedorId: proveedorId || null,
    ...(nuevaImagenUrl !== undefined ? { imagenUrl: nuevaImagenUrl } : {}),
  };

  try {
    let productoId = id;
    let imagenAnterior: string | null = null;
    if (id) {
      if (nuevaImagenUrl !== undefined) {
        const actual = await prisma.productoInventario.findUnique({ where: { id }, select: { imagenUrl: true } });
        imagenAnterior = actual?.imagenUrl ?? null;
      }
      await prisma.productoInventario.update({ where: { id }, data });
    } else {
      const creado = await prisma.productoInventario.create({ data });
      productoId = creado.id;
    }
    if (imagenAnterior && imagenAnterior !== nuevaImagenUrl) {
      await del(imagenAnterior).catch(() => {});
    }
    revalidatePath("/admin/inventario");
    redirect(`/admin/inventario/${productoId}`);
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { error: "Ya existe un producto con ese SKU" };
    }
    throw e;
  }
}

export async function eliminarProducto(id: string) {
  const producto = await prisma.productoInventario.delete({ where: { id } });
  if (producto.imagenUrl) {
    await del(producto.imagenUrl).catch(() => {});
  }
  revalidatePath("/admin/inventario");
  redirect("/admin/inventario");
}

export type AjusteFormState = { error: string };

export async function ajustarStock(
  productoId: string,
  _prevState: AjusteFormState,
  formData: FormData
): Promise<AjusteFormState> {
  const tipo = String(formData.get("tipo") ?? "AJUSTE") as "ENTRADA" | "SALIDA" | "AJUSTE";
  const cantidad = Number(formData.get("cantidad") ?? 0);
  const motivo = String(formData.get("motivo") ?? "").trim();

  if (!cantidad || cantidad <= 0) return { error: "La cantidad debe ser mayor a 0" };

  const delta = tipo === "SALIDA" ? -cantidad : cantidad;

  await prisma.$transaction([
    prisma.productoInventario.update({
      where: { id: productoId },
      data: { stockActual: { increment: delta } },
    }),
    prisma.movimientoInventario.create({
      data: { productoId, tipo, cantidad, motivo: motivo || null },
    }),
  ]);

  revalidatePath(`/admin/inventario/${productoId}`);
  revalidatePath("/admin/inventario");
  return { error: "" };
}

export type ImportarFormState = { mensaje: string; errores: string[] };

export async function importarProductos(
  _prevState: ImportarFormState,
  formData: FormData
): Promise<ImportarFormState> {
  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { mensaje: "", errores: ["Selecciona un archivo CSV"] };
  }

  const texto = await archivo.text();
  const filas = parseCsv(texto);
  if (filas.length < 2) {
    return { mensaje: "", errores: ["El archivo está vacío o solo tiene encabezados"] };
  }

  const headers = filas[0].map((h) => h.trim().toLowerCase());
  const col = (nombre: string) => headers.indexOf(nombre);
  const iNombre = col("nombre");
  const iCategoria = col("categoria");
  if (iNombre === -1 || iCategoria === -1) {
    return { mensaje: "", errores: ['El archivo debe tener al menos las columnas "nombre" y "categoria"'] };
  }
  const iSku = col("sku");
  const iUnidad = col("unidad");
  const iTipo = col("tipo");
  const iStockActual = col("stockactual");
  const iStockMinimo = col("stockminimo");
  const iCosto = col("costounitario");
  const iProveedor = col("proveedor");

  type FilaValida = {
    sku: string | null;
    nombre: string;
    categoria: string;
    unidad: string;
    tipo: TipoProductoInventario;
    stockActual: number;
    stockMinimo: number;
    costoUnitario: number | null;
    proveedorNombre: string | null;
  };

  const errores: string[] = [];
  const validas: FilaValida[] = [];
  let categoriaAproximada = 0;

  for (let f = 1; f < filas.length; f++) {
    const fila = filas[f];
    if (fila.length === 0 || fila.every((c) => c.trim() === "")) continue;
    const numLinea = f + 1;

    const nombre = (fila[iNombre] ?? "").trim();
    const categoriaRaw = (fila[iCategoria] ?? "").trim();
    if (!nombre || !categoriaRaw) {
      errores.push(`Línea ${numLinea}: falta nombre o categoría`);
      continue;
    }

    // Nunca rechaza por categoría: si no coincide exacto con nuestro catálogo, la aproxima
    // por palabra clave (ver inferirCategoria) y en el peor caso cae en "Otro".
    const categoria = inferirCategoria(categoriaRaw);
    if (categoria === "OTR" && categoriaRaw.toLowerCase() !== "otro" && categoriaRaw.toLowerCase() !== "otros") {
      categoriaAproximada++;
    }

    const sku = iSku === -1 ? "" : (fila[iSku] ?? "").trim();
    const unidad = iUnidad === -1 ? "" : (fila[iUnidad] ?? "").trim();
    const tipoRaw = iTipo === -1 ? "" : (fila[iTipo] ?? "").trim().toUpperCase();
    const tipo: TipoProductoInventario = tipoRaw === "COMPUESTO" ? "COMPUESTO" : "SIMPLE";
    const costoRaw = iCosto === -1 ? "" : (fila[iCosto] ?? "").trim();
    const stockMinimoRaw = iStockMinimo === -1 ? "" : (fila[iStockMinimo] ?? "").trim();
    const stockActualRaw = iStockActual === -1 ? "" : (fila[iStockActual] ?? "").trim();
    const proveedorRaw = iProveedor === -1 ? "" : (fila[iProveedor] ?? "").trim();

    if (costoRaw && Number.isNaN(Number(costoRaw))) {
      errores.push(`Línea ${numLinea}: costo unitario inválido`);
      continue;
    }
    if (stockMinimoRaw && Number.isNaN(Number(stockMinimoRaw))) {
      errores.push(`Línea ${numLinea}: stock mínimo inválido`);
      continue;
    }
    if (stockActualRaw && Number.isNaN(Number(stockActualRaw))) {
      errores.push(`Línea ${numLinea}: stock actual inválido`);
      continue;
    }

    validas.push({
      sku: sku || null,
      nombre,
      categoria,
      unidad: unidad || "unidad",
      tipo,
      stockActual: stockActualRaw === "" ? 0 : Number(stockActualRaw),
      stockMinimo: stockMinimoRaw === "" ? 0 : Number(stockMinimoRaw),
      costoUnitario: costoRaw === "" ? null : Number(costoRaw),
      proveedorNombre: proveedorRaw || null,
    });
  }

  if (validas.length === 0) {
    return { mensaje: "", errores: errores.length ? errores : ["No se encontraron filas válidas para importar"] };
  }

  // Proveedores: crea automáticamente los que vengan en el archivo y no existan todavía,
  // en vez de descartar la referencia (evita cientos de avisos repetidos en archivos grandes).
  const nombresProveedor = [...new Set(validas.map((f) => f.proveedorNombre).filter((n): n is string => !!n))];
  const proveedoresExistentes = await prisma.proveedor.findMany({
    where: { nombre: { in: nombresProveedor } },
    select: { id: true, nombre: true },
  });
  const proveedorPorNombre = new Map(proveedoresExistentes.map((p) => [p.nombre.toLowerCase(), p.id]));
  const porCrear = nombresProveedor.filter((n) => !proveedorPorNombre.has(n.toLowerCase()));
  if (porCrear.length > 0) {
    await prisma.proveedor.createMany({
      data: porCrear.map((nombre) => ({ nombre })),
      skipDuplicates: true,
    });
    const nuevos = await prisma.proveedor.findMany({
      where: { nombre: { in: porCrear } },
      select: { id: true, nombre: true },
    });
    for (const p of nuevos) proveedorPorNombre.set(p.nombre.toLowerCase(), p.id);
  }

  // Divide en crear/actualizar con UNA consulta (no una por fila) para soportar archivos de
  // miles de líneas sin agotar el tiempo de una transacción interactiva.
  const skusDelArchivo = validas.map((f) => f.sku).filter((s): s is string => !!s);
  const existentes =
    skusDelArchivo.length > 0
      ? await prisma.productoInventario.findMany({
          where: { sku: { in: skusDelArchivo } },
          select: { id: true, sku: true },
        })
      : [];
  const idPorSku = new Map(existentes.map((p) => [p.sku as string, p.id]));

  const paraCrear = validas.filter((f) => !f.sku || !idPorSku.has(f.sku));
  const paraActualizar = validas.filter((f) => f.sku && idPorSku.has(f.sku));

  const nuevosConId = paraCrear.map((f) => ({ ...f, id: randomUUID() }));

  if (nuevosConId.length > 0) {
    await prisma.productoInventario.createMany({
      data: nuevosConId.map((f) => ({
        id: f.id,
        sku: f.sku,
        nombre: f.nombre,
        categoria: f.categoria,
        unidad: f.unidad,
        tipo: f.tipo,
        stockActual: f.stockActual,
        stockMinimo: f.stockMinimo,
        costoUnitario: f.costoUnitario,
        proveedorId: f.proveedorNombre ? (proveedorPorNombre.get(f.proveedorNombre.toLowerCase()) ?? null) : null,
      })),
      skipDuplicates: true,
    });

    const conStockInicial = nuevosConId.filter((f) => f.stockActual > 0);
    if (conStockInicial.length > 0) {
      await prisma.movimientoInventario.createMany({
        data: conStockInicial.map((f) => ({
          productoId: f.id,
          tipo: "ENTRADA" as const,
          cantidad: f.stockActual,
          motivo: "Carga inicial por importación",
        })),
      });
    }
  }

  const CONCURRENCIA = 20;
  for (let i = 0; i < paraActualizar.length; i += CONCURRENCIA) {
    const lote = paraActualizar.slice(i, i + CONCURRENCIA);
    await Promise.all(
      lote.map((f) =>
        prisma.productoInventario.update({
          where: { id: idPorSku.get(f.sku as string)! },
          data: {
            nombre: f.nombre,
            categoria: f.categoria,
            unidad: f.unidad,
            tipo: f.tipo,
            stockMinimo: f.stockMinimo,
            costoUnitario: f.costoUnitario,
            proveedorId: f.proveedorNombre ? (proveedorPorNombre.get(f.proveedorNombre.toLowerCase()) ?? null) : null,
          },
        })
      )
    );
  }

  if (categoriaAproximada > 0) {
    errores.push(
      `${categoriaAproximada} producto(s) se cargaron con categoría "Otro" porque su categoría original del archivo no tiene equivalente exacto en el sistema — puedes reclasificarlos luego desde su ficha.`
    );
  }

  revalidatePath("/admin/inventario");
  return {
    mensaje: `Importación completa: ${nuevosConId.length} producto(s) creado(s), ${paraActualizar.length} actualizado(s).`,
    errores,
  };
}

export type MargenFormState = { error: string };

export async function guardarMargenDefault(
  _prevState: MargenFormState,
  formData: FormData
): Promise<MargenFormState> {
  const margenRaw = String(formData.get("margenDefaultPct") ?? "").trim();
  const margen = Number(margenRaw);
  if (margenRaw === "" || Number.isNaN(margen) || margen < 0) {
    return { error: "El margen debe ser un número mayor o igual a 0" };
  }

  await prisma.configuracion.upsert({
    where: { id: "global" },
    create: { id: "global", margenDefaultPct: margen },
    update: { margenDefaultPct: margen },
  });

  revalidatePath("/admin/inventario");
  return { error: "" };
}
