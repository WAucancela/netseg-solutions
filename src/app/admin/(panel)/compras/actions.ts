"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EstadoOrdenCompra } from "@/generated/prisma/client";

export type CompraFormState = { error: string };

type LineaInput = { productoId: string; cantidad: number; costoUnitario: number };

async function siguienteNumero(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `OC-${year}-`;
  const count = await prisma.ordenCompra.count({ where: { numero: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

function parseLineas(raw: string): LineaInput[] | null {
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return null;
    return data
      .map((l) => ({
        productoId: String(l.productoId ?? ""),
        cantidad: Number(l.cantidad),
        costoUnitario: Number(l.costoUnitario),
      }))
      .filter((l) => l.productoId && !Number.isNaN(l.cantidad) && l.cantidad > 0 && !Number.isNaN(l.costoUnitario));
  } catch {
    return null;
  }
}

export async function guardarCompra(
  id: string | null,
  _prevState: CompraFormState,
  formData: FormData
): Promise<CompraFormState> {
  const proveedorId = String(formData.get("proveedorId") ?? "").trim();
  const fechaRaw = String(formData.get("fecha") ?? "").trim();
  const estado = String(formData.get("estado") ?? "BORRADOR") as EstadoOrdenCompra;
  const notas = String(formData.get("notas") ?? "").trim();
  const lineas = parseLineas(String(formData.get("lineasJson") ?? "[]"));

  if (!proveedorId) return { error: "Selecciona un proveedor" };
  if (!lineas || lineas.length === 0) return { error: "Agrega al menos una línea con producto, cantidad y costo" };

  const data = {
    proveedorId,
    fecha: fechaRaw === "" ? new Date() : new Date(fechaRaw),
    estado,
    notas: notas || null,
  };

  let ordenId = id;
  if (id) {
    await prisma.$transaction([
      prisma.ordenCompraLinea.deleteMany({ where: { ordenCompraId: id } }),
      prisma.ordenCompra.update({
        where: { id },
        data: { ...data, lineas: { create: lineas.map((l, orden) => ({ ...l, orden })) } },
      }),
    ]);
  } else {
    const numero = await siguienteNumero();
    const creada = await prisma.ordenCompra.create({
      data: { ...data, numero, lineas: { create: lineas.map((l, orden) => ({ ...l, orden })) } },
    });
    ordenId = creada.id;
  }

  revalidatePath("/admin/compras");
  redirect(`/admin/compras/${ordenId}`);
}

export async function eliminarCompra(id: string) {
  await prisma.ordenCompra.delete({ where: { id } });
  revalidatePath("/admin/compras");
  redirect("/admin/compras");
}

export async function marcarRecibida(id: string) {
  const orden = await prisma.ordenCompra.findUnique({ where: { id }, include: { lineas: true } });
  if (!orden || orden.estado === "RECIBIDA") return;

  await prisma.$transaction([
    ...orden.lineas.flatMap((l) => [
      prisma.productoInventario.update({
        where: { id: l.productoId },
        data: { stockActual: { increment: l.cantidad } },
      }),
      prisma.movimientoInventario.create({
        data: {
          productoId: l.productoId,
          tipo: "ENTRADA",
          cantidad: l.cantidad,
          motivo: "Recepción de orden de compra",
          referencia: orden.numero,
        },
      }),
    ]),
    prisma.ordenCompra.update({ where: { id }, data: { estado: "RECIBIDA" } }),
  ]);

  revalidatePath(`/admin/compras/${id}`);
  revalidatePath("/admin/inventario");
}
