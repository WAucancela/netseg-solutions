"use client";

import { useActionState, useState } from "react";
import { crearProspecto, type ProspectoFormState } from "@/app/actions/prospectos";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "./icons";

const initialState: ProspectoFormState = { ok: false, message: "" };

const TELEFONO = "+593 99 000 0000";
const CORREO = "contacto@netsegsolutions.ec";

async function copyText(text: string, onDone: (label: string) => void) {
  try {
    await navigator.clipboard.writeText(text);
    onDone("Copiado");
  } catch {
    onDone("Copia manual");
  }
  setTimeout(() => onDone("Copiar"), 1800);
}

export function ContactSection({ servicios }: { servicios: { slug: string; nombre: string }[] }) {
  const [state, formAction, isPending] = useActionState(crearProspecto, initialState);
  const [phoneLabel, setPhoneLabel] = useState("Copiar");
  const [mailLabel, setMailLabel] = useState("Copiar");

  return (
    <section id="contacto">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Contacto</span>
          <h2>Cuéntanos del sitio y te enviamos un alcance técnico.</h2>
          <p className="lede">Completa el formulario y nuestro equipo revisa tu solicitud, o escríbenos directo por los medios de abajo.</p>
        </div>

        <div className="contact-wrap">
          <div className="card-list">
            <div className="ccard">
              <div className="l">
                <span className="icon">
                  <PhoneIcon />
                </span>
                <span className="t">
                  <span className="k">Teléfono / WhatsApp</span>
                  <br />
                  <span className="v">{TELEFONO}</span>
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => copyText(TELEFONO, setPhoneLabel)}>
                {phoneLabel}
              </button>
            </div>

            <div className="ccard">
              <div className="l">
                <span className="icon">
                  <MailIcon />
                </span>
                <span className="t">
                  <span className="k">Correo</span>
                  <br />
                  <span className="v">{CORREO}</span>
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => copyText(CORREO, setMailLabel)}>
                {mailLabel}
              </button>
            </div>

            <div className="ccard">
              <div className="l">
                <span className="icon">
                  <PinIcon />
                </span>
                <span className="t">
                  <span className="k">Cobertura</span>
                  <br />
                  <span className="v">Quito, Ecuador · atención a nivel nacional</span>
                </span>
              </div>
            </div>

            <div className="ccard">
              <div className="l">
                <span className="icon">
                  <ClockIcon />
                </span>
                <span className="t">
                  <span className="k">Horario</span>
                  <br />
                  <span className="v">Lun–Vie 8:00–18:00 · monitoreo 24/7</span>
                </span>
              </div>
            </div>
          </div>

          <form className="form-card" action={formAction}>
            <div className="row2">
              <div className="field">
                <label htmlFor="f-nombre">Nombre</label>
                <input id="f-nombre" name="nombre" type="text" placeholder="Tu nombre" required />
              </div>
              <div className="field">
                <label htmlFor="f-empresa">Empresa</label>
                <input id="f-empresa" name="empresa" type="text" placeholder="Nombre de la empresa" />
              </div>
            </div>
            <div className="row2">
              <div className="field">
                <label htmlFor="f-email">Correo</label>
                <input id="f-email" name="email" type="email" placeholder="tucorreo@empresa.com" />
              </div>
              <div className="field">
                <label htmlFor="f-telefono">Teléfono</label>
                <input id="f-telefono" name="telefono" type="tel" placeholder="09XXXXXXXX" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="f-servicio">Servicio de interés</label>
              <select id="f-servicio" name="servicioInteres" defaultValue="">
                <option value="" disabled>
                  Selecciona un servicio
                </option>
                {servicios.map((s) => (
                  <option key={s.slug} value={s.nombre}>
                    {s.nombre}
                  </option>
                ))}
                <option value="Otro / varios">Otro / varios</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-mensaje">Detalle del sitio</label>
              <textarea
                id="f-mensaje"
                name="mensaje"
                placeholder="Número de accesos, cámaras estimadas, m2 del sitio, plazos..."
              />
            </div>
            <div className="copy-msg">
              <button className="btn btn-primary" type="submit" disabled={isPending}>
                {isPending ? "Enviando..." : "Enviar solicitud"}
              </button>
              {state.message && (
                <span className={`form-note ${state.ok ? "ok" : "error"}`}>{state.message}</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
