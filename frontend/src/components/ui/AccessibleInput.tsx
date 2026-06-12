import React, { InputHTMLAttributes, forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AccessibleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Etiqueta del campo (obligatorio para accesibilidad) */
  label: string;
  /** Indicador visual de campo obligatorio */
  isRequired?: boolean;
  /** Mensaje de error a mostrar */
  errorMessage?: string;
  /** Indica si el campo tiene un error */
  isError?: boolean;
  /** Texto de ayuda debajo del campo */
  helpText?: string;
  /** Contenedor de clases CSS adicionales */
  containerClassName?: string;
  /** Clases del label */
  labelClassName?: string;
  /** Clases del input */
  inputClassName?: string;
}

/**
 * Componente Input accesible que cumple con WCAG 2.1 AA
 *
 * Características:
 * - Label semántico vinculado con htmlFor
 * - Validación HTML5 nativa como primera capa
 * - ARIA completo (aria-invalid, aria-describedby, role="alert")
 * - Soporte para keyboard navigation (Tab, Enter)
 * - Mensajes de error amigables
 * - Estructura HTML semántica
 */
export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      id,
      label,
      isRequired = false,
      errorMessage = "",
      isError = false,
      helpText = "",
      type = "text",
      className,
      containerClassName = "",
      labelClassName = "",
      inputClassName = "",
      disabled = false,
      ...props
    },
    ref
  ) => {
    // Generar ID único si no se proporciona
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helpId = `${inputId}-help`;

    // Determinar si hay descripción (error o ayuda)
    const ariaDescribedBy = [isError && errorId, helpText && helpId].filter(Boolean).join(" ");

    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        <Label
          htmlFor={inputId}
          className={cn("block text-sm font-medium text-foreground", labelClassName)}
        >
          <span className="flex items-center gap-1">
            {label}
            {isRequired && (
              <abbr
                title="Campo obligatorio"
                className="text-red-500 no-underline cursor-help"
                aria-label="obligatorio"
              >
                *
              </abbr>
            )}
          </span>
        </Label>

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          {...(isRequired && { required: true })}
          {...(ariaDescribedBy && { "aria-describedby": ariaDescribedBy })}
          aria-invalid={isError}
          className={cn(
            // Base
            "w-full px-3 py-2 rounded-md border transition-colors duration-200",
            "text-sm bg-background text-foreground",
            "placeholder:text-muted-foreground",

            // Focus
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",

            // Keyboard navigation visible
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",

            // Estados
            {
              "border-destructive focus:ring-destructive focus-visible:ring-destructive": isError,
              "border-input": !isError,
              "opacity-50 cursor-not-allowed bg-muted": disabled,
            },

            inputClassName
          )}
          {...props}
        />

        {/* Error Message - con role="alert" para anunciar cambios a lectores de pantalla */}
        {isError && errorMessage && (
          <article
            id={errorId}
            role="alert"
            className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errorMessage}</span>
          </article>
        )}

        {/* Help Text */}
        {helpText && !isError && (
          <aside id={helpId} className="text-xs text-muted-foreground">
            {helpText}
          </aside>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = "AccessibleInput";
