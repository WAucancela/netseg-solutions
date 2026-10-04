import { getSession } from "@/lib/auth";
import { cerrarSesion } from "../admin/logout-action";
import { BrandMarkIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav className="nav">
        <div className="wrap nav-row">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <BrandMarkIcon />
            </span>
            NetSeg Solutions
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>{session?.email}</span>
            <form action={cerrarSesion}>
              <button type="submit" className="btn btn-ghost btn-sm">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="wrap" style={{ paddingBlock: 32 }}>
        {children}
      </main>
    </div>
  );
}
