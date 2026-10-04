const PASOS = [
  {
    num: "01",
    titulo: "Diagnóstico técnico",
    texto: "Levantamiento en sitio: planos, puntos ciegos, cableado existente y requerimientos de conectividad.",
  },
  {
    num: "02",
    titulo: "Diseño de solución",
    texto: "Propuesta con equipos, topología de red y presupuesto detallado por partida.",
  },
  {
    num: "03",
    titulo: "Instalación certificada",
    texto: "Ejecución con técnicos de baja tensión y pruebas de enlace documentadas.",
  },
  {
    num: "04",
    titulo: "Soporte continuo",
    texto: "Monitoreo, mantenimiento programado y mesa de ayuda post-instalación.",
  },
];

export function ProcessSection() {
  return (
    <section id="proceso">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Proceso</span>
          <h2>De la visita técnica al soporte continuo.</h2>
        </div>
        <div className="process">
          {PASOS.map((p) => (
            <div className="pstep" key={p.num}>
              <span className="num mono">{p.num}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
