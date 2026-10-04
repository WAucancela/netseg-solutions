export function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandMarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M20 14.5A8.5 8.5 0 1110.5 4a7 7 0 009.5 10.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.2 2.2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/** Icon paths keyed by servicio slug, ported 1:1 from the marketing artifact. */
const SERVICE_ICON_PATHS: Record<string, React.ReactNode> = {
  "videovigilancia-ip": (
    <>
      <rect x="2" y="7" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 10l6-3v10l-6-3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </>
  ),
  "control-de-acceso": (
    <>
      <path d="M12 2l7 3v6c0 5-3.1 8.4-7 10-3.9-1.6-7-5-7-10V5l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "cableado-estructurado": (
    <>
      <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="19" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  "redes-y-conectividad": (
    <>
      <circle cx="6" cy="6" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="6" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="18" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 7.3L11 16M16 7.3L13 16M8.3 6h7.4" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  "alarmas-y-monitoreo": (
    <>
      <path d="M12 3a6 6 0 00-6 6v3.5L4 16h16l-2-3.5V9a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  "soporte-y-mantenimiento": (
    <>
      <path d="M14.7 6.3l3 3-8.4 8.4-3.6.6.6-3.6 8.4-8.4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13 8l3 3" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  "automatizacion-y-domotica": (
    <>
      <path d="M3 11l9-7 9 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20h14V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 20v-5.5h5V20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </>
  ),
  "sistemas-fotovoltaicos": <path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  "central-de-monitoreo-24-7": (
    <>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.7 21a2 2 0 01-3.4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  "respaldo-en-la-nube": (
    <path
      d="M6.5 17a4.5 4.5 0 01-.5-8.97A5.5 5.5 0 0116.9 6.5a4.5 4.5 0 01.6 8.98"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "videoanalitica-con-ia": (
    <>
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 12a8 8 0 0116 0M2 12a10 10 0 0120 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  "videoportero-e-intercomunicacion": (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  "cercas-electricas-y-perimetraje": (
    <path d="M3 20l4-8 4 4 4-9 6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "wifi-empresarial": (
    <>
      <path d="M2 8.5a16 16 0 0120 0M5 12a11 11 0 0114 0M8.5 15.5a6 6 0 017 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1.3" fill="currentColor" />
    </>
  ),
  "ciberseguridad-de-red": (
    <path d="M12 2l7 3v6c0 5-3.1 8.4-7 10-3.9-1.6-7-5-7-10V5l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  "deteccion-contra-incendios": (
    <path
      d="M12 22c4-2.5 5-6 3.5-9-1-2-2.5-1.5-2.5.5.5-3-1-5.5-3-6.5 1 2-1 3.5-1.5 5C7 14 7 17 8.5 19c-2-1-2.5-3.5-2-6C4 15.5 3.5 19 6.5 21.5 8 22.5 10 22.7 12 22z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  "ups-y-continuidad-electrica": (
    <>
      <rect x="3" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19 10v4M7 10v4M11 10v4M15 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  "telefonia-ip-voip": (
    <path
      d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.2 2.2z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  "auditoria-de-seguridad-y-redes": (
    <>
      <path d="M9 3h6l1 4H8l1-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="5" y="7" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
};

const FALLBACK_ICON = (
  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
);

export function ServiceIcon({ slug, size = 20 }: { slug: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {SERVICE_ICON_PATHS[slug] ?? FALLBACK_ICON}
    </svg>
  );
}
