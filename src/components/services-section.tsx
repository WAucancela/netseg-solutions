import { CheckIcon, ServiceIcon } from "./icons";

type ServicioConItems = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  destacado: boolean;
  items: { id: string; texto: string }[];
};

export function ServicesSection({ servicios }: { servicios: ServicioConItems[] }) {
  const principales = servicios.filter((s) => s.destacado);
  const adicionales = servicios.filter((s) => !s.destacado);

  return (
    <section id="servicios">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Servicios</span>
          <h2>Un solo proveedor para seguridad, cableado y red.</h2>
          <p className="lede">
            Cada proyecto se entrega con diagrama de topología, inventario de equipos y manual de operación — no
            solo la instalación.
          </p>
        </div>

        <div className="svc-grid">
          {principales.map((s) => (
            <article className="svc-card" key={s.id}>
              <div className="svc-icon">
                <ServiceIcon slug={s.slug} />
              </div>
              <h3>{s.nombre}</h3>
              <p>{s.descripcion}</p>
              {s.items.length > 0 && (
                <ul className="svc-list">
                  {s.items.map((item) => (
                    <li key={item.id}>
                      <CheckIcon />
                      {item.texto}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        {adicionales.length > 0 && (
          <>
            <div className="svc-subhead">
              <h3>También trabajamos con</h3>
              <span>Se cotizan como complemento a cualquiera de los servicios anteriores</span>
            </div>
            <div className="svc-mini-grid">
              {adicionales.map((s) => (
                <div className="svc-mini" key={s.id}>
                  <div className="svc-icon">
                    <ServiceIcon slug={s.slug} size={18} />
                  </div>
                  <div>
                    <h4>{s.nombre}</h4>
                    <p>{s.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
