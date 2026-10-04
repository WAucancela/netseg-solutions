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

export type PaqueteFormState = { error: string };

export async function guardarPaquete(
  id: string | null,
  _prevState: PaqueteFormState,
  formData: FormData
): Promise<PaqueteFormState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcionAlcance = String(formData.get("descripcionAlcance") ?? "").trim();
  const precioRaw = String(formData.get("precioDesde") ?? "").trim();
  const precioDesde = precioRaw === "" ? null : Number(precioRaw);
  const notaPrecio = String(formData.get("notaPrecio") ?? "").trim();
  const destacado = formData.get("destacado") === "on";
  const premium = formData.get("premium") === "on";
  const activo = formData.get("activo") === "on";
  const orden = Number(formData.get("orden") ?? 0);
  const items = parseItems(String(formData.get("items") ?? ""));

  if (!nombre || !descripcionAlcance) {
    return { error: "Nombre y descripción de alcance son obligatorios" };
  }
  if (precioRaw !== "" && Number.isNaN(precioDesde)) {
    return { error: "El precio debe ser un número" };
  }

  if (id) {
    await prisma.$transaction([
      prisma.paqueteItem.deleteMany({ where: { paqueteId: id } }),
      prisma.paquete.update({
        where: { id },
        data: {
          nombre,
          descripcionAlcance,
          precioDesde,
          notaPrecio: notaPrecio || null,
          destacado,
          premium,
          activo,
          orden,
          items: { create: items.map((texto, orden) => ({ texto, orden })) },
        },
      }),
    ]);
  } else {
    await prisma.paquete.create({
      data: {
        slug: slugify(nombre),
        nombre,
        descripcionAlcance,
        precioDesde,
        notaPrecio: notaPrecio || null,
        destacado,
        premium,
        activo,
        orden,
        items: { create: items.map((texto, orden) => ({ texto, orden })) },
      },
    });
  }

  revalidatePath("/admin/paquetes");
  revalidatePath("/");
  redirect("/admin/paquetes");
}

export async function eliminarPaquete(id: string) {
  await prisma.paquete.delete({ where: { id } });
  revalidatePath("/admin/paquetes");
  revalidatePath("/");
  redirect("/admin/paquetes");
}
