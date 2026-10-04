import { prisma } from "./prisma";
import { MARGEN_DEFAULT_PCT } from "./precios";

export async function getMargenDefaultPct(): Promise<number> {
  const config = await prisma.configuracion.findUnique({ where: { id: "global" } });
  return config ? Number(config.margenDefaultPct) : MARGEN_DEFAULT_PCT;
}
