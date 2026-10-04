"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseItems(raw: string) {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export type ServicioFormState = { error: string };

export async function guardarServicio(
  id: string | null,
  _prevState: ServicioFormState,
  formData: FormData
): Promise<ServicioFormState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const destacado = formData.get("destacado") === "on";
  const activo = formData.get("activo") === "on";
  const orden = Number(formData.get("orden") ?? 0);
  const itemsRaw = String(formData.get("items") ?? "");
  const items = parseItems(itemsRaw);

  if (!nombre || !categoria || !descripcion) {
    return { error: "Nombre, categoría y descripción son obligatorios" };
  }

  if (id) {
    await prisma.$transaction([
      prisma.servicioItem.deleteMany({ where: { servicioId: id } }),
      prisma.servicio.update({
        where: { id },
        data: {
          nombre,
          categoria,
          descripcion,
          destacado,
          activo,
          orden,
          items: { create: items.map((texto, orden) => ({ texto, orden })) },
        },
      }),
    ]);
  } else {
    const slug = slugify(nombre);
    await prisma.servicio.create({
      data: {
        slug,
        nombre,
        categoria,
        descripcion,
        destacado,
        activo,
        orden,
        items: { create: items.map((texto, orden) => ({ texto, orden })) },
      },
    });
  }

  revalidatePath("/admin/servicios");
  revalidatePath("/");
  redirect("/admin/servicios");
}

export async function eliminarServicio(id: string) {
  await prisma.servicio.delete({ where: { id } });
  revalidatePath("/admin/servicios");
  revalidatePath("/");
  redirect("/admin/servicios");
}
