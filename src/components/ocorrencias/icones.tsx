type IconeProps = { className?: string };

/** Criticidade da ocorrência — bandeirola, cor indica o nível (ver CRITICIDADE_TEXT_COLOR). */
export function IconeCriticidade({ className }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M6 2.25a.9.9 0 0 1 .9.9v.24c1.5-.66 3.1-.66 4.6 0 1.66.73 3.44.73 5.1 0a.9.9 0 0 1 1.26.83v8.1a.9.9 0 0 1-1.26.82c-1.66-.73-3.44-.73-5.1 0-1.5.66-3.1.66-4.6 0V21.1a.9.9 0 1 1-1.8 0V3.15a.9.9 0 0 1 .9-.9Z" />
    </svg>
  );
}
