import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

const COLUMNAS = [
  "sku",
  "nombre",
  "categoria",
  "unidad",
  "tipo",
  "stockActual",
  "stockMinimo",
  "costoUnitario",
  "proveedor",
];

export async function GET() {
  const productos = await prisma.productoInventario.findMany({
    orderBy: { nombre: "asc" },
    include: { proveedor: { select: { nombre: true } } },
  });

  const filas: string[][] = [COLUMNAS];
  for (const p of productos) {
    filas.push([
      p.sku ?? "",
      p.nombre,
      p.categoria,
      p.unidad,
      p.tipo,
      String(Number(p.stockActual)),
      String(Number(p.stockMinimo)),
      p.costoUnitario === null ? "" : String(Number(p.costoUnitario)),
      p.proveedor?.nombre ?? "",
    ]);
  }

  const csv = "﻿" + toCsv(filas);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="inventario-formato.csv"',
    },
  });
}
