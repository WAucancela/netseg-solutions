/**
 * Utilidades de facturación electrónica SRI (Ecuador).
 *
 * Implementa la clave de acceso de 49 dígitos y el XML base de una factura
 * según la ficha técnica de comprobantes electrónicos del SRI. Lo que NO
 * hace esta librería: firmar el XML (XAdES-BES con el .p12 del RUC) ni
 * enviarlo a los web services de recepción/autorización del SRI — ambos
 * pasos requieren el certificado de firma electrónica real de NetSeg, que
 * no existe en este entorno de desarrollo. Ver README para el flujo manual
 * mientras tanto.
 */

export type EmisorConfig = {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  establecimiento: string; // 3 dígitos
  puntoEmision: string; // 3 dígitos
  direccionMatriz: string;
  ambiente: "1" | "2"; // 1 = pruebas, 2 = producción
};

export function getEmisorConfig(): EmisorConfig | null {
  const ruc = process.env.NETSEG_RUC;
  if (!ruc || ruc.length !== 13) return null;
  return {
    ruc,
    razonSocial: process.env.NETSEG_RAZON_SOCIAL ?? "NETSEG SOLUTIONS",
    nombreComercial: process.env.NETSEG_NOMBRE_COMERCIAL ?? "NetSeg Solutions",
    establecimiento: process.env.NETSEG_ESTABLECIMIENTO ?? "001",
    puntoEmision: process.env.NETSEG_PUNTO_EMISION ?? "001",
    direccionMatriz: process.env.NETSEG_DIRECCION ?? "Quito, Ecuador",
    ambiente: process.env.NETSEG_AMBIENTE === "2" ? "2" : "1",
  };
}

function digitoVerificadorModulo11(digitos: string): string {
  const pesos = [2, 3, 4, 5, 6, 7];
  let suma = 0;
  let pesoIdx = 0;
  for (let i = digitos.length - 1; i >= 0; i--) {
    suma += Number(digitos[i]) * pesos[pesoIdx];
    pesoIdx = (pesoIdx + 1) % pesos.length;
  }
  const resto = suma % 11;
  const resultado = 11 - resto;
  if (resultado === 11) return "0";
  if (resultado === 10) return "1";
  return String(resultado);
}

function codigoNumericoAleatorio(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

function formatFechaDDMMYYYY(fecha: Date): string {
  const dd = String(fecha.getDate()).padStart(2, "0");
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const yyyy = fecha.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

/**
 * Genera la clave de acceso de 49 dígitos para una factura (tipo 01).
 * `secuencial` es el número de comprobante, 1-9 dígitos, se rellena a 9.
 */
export function generarClaveAcceso(params: {
  fecha: Date;
  emisor: EmisorConfig;
  secuencial: string;
}): string {
  const { fecha, emisor, secuencial } = params;
  const tipoComprobante = "01"; // factura
  const serie = `${emisor.establecimiento}${emisor.puntoEmision}`;
  const secuencial9 = secuencial.padStart(9, "0");
  const tipoEmision = "1"; // normal

  const base =
    formatFechaDDMMYYYY(fecha) +
    tipoComprobante +
    emisor.ruc +
    emisor.ambiente +
    serie +
    secuencial9 +
    codigoNumericoAleatorio() +
    tipoEmision;

  const dv = digitoVerificadorModulo11(base);
  return base + dv;
}

export function generarNumeroComprobante(emisor: EmisorConfig, secuencial: string): string {
  return `${emisor.establecimiento}-${emisor.puntoEmision}-${secuencial.padStart(9, "0")}`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type FacturaLineaXml = { descripcion: string; cantidad: number; precioUnitario: number };

/**
 * Genera el XML base (sin firmar) de la factura según el esquema v1.1.0 del SRI.
 * Estructuralmente correcto; no reemplaza la validación oficial del SRI.
 */
export function generarXmlFactura(params: {
  claveAcceso: string;
  numero: string;
  fecha: Date;
  emisor: EmisorConfig;
  cliente: { razonSocial: string; ruc: string; direccion?: string | null };
  lineas: FacturaLineaXml[];
  ivaPct: number;
}): string {
  const { claveAcceso, numero, fecha, emisor, cliente, lineas, ivaPct } = params;
  const [establecimiento, puntoEmision, secuencial] = numero.split("-");

  const subtotal = lineas.reduce((acc, l) => acc + l.cantidad * l.precioUnitario, 0);
  const valorIva = subtotal * (ivaPct / 100);
  const importeTotal = subtotal + valorIva;

  const detalles = lineas
    .map(
      (l) => `    <detalle>
      <descripcion>${escapeXml(l.descripcion)}</descripcion>
      <cantidad>${l.cantidad.toFixed(2)}</cantidad>
      <precioUnitario>${l.precioUnitario.toFixed(2)}</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>${(l.cantidad * l.precioUnitario).toFixed(2)}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>${ivaPct === 0 ? "0" : "4"}</codigoPorcentaje>
          <tarifa>${ivaPct.toFixed(2)}</tarifa>
          <baseImponible>${(l.cantidad * l.precioUnitario).toFixed(2)}</baseImponible>
          <valor>${(l.cantidad * l.precioUnitario * (ivaPct / 100)).toFixed(2)}</valor>
        </impuesto>
      </impuestos>
    </detalle>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>${emisor.ambiente}</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>${escapeXml(emisor.razonSocial)}</razonSocial>
    <nombreComercial>${escapeXml(emisor.nombreComercial)}</nombreComercial>
    <ruc>${emisor.ruc}</ruc>
    <claveAcceso>${claveAcceso}</claveAcceso>
    <codDoc>01</codDoc>
    <estab>${establecimiento}</estab>
    <ptoEmi>${puntoEmision}</ptoEmi>
    <secuencial>${secuencial}</secuencial>
    <dirMatriz>${escapeXml(emisor.direccionMatriz)}</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}</fechaEmision>
    <dirEstablecimiento>${escapeXml(emisor.direccionMatriz)}</dirEstablecimiento>
    <obligadoContabilidad>NO</obligadoContabilidad>
    <tipoIdentificacionComprador>${cliente.ruc.length === 13 ? "04" : "05"}</tipoIdentificacionComprador>
    <razonSocialComprador>${escapeXml(cliente.razonSocial)}</razonSocialComprador>
    <identificacionComprador>${cliente.ruc}</identificacionComprador>
    <direccionComprador>${escapeXml(cliente.direccion ?? "")}</direccionComprador>
    <totalSinImpuestos>${subtotal.toFixed(2)}</totalSinImpuestos>
    <totalDescuento>0.00</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>${ivaPct === 0 ? "0" : "4"}</codigoPorcentaje>
        <baseImponible>${subtotal.toFixed(2)}</baseImponible>
        <valor>${valorIva.toFixed(2)}</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <propina>0.00</propina>
    <importeTotal>${importeTotal.toFixed(2)}</importeTotal>
    <moneda>DOLAR</moneda>
  </infoFactura>
  <detalles>
${detalles}
  </detalles>
</factura>`;
}
