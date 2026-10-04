# NetSeg Solutions

Sitio público + sistema de gestión para un negocio de seguridad electrónica e infraestructura de
redes en Ecuador. Next.js full-stack (App Router) + Prisma + PostgreSQL.

Es un proyecto independiente de **InfraControl** (`C:\Programacion\Sistema de gestion infraestrucutra de redes`),
pero reutiliza su taxonomía de categorías (`core/choices.py` → `src/lib/taxonomia.ts`) para hablar el mismo
vocabulario entre los dos sistemas.

## Qué incluye

### Sitio público (`/`)
Hero, servicios, paquetes, proceso, "por qué NetSeg" y contacto — todo el contenido se lee en vivo desde la
base de datos. El formulario de contacto crea un `Prospecto` real.

### Panel de administración (`/admin`, protegido con login y roles)

**Comercial**
- **Prospectos** — lista + detalle, edición de datos, cambio de estado, notas internas, conversión a Cliente,
  eliminar.
- **Clientes** — ficha real (RUC único, razón social, contacto), editar, eliminar. El campo RUC/cédula
  consulta automáticamente al SRI al salir del campo (misma consulta no oficial que usa InfraControl,
  `obtenerPorNumerRuc`) y autocompleta razón social / nombre comercial / dirección si están vacíos; nunca
  bloquea el guardado si el SRI no responde (timeout duro de 8s).
- **Cotizaciones** — numeración automática (`COT-2026-0001`), líneas de detalle con categoría y unidad
  (se agrupan por secciones en el PDF), IVA, estados.
  - **PDF profesional** (`/admin/cotizaciones/[id]/pdf`, con `@react-pdf/renderer`): cabecera con marca de
    NetSeg, datos del cliente, resumen ejecutivo, desglose de materiales/mano de obra agrupado, cronograma
    tipo Gantt (opcional, por actividades con día de inicio/duración), términos y condiciones (plantilla fija
    editable desde `/admin/cotizaciones`) y bloques de firma.
  - **Versionado automático** — mientras una cotización está en Borrador se edita en el mismo registro. En
    cuanto pasa a Enviada/Aceptada/etc., la siguiente edición **crea una nueva versión** (mismo número, +1 en
    `version`) y la anterior queda congelada tal cual se envió. La ficha muestra un selector con todas las
    versiones (v1, v2…) y su estado.
  - **Trazabilidad por cliente** — la ficha de cada cliente lista todas sus cotizaciones (todas las
    versiones) con proyecto, total y estado.
- **Facturas** — ver sección de Facturación SRI abajo.
- **Contratos** — modalidad Compra o Renta mensual (SECaaS), periodicidad de cobro.

**Operación**
- **Proyectos y tareas** — tareas tipo Inspección/Instalación/Soporte, asignadas a un técnico real (usuario
  con rol Técnico, no solo texto libre).
- **Checklist de instalación con semáforo** — verde/amarillo/rojo por tarea.
- **Activos de red por cliente** — equipo instalado (cámara, switch, control de acceso...) con IP, MAC, VLAN,
  puerto de switch y ubicación.

**Inventario**
- **Productos** — stock por producto, stock mínimo con alerta, costo unitario, categoría, foto (ver abajo).
  El listado tiene **búsqueda** (por nombre o SKU) y **filtro por categoría**, y pagina de 50 en 50 — pensado
  para catálogos grandes de proveedor (cientos o miles de productos), no solo para unos pocos ítems.
- **Órdenes de compra** — por proveedor, con líneas; "Marcar como recibida" incrementa el stock automáticamente
  y registra el movimiento.
- **Proveedores** — ficha básica de contacto.
- Cada producto tiene un historial de movimientos (entradas/salidas/ajustes) y se puede ajustar el stock a
  mano (conteo físico, merma, etc.) desde su ficha.
- **Receta (lista de materiales / BOM)** — un producto marcado como "Compuesto" se arma a partir de
  materiales de inventario (con cantidad), servicios del catálogo (o libres) y mano de obra (horas × tarifa).
  Los materiales se eligen con un **buscador con autocompletar** (nombre o SKU, cualquier orden de palabras,
  resultados en vivo) en vez de un `<select>` con todo el catálogo — pensado para funcionar bien con miles de
  productos. El costo total se calcula en vivo. El botón "Producir" descuenta los materiales de la receta
  multiplicados por la cantidad del stock (valida que haya suficiente antes de ejecutar) y suma el producto
  terminado, dejando ambos movimientos registrados en el historial.
- **PVP (precio de venta al público)** — se calcula como costo unitario + margen de ganancia, nunca se guarda
  a mano. Hay un margen por defecto configurable desde `/admin/inventario` (aplica a todo el catálogo) y cada
  producto puede tener su propio margen que lo sobreescribe. El PVP se recalcula en vivo en el formulario y se
  muestra en el listado y en la ficha de cada producto (`src/lib/precios.ts` tiene el cálculo puro, reusable
  desde cliente; `src/lib/precios.server.ts` lee el margen por defecto de la base — separados a propósito para
  no filtrar el cliente de Prisma al bundle del navegador).
- **Foto del producto** — se sube desde la ficha del producto (JPG/PNG/WEBP, máx. 5 MB) y se guarda en
  **Vercel Blob** (store `netseg-productos`, acceso público). Se muestra como miniatura en el listado y en la
  ficha; "Quitar foto actual" la borra. Al reemplazar o quitar una foto, la anterior se elimina del Blob store
  para no dejar archivos huérfanos. Requiere la variable `BLOB_READ_WRITE_TOKEN` (ver `.env.example`); en
  Vercel se inyecta sola al conectar el store al proyecto, en local vive en `.env.local` (generado por
  `vercel blob create-store`, no se versiona).
- **Carga masiva por CSV** — desde `/admin/inventario`, "Descargar formato" exporta el inventario actual como
  CSV (columnas `sku, nombre, categoria, unidad, tipo, stockActual, stockMinimo, costoUnitario, proveedor`,
  compatible con Excel/Sheets). Al editarlo y subirlo con "Subir formato", cada fila con `sku` existente
  **actualiza** ese producto (sin tocar su stock actual, que se sigue manejando desde la ficha o "Producir");
  cada fila sin `sku`, o con uno nuevo, **crea** un producto (y si trae `stockActual > 0` registra el
  movimiento de carga inicial). Si trae `proveedor` y ese proveedor no existe todavía, se crea automáticamente
  (una sola vez, aunque se repita en cientos de filas). La categoría acepta el código (`CAM`), la etiqueta
  completa (`Cámara / Videovigilancia`) **o el esquema más granular de un catálogo de proveedor**
  (`"CCTV > Grabadores IP"`, `"PPA > Motor corredizo"`, etc. — ver `inferirCategoria` en `src/lib/taxonomia.ts`):
  nunca rechaza una fila por categoría, en el peor caso la deja en "Otro" para reclasificar a mano después.
  Solo falta nombre o categoría (vacíos) bloquea una fila, y se reporta sin afectar el resto del archivo.
  Pensado para catálogos reales de miles de líneas: corre en lotes (no fila por fila), no por archivo.

**RRHH**
- **Nómina** — empleados + generación de rol de pagos por período. Ver el disclaimer legal más abajo.

**Sistema**
- **Usuarios** — Administrador, Técnico o Cliente. Ver la sección de roles abajo.

**Sitio público**
- **Servicios** y **Paquetes** — el contenido que alimenta la página pública.

### Portal del cliente (`/portal`)
Vista de solo lectura para usuarios con rol Cliente: sus propios proyectos, activos instalados, cotizaciones
y facturas. Un cliente nunca ve datos de otro cliente.

## Roles y quién ve qué

| Rol | Acceso |
|---|---|
| **Administrador** | Todo `/admin` |
| **Técnico** | Solo `/admin/mis-tareas` — sus tareas asignadas y el checklist de cada una. Si intenta entrar a otra URL de `/admin` (por ejemplo `/admin/clientes`), el sistema lo redirige de vuelta. No ve datos financieros ni de otros clientes. |
| **Cliente** | Solo `/portal` — únicamente la información de su propio `Cliente` (proyectos, activos, cotizaciones, facturas). |

Los usuarios se crean desde `/admin/usuarios` (solo Administrador). Un usuario con rol Cliente debe
vincularse a un registro de `Cliente` existente al crearlo.

## Stack

- Next.js 16 (App Router, Server Actions, Turbopack)
- Prisma 7 + `@prisma/adapter-pg` (driver adapter — obligatorio desde Prisma 7, ver nota abajo)
- PostgreSQL (Supabase en producción, Docker local para desarrollo)
- Vercel Blob (`@vercel/blob`) para las fotos de producto de Inventario
- Autenticación propia con sesión firmada (JWT vía `jose`) en cookie httpOnly
- Tailwind CSS v4 + el mismo sistema de diseño (tokens, tipografía Poppins/Open Sans/IBM Plex Mono) del
  Artifact original, cargado con `next/font/google`

## Cómo correrlo en local

### 1. Base de datos (Docker)

```bash
docker run -d --name netseg-pg \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=netseg \
  -p 5432:5432 -v netseg-pg-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

(Si el contenedor `netseg-pg` ya existe de una sesión anterior, solo `docker start netseg-pg`.)

### 2. Variables de entorno

Copia `.env.example` a `.env`. Las variables `NETSEG_*` (RUC, SBU) son opcionales — sin ellas, Facturación
y Nómina siguen funcionando pero con las limitaciones descritas abajo.

### 3. Instalar, sincronizar esquema y sembrar datos

```bash
npm install
npm run db:push   # crea las tablas en Postgres
npm run db:seed   # carga los 19 servicios, 3 paquetes y el usuario admin
npm run dev
```

Abre `http://localhost:3000` para el sitio público y `http://localhost:3000/admin/login` para el panel
(usa el `ADMIN_EMAIL` / `ADMIN_PASSWORD` de tu `.env`).

**Importante:** cada vez que cambie el esquema de datos (`prisma/schema.prisma`), reinicia `npm run dev`
(Ctrl+C y volver a correrlo) — el proceso ya corriendo se queda con el cliente de Prisma viejo en memoria y
las páginas que usan modelos nuevos truenan hasta reiniciar.

## ⚠️ Nota sobre Prisma 7: usa `db:push`, no `db:migrate`, por ahora

Prisma 7 requiere un driver adapter y mueve la configuración de conexión a `prisma.config.ts`. En este setup,
`prisma migrate dev` falla al crear la shadow database (error `P1003`). `prisma db push` funciona perfectamente
y es lo que usan los scripts `db:push` / `db:seed`.

**Además**, Prisma detecta cuando un agente de IA intenta correr una operación destructiva (borrar/renombrar
una tabla con datos) y la bloquea salvo que el usuario dé consentimiento explícito — así se manejó el cambio
de `Admin` a `Usuario` en esta sesión. Es una protección real, no un error: cualquier cambio de esquema que
implique pérdida de datos en producción debe confirmarse contigo antes de aplicarse.

## Facturación electrónica SRI — qué funciona y qué no

El sistema genera:
- **Número de comprobante** con el formato oficial (`001-001-000000001`).
- **Clave de acceso** de 49 dígitos con el algoritmo real del SRI (módulo 11).
- **XML base** de la factura según el esquema v1.1.0.

**Lo que NO hace** (y no puede hacer sin configuración tuya): firmar el XML con XAdES-BES usando tu
certificado de firma electrónica (.p12), ni enviarlo a los web services de recepción/autorización del SRI.
Eso requiere el certificado digital real de NetSeg, emitido por una entidad autorizada (Banco Central,
Security Data, etc.) a nombre del RUC del negocio — algo que solo tú puedes tramitar.

**Para activar la generación de clave/XML**, configura en `.env`: `NETSEG_RUC`, `NETSEG_RAZON_SOCIAL`,
`NETSEG_ESTABLECIMIENTO`, `NETSEG_PUNTO_EMISION`, `NETSEG_DIRECCION`, `NETSEG_AMBIENTE` (`1`=pruebas,
`2`=producción). Sin `NETSEG_RUC`, el botón "Generar XML y clave de acceso" muestra un error explicando qué falta.

## Nómina — herramienta de cálculo, no un sistema certificado

Calcula automáticamente: aporte personal IESS (9.45%), aporte patronal IESS (11.15%), décimo tercero y
décimo cuarto mensualizados. El **impuesto a la renta** se deja como un campo editable en cero — su tabla
cambia cada año y debe confirmarlo un contador, no se calcula aquí. El Salario Básico Unificado (usado para
el décimo cuarto) es configurable vía `NETSEG_SBU` en `.env` (cambia cada enero).

Esto es una herramienta de apoyo para armar el rol de pagos más rápido, no reemplaza la responsabilidad de
un contador ni garantiza cumplimiento tributario/laboral.

## Pasar a producción (Supabase + Vercel)

**Ya está hecho** — el proyecto Supabase (`netseg-solutions`, región `sa-east-1`) y el proyecto Vercel
(`sorteospremieur-s-projects/netseg-solutions`) están creados y conectados:

- `DATABASE_URL` (Production) apunta al **connection pooler** de Supabase
  (`...pooler.supabase.com:6543/...?pgbouncer=true`) — recomendado sobre la conexión directa porque las
  funciones serverless de Vercel abren muchas conexiones cortas y el pooler las reutiliza.
- `SESSION_SECRET` (Production) ya está configurado con un valor propio de producción (distinto del de `.env`
  local, que es solo para desarrollo).
- `BLOB_READ_WRITE_TOKEN` ya está en Production/Preview/Development (ver sección de fotos de producto).
- El schema ya se aplicó (`prisma db push`) y se sembraron los 19 servicios, 3 paquetes y el usuario admin
  contra esa base — **las credenciales del admin de producción se te dieron una sola vez por chat**, no están
  en ningún archivo del repo; guárdalas en un gestor de contraseñas.

Lo único que falta para que quede público es el primer deploy real (`vercel deploy --prod`, o conectar el
repo a Git para que despliegue solo en cada push) y, si vas a usar Facturación/Nómina, agregar las
`NETSEG_*` como variables de entorno de Production.

Si en algún momento quieres regenerar las credenciales de producción (contraseña de la base de datos,
`SESSION_SECRET` o la clave del admin), avisa y se rotan — no hay que recrear el proyecto.

## Qué quedó fuera de este alcance (a propósito)

- **Las 9 calculadoras de costo de InfraControl** (`lib/costo-solucion-*.ts`). Son TypeScript puro sin
  dependencias de InfraControl, se pueden copiar casi literal el día que quieras que las líneas de una
  cotización se calculen solas en vez de escribirlas a mano.
- **Historial de versiones de activos** (InfraControl's `ActivoVersion`, con diff JSON de cada cambio). Hoy
  `ActivoCliente` guarda solo el estado actual del equipo, no quién cambió qué y cuándo.
- **Firma y envío real al SRI** — ver sección de Facturación arriba.
- **Tabla de impuesto a la renta automática** — ver sección de Nómina arriba.
- **Licitaciones** (específico de concursos públicos en Ecuador) — no aplica a NetSeg como empresa privada,
  a menos que en el futuro participen en contratación pública.
