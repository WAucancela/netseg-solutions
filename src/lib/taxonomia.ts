/**
 * Categorias de linea compartidas entre Servicios y Paquetes.
 * Portado de `core/choices.py` (CategoriaItem) en InfraControl para mantener
 * el mismo vocabulario entre los dos sistemas, aunque las bases de datos sean independientes.
 *
 * `RAD` y `CER` son la excepcion: se agregaron solo en NetSeg (no existen en InfraControl) porque
 * el catalogo real de inventario trae cientos de radios de telecomunicacion y de productos de
 * cerco electrico (electrificadores, aisladores, etc.) que no encajan bien en ninguna categoria
 * de seguridad/redes existente — meterlos todos en "Alarma / Sensor" los dejaba invisibles ahi.
 */
export const CATEGORIAS = {
  CAM: "Cámara / Videovigilancia",
  NVR: "NVR / DVR / Grabador",
  RED: "Networking (switch, router, AP, wifi)",
  FIB: "Fibra Óptica",
  ALM: "Alarma / Sensor",
  CTA: "Control de Acceso",
  DOM: "Domótica",
  LIC: "Licencia / Software",
  MOB: "Mano de Obra Especializada",
  CAB: "Cableado / Ductería",
  INC: "Detección de Incendio",
  SOL: "Energía Solar / Fotovoltaico",
  RAD: "Radios de Telecomunicación",
  CER: "Cerco Eléctrico",
  OTR: "Otro",
} as const;

export type CategoriaCodigo = keyof typeof CATEGORIAS;

export const CATEGORIA_OPCIONES = Object.entries(CATEGORIAS).map(([codigo, etiqueta]) => ({
  codigo: codigo as CategoriaCodigo,
  etiqueta,
}));

/**
 * Mapea una categoria "cruda" de un catalogo de proveedor (ej. "CCTV > Grabadores IP",
 * "PPA > Motor corredizo") a uno de los codigos de `CATEGORIAS`. Los proveedores suelen usar
 * un esquema de categorias mucho mas granular que el nuestro (que se comparte con InfraControl),
 * asi que esto hace lo mejor posible por prefijo/palabra clave en vez de exigir coincidencia exacta.
 * Nunca falla: cualquier cosa que no reconozca cae en OTR.
 */
export function inferirCategoria(crudo: string): CategoriaCodigo {
  const texto = crudo.trim().toLowerCase();
  if (!texto) return "OTR";

  const exacta = CATEGORIA_OPCIONES.find(
    (o) => o.codigo.toLowerCase() === texto || o.etiqueta.toLowerCase() === texto
  );
  if (exacta) return exacta.codigo;

  const [prefijo, resto = ""] = texto.split(">").map((s) => s.trim());

  if (prefijo === "cctv") {
    return /grabador|dvr/.test(resto) ? "NVR" : "CAM";
  }
  if (prefijo === "ezviz") {
    if (resto === "cerradura") return "CTA";
    if (resto === "videoportero") return "CTA";
    return "CAM";
  }
  if (prefijo === "control de acceso") return "CTA";
  if (prefijo === "video porteros") return "CTA";
  if (prefijo === "redes") return "RED";
  if (prefijo === "tplink") return "RED";
  if (prefijo === "telefonia ip" || prefijo === "telefonía ip") return "RED";
  if (prefijo === "fibra optica" || prefijo === "fibra óptica") return "FIB";
  if (prefijo === "alarmas contra robo e incendio") {
    if (/incendio|humo|fotobeam/.test(resto)) return "INC";
    if (/cerco|cerca el[eé]ctric/.test(resto)) return "CER";
    return "ALM";
  }
  if (prefijo === "sistema antihurto") return "ALM";
  if (prefijo === "control de temperatura") return "ALM";
  if (prefijo === "ppa") return "DOM";
  if (prefijo === "paneles solares") return "SOL";
  if (prefijo === "radios de telecomunicación" || prefijo === "radios de telecomunicacion") return "RAD";

  return "OTR";
}
