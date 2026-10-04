"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";

export type LoginState = {
  error: string;
};

function destinoPorRol(rol: string) {
  if (rol === "CLIENTE") return "/portal";
  return "/admin";
}

export async function iniciarSesion(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "");

  if (!email || !password) {
    return { error: "Ingresa correo y contraseña" };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.activo) {
    return { error: "Credenciales inválidas" };
  }

  const valido = await bcrypt.compare(password, usuario.passwordHash);
  if (!valido) {
    return { error: "Credenciales inválidas" };
  }

  await createSessionCookie({
    usuarioId: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    clienteId: usuario.clienteId,
  });

  const destino = destinoPorRol(usuario.rol);
  redirect(from.startsWith(destino) ? from : destino);
}
