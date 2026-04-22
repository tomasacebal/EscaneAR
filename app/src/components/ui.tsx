import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const buttonClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-blue text-black hover:bg-white/20 hover:text-black hover:ring-1 hover:ring-verge-hover-ring focus-visible:border focus-visible:border-verge-purple focus-visible:bg-verge-focus focus-visible:text-white',
  secondary:
    'bg-panel text-muted-dark hover:bg-white/20 hover:text-black hover:ring-1 hover:ring-verge-hover-ring focus-visible:border focus-visible:border-verge-purple focus-visible:bg-verge-focus focus-visible:text-white',
  danger:
    'border border-verge-purple bg-transparent text-white hover:bg-verge-purple hover:text-white focus-visible:border-verge-purple focus-visible:bg-verge-focus focus-visible:text-white',
  ghost:
    'border border-blue bg-transparent text-blue hover:bg-blue hover:text-black focus-visible:border-verge-purple focus-visible:bg-verge-focus focus-visible:text-white',
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
 * Boton base mobile-first con estilo pill editorial.
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
  type = 'button',
  ...props
}: AppButtonProps) {
  return (
    <button
      type={type}
      className={`min-tap verge-button-label rounded-3xl px-6 py-2 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verge-focus active:bg-button-active active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50 ${buttonClasses[variant]} ${className}`}
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
      <span className="verge-label text-muted">{label}</span>
      <input
        className="min-tap rounded-sm border border-white bg-app px-4 text-white outline-none transition-colors duration-150 placeholder:text-muted focus:border-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verge-focus"
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
      <span className="verge-label text-muted">{label}</span>
      <select
        className="min-tap rounded-sm border border-white bg-app px-4 text-white outline-none transition-colors duration-150 focus:border-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verge-focus"
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
  return (
    <div className={`animate-pulse verge-card border-white/30 motion-reduce:animate-none ${className}`} />
  );
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
    <div className="verge-card p-5 text-center text-white">
      <p className="verge-label text-blue">{title}</p>
      {detail ? <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p> : null}
    </div>
  );
}
