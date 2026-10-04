"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getEmisorConfig, generarClaveAcceso, generarNumeroComprobante, generarXmlFactura } from "@/lib/sri";

export type FacturaFormState = { error: string };

type LineaInput = { descripcion: string; cantidad: number; precioUnitario: number };

function parseLineas(raw: string): LineaInput[] | null {
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return null;
    return data
      .map((l) => ({
        descripcion: String(l.descripcion ?? "").trim(),
        cantidad: Number(l.cantidad),
        precioUnitario: Number(l.precioUnitario),
      }))
      .filter((l) => l.descripcion && !Number.isNaN(l.cantidad) && !Number.isNaN(l.precioUnitario));
  } catch {
    return null;
  }
}

async function reservarSecuencial(): Promise<string> {
  const count = await prisma.factura.count();
  return String(count + 1);
}

export async function crearFactura(
  _prevState: FacturaFormState,
  formData: FormData
): Promise<FacturaFormState> {
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const ivaPct = Number(formData.get("ivaPct") ?? 15);
  const notas = String(formData.get("notas") ?? "").trim();
  const lineas = parseLineas(String(formData.get("lineasJson") ?? "[]"));

  if (!clienteId) return { error: "Selecciona un cliente" };
  if (!lineas || lineas.length === 0) return { error: "Agrega al menos una línea" };

  const emisor = getEmisorConfig();
  const secuencial = await reservarSecuencial();
  const numero = emisor
    ? generarNumeroComprobante(emisor, secuencial)
    : `000-000-${secuencial.padStart(9, "0")}`;

  const factura = await prisma.factura.create({
    data: {
      numero,
      clienteId,
      ivaPct,
      notas: notas || null,
      lineas: { create: lineas.map((l, orden) => ({ ...l, orden })) },
    },
  });

  revalidatePath("/admin/facturas");
  redirect(`/admin/facturas/${factura.id}`);
}

export async function crearFacturaDesdeCotizacion(cotizacionId: string) {
  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id: cotizacionId },
    include: { lineas: true },
  });
  if (!cotizacion || cotizacion.estado !== "ACEPTADA") return;

  const existente = await prisma.factura.findUnique({ where: { cotizacionId } });
  if (existente) redirect(`/admin/facturas/${existente.id}`);

  const emisor = getEmisorConfig();
  const secuencial = await reservarSecuencial();
  const numero = emisor
    ? generarNumeroComprobante(emisor, secuencial)
    : `000-000-${secuencial.padStart(9, "0")}`;

  const factura = await prisma.factura.create({
    data: {
      numero,
      clienteId: cotizacion.clienteId,
      cotizacionId: cotizacion.id,
      ivaPct: cotizacion.ivaPct,
      lineas: {
        create: cotizacion.lineas.map((l, orden) => ({
          descripcion: l.descripcion,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
          orden,
        })),
      },
    },
  });

  revalidatePath("/admin/facturas");
  redirect(`/admin/facturas/${factura.id}`);
}

export async function generarXmlYClave(id: string) {
  const emisor = getEmisorConfig();
  if (!emisor) {
    return { error: "Configura NETSEG_RUC y los demás datos del emisor en .env antes de generar el XML." };
  }

  const factura = await prisma.factura.findUnique({
    where: { id },
    include: { cliente: true, lineas: true },
  });
  if (!factura || factura.estado !== "BORRADOR") return { error: "" };

  const [, , secuencial] = factura.numero.split("-");
  const claveAcceso = generarClaveAcceso({ fecha: factura.fecha, emisor, secuencial: secuencial ?? "1" });
  const xml = generarXmlFactura({
    claveAcceso,
    numero: factura.numero,
    fecha: factura.fecha,
    emisor,
    cliente: { razonSocial: factura.cliente.razonSocial, ruc: factura.cliente.ruc, direccion: factura.cliente.direccion },
    lineas: factura.lineas.map((l) => ({
      descripcion: l.descripcion,
      cantidad: Number(l.cantidad),
      precioUnitario: Number(l.precioUnitario),
    })),
    ivaPct: Number(factura.ivaPct),
  });

  await prisma.factura.update({
    where: { id },
    data: { claveAcceso, xml, estado: "GENERADA" },
  });

  revalidatePath(`/admin/facturas/${id}`);
  return { error: "" };
}

export async function anularFactura(id: string) {
  await prisma.factura.update({ where: { id }, data: { estado: "ANULADA" } });
  revalidatePath(`/admin/facturas/${id}`);
}

export async function eliminarFactura(id: string) {
  await prisma.factura.delete({ where: { id } });
  revalidatePath("/admin/facturas");
  redirect("/admin/facturas");
}
