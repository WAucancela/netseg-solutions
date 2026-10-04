import Link from "next/link";
import { BrandMarkIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  return (
    <nav className="nav">
      <div className="wrap nav-row">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <BrandMarkIcon />
          </span>
          NetSeg Solutions
        </div>
        <div className="nav-links">
          <Link href="#servicios">Servicios</Link>
          <Link href="#productos">Productos</Link>
          <Link href="#proceso">Proceso</Link>
          <Link href="#nosotros">Nosotros</Link>
          <Link href="#contacto">Contacto</Link>
        </div>
        <div className="nav-actions">
          <ThemeToggle />
          <Link href="#contacto" className="btn btn-primary btn-sm nav-cta">
            Solicitar cotización
          </Link>
        </div>
      </div>
    </nav>
  );
}
