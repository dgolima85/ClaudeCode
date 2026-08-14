type IconeProps = { className?: string };

const basePath = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Status: Ativo — sino, aviso em curso. */
export function IconeAtivo({ className }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...basePath}>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

/** Status: Concluído — check em círculo. */
export function IconeConcluido({ className }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...basePath}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.5 2.4 2.4 4.6-5.3" />
    </svg>
  );
}

/** Modelo: Informativo — "i" em círculo. */
export function IconeInformativo({ className }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...basePath}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Modelo: Acompanhamento — olho, monitoramento contínuo. */
export function IconeAcompanhamento({ className }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...basePath}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

/** Modelo: Atuação — alerta triangular, ação necessária. */
export function IconeAtuacao({ className }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...basePath}>
      <path d="M12 4.5 21 19H3L12 4.5Z" />
      <path d="M12 10.5v3.5" />
      <circle cx="12" cy="16.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
