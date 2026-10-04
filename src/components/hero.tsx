import { CheckIcon } from "./icons";

export function Hero() {
  return (
    <header className="hero">
      <svg className="hero-grid" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="var(--border)" strokeWidth="1" />
          </pattern>
          <radialGradient id="fade" cx="30%" cy="20%" r="75%">
            <stop offset="0%" stopColor="var(--bg)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--bg)" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="1200" height="600" fill="url(#grid)" />
        <g stroke="var(--accent)" strokeWidth="1.4" fill="none" opacity=".3">
          <path d="M0 420 L260 420 L300 380 L520 380" />
          <path d="M120 600 L120 460 L220 380 L220 260" />
          <path d="M900 0 L900 140 L1020 220 L1200 220" />
        </g>
        <g fill="var(--accent)" opacity=".5">
          <circle cx="260" cy="420" r="4" />
          <circle cx="520" cy="380" r="4" />
          <circle cx="220" cy="260" r="4" />
          <circle cx="1020" cy="220" r="4" />
        </g>
        <rect width="1200" height="600" fill="url(#fade)" />
      </svg>

      <div className="wrap hero-inner">
        <div>
          <span className="eyebrow">Seguridad electrónica · Infraestructura de redes</span>
          <h1>Sistemas de seguridad y redes que tu operación no nota hasta que los necesita.</h1>
          <p className="lede">
            Diseñamos e instalamos videovigilancia, control de acceso, cableado estructurado y redes para empresas,
            condominios e industria — con planos as-built, equipos certificados y soporte real después de la
            entrega.
          </p>
          <div className="hero-actions">
            <a href="#contacto" className="btn btn-primary">
              Solicitar cotización
            </a>
            <a href="#servicios" className="btn btn-ghost">
              Ver servicios
            </a>
          </div>
          <div className="trust-badges">
            <span className="trust-badge">
              <CheckIcon />
              Técnicos certificados en baja tensión
            </span>
            <span className="trust-badge">
              <CheckIcon />
              Cobertura a nivel nacional
            </span>
            <span className="trust-badge">
              <CheckIcon />
              Facturación electrónica SRI
            </span>
          </div>
        </div>

        <div className="status-card" role="img" aria-label="Panel ilustrativo de estado del sistema">
          <div className="status-head">
            <span className="lbl">Panel de monitoreo · ilustrativo</span>
            <span className="pulse">
              <i />
              en línea
            </span>
          </div>
          <div className="status-rows">
            <div className="r">
              <span className="k">Cámaras IP activas</span>
              <span className="v ok mono">24 / 24</span>
            </div>
            <div className="r">
              <span className="k">Enlace troncal de fibra</span>
              <span className="v ok mono">estable · 0 caídas</span>
            </div>
            <div className="r">
              <span className="k">Control de acceso</span>
              <span className="v ok mono">3 zonas · sincronizado</span>
            </div>
            <div className="r">
              <span className="k">Respaldo de grabación</span>
              <span className="v warn mono">en curso · 82%</span>
            </div>
            <div className="r">
              <span className="k">Último mantenimiento</span>
              <span className="v mono">hace 12 días</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
