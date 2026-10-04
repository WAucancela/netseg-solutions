import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SERVICIOS_PRINCIPALES = [
  {
    slug: "videovigilancia-ip",
    nombre: "Videovigilancia IP",
    categoria: "CAM",
    descripcion:
      "Cámaras IP, grabación en NVR y almacenamiento redundante, con acceso remoto y retención configurable.",
    items: [
      "Cámaras IP interior/exterior 2–8 MP",
      "NVR con RAID y retención configurable",
      "App de monitoreo remoto incluida",
    ],
  },
  {
    slug: "control-de-acceso",
    nombre: "Control de acceso",
    categoria: "CTA",
    descripcion: "Lectores biométricos y RFID por zona, con bitácora de eventos y perfiles de horario.",
    items: [
      "Lectores biométricos, RFID o PIN",
      "Control por zona y perfil de horario",
      "Bitácora de eventos exportable",
    ],
  },
  {
    slug: "cableado-estructurado",
    nombre: "Cableado estructurado",
    categoria: "CAB",
    descripcion: "Cat6/Cat6A y fibra óptica, racks, patch panels y certificación de cada enlace entregado.",
    items: [
      "Cat6 / Cat6A y fibra monomodo/multimodo",
      "Racks, organizadores y patch panels",
      "Certificación de enlace por punto",
    ],
  },
  {
    slug: "redes-y-conectividad",
    nombre: "Redes y conectividad",
    categoria: "RED",
    descripcion: "Diseño de topología, switches PoE, segmentación VLAN y enlaces inalámbricos punto a punto.",
    items: [
      "Diagrama de topología documentado",
      "Switches PoE y segmentación VLAN",
      "Enlaces inalámbricos punto a punto",
    ],
  },
  {
    slug: "alarmas-y-monitoreo",
    nombre: "Alarmas y monitoreo",
    categoria: "ALM",
    descripcion: "Sensores perimetrales, detección de intrusión y monitoreo remoto continuo.",
    items: ["Sensores de movimiento y perimetrales", "Notificación inmediata por app", "Monitoreo remoto continuo"],
  },
  {
    slug: "soporte-y-mantenimiento",
    nombre: "Soporte y mantenimiento",
    categoria: "MOB",
    descripcion: "Mantenimiento preventivo y correctivo, con tiempos de respuesta definidos por contrato.",
    items: [
      "Mantenimiento preventivo programado",
      "Mesa de ayuda con SLA por contrato",
      "Reportes de estado periódicos",
    ],
  },
  {
    slug: "automatizacion-y-domotica",
    nombre: "Automatización y domótica",
    categoria: "DOM",
    descripcion:
      "Iluminación, climatización y cerraduras inteligentes integradas al mismo sistema de seguridad, controladas desde una sola app.",
    items: [
      "Luces, clima y cerraduras por app o voz",
      "Escenarios ligados a alarma y accesos",
      "Protocolos estándar: Zigbee, Z-Wave, Wi-Fi",
    ],
  },
  {
    slug: "sistemas-fotovoltaicos",
    nombre: "Sistemas fotovoltaicos",
    categoria: "SOL",
    descripcion:
      "Paneles solares con banco de baterías para que cámaras, red y control de acceso sigan operando ante cortes de energía.",
    items: [
      "Paneles + inversor + banco de baterías",
      "Respaldo dedicado para sitios críticos",
      "Monitoreo de generación y consumo",
    ],
  },
] as const;

const SERVICIOS_ADICIONALES = [
  { slug: "central-de-monitoreo-24-7", nombre: "Central de monitoreo 24/7", categoria: "ALM", descripcion: "Estación con protocolo de respuesta ante alarmas, no solo notificación por app.", items: [] },
  { slug: "respaldo-en-la-nube", nombre: "Respaldo en la nube", categoria: "NVR", descripcion: "Copia remota de las grabaciones críticas, independiente del NVR local.", items: [] },
  { slug: "videoanalitica-con-ia", nombre: "Videoanalítica con IA", categoria: "CAM", descripcion: "Conteo de personas, lectura de placas (LPR) y detección de EPP en planta.", items: [] },
  { slug: "videoportero-e-intercomunicacion", nombre: "Videoportero e intercomunicación", categoria: "CTA", descripcion: "Portero IP con video, integrado al mismo control de acceso.", items: [] },
  { slug: "cercas-electricas-y-perimetraje", nombre: "Cercas eléctricas y perimetraje", categoria: "ALM", descripcion: "Electrificación de linderos con sensor de corte y disparo de alarma.", items: [] },
  { slug: "wifi-empresarial", nombre: "WiFi empresarial", categoria: "RED", descripcion: "Cobertura administrada con red de invitados aislada de la red interna.", items: [] },
  { slug: "ciberseguridad-de-red", nombre: "Ciberseguridad de red", categoria: "RED", descripcion: "Firewall, VPN entre sucursales y segmentación de la red que instalamos.", items: [] },
  { slug: "deteccion-contra-incendios", nombre: "Detección contra incendios", categoria: "INC", descripcion: "Sensores de humo y calor con alarma sonora, mediante alianza certificada.", items: [] },
  { slug: "ups-y-continuidad-electrica", nombre: "UPS y continuidad eléctrica", categoria: "SOL", descripcion: "Respaldo de corto plazo para racks y equipos mientras entra el generador o el solar.", items: [] },
  { slug: "telefonia-ip-voip", nombre: "Telefonía IP / VoIP", categoria: "RED", descripcion: "Extensiones y troncal SIP sobre la misma red de datos.", items: [] },
  { slug: "auditoria-de-seguridad-y-redes", nombre: "Auditoría de seguridad y redes", categoria: "MOB", descripcion: "Diagnóstico independiente de un sitio, con informe y plan de remediación.", items: [] },
] as const;

const PAQUETES = [
  {
    slug: "pyme",
    nombre: "Pyme",
    descripcionAlcance: "Locales pequeños, oficinas y viviendas — hasta 8 cámaras y 1 punto de acceso.",
    precioDesde: 890,
    notaPrecio: "Precio de referencia · costo final según diagnóstico",
    destacado: false,
    premium: false,
    items: ["Hasta 8 cámaras IP + NVR", "1 punto de control de acceso", "Cableado Cat6 básico", "Garantía de equipos 12 meses"],
  },
  {
    slug: "comercial",
    nombre: "Comercial",
    descripcionAlcance: "Locales comerciales y condominios medianos — hasta 24 cámaras y control multi-zona.",
    precioDesde: 2950,
    notaPrecio: "Precio de referencia · costo final según diagnóstico",
    destacado: true,
    premium: false,
    items: [
      "Hasta 24 cámaras IP + NVR redundante",
      "Control de acceso multi-zona",
      "Red completa con switches PoE y VLAN",
      "Mantenimiento preventivo trimestral",
    ],
  },
  {
    slug: "empresarial",
    nombre: "Empresarial",
    descripcionAlcance: "Industria, edificios corporativos y multi-sitio — solución a medida con alta disponibilidad.",
    precioDesde: null,
    notaPrecio: "Alcance y precio se definen tras el levantamiento técnico",
    destacado: false,
    premium: true,
    items: [
      "Cobertura de cámaras sin límite fijo",
      "Red redundante y enlaces de respaldo",
      "Monitoreo 24/7 y SLA por contrato",
      "Gerente de proyecto asignado",
    ],
  },
] as const;

async function main() {
  console.log("Sembrando servicios principales...");
  for (const [i, s] of SERVICIOS_PRINCIPALES.entries()) {
    await prisma.servicio.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        nombre: s.nombre,
        categoria: s.categoria,
        descripcion: s.descripcion,
        destacado: true,
        orden: i,
        items: { create: s.items.map((texto, orden) => ({ texto, orden })) },
      },
      update: {
        nombre: s.nombre,
        categoria: s.categoria,
        descripcion: s.descripcion,
        destacado: true,
        orden: i,
      },
    });
  }

  console.log("Sembrando servicios adicionales...");
  for (const [i, s] of SERVICIOS_ADICIONALES.entries()) {
    await prisma.servicio.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        nombre: s.nombre,
        categoria: s.categoria,
        descripcion: s.descripcion,
        destacado: false,
        orden: i,
      },
      update: {
        nombre: s.nombre,
        categoria: s.categoria,
        descripcion: s.descripcion,
        destacado: false,
        orden: i,
      },
    });
  }

  console.log("Sembrando paquetes...");
  for (const [i, p] of PAQUETES.entries()) {
    await prisma.paquete.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        nombre: p.nombre,
        descripcionAlcance: p.descripcionAlcance,
        precioDesde: p.precioDesde,
        notaPrecio: p.notaPrecio,
        destacado: p.destacado,
        premium: p.premium,
        orden: i,
        items: { create: p.items.map((texto, orden) => ({ texto, orden })) },
      },
      update: {
        nombre: p.nombre,
        descripcionAlcance: p.descripcionAlcance,
        precioDesde: p.precioDesde,
        notaPrecio: p.notaPrecio,
        destacado: p.destacado,
        premium: p.premium,
        orden: i,
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    console.log(`Creando usuario admin ${adminEmail}...`);
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.usuario.upsert({
      where: { email: adminEmail },
      create: { email: adminEmail, passwordHash, nombre: "Administrador", rol: "ADMIN" },
      update: { passwordHash, rol: "ADMIN" },
    });
  } else {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD no configurados: no se creó usuario admin.");
  }

  console.log("Listo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
