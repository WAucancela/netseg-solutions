import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ActividadCronograma } from "@/lib/cronograma";

const INK = "#0f172a";
const ACCENT = "#0369a1";
const MUTED = "#55697a";
const BORDER = "#dbe3ec";
const SURFACE_2 = "#eef2f6";

const fmt = (n: number) => `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const styles = StyleSheet.create({
  page: { fontSize: 9, color: INK, paddingTop: 90, paddingBottom: 48, paddingHorizontal: 32, fontFamily: "Helvetica" },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 66,
    flexDirection: "row",
  },
  headerLeft: { flex: 1, backgroundColor: INK, padding: 18, justifyContent: "center" },
  headerRight: { width: 180, backgroundColor: ACCENT, padding: 18, justifyContent: "center" },
  brandName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  brandTagline: { fontSize: 7, color: "#cbd5e1", marginTop: 4 },
  docTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#ffffff", letterSpacing: 1 },
  docMeta: { fontSize: 8, color: "#e0f2fe", marginTop: 3 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 22,
    backgroundColor: ACCENT,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  footerText: { fontSize: 7, color: "#ffffff" },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: INK, marginTop: 16, marginBottom: 8 },
  clienteBox: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    backgroundColor: SURFACE_2,
    padding: 10,
    marginTop: 4,
  },
  row: { flexDirection: "row" },
  label: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  summaryBoxes: { flexDirection: "row", gap: 8, marginTop: 4, marginBottom: 8 },
  summaryBox: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 3 },
  summaryBoxHeader: { backgroundColor: INK, color: "#ffffff", fontSize: 7, fontFamily: "Helvetica-Bold", padding: 4, letterSpacing: 0.5 },
  summaryBoxBody: { padding: 8 },
  summaryBoxValue: { fontSize: 15, fontFamily: "Helvetica-Bold", color: ACCENT },
  summaryBoxSub: { fontSize: 7, color: MUTED, marginTop: 2 },
  paragraph: { fontSize: 8.5, color: "#1e293b", lineHeight: 1.5, marginTop: 4 },
  table: { marginTop: 4, borderWidth: 1, borderColor: BORDER },
  theadRow: { flexDirection: "row", backgroundColor: INK },
  theadCell: { color: "#ffffff", fontSize: 7.5, fontFamily: "Helvetica-Bold", padding: 4 },
  categoriaRow: { backgroundColor: SURFACE_2, borderLeftWidth: 3, borderLeftColor: ACCENT, paddingVertical: 3, paddingHorizontal: 5 },
  categoriaText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: INK },
  lineaRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER, paddingVertical: 3 },
  cellNum: { width: 20, fontSize: 8, paddingHorizontal: 4 },
  cellDesc: { flex: 1, fontSize: 8, paddingHorizontal: 4 },
  cellCant: { width: 36, fontSize: 8, paddingHorizontal: 4, textAlign: "center" },
  cellUnid: { width: 28, fontSize: 8, paddingHorizontal: 4, textAlign: "center" },
  cellPrecio: { width: 52, fontSize: 8, paddingHorizontal: 4, textAlign: "right" },
  cellSubtotal: { width: 60, fontSize: 8, paddingHorizontal: 4, textAlign: "right", fontFamily: "Helvetica-Bold" },
  totalesBox: { marginTop: 8, alignItems: "flex-end" },
  totalesLinea: { flexDirection: "row", width: 180, justifyContent: "space-between", paddingVertical: 2 },
  totalFinal: {
    flexDirection: "row",
    width: 180,
    justifyContent: "space-between",
    backgroundColor: ACCENT,
    padding: 5,
    marginTop: 3,
  },
  totalFinalText: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 10 },
  criterio: { fontSize: 7, color: MUTED, marginTop: 6, lineHeight: 1.4, fontStyle: "italic" },
  ttCard: { flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER, paddingVertical: 6 },
  ttLabel: { width: 110, fontSize: 8, fontFamily: "Helvetica-Bold", color: INK },
  ttValue: { flex: 1, fontSize: 8, color: "#1e293b", lineHeight: 1.4 },
  firmas: { flexDirection: "row", justifyContent: "space-between", marginTop: 50 },
  firmaBox: { width: "42%", borderTopWidth: 1, borderTopColor: INK, paddingTop: 4 },
  firmaNombre: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  firmaCargo: { fontSize: 7, color: MUTED, marginTop: 2 },
  ganttHeader: { flexDirection: "row", backgroundColor: INK },
  ganttHeaderLabel: { width: 150, color: "#fff", fontSize: 7, fontFamily: "Helvetica-Bold", padding: 4 },
  ganttDayHeader: { fontSize: 6, color: "#fff", textAlign: "center", paddingVertical: 4 },
  ganttRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER, alignItems: "center" },
  ganttRowLabel: { width: 150, fontSize: 7, padding: 4 },
  ganttDayCell: { borderLeftWidth: 1, borderLeftColor: "#f1f5f9" },
  ganttSeccionBand: { backgroundColor: SURFACE_2, paddingVertical: 2, paddingHorizontal: 5 },
  ganttSeccionText: { fontSize: 7, fontFamily: "Helvetica-Bold", color: ACCENT },
  legendRow: { flexDirection: "row", gap: 14, marginTop: 6, alignItems: "center" },
  legendSwatch: { width: 10, height: 7, marginRight: 4 },
  legendText: { fontSize: 7, color: MUTED },
});

export type LineaPdf = { categoria: string | null; descripcion: string; cantidad: number; unidad: string; precioUnitario: number };

export type CotizacionPdfData = {
  numero: string;
  version: number;
  fecha: string;
  validaHasta: string | null;
  ivaPct: number;
  proyecto: string | null;
  ubicacion: string | null;
  resumenEjecutivo: string | null;
  tiempoEjecucion: string | null;
  validezOferta: string | null;
  criterioCalculo: string | null;
  notasTerminos: string | null;
  cronograma: ActividadCronograma[];
  lineas: LineaPdf[];
  cliente: { razonSocial: string; nombreComercial: string | null; direccion: string | null };
  empresa: {
    nombre: string;
    tagline: string;
    contacto: string;
    ciudad: string;
    garantiaTexto: string;
    formaPagoTexto: string;
    requisitosTexto: string;
    alcanceTexto: string;
  };
};

function Header({ data }: { data: CotizacionPdfData }) {
  const [primero, ...resto] = data.empresa.nombre.split(" ");
  return (
    <View style={styles.header} fixed>
      <View style={styles.headerLeft}>
        <Text style={styles.brandName}>
          {primero} {resto.join(" ")}
        </Text>
        <Text style={styles.brandTagline}>
          {data.empresa.ciudad} · {data.empresa.contacto}
        </Text>
        <Text style={styles.brandTagline}>{data.empresa.tagline}</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.docTitle}>COTIZACIÓN</Text>
        <Text style={styles.docMeta}>
          {data.numero}
          {data.version > 1 ? ` · v${data.version}` : ""}
        </Text>
        <Text style={styles.docMeta}>{data.fecha}</Text>
      </View>
    </View>
  );
}

function Footer({ data }: { data: CotizacionPdfData }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        {data.numero}
        {data.version > 1 ? ` v${data.version}` : ""} · {data.proyecto ?? data.cliente.razonSocial}
      </Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  );
}

function Resumen({ data, total }: { data: CotizacionPdfData; total: number }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>1. Resumen ejecutivo</Text>
      <View style={styles.summaryBoxes}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryBoxHeader}>TOTAL</Text>
          <View style={styles.summaryBoxBody}>
            <Text style={styles.summaryBoxValue}>{fmt(total)}</Text>
          </View>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryBoxHeader}>TIEMPO DE EJECUCIÓN</Text>
          <View style={styles.summaryBoxBody}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{data.tiempoEjecucion || "A confirmar"}</Text>
          </View>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryBoxHeader}>VALIDEZ DE LA OFERTA</Text>
          <View style={styles.summaryBoxBody}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{data.validezOferta || "15 días calendario"}</Text>
          </View>
        </View>
      </View>
      {data.resumenEjecutivo && <Text style={styles.paragraph}>{data.resumenEjecutivo}</Text>}
    </View>
  );
}

function TablaLineas({ data, subtotal, iva, total }: { data: CotizacionPdfData; subtotal: number; iva: number; total: number }) {
  const categorias: { nombre: string; lineas: (LineaPdf & { numero: number })[] }[] = [];
  data.lineas.forEach((l, idx) => {
    const nombre = l.categoria?.trim() || "";
    const ultima = categorias[categorias.length - 1];
    if (ultima && ultima.nombre === nombre) {
      ultima.lineas.push({ ...l, numero: idx + 1 });
    } else {
      categorias.push({ nombre, lineas: [{ ...l, numero: idx + 1 }] });
    }
  });

  return (
    <View>
      <Text style={styles.sectionTitle}>2. Desglose de materiales y mano de obra</Text>
      <View style={styles.table}>
        <View style={styles.theadRow} fixed>
          <Text style={[styles.theadCell, { width: 20 }]}>#</Text>
          <Text style={[styles.theadCell, { flex: 1 }]}>Ítem</Text>
          <Text style={[styles.theadCell, { width: 36, textAlign: "center" }]}>Cant.</Text>
          <Text style={[styles.theadCell, { width: 28, textAlign: "center" }]}>Unid.</Text>
          <Text style={[styles.theadCell, { width: 52, textAlign: "right" }]}>P. unit.</Text>
          <Text style={[styles.theadCell, { width: 60, textAlign: "right" }]}>Subtotal</Text>
        </View>
        {categorias.map((cat, ci) => (
          <View key={ci}>
            {cat.nombre && (
              <View style={styles.categoriaRow} wrap={false}>
                <Text style={styles.categoriaText}>{cat.nombre}</Text>
              </View>
            )}
            {cat.lineas.map((l) => (
              <View key={l.numero} style={styles.lineaRow} wrap={false}>
                <Text style={styles.cellNum}>{l.numero}</Text>
                <Text style={styles.cellDesc}>{l.descripcion}</Text>
                <Text style={styles.cellCant}>{l.cantidad}</Text>
                <Text style={styles.cellUnid}>{l.unidad}</Text>
                <Text style={styles.cellPrecio}>{fmt(l.precioUnitario)}</Text>
                <Text style={styles.cellSubtotal}>{fmt(l.cantidad * l.precioUnitario)}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.totalesBox}>
        <View style={styles.totalesLinea}>
          <Text style={{ fontSize: 8.5, color: MUTED }}>Subtotal</Text>
          <Text style={{ fontSize: 8.5 }}>{fmt(subtotal)}</Text>
        </View>
        <View style={styles.totalesLinea}>
          <Text style={{ fontSize: 8.5, color: MUTED }}>IVA ({data.ivaPct}%)</Text>
          <Text style={{ fontSize: 8.5 }}>{fmt(iva)}</Text>
        </View>
        <View style={styles.totalFinal}>
          <Text style={styles.totalFinalText}>TOTAL</Text>
          <Text style={styles.totalFinalText}>{fmt(total)}</Text>
        </View>
      </View>

      {data.criterioCalculo && <Text style={styles.criterio}>Criterio de cálculo: {data.criterioCalculo}</Text>}
    </View>
  );
}

const COLOR_SITIO = "#0369a1";
const COLOR_TALLER = "#0f172a";

function Cronograma({ actividades }: { actividades: ActividadCronograma[] }) {
  if (actividades.length === 0) return null;
  const totalDias = Math.max(...actividades.map((a) => a.diaInicio + a.duracionDias - 1));
  const dias = Array.from({ length: totalDias }, (_, i) => i + 1);
  const anchoDia = Math.min(20, Math.max(10, Math.floor(330 / totalDias)));

  const secciones: { nombre: string; actividades: ActividadCronograma[] }[] = [];
  actividades.forEach((a) => {
    const ultima = secciones[secciones.length - 1];
    if (ultima && ultima.nombre === a.seccion) ultima.actividades.push(a);
    else secciones.push({ nombre: a.seccion, actividades: [a] });
  });

  return (
    <View break>
      <Text style={styles.sectionTitle}>3. Cronograma de trabajo</Text>
      <View style={styles.table}>
        <View style={styles.ganttHeader}>
          <Text style={styles.ganttHeaderLabel}>Actividad</Text>
          {dias.map((d) => (
            <Text key={d} style={[styles.ganttDayHeader, { width: anchoDia }]}>
              D{d}
            </Text>
          ))}
        </View>
        {secciones.map((sec, si) => (
          <View key={si}>
            {sec.nombre && (
              <View style={styles.ganttSeccionBand} wrap={false}>
                <Text style={styles.ganttSeccionText}>{sec.nombre}</Text>
              </View>
            )}
            {sec.actividades.map((a, ai) => (
              <View key={ai} style={styles.ganttRow} wrap={false}>
                <Text style={styles.ganttRowLabel}>{a.actividad}</Text>
                {dias.map((d) => {
                  const activo = d >= a.diaInicio && d < a.diaInicio + a.duracionDias;
                  const esInicio = d === a.diaInicio;
                  return (
                    <View key={d} style={[styles.ganttDayCell, { width: anchoDia, height: 16, justifyContent: "center", alignItems: "center" }]}>
                      {activo && a.tipo === "hito" && esInicio && (
                        <View style={{ width: 7, height: 7, backgroundColor: COLOR_SITIO, transform: "rotate(45deg)" }} />
                      )}
                      {activo && a.tipo !== "hito" && (
                        <View
                          style={{
                            width: "82%",
                            height: 9,
                            backgroundColor: a.tipo === "taller" ? COLOR_TALLER : COLOR_SITIO,
                            borderRadius: 2,
                          }}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legendRow}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.legendSwatch, { backgroundColor: COLOR_SITIO, borderRadius: 2 }]} />
          <Text style={styles.legendText}>Trabajo en sitio</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.legendSwatch, { backgroundColor: COLOR_TALLER, borderRadius: 2 }]} />
          <Text style={styles.legendText}>Fabricación en taller</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 7, height: 7, backgroundColor: COLOR_SITIO, transform: "rotate(45deg)", marginRight: 6 }} />
          <Text style={styles.legendText}>Hito de entrega</Text>
        </View>
      </View>
    </View>
  );
}

function Terminos({ data }: { data: CotizacionPdfData }) {
  return (
    <View break>
      <Text style={styles.sectionTitle}>4. Términos y condiciones</Text>
      <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 3 }}>
        <View style={[styles.ttCard, { borderTopWidth: 0 }]} wrap={false}>
          <Text style={styles.ttLabel}>Garantía</Text>
          <Text style={styles.ttValue}>{data.empresa.garantiaTexto}</Text>
        </View>
        <View style={styles.ttCard} wrap={false}>
          <Text style={styles.ttLabel}>Forma de pago</Text>
          <Text style={styles.ttValue}>{data.empresa.formaPagoTexto}</Text>
        </View>
        <View style={styles.ttCard} wrap={false}>
          <Text style={styles.ttLabel}>Requerimientos previos</Text>
          <Text style={styles.ttValue}>{data.empresa.requisitosTexto}</Text>
        </View>
        <View style={styles.ttCard} wrap={false}>
          <Text style={styles.ttLabel}>Alcance</Text>
          <Text style={styles.ttValue}>{data.empresa.alcanceTexto}</Text>
        </View>
        {data.notasTerminos && (
          <View style={styles.ttCard} wrap={false}>
            <Text style={styles.ttLabel}>Notas adicionales</Text>
            <Text style={styles.ttValue}>{data.notasTerminos}</Text>
          </View>
        )}
      </View>

      <View style={styles.firmas} wrap={false}>
        <View style={styles.firmaBox}>
          <Text style={styles.firmaNombre}>{data.empresa.nombre}</Text>
          <Text style={styles.firmaCargo}>Representante</Text>
        </View>
        <View style={styles.firmaBox}>
          <Text style={styles.firmaNombre}>Aceptación del cliente</Text>
          <Text style={styles.firmaCargo}>Nombre, firma y fecha</Text>
        </View>
      </View>
    </View>
  );
}

export function CotizacionPdf({ data }: { data: CotizacionPdfData }) {
  const subtotal = data.lineas.reduce((acc, l) => acc + l.cantidad * l.precioUnitario, 0);
  const iva = subtotal * (data.ivaPct / 100);
  const total = subtotal + iva;

  return (
    <Document title={`Cotización ${data.numero}${data.version > 1 ? ` v${data.version}` : ""}`}>
      <Page size="A4" style={styles.page} wrap>
        <Header data={data} />
        <Footer data={data} />

        <View style={styles.clienteBox} wrap={false}>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente: </Text>
            <Text>{data.cliente.nombreComercial || data.cliente.razonSocial}</Text>
          </View>
          {data.ubicacion && (
            <View style={[styles.row, { marginTop: 2 }]}>
              <Text style={styles.label}>Ubicación: </Text>
              <Text>{data.ubicacion}</Text>
            </View>
          )}
          {data.proyecto && (
            <View style={[styles.row, { marginTop: 2 }]}>
              <Text style={styles.label}>Proyecto: </Text>
              <Text>{data.proyecto}</Text>
            </View>
          )}
        </View>

        <Resumen data={data} total={total} />
        <TablaLineas data={data} subtotal={subtotal} iva={iva} total={total} />
        <Cronograma actividades={data.cronograma} />
        <Terminos data={data} />
      </Page>
    </Document>
  );
}
