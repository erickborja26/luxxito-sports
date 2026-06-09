import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * OBLIGATORIO: Etiqueta descriptiva para el botón.
   * Necesario para accesibilidad WCAG (botones de solo ícono)
   */
  "aria-label": string;

  /** El ícono a mostrar (SVG, JSX, etc.) */
  children: ReactNode;

  /** Variante de estilo del botón */
  variant?: "default" | "ghost" | "outline" | "destructive";

  /** Tamaño del botón */
  size?: "sm" | "md" | "lg";

  /** Si el botón está en estado de carga */
  isLoading?: boolean;

  /** Clases CSS personalizadas */
  className?: string;
}

/**
 * Componente IconButton accesible
 *
 * Características:
 * - `aria-label` es OBLIGATORIO por TypeScript
 * - Garantiza que botones de solo ícono sean accesibles
 * - Soporte para variantes y tamaños
 * - Keyboard navigation completo
 * - Estados visuales claros (focus-visible)
 *
 * Uso:
 * ```tsx
 * <IconButton aria-label="Editar reserva">
 *   <PencilIcon />
 * </IconButton>
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      "aria-label": ariaLabel,
      children,
      variant = "default",
      size = "md",
      isLoading = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    // Estilos base
    const baseStyles =
      "inline-flex items-center justify-center rounded-md transition-colors duration-200 flex-shrink-0";

    // Focus styles
    const focusStyles = "focus:outline-none focus:ring-2 focus:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

    // Tamaños
    const sizeStyles = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    };

    // Variantes
    const variantStyles = {
      default: `bg-primary text-primary-foreground hover:bg-primary/90 ${focusStyles} focus:ring-primary focus-visible:ring-primary`,
      ghost: `hover:bg-accent hover:text-accent-foreground ${focusStyles} focus:ring-accent focus-visible:ring-accent`,
      outline: `border border-input hover:bg-accent hover:text-accent-foreground ${focusStyles} focus:ring-primary focus-visible:ring-primary`,
      destructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90 ${focusStyles} focus:ring-destructive focus-visible:ring-destructive`,
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        aria-busy={isLoading}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          {
            "opacity-50 cursor-not-allowed": disabled || isLoading,
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          children
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
