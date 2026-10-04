import { CheckIcon } from "./icons";

const RAZONES = [
  "Planos as-built entregados al cierre de cada proyecto",
  "Equipos con garantía, compatibles con ONVIF y PoE estándar",
  "Cumplimiento normativo y facturación electrónica ante el SRI",
  "Técnicos certificados en instalaciones de baja tensión",
  "Tiempos de respuesta de soporte definidos por contrato",
];

export function WhySection() {
  return (
    <section id="nosotros" className="alt-surface">
      <div className="wrap why">
        <div>
          <span className="eyebrow">Por qué NetSeg</span>
          <h2 style={{ fontSize: "clamp(1.5rem,2.6vw,1.9rem)", marginTop: 10, marginBottom: 20, letterSpacing: "-.01em" }}>
            Rigor técnico, no solo instalación.
          </h2>
          <ul className="check-list">
            {RAZONES.map((r) => (
              <li key={r}>
                <CheckIcon size={18} />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="why-panel">
          <span className="eyebrow">Enfoque</span>
          <blockquote>
            &ldquo;Un sistema de seguridad es tan bueno como la red que lo sostiene — por eso diseñamos ambos
            juntos, desde el primer diagnóstico.&rdquo;
          </blockquote>
          <p className="attrib">Principio de diseño de NetSeg Solutions</p>
        </div>
      </div>
    </section>
  );
}
