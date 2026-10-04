"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { RolUsuario } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";

export type UsuarioFormState = { error: string };

export async function guardarUsuario(
  id: string | null,
  _prevState: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  const session = await getSession();
  if (session?.rol !== "ADMIN") {
    return { error: "No tienes permiso para esta acción" };
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol") ?? "TECNICO") as RolUsuario;
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const activo = formData.get("activo") === "on";

  if (!nombre || !email) {
    return { error: "Nombre y correo son obligatorios" };
  }
  if (!id && password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (rol === "CLIENTE" && !clienteId) {
    return { error: "Selecciona a qué cliente pertenece este usuario" };
  }

  const data: {
    nombre: string;
    email: string;
    rol: RolUsuario;
    clienteId: string | null;
    activo: boolean;
    passwordHash?: string;
  } = {
    nombre,
    email,
    rol,
    clienteId: rol === "CLIENTE" ? clienteId : null,
    activo,
  };

  if (password) {
    if (password.length < 8) {
      return { error: "La contraseña debe tener al menos 8 caracteres" };
    }
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    if (id) {
      await prisma.usuario.update({ where: { id }, data });
    } else {
      await prisma.usuario.create({ data: { ...data, passwordHash: data.passwordHash! } });
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { error: "Ya existe un usuario con ese correo" };
    }
    throw e;
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function eliminarUsuario(id: string) {
  const session = await getSession();
  if (session?.rol !== "ADMIN") return;
  if (session.usuarioId === id) return; // no te puedes eliminar a ti mismo
  await prisma.usuario.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}
