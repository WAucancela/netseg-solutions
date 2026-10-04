import Link from "next/link";
import { BrandMarkIcon } from "./icons";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="wrap foot-top">
        <div>
          <div className="foot-brand">
            <span className="brand-mark" aria-hidden="true">
              <BrandMarkIcon />
            </span>
            NetSeg Solutions
          </div>
          <p className="foot-desc">
            Seguridad electrónica e infraestructura de redes para empresas, condominios e industria en Ecuador.
          </p>
        </div>
        <div>
          <h5>Navegación</h5>
          <ul className="foot-links">
            <li>
              <Link href="#servicios">Servicios</Link>
            </li>
            <li>
              <Link href="#productos">Productos</Link>
            </li>
            <li>
              <Link href="#proceso">Proceso</Link>
            </li>
            <li>
              <Link href="#nosotros">Nosotros</Link>
            </li>
            <li>
              <Link href="#contacto">Contacto</Link>
            </li>
          </ul>
        </div>
        <div>
          <h5>Contacto</h5>
          <div className="foot-contact">
            <span className="mono">+593 99 000 0000</span>
            <span className="mono">contacto@netsegsolutions.ec</span>
            <span>Quito, Ecuador · cobertura nacional</span>
          </div>
        </div>
      </div>
      <div className="wrap foot-bottom">
        <span>© {year} NetSeg Solutions</span>
        <span>Técnicos certificados · Facturación electrónica SRI</span>
        <Link href="/admin/login" className="foot-admin-link">
          Acceso administrativo
        </Link>
      </div>
    </footer>
  );
}
