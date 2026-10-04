import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { ServicesSection } from "@/components/services-section";
import { PackagesSection } from "@/components/packages-section";
import { ProcessSection } from "@/components/process-section";
import { WhySection } from "@/components/why-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [servicios, paquetes] = await Promise.all([
    prisma.servicio.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      include: { items: { orderBy: { orden: "asc" } } },
    }),
    prisma.paquete.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      include: { items: { orderBy: { orden: "asc" } } },
    }),
  ]);

  const paquetesParaVista = paquetes.map((p) => ({
    ...p,
    precioDesde: p.precioDesde === null ? null : Number(p.precioDesde),
  }));

  return (
    <>
      <Nav />
      <Hero />
      <main>
        <ServicesSection servicios={servicios} />
        <PackagesSection paquetes={paquetesParaVista} />
        <ProcessSection />
        <WhySection />
        <ContactSection servicios={servicios.filter((s) => s.destacado)} />
      </main>
      <Footer />
    </>
  );
}
