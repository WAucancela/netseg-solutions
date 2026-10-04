"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ProveedorFormState = { error: string };

export async function guardarProveedor(
  id: string | null,
  _prevState: ProveedorFormState,
  formData: FormData
): Promise<ProveedorFormState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const ruc = String(formData.get("ruc") ?? "").trim();
  const contacto = String(formData.get("contacto") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();

  if (!nombre) return { error: "El nombre es obligatorio" };

  const data = {
    nombre,
    ruc: ruc || null,
    contacto: contacto || null,
    telefono: telefono || null,
    email: email || null,
    notas: notas || null,
  };

  let proveedorId = id;
  if (id) {
    await prisma.proveedor.update({ where: { id }, data });
  } else {
    const creado = await prisma.proveedor.create({ data });
    proveedorId = creado.id;
  }

  revalidatePath("/admin/proveedores");
  redirect(`/admin/proveedores/${proveedorId}`);
}

export async function eliminarProveedor(id: string) {
  await prisma.proveedor.delete({ where: { id } });
  revalidatePath("/admin/proveedores");
  redirect("/admin/proveedores");
}
