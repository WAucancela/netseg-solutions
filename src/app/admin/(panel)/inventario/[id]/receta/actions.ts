"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type MaterialBuscado = {
  id: string;
  nombre: string;
  sku: string | null;
  unidad: string;
  costoUnitario: number | null;
};

export async function buscarMateriales(query: string, excluirId: string): Promise<MaterialBuscado[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  // Cada palabra debe aparecer en algún lado (nombre o sku), en cualquier orden — así
  // "camara hikvision 4mp" encuentra "CAMARA IP TUBO 4MP HIKVISION" aunque no sea sustring literal.
  const palabras = q.split(/\s+/).filter(Boolean);

  const productos = await prisma.productoInventario.findMany({
    where: {
      id: { not: excluirId },
      AND: palabras.map((palabra) => ({
        OR: [{ nombre: { contains: palabra, mode: "insensitive" } }, { sku: { contains: palabra, mode: "insensitive" } }],
      })),
    },
    orderBy: { nombre: "asc" },
    take: 20,
    select: { id: true, nombre: true, sku: true, unidad: true, costoUnitario: true },
  });

  return productos.map((p) => ({ ...p, costoUnitario: p.costoUnitario === null ? null : Number(p.costoUnitario) }));
}

export type RecetaFormState = { error: string };

type MaterialInput = { productoId: string; cantidad: number };
type ServicioInput = { servicioId: string | null; descripcion: string; costo: number };

function parseMateriales(raw: string): MaterialInput[] | null {
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return null;
    return data
      .map((m) => ({ productoId: String(m.productoId ?? ""), cantidad: Number(m.cantidad) }))
      .filter((m) => m.productoId && !Number.isNaN(m.cantidad) && m.cantidad > 0);
  } catch {
    return null;
  }
}

function parseServicios(raw: string): ServicioInput[] | null {
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return null;
    return data
      .map((s) => ({
        servicioId: s.servicioId ? String(s.servicioId) : null,
        descripcion: String(s.descripcion ?? "").trim(),
        costo: Number(s.costo),
      }))
      .filter((s) => s.descripcion && !Number.isNaN(s.costo));
  } catch {
    return null;
  }
}

export async function guardarReceta(
  productoId: string,
  _prevState: RecetaFormState,
  formData: FormData
): Promise<RecetaFormState> {
  const manoObraHorasRaw = String(formData.get("manoObraHoras") ?? "").trim();
  const manoObraTarifaRaw = String(formData.get("manoObraTarifaHora") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();
  const materiales = parseMateriales(String(formData.get("materialesJson") ?? "[]"));
  const servicios = parseServicios(String(formData.get("serviciosJson") ?? "[]"));

  if (materiales === null || servicios === null) {
    return { error: "No se pudo leer los materiales o servicios" };
  }

  const data = {
    manoObraHoras: manoObraHorasRaw === "" ? null : Number(manoObraHorasRaw),
    manoObraTarifaHora: manoObraTarifaRaw === "" ? null : Number(manoObraTarifaRaw),
    notas: notas || null,
  };

  await prisma.$transaction([
    prisma.recetaMaterial.deleteMany({ where: { receta: { productoId } } }),
    prisma.recetaServicio.deleteMany({ where: { receta: { productoId } } }),
    prisma.receta.upsert({
      where: { productoId },
      create: {
        productoId,
        ...data,
        materiales: { create: materiales.map((m, orden) => ({ ...m, orden })) },
        servicios: { create: servicios.map((s, orden) => ({ ...s, orden })) },
      },
      update: {
        ...data,
        materiales: { create: materiales.map((m, orden) => ({ ...m, orden })) },
        servicios: { create: servicios.map((s, orden) => ({ ...s, orden })) },
      },
    }),
  ]);

  revalidatePath(`/admin/inventario/${productoId}/receta`);
  return { error: "" };
}

export type ProducirFormState = { error: string };

export async function producir(
  productoId: string,
  _prevState: ProducirFormState,
  formData: FormData
): Promise<ProducirFormState> {
  const cantidad = Number(formData.get("cantidad") ?? 0);
  if (!cantidad || cantidad <= 0) return { error: "La cantidad a producir debe ser mayor a 0" };

  const receta = await prisma.receta.findUnique({
    where: { productoId },
    include: { materiales: { include: { producto: true } } },
  });
  if (!receta) return { error: "Este producto no tiene una receta definida todavía" };

  const faltante = receta.materiales.find((m) => Number(m.producto.stockActual) < Number(m.cantidad) * cantidad);
  if (faltante) {
    return {
      error: `No hay suficiente stock de "${faltante.producto.nombre}" (necesitas ${Number(faltante.cantidad) * cantidad}, tienes ${Number(faltante.producto.stockActual)})`,
    };
  }

  const producto = await prisma.productoInventario.findUnique({ where: { id: productoId } });

  await prisma.$transaction([
    ...receta.materiales.flatMap((m) => {
      const consumo = Number(m.cantidad) * cantidad;
      return [
        prisma.productoInventario.update({
          where: { id: m.productoId },
          data: { stockActual: { decrement: consumo } },
        }),
        prisma.movimientoInventario.create({
          data: {
            productoId: m.productoId,
            tipo: "SALIDA",
            cantidad: consumo,
            motivo: `Producción de ${producto?.nombre ?? "producto compuesto"}`,
          },
        }),
      ];
    }),
    prisma.productoInventario.update({
      where: { id: productoId },
      data: { stockActual: { increment: cantidad } },
    }),
    prisma.movimientoInventario.create({
      data: { productoId, tipo: "ENTRADA", cantidad, motivo: "Producción (ensamblado desde receta)" },
    }),
  ]);

  revalidatePath(`/admin/inventario/${productoId}`);
  revalidatePath(`/admin/inventario/${productoId}/receta`);
  revalidatePath("/admin/inventario");
  return { error: "" };
}
