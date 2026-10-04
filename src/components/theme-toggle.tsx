"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./icons";

const STORE_KEY = "netseg-theme";

function systemPrefersDark() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function writeStored(v: "light" | "dark") {
  try {
    localStorage.setItem(STORE_KEY, v);
  } catch {
    // ignore: private mode / blocked storage
  }
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // El script inline en el <html> (ver layout.tsx) ya aplicó data-theme antes del primer
    // paint para evitar el flash de color; acá solo leemos ese resultado para el ícono.
    const applied = document.documentElement.getAttribute("data-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(applied ? applied === "dark" : systemPrefersDark());
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    writeStored(next);
    setDark(next === "dark");
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggle}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {dark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
