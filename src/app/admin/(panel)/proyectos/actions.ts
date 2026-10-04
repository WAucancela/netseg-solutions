"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EstadoProyecto, TipoTarea, EstadoTarea, EstadoChecklist } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";

export type ProyectoFormState = { error: string };

export async function guardarProyecto(
  id: string | null,
  _prevState: ProyectoFormState,
  formData: FormData
): Promise<ProyectoFormState> {
  const session = await getSession();
  if (session?.rol !== "ADMIN") return { error: "No tienes permiso para esta acción" };

  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const estado = String(formData.get("estado") ?? "PLANIFICADO") as EstadoProyecto;
  const presupuestoRaw = String(formData.get("presupuestoAprobado") ?? "").trim();
  const margenRaw = String(formData.get("margenMetaPct") ?? "").trim();
  const fechaInicioRaw = String(formData.get("fechaInicio") ?? "").trim();
  const fechaFinRaw = String(formData.get("fechaFin") ?? "").trim();

  if (!clienteId || !nombre) {
    return { error: "Cliente y nombre son obligatorios" };
  }

  const data = {
    clienteId,
    nombre,
    descripcion: descripcion || null,
    estado,
    presupuestoAprobado: presupuestoRaw === "" ? null : Number(presupuestoRaw),
    margenMetaPct: margenRaw === "" ? null : Number(margenRaw),
    fechaInicio: fechaInicioRaw === "" ? null : new Date(fechaInicioRaw),
    fechaFin: fechaFinRaw === "" ? null : new Date(fechaFinRaw),
  };

  let proyectoId = id;
  if (id) {
    await prisma.proyecto.update({ where: { id }, data });
  } else {
    const creado = await prisma.proyecto.create({ data });
    proyectoId = creado.id;
  }

  revalidatePath("/admin/proyectos");
  redirect(`/admin/proyectos/${proyectoId}`);
}

export async function eliminarProyecto(id: string) {
  const session = await getSession();
  if (session?.rol !== "ADMIN") return;
  await prisma.proyecto.delete({ where: { id } });
  revalidatePath("/admin/proyectos");
  redirect("/admin/proyectos");
}

export type TareaFormState = { error: string };

export async function crearTarea(
  proyectoId: string,
  _prevState: TareaFormState,
  formData: FormData
): Promise<TareaFormState> {
  const session = await getSession();
  if (session?.rol !== "ADMIN") return { error: "No tienes permiso para esta acción" };

  const tipo = String(formData.get("tipo") ?? "INSPECCION") as TipoTarea;
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const tecnicoId = String(formData.get("tecnicoId") ?? "").trim();
  const fechaProgramadaRaw = String(formData.get("fechaProgramada") ?? "").trim();

  if (!titulo) {
    return { error: "El título de la tarea es obligatorio" };
  }

  let tecnicoNombre: string | null = null;
  if (tecnicoId) {
    const tecnico = await prisma.usuario.findUnique({ where: { id: tecnicoId } });
    tecnicoNombre = tecnico?.nombre ?? null;
  }

  await prisma.tarea.create({
    data: {
      proyectoId,
      tipo,
      titulo,
      descripcion: descripcion || null,
      tecnicoId: tecnicoId || null,
      tecnicoNombre,
      fechaProgramada: fechaProgramadaRaw === "" ? null : new Date(fechaProgramadaRaw),
    },
  });

  revalidatePath(`/admin/proyectos/${proyectoId}`);
  return { error: "" };
}

async function puedeGestionarTarea(tareaId: string) {
  const session = await getSession();
  if (!session) return false;
  if (session.rol === "ADMIN") return true;
  if (session.rol !== "TECNICO") return false;
  const tarea = await prisma.tarea.findUnique({ where: { id: tareaId }, select: { tecnicoId: true } });
  return tarea?.tecnicoId === session.usuarioId;
}

export async function actualizarEstadoTarea(tareaId: string, proyectoId: string, estado: EstadoTarea) {
  if (!(await puedeGestionarTarea(tareaId))) return;
  await prisma.tarea.update({ where: { id: tareaId }, data: { estado } });
  revalidatePath(`/admin/proyectos/${proyectoId}`);
  revalidatePath(`/admin/proyectos/${proyectoId}/tareas/${tareaId}`);
  revalidatePath("/admin/mis-tareas");
  revalidatePath(`/admin/mis-tareas/${tareaId}`);
}

export async function eliminarTarea(tareaId: string, proyectoId: string) {
  const session = await getSession();
  if (session?.rol !== "ADMIN") return;
  await prisma.tarea.delete({ where: { id: tareaId } });
  revalidatePath(`/admin/proyectos/${proyectoId}`);
  redirect(`/admin/proyectos/${proyectoId}`);
}

export type ChecklistFormState = { error: string };

export async function agregarChecklistItems(
  tareaId: string,
  _prevState: ChecklistFormState,
  formData: FormData
): Promise<ChecklistFormState> {
  if (!(await puedeGestionarTarea(tareaId))) {
    return { error: "No tienes permiso para esta acción" };
  }

  const raw = String(formData.get("items") ?? "");
  const lineas = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lineas.length === 0) {
    return { error: "Escribe al menos un punto de checklist" };
  }

  const ultimo = await prisma.checklistItem.findFirst({ where: { tareaId }, orderBy: { orden: "desc" } });
  let orden = (ultimo?.orden ?? -1) + 1;

  await prisma.checklistItem.createMany({
    data: lineas.map((descripcion) => ({ tareaId, descripcion, orden: orden++ })),
  });

  revalidatePath(`/admin/proyectos`);
  revalidatePath("/admin/mis-tareas");
  return { error: "" };
}

export async function actualizarEstadoChecklist(itemId: string, estado: EstadoChecklist) {
  const item = await prisma.checklistItem.findUnique({ where: { id: itemId }, select: { tareaId: true } });
  if (!item || !(await puedeGestionarTarea(item.tareaId))) return;
  const actualizado = await prisma.checklistItem.update({
    where: { id: itemId },
    data: { estado },
    include: { tarea: true },
  });
  revalidatePath(`/admin/proyectos/${actualizado.tarea.proyectoId}/tareas/${actualizado.tareaId}`);
  revalidatePath(`/admin/mis-tareas/${actualizado.tareaId}`);
}

export async function eliminarChecklistItem(itemId: string) {
  const item = await prisma.checklistItem.findUnique({ where: { id: itemId }, select: { tareaId: true } });
  if (!item || !(await puedeGestionarTarea(item.tareaId))) return;
  const borrado = await prisma.checklistItem.delete({ where: { id: itemId }, include: { tarea: true } });
  revalidatePath(`/admin/proyectos/${borrado.tarea.proyectoId}/tareas/${borrado.tareaId}`);
  revalidatePath(`/admin/mis-tareas/${borrado.tareaId}`);
}
