"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ProspectoSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre completo"),
  empresa: z.string().trim().optional(),
  email: z.string().trim().email("Correo inválido").optional().or(z.literal("")),
  telefono: z.string().trim().optional(),
  servicioInteres: z.string().trim().optional(),
  mensaje: z.string().trim().optional(),
});

export type ProspectoFormState = {
  ok: boolean;
  message: string;
};

export async function crearProspecto(
  _prevState: ProspectoFormState,
  formData: FormData
): Promise<ProspectoFormState> {
  const parsed = ProspectoSchema.safeParse({
    nombre: formData.get("nombre"),
    empresa: formData.get("empresa"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    servicioInteres: formData.get("servicioInteres"),
    mensaje: formData.get("mensaje"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Revisa los datos del formulario";
    return { ok: false, message: firstError };
  }

  const data = parsed.data;

  await prisma.prospecto.create({
    data: {
      nombre: data.nombre,
      empresa: data.empresa || null,
      email: data.email || null,
      telefono: data.telefono || null,
      servicioInteres: data.servicioInteres || null,
      mensaje: data.mensaje || null,
    },
  });

  return { ok: true, message: "Gracias, recibimos tu solicitud. Te contactaremos pronto." };
}
