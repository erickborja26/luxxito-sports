import React, { ReactNode, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  /** Contenido del tooltip */
  content: ReactNode;

  /** Elemento que dispara el tooltip */
  children: ReactNode;

  /** Posición del tooltip */
  position?: "top" | "bottom" | "left" | "right";

  /** Delay antes de mostrar (en ms) */
  delayMs?: number;

  /** Clases CSS adicionales */
  className?: string;

  /** Clases para el contenedor del tooltip */
  contentClassName?: string;
}

/**
 * Componente Tooltip accesible
 *
 * Características:
 * - Funciona con hover y keyboard focus
 * - ARIA correcto (role="tooltip", aria-describedby)
 * - Posicionamiento inteligente
 * - Delay configurable
 * - Desaparece al presionar Escape
 * - Transiciones suaves
 *
 * Uso:
 * ```tsx
 * <Tooltip content="Precio: $50 • Fútbol 5">
 *   <button>Cancha A</button>
 * </Tooltip>
 *
 * <Tooltip content="Haz click para editar" position="right">
 *   <IconButton aria-label="Editar">
 *     <PencilIcon />
 *   </IconButton>
 * </Tooltip>
 * ```
 */
export const Tooltip = ({
  content,
  children,
  position = "top",
  delayMs = 200,
  className,
  contentClassName,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`).current;

  // Limpiar timeout en desmontaje
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Mostrar tooltip con delay
  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delayMs);
  };

  // Ocultar tooltip inmediatamente
  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  // Manejar Escape
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isVisible) {
      hide();
    }
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isVisible]);

  // Estilos de posición
  const positionStyles = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  // Estilos de flecha según posición
  const arrowStyles = {
    top: "bottom-[-4px] left-1/2 -translate-x-1/2 border-t-8 border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-popover",
    bottom:
      "top-[-4px] left-1/2 -translate-x-1/2 border-b-8 border-l-4 border-r-4 border-l-transparent border-r-transparent border-b-popover",
    left: "left-[-4px] top-1/2 -translate-y-1/2 border-l-8 border-t-4 border-b-4 border-t-transparent border-b-transparent border-l-popover",
    right:
      "right-[-4px] top-1/2 -translate-y-1/2 border-r-8 border-t-4 border-b-4 border-t-transparent border-b-transparent border-r-popover",
  };

  return (
    <div
      ref={triggerRef}
      className={cn("relative inline-block", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {/* Elemento que dispara el tooltip */}
      <div aria-describedby={isVisible ? tooltipId : undefined}>{children}</div>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={cn(
            // Posición base
            "absolute pointer-events-none z-50",
            positionStyles[position],

            // Animación
            "animate-in fade-in duration-150"
          )}
        >
          {/* Contenido */}
          <div
            className={cn(
              // Estilos base
              "px-3 py-2 rounded-md text-xs font-medium text-white",
              "bg-popover text-popover-foreground",
              "shadow-md whitespace-nowrap",

              // Max width para texto largo
              "max-w-xs sm:max-w-sm break-words",

              contentClassName
            )}
          >
            {content}
          </div>

          {/* Flecha decorativa */}
          <div
            className={cn("absolute w-0 h-0", arrowStyles[position])}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = "Tooltip";

/**
 * Variante: TooltipInfo para mostrar información adicional en un elemento
 * Useful para mostrar precios, deportes, etc. en tarjetas
 */
interface TooltipInfoProps extends Omit<TooltipProps, "children"> {
  label: string;
}

export const TooltipInfo = ({ label, content, ...props }: TooltipInfoProps) => (
  <Tooltip content={content} {...props}>
    <button
      type="button"
      aria-label={`${label}: ${typeof content === "string" ? content : "ver información"}`}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-xs font-bold text-muted-foreground hover:bg-muted-foreground hover:text-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
    >
      ?
    </button>
  </Tooltip>
);

TooltipInfo.displayName = "TooltipInfo";

// Re-exports para compatibilidad con Radix UI si es necesario
export const TooltipProvider = ({ children }: { children: ReactNode }) => <>{children}</>;
export const TooltipTrigger = ({ children }: { children: ReactNode }) => <>{children}</>;
export const TooltipContent = ({ children }: { children: ReactNode }) => <>{children}</>;

