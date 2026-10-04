"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { iniciarSesion, type LoginState } from "./actions";
import { BrandMarkIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

const initialState: LoginState = { error: "" };

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";
  const [state, formAction, isPending] = useActionState(iniciarSesion, initialState);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <ThemeToggle />
      </div>
      <form action={formAction} className="form-card" style={{ width: 360 }}>
        <div className="foot-brand" style={{ marginBottom: 20 }}>
          <span className="brand-mark" aria-hidden="true">
            <BrandMarkIcon />
          </span>
          NetSeg Solutions
        </div>
        <p className="lede" style={{ marginBottom: 20, fontSize: ".92rem" }}>
          Panel de administración
        </p>
        <input type="hidden" name="from" value={from} />
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" required />
        </div>
        {state.error && <p className="form-note error">{state.error}</p>}
        <button className="btn btn-primary" type="submit" disabled={isPending} style={{ width: "100%", marginTop: 6 }}>
          {isPending ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
