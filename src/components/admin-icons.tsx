type IconProps = { size?: number };

function Svg({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

export function GridIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </Svg>
  );
}

export function UserPlusIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 8v6M15 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function BuildingIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="4" y="3" width="11" height="18" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 7h3M8 11h3M8 15h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 10h5v11h-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </Svg>
  );
}

export function ReceiptIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path
        d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function FileSignatureIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M8 3h6l4 4v8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4 19c1.5-3.5 3-3.5 3.5-2s2-1.5 3.5 1 2.5-3.5 4-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function FolderIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path
        d="M3 6a1 1 0 011-1h5l2 2h9a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function NetworkIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="6" cy="6" r="2.1" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="6" r="2.1" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="18" r="2.1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 7.2L11 16M16 7.2L13 16M8.3 6h7.4" stroke="currentColor" strokeWidth="1.8" />
    </Svg>
  );
}

export function ListIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M8 6h12M8 12h12M8 18h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="4" cy="6" r="1.2" fill="currentColor" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" />
      <circle cx="4" cy="18" r="1.2" fill="currentColor" />
    </Svg>
  );
}

export function PackageIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4.5 7.5L12 12l7.5-4.5M12 12v9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </Svg>
  );
}

export function ArrowRightIcon({ size = 14 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PencilIcon({ size = 14 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M14.7 6.3l3 3-8.4 8.4-3.6.6.6-3.6 8.4-8.4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </Svg>
  );
}

export function TrashIcon({ size = 14 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function BoxesIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3 9l5-3 5 3v6l-5 3-5-3V9z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M13 11l4-2.3 4 2.3v5l-4 2.3-4-2.3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M3 9l5 3 5-3M8 12v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </Svg>
  );
}

export function TruckIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="2" y="8" width="11" height="8" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13 11h4l3 3v2h-7v-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    </Svg>
  );
}

export function InvoiceIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M6 2.5h9l3 3v16H6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M15 2.5v3h3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 11.5l2 2 3.5-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function WalletIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 12.5h4v3h-4a1.5 1.5 0 010-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}

export function UsersIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17" cy="7.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 14.3c2.6.3 4.5 2.2 4.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function ClipboardCheckIcon({ size }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="5" y="4" width="14" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 3.5h6v2.5H9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 13l2 2 4-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function InboxIcon({ size = 28 }: IconProps) {
  return (
    <Svg size={size}>
      <path
        d="M4 13l2.5-7h11L20 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 13h5l1.5 2h3L15 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}
