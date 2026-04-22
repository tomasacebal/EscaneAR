import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const buttonClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue text-white',
  secondary: 'bg-ink-dark text-white',
  danger: 'bg-ink-dark text-white',
  ghost: 'bg-transparent text-link-dark ring-1 ring-link-dark',
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
      className={`min-tap rounded-full px-4 py-2 text-base font-normal leading-tight tracking-normal transition hover:brightness-110 focus:outline-2 focus:outline-blue active:bg-button-active active:text-ink-dark disabled:cursor-not-allowed disabled:opacity-50 ${buttonClasses[variant]} ${className}`}
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
      <span className="font-semibold">{label}</span>
      <input
        className="min-tap rounded-xl border-4 border-black/5 bg-panel-soft px-4 text-ink-dark outline-none transition placeholder:text-tertiary focus:outline-2 focus:outline-blue"
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
      <span className="font-semibold">{label}</span>
      <select
        className="min-tap rounded-xl border-4 border-black/5 bg-panel-soft px-4 text-ink-dark outline-none transition focus:outline-2 focus:outline-blue"
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
  return <div className={`animate-pulse rounded-lg bg-black/10 ${className}`} />;
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
    <div className="rounded-lg bg-panel p-5 text-center text-ink-dark apple-card-shadow">
      <p className="font-semibold">{title}</p>
      {detail ? <p className="mt-1 text-sm text-muted">{detail}</p> : null}
    </div>
  );
}
