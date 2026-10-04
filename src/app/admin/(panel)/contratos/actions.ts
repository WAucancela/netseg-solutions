"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ModalidadContrato, Periodicidad, EstadoContrato } from "@/generated/prisma/client";

export type ContratoFormState = { error: string };

export async function guardarContrato(
  id: string | null,
  _prevState: ContratoFormState,
  formData: FormData
): Promise<ContratoFormState> {
  const clienteNombre = String(formData.get("clienteNombre") ?? "").trim();
  const clienteEmail = String(formData.get("clienteEmail") ?? "").trim();
  const clienteTelefono = String(formData.get("clienteTelefono") ?? "").trim();
  const paqueteId = String(formData.get("paqueteId") ?? "").trim();
  const modalidad = String(formData.get("modalidad") ?? "COMPRA") as ModalidadContrato;
  const montoRaw = String(formData.get("montoMensual") ?? "").trim();
  const montoMensual = montoRaw === "" ? null : Number(montoRaw);
  const periodicidad = String(formData.get("periodicidad") ?? "MENSUAL") as Periodicidad;
  const proximaFacturaRaw = String(formData.get("proximaFactura") ?? "").trim();
  const proximaFactura = proximaFacturaRaw === "" ? null : new Date(proximaFacturaRaw);
  const estado = String(formData.get("estado") ?? "ACTIVO") as EstadoContrato;
  const notas = String(formData.get("notas") ?? "").trim();

  if (!clienteNombre) {
    return { error: "El nombre del cliente es obligatorio" };
  }
  if (montoRaw !== "" && Number.isNaN(montoMensual)) {
    return { error: "El monto mensual debe ser un número" };
  }

  const data = {
    clienteNombre,
    clienteEmail: clienteEmail || null,
    clienteTelefono: clienteTelefono || null,
    paqueteId: paqueteId || null,
    modalidad,
    montoMensual,
    periodicidad,
    proximaFactura,
    estado,
    notas: notas || null,
  };

  if (id) {
    await prisma.contrato.update({ where: { id }, data });
  } else {
    await prisma.contrato.create({ data });
  }

  revalidatePath("/admin/contratos");
  revalidatePath("/admin");
  redirect("/admin/contratos");
}

export async function eliminarContrato(id: string) {
  await prisma.contrato.delete({ where: { id } });
  revalidatePath("/admin/contratos");
  redirect("/admin/contratos");
}
