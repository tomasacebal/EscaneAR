import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const buttonClasses: Record<ButtonVariant, string> = {
  primary: 'bg-good text-app shadow-lg shadow-good/10',
  secondary: 'bg-panel-soft text-ink ring-1 ring-line',
  danger: 'bg-bad text-app',
  ghost: 'bg-transparent text-ink ring-1 ring-line',
};

/**
 * Props para boton tactil custom.
 *
 * Args:
 *   variant: Variante visual.
 *   children: Contenido del boton.
 *
 * Returns:
 *   No aplica.
 */
export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

/**
 * Boton base mobile-first con alto tactil minimo.
 *
 * Args:
 *   variant: Variante visual.
 *   className: Clases adicionales.
 *   children: Contenido del boton.
 *
 * Returns:
 *   Elemento button.
 */
export function AppButton({
  variant = 'primary',
  className = '',
  children,
  ...props
}: AppButtonProps) {
  return (
    <button
      className={`min-tap rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-normal transition active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 ${buttonClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Props para input custom.
 *
 * Args:
 *   label: Etiqueta visible.
 *
 * Returns:
 *   No aplica.
 */
export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/**
 * Input mobile con label consistente.
 *
 * Args:
 *   label: Etiqueta visible.
 *   className: Clases adicionales.
 *
 * Returns:
 *   Campo de texto.
 */
export function TextInput({ label, className = '', ...props }: TextInputProps) {
  return (
    <label className={`grid gap-2 text-sm text-muted ${className}`}>
      <span>{label}</span>
      <input
        className="min-tap rounded-lg border border-line bg-panel px-3 text-ink outline-none transition focus:border-good"
        {...props}
      />
    </label>
  );
}

/**
 * Props para select custom.
 *
 * Args:
 *   label: Etiqueta visible.
 *   children: Opciones del select.
 *
 * Returns:
 *   No aplica.
 */
export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

/**
 * Select mobile con estilos de formulario.
 *
 * Args:
 *   label: Etiqueta visible.
 *   children: Opciones disponibles.
 *
 * Returns:
 *   Campo select.
 */
export function SelectField({ label, children, ...props }: SelectFieldProps) {
  return (
    <label className="grid gap-2 text-sm text-muted">
      <span>{label}</span>
      <select
        className="min-tap rounded-lg border border-line bg-panel px-3 text-ink outline-none transition focus:border-good"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

/**
 * Bloque skeleton para estados de carga.
 *
 * Args:
 *   className: Clases de tamaño.
 *
 * Returns:
 *   Elemento visual skeleton.
 */
export function SkeletonBlock({ className = 'h-12' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-panel-soft ${className}`} />;
}

/**
 * Estado vacio compacto.
 *
 * Args:
 *   title: Texto principal.
 *   detail: Texto secundario opcional.
 *
 * Returns:
 *   Bloque informativo.
 */
export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {detail ? <p className="mt-1 text-sm text-muted">{detail}</p> : null}
    </div>
  );
}
