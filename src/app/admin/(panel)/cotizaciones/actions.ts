"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EstadoCotizacion, Prisma } from "@/generated/prisma/client";
import { parseCronograma } from "@/lib/cronograma";

export type CotizacionFormState = { error: string };

type LineaInput = { categoria: string | null; descripcion: string; cantidad: number; unidad: string; precioUnitario: number };

async function siguienteNumero(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `COT-${year}-`;
  // Varias filas pueden compartir numero (distintas versiones), así que se cuenta numero
  // distinto, no filas — de lo contrario el correlativo se adelanta de más.
  const distintos = await prisma.cotizacion.findMany({
    where: { numero: { startsWith: prefix } },
    distinct: ["numero"],
    select: { numero: true },
  });
  return `${prefix}${String(distintos.length + 1).padStart(4, "0")}`;
}

function parseLineas(raw: string): LineaInput[] | null {
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return null;
    return data
      .map((l) => ({
        categoria: String(l.categoria ?? "").trim() || null,
        descripcion: String(l.descripcion ?? "").trim(),
        cantidad: Number(l.cantidad),
        unidad: String(l.unidad ?? "u").trim() || "u",
        precioUnitario: Number(l.precioUnitario),
      }))
      .filter((l) => l.descripcion && !Number.isNaN(l.cantidad) && !Number.isNaN(l.precioUnitario));
  } catch {
    return null;
  }
}

export async function guardarCotizacion(
  id: string | null,
  _prevState: CotizacionFormState,
  formData: FormData
): Promise<CotizacionFormState> {
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const fechaRaw = String(formData.get("fecha") ?? "").trim();
  const validaHastaRaw = String(formData.get("validaHasta") ?? "").trim();
  const ivaPct = Number(formData.get("ivaPct") ?? 15);
  const margenRaw = String(formData.get("margenAplicadoPct") ?? "").trim();
  const estado = String(formData.get("estado") ?? "BORRADOR") as EstadoCotizacion;
  const proyecto = String(formData.get("proyecto") ?? "").trim();
  const ubicacion = String(formData.get("ubicacion") ?? "").trim();
  const resumenEjecutivo = String(formData.get("resumenEjecutivo") ?? "").trim();
  const tiempoEjecucion = String(formData.get("tiempoEjecucion") ?? "").trim();
  const validezOferta = String(formData.get("validezOferta") ?? "").trim();
  const criterioCalculo = String(formData.get("criterioCalculo") ?? "").trim();
  const notasTerminos = String(formData.get("notasTerminos") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();
  const lineas = parseLineas(String(formData.get("lineasJson") ?? "[]"));
  let cronogramaCrudo: unknown = [];
  try {
    cronogramaCrudo = JSON.parse(String(formData.get("cronogramaJson") ?? "[]"));
  } catch {
    cronogramaCrudo = [];
  }
  const cronograma = parseCronograma(cronogramaCrudo);

  if (!clienteId) return { error: "Selecciona un cliente" };
  if (!lineas || lineas.length === 0) return { error: "Agrega al menos una línea con descripción, cantidad y precio" };

  const data = {
    clienteId,
    fecha: fechaRaw === "" ? new Date() : new Date(fechaRaw),
    validaHasta: validaHastaRaw === "" ? null : new Date(validaHastaRaw),
    ivaPct,
    margenAplicadoPct: margenRaw === "" ? null : Number(margenRaw),
    estado,
    proyecto: proyecto || null,
    ubicacion: ubicacion || null,
    resumenEjecutivo: resumenEjecutivo || null,
    tiempoEjecucion: tiempoEjecucion || null,
    validezOferta: validezOferta || null,
    criterioCalculo: criterioCalculo || null,
    notasTerminos: notasTerminos || null,
    cronogramaJson: cronograma.length > 0 ? cronograma : Prisma.JsonNull,
    notas: notas || null,
  };

  if (!id) {
    const numero = await siguienteNumero();
    const creada = await prisma.cotizacion.create({
      data: { ...data, numero, version: 1, lineas: { create: lineas.map((l, orden) => ({ ...l, orden })) } },
    });
    revalidatePath("/admin/cotizaciones");
    redirect(`/admin/cotizaciones/${creada.id}`);
  }

  const actual = await prisma.cotizacion.findUnique({ where: { id } });
  if (!actual) return { error: "Cotización no encontrada" };

  if (actual.estado === "BORRADOR") {
    // Todavía no se envió a nadie: se edita en el mismo registro, sin versionar.
    await prisma.$transaction([
      prisma.lineaCotizacion.deleteMany({ where: { cotizacionId: id } }),
      prisma.cotizacion.update({
        where: { id },
        data: { ...data, lineas: { create: lineas.map((l, orden) => ({ ...l, orden })) } },
      }),
    ]);
    revalidatePath("/admin/cotizaciones");
    revalidatePath(`/admin/cotizaciones/${id}`);
    redirect(`/admin/cotizaciones/${id}`);
  }

  // Ya se envió/aceptó/etc.: la fila actual queda congelada tal cual, y se crea una versión nueva.
  const origenId = actual.cotizacionOrigenId ?? actual.id;
  const maxVersion = await prisma.cotizacion.aggregate({
    where: { OR: [{ id: origenId }, { cotizacionOrigenId: origenId }] },
    _max: { version: true },
  });
  const nuevaVersion = (maxVersion._max.version ?? actual.version) + 1;

  const nueva = await prisma.cotizacion.create({
    data: {
      ...data,
      numero: actual.numero,
      version: nuevaVersion,
      cotizacionOrigenId: origenId,
      lineas: { create: lineas.map((l, orden) => ({ ...l, orden })) },
    },
  });

  revalidatePath("/admin/cotizaciones");
  redirect(`/admin/cotizaciones/${nueva.id}`);
}

export async function eliminarCotizacion(id: string) {
  await prisma.cotizacion.delete({ where: { id } });
  revalidatePath("/admin/cotizaciones");
  redirect("/admin/cotizaciones");
}

export type PlantillaFormState = { error: string };

export async function guardarPlantillaTerminos(_prevState: PlantillaFormState, formData: FormData): Promise<PlantillaFormState> {
  const empresaNombre = String(formData.get("empresaNombre") ?? "").trim();
  const empresaTagline = String(formData.get("empresaTagline") ?? "").trim();
  const empresaContacto = String(formData.get("empresaContacto") ?? "").trim();
  const empresaCiudad = String(formData.get("empresaCiudad") ?? "").trim();
  const garantiaTexto = String(formData.get("garantiaTexto") ?? "").trim();
  const formaPagoTexto = String(formData.get("formaPagoTexto") ?? "").trim();
  const requisitosTexto = String(formData.get("requisitosTexto") ?? "").trim();
  const alcanceTexto = String(formData.get("alcanceTexto") ?? "").trim();

  if (!empresaNombre) return { error: "El nombre de la empresa es obligatorio" };

  const data = { empresaNombre, empresaTagline, empresaContacto, empresaCiudad, garantiaTexto, formaPagoTexto, requisitosTexto, alcanceTexto };

  await prisma.configuracion.upsert({
    where: { id: "global" },
    create: { id: "global", ...data },
    update: data,
  });

  revalidatePath("/admin/cotizaciones");
  return { error: "" };
}
