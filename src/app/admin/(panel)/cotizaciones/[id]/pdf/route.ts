import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { parseCronograma } from "@/lib/cronograma";
import { CotizacionPdf, type CotizacionPdfData } from "../cotizacion-pdf";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [cotizacion, configuracion] = await Promise.all([
    prisma.cotizacion.findUnique({
      where: { id },
      include: { cliente: true, lineas: { orderBy: { orden: "asc" } } },
    }),
    prisma.configuracion.findUnique({ where: { id: "global" } }),
  ]);

  if (!cotizacion) {
    return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
  }

  const data: CotizacionPdfData = {
    numero: cotizacion.numero,
    version: cotizacion.version,
    fecha: cotizacion.fecha.toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" }),
    validaHasta: cotizacion.validaHasta
      ? cotizacion.validaHasta.toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" })
      : null,
    ivaPct: Number(cotizacion.ivaPct),
    proyecto: cotizacion.proyecto,
    ubicacion: cotizacion.ubicacion,
    resumenEjecutivo: cotizacion.resumenEjecutivo,
    tiempoEjecucion: cotizacion.tiempoEjecucion,
    validezOferta: cotizacion.validezOferta,
    criterioCalculo: cotizacion.criterioCalculo,
    notasTerminos: cotizacion.notasTerminos,
    cronograma: parseCronograma(cotizacion.cronogramaJson),
    lineas: cotizacion.lineas.map((l) => ({
      categoria: l.categoria,
      descripcion: l.descripcion,
      cantidad: Number(l.cantidad),
      unidad: l.unidad,
      precioUnitario: Number(l.precioUnitario),
    })),
    cliente: {
      razonSocial: cotizacion.cliente.razonSocial,
      nombreComercial: cotizacion.cliente.nombreComercial,
      direccion: cotizacion.cliente.direccion,
    },
    empresa: {
      nombre: configuracion?.empresaNombre ?? "NETSEG SOLUTIONS",
      tagline: configuracion?.empresaTagline ?? "Seguridad electrónica · Infraestructura de redes · Domótica",
      contacto: configuracion?.empresaContacto ?? "info@netsegsolutions.ec",
      ciudad: configuracion?.empresaCiudad ?? "Guayaquil, Ecuador",
      garantiaTexto: configuracion?.garantiaTexto ?? "",
      formaPagoTexto: configuracion?.formaPagoTexto ?? "",
      requisitosTexto: configuracion?.requisitosTexto ?? "",
      alcanceTexto: configuracion?.alcanceTexto ?? "",
    },
  };

  const buffer = await renderToBuffer(CotizacionPdf({ data }));
  const nombreArchivo = `${cotizacion.numero}${cotizacion.version > 1 ? `-v${cotizacion.version}` : ""}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nombreArchivo}"`,
    },
  });
}
