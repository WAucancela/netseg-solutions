"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EstadoEmpleado, EstadoRolPagos } from "@/generated/prisma/client";
import { calcularRolPagos } from "@/lib/nomina";

export type EmpleadoFormState = { error: string };

export async function guardarEmpleado(
  id: string | null,
  _prevState: EmpleadoFormState,
  formData: FormData
): Promise<EmpleadoFormState> {
  const nombres = String(formData.get("nombres") ?? "").trim();
  const apellidos = String(formData.get("apellidos") ?? "").trim();
  const cedula = String(formData.get("cedula") ?? "").trim();
  const cargo = String(formData.get("cargo") ?? "").trim();
  const fechaIngresoRaw = String(formData.get("fechaIngreso") ?? "").trim();
  const salarioMensual = Number(formData.get("salarioMensual") ?? 0);
  const email = String(formData.get("email") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const estado = String(formData.get("estado") ?? "ACTIVO") as EstadoEmpleado;

  if (!nombres || !apellidos || !cedula || !cargo || !fechaIngresoRaw) {
    return { error: "Nombres, apellidos, cédula, cargo y fecha de ingreso son obligatorios" };
  }
  if (!salarioMensual || salarioMensual <= 0) {
    return { error: "El salario mensual debe ser mayor a 0" };
  }

  const data = {
    nombres,
    apellidos,
    cedula,
    cargo,
    fechaIngreso: new Date(fechaIngresoRaw),
    salarioMensual,
    email: email || null,
    telefono: telefono || null,
    estado,
  };

  try {
    let empleadoId = id;
    if (id) {
      await prisma.empleado.update({ where: { id }, data });
    } else {
      const creado = await prisma.empleado.create({ data });
      empleadoId = creado.id;
    }
    revalidatePath("/admin/nomina");
    redirect(`/admin/nomina/${empleadoId}`);
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { error: "Ya existe un empleado con esa cédula" };
    }
    throw e;
  }
}

export async function eliminarEmpleado(id: string) {
  await prisma.empleado.delete({ where: { id } });
  revalidatePath("/admin/nomina");
  redirect("/admin/nomina");
}

export type RolPagosFormState = { error: string };

export async function generarRolPagos(
  empleadoId: string,
  _prevState: RolPagosFormState,
  formData: FormData
): Promise<RolPagosFormState> {
  const periodo = String(formData.get("periodo") ?? "").trim();
  const horasExtras = Number(formData.get("horasExtras") ?? 0) || 0;
  const otrosIngresos = Number(formData.get("otrosIngresos") ?? 0) || 0;
  const otrosDescuentos = Number(formData.get("otrosDescuentos") ?? 0) || 0;
  const impuestoRenta = Number(formData.get("impuestoRenta") ?? 0) || 0;

  if (!periodo) return { error: "Indica el período (ej. 2026-10)" };

  const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } });
  if (!empleado) return { error: "Empleado no encontrado" };

  const calculo = calcularRolPagos({
    salarioMensual: Number(empleado.salarioMensual),
    horasExtras,
    otrosIngresos,
    otrosDescuentos,
    impuestoRenta,
  });

  try {
    await prisma.rolPagos.create({
      data: {
        empleadoId,
        periodo,
        salarioMensual: empleado.salarioMensual,
        horasExtras,
        otrosIngresos,
        otrosDescuentos,
        impuestoRenta,
        ...calculo,
      },
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { error: `Ya existe un rol de pagos para ${empleado.nombres} en ${periodo}` };
    }
    throw e;
  }

  revalidatePath(`/admin/nomina/${empleadoId}`);
  return { error: "" };
}

export async function actualizarEstadoRol(rolId: string, empleadoId: string, estado: EstadoRolPagos) {
  await prisma.rolPagos.update({ where: { id: rolId }, data: { estado } });
  revalidatePath(`/admin/nomina/${empleadoId}`);
}

export async function eliminarRolPagos(rolId: string, empleadoId: string) {
  await prisma.rolPagos.delete({ where: { id: rolId } });
  revalidatePath(`/admin/nomina/${empleadoId}`);
}
