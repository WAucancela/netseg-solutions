import { getSession } from "@/lib/auth";
import { cerrarSesion } from "../logout-action";
import { AdminNav } from "@/components/admin-nav";
import { BrandMarkIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark" aria-hidden="true">
            <BrandMarkIcon />
          </span>
          NetSeg Admin
          <span style={{ marginLeft: "auto" }}>
            <ThemeToggle />
          </span>
        </div>
        <AdminNav rol={session?.rol ?? "ADMIN"} />
        <div style={{ flex: 1 }} />
        <div style={{ padding: "0 12px", fontSize: ".78rem", color: "var(--muted)", marginBottom: 8 }}>
          {session?.email}
        </div>
        <form action={cerrarSesion}>
          <button type="submit" className="btn btn-ghost btn-sm" style={{ width: "100%" }}>
            Cerrar sesión
          </button>
        </form>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
