"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EstadoActivo } from "@/generated/prisma/client";

export type ActivoFormState = { error: string };

export async function guardarActivo(
  id: string | null,
  _prevState: ActivoFormState,
  formData: FormData
): Promise<ActivoFormState> {
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const proyectoId = String(formData.get("proyectoId") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const marca = String(formData.get("marca") ?? "").trim();
  const modelo = String(formData.get("modelo") ?? "").trim();
  const serial = String(formData.get("serial") ?? "").trim();
  const ip = String(formData.get("ip") ?? "").trim();
  const mac = String(formData.get("mac") ?? "").trim();
  const vlan = String(formData.get("vlan") ?? "").trim();
  const puertoSwitch = String(formData.get("puertoSwitch") ?? "").trim();
  const ubicacion = String(formData.get("ubicacion") ?? "").trim();
  const estado = String(formData.get("estado") ?? "ACTIVO") as EstadoActivo;
  const fechaInstalacionRaw = String(formData.get("fechaInstalacion") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();

  if (!clienteId || !categoria || !nombre) {
    return { error: "Cliente, categoría y nombre son obligatorios" };
  }

  const data = {
    clienteId,
    proyectoId: proyectoId || null,
    categoria,
    nombre,
    marca: marca || null,
    modelo: modelo || null,
    serial: serial || null,
    ip: ip || null,
    mac: mac || null,
    vlan: vlan || null,
    puertoSwitch: puertoSwitch || null,
    ubicacion: ubicacion || null,
    estado,
    fechaInstalacion: fechaInstalacionRaw === "" ? null : new Date(fechaInstalacionRaw),
    notas: notas || null,
  };

  let activoId = id;
  if (id) {
    await prisma.activoCliente.update({ where: { id }, data });
  } else {
    const creado = await prisma.activoCliente.create({ data });
    activoId = creado.id;
  }

  revalidatePath("/admin/activos");
  redirect(`/admin/activos/${activoId}`);
}

export async function eliminarActivo(id: string) {
  await prisma.activoCliente.delete({ where: { id } });
  revalidatePath("/admin/activos");
  redirect("/admin/activos");
}
