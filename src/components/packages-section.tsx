import Link from "next/link";
import { CheckIcon, InfoIcon } from "./icons";

type PaqueteConItems = {
  id: string;
  nombre: string;
  descripcionAlcance: string;
  precioDesde: number | null;
  notaPrecio: string | null;
  destacado: boolean;
  premium: boolean;
  items: { id: string; texto: string }[];
};

function formatPrecio(precio: number | null) {
  if (precio === null) return null;
  return `$${precio.toLocaleString("en-US")}`;
}

export function PackagesSection({ paquetes }: { paquetes: PaqueteConItems[] }) {
  return (
    <section id="productos" className="alt-surface">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Productos</span>
          <h2>Paquetes de solución según el tamaño de tu sitio.</h2>
          <p className="lede">
            Cada paquete combina equipos, cableado y horas de instalación. El alcance final se ajusta tras el
            diagnóstico técnico; la cotización siempre es a medida.
          </p>
        </div>

        <div className="tier-grid">
          {paquetes.map((p) => {
            const precio = formatPrecio(p.precioDesde);
            const cardClass = ["tier-card", p.destacado && "featured", p.premium && "premium"]
              .filter(Boolean)
              .join(" ");
            return (
              <article className={cardClass} key={p.id}>
                {p.destacado && <span className="tier-badge">Más solicitado</span>}
                {p.premium && <span className="tier-badge dark">A la medida</span>}
                <span className="tier-name">{p.nombre}</span>
                {precio ? (
                  <span className="tier-price">
                    {precio}
                    <span className="per">instalación desde</span>
                  </span>
                ) : (
                  <span className="tier-price custom">Cotización personalizada</span>
                )}
                {p.notaPrecio && <span className="tier-price-note">{p.notaPrecio}</span>}
                <p className="tier-scope">{p.descripcionAlcance}</p>
                <ul className="tier-list">
                  {p.items.map((item) => (
                    <li key={item.id}>
                      <CheckIcon size={16} />
                      {item.texto}
                    </li>
                  ))}
                </ul>
                <Link href="#contacto" className={`btn ${p.destacado ? "btn-primary" : "btn-ghost"}`}>
                  Cotizar {p.nombre}
                </Link>
              </article>
            );
          })}
        </div>

        <div className="secaas-banner">
          <span className="icon">
            <InfoIcon />
          </span>
          <p>
            <strong>¿Prefieres rentar en vez de comprar?</strong> Cualquier paquete está disponible como Seguridad
            como Servicio (SECaaS): pagas una mensualidad que incluye equipo, instalación y soporte, sin inversión
            inicial.
          </p>
        </div>
      </div>
    </section>
  );
}
