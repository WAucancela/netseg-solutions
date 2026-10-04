import type { Metadata } from "next";
import { ibmPlexMono, openSans, poppins } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "NetSeg Solutions",
  description: "Seguridad electrónica e infraestructura de redes para empresas, condominios e industria en Ecuador.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${openSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Aplica el tema guardado ANTES del primer paint, para que una navegación completa
            (ej. el formulario de búsqueda, que no es un Link de Next) no muestre el tema por
            defecto un instante antes de cambiar al guardado por el usuario. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('netseg-theme');" +
              "if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}" +
              "document.documentElement.setAttribute('data-theme',t);}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
