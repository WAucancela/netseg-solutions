"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GridIcon,
  UserPlusIcon,
  BuildingIcon,
  ReceiptIcon,
  FileSignatureIcon,
  FolderIcon,
  NetworkIcon,
  ListIcon,
  PackageIcon,
  BoxesIcon,
  TruckIcon,
  InvoiceIcon,
  WalletIcon,
  UsersIcon,
  ClipboardCheckIcon,
} from "./admin-icons";

type NavLink = { href: string; label: string; icon: (props: { size?: number }) => React.ReactElement; exact?: boolean };

const GRUPOS_ADMIN: { label: string | null; links: NavLink[] }[] = [
  { label: null, links: [{ href: "/admin", label: "Resumen", icon: GridIcon, exact: true }] },
  {
    label: "Comercial",
    links: [
      { href: "/admin/prospectos", label: "Prospectos", icon: UserPlusIcon },
      { href: "/admin/solicitudes", label: "Solicitudes", icon: ClipboardCheckIcon },
      { href: "/admin/clientes", label: "Clientes", icon: BuildingIcon },
      { href: "/admin/cotizaciones", label: "Cotizaciones", icon: ReceiptIcon },
      { href: "/admin/facturas", label: "Facturas", icon: InvoiceIcon },
      { href: "/admin/contratos", label: "Contratos", icon: FileSignatureIcon },
    ],
  },
  {
    label: "Operación",
    links: [
      { href: "/admin/proyectos", label: "Proyectos", icon: FolderIcon },
      { href: "/admin/activos", label: "Activos de red", icon: NetworkIcon },
    ],
  },
  {
    label: "Inventario",
    links: [
      { href: "/admin/inventario", label: "Productos", icon: BoxesIcon },
      { href: "/admin/compras", label: "Órdenes de compra", icon: TruckIcon },
      { href: "/admin/proveedores", label: "Proveedores", icon: BuildingIcon },
    ],
  },
  {
    label: "RRHH",
    links: [{ href: "/admin/nomina", label: "Nómina", icon: WalletIcon }],
  },
  {
    label: "Sitio público",
    links: [
      { href: "/admin/servicios", label: "Servicios", icon: ListIcon },
      { href: "/admin/paquetes", label: "Paquetes", icon: PackageIcon },
    ],
  },
  {
    label: "Sistema",
    links: [{ href: "/admin/usuarios", label: "Usuarios", icon: UsersIcon }],
  },
];

const GRUPOS_TECNICO: { label: string | null; links: NavLink[] }[] = [
  {
    label: null,
    links: [{ href: "/admin/mis-tareas", label: "Mis tareas", icon: ClipboardCheckIcon, exact: true }],
  },
];

export function AdminNav({ rol }: { rol: "ADMIN" | "TECNICO" | "CLIENTE" }) {
  const pathname = usePathname();
  const grupos = rol === "TECNICO" ? GRUPOS_TECNICO : GRUPOS_ADMIN;

  return (
    <>
      {grupos.map((grupo, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          {grupo.label && (
            <div
              style={{
                fontFamily: "var(--font-ibm-plex-mono)",
                fontSize: ".68rem",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--muted)",
                padding: "10px 12px 4px",
              }}
            >
              {grupo.label}
            </div>
          )}
          {grupo.links.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={isActive ? "active" : undefined}>
                <Icon size={17} />
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
