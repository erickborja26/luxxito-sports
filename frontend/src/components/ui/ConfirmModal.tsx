import React, { forwardRef, ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;

  /** Callback cuando se cierra el modal */
  onClose: () => void;

  /** Callback cuando se confirma la acción */
  onConfirm: () => void | Promise<void>;

  /** Título del modal */
  title: string;

  /** Mensaje/descripción */
  description: ReactNode;

  /** Texto del botón de confirmación */
  confirmLabel?: string;

  /** Variante del botón (default | destructive) */
  confirmVariant?: "default" | "destructive";

  /** Texto del botón cancelar */
  cancelLabel?: string;

  /** Si está en estado de carga */
  isLoading?: boolean;

  /** Clases CSS personalizadas */
  className?: string;
}

/**
 * Modal de confirmación accesible usando HTML <dialog> nativo
 *
 * Características:
 * - HTML semántico con <dialog>
 * - ARIA correcto (role="alertdialog", aria-modal, aria-labelledby)
 * - Enfoque automático en el botón primario
 * - Cierre con tecla Escape
 * - Gestión de enfoque (trap focus en el modal)
 * - Transiciones suaves
 * - Previene acciones accidentales
 *
 * Uso:
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <ConfirmModal
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={() => cancelReservation()}
 *   title="Cancelar Reserva"
 *   description="¿Estás seguro? Esta acción no se puede deshacer."
 *   confirmLabel="Sí, cancelar"
 *   confirmVariant="destructive"
 * />
 * ```
 */
export const ConfirmModal = forwardRef<HTMLDialogElement, ConfirmModalProps>(
  (
    {
      isOpen,
      onClose,
      onConfirm,
      title,
      description,
      confirmLabel = "Confirmar",
      confirmVariant = "default",
      cancelLabel = "Cancelar",
      isLoading = false,
      className,
    },
    ref
  ) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const [isConfirming, setIsConfirming] = React.useState(false);

    // Combinar refs
    React.useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement);

    // Abrir/cerrar el modal
    useEffect(() => {
      if (!dialogRef.current) return;

      if (isOpen) {
        dialogRef.current.showModal();
        // Focus automático en el botón de confirmación
        setTimeout(() => confirmButtonRef.current?.focus(), 0);
      } else {
        dialogRef.current.close();
      }
    }, [isOpen]);

    // Manejar cierre con Escape
    const handleCancel = (e: React.MouseEvent | React.KeyboardEvent) => {
      if (isConfirming) e.preventDefault();
      if (!isConfirming) onClose();
    };

    // Manejar confirmación
    const handleConfirm = async () => {
      setIsConfirming(true);
      try {
        await onConfirm();
        onClose();
      } finally {
        setIsConfirming(false);
      }
    };

    return (
      <dialog
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        onCancel={(e) => {
          e.preventDefault();
          if (!isConfirming) onClose();
        }}
        className={cn(
          // Backdrop
          "backdrop:bg-black/50 backdrop:transition-opacity backdrop:duration-200",

          // Dialog styles
          "rounded-lg shadow-lg p-0 max-w-sm w-full mx-auto",
          "bg-background text-foreground",
          "focus:outline-none",

          // Animaciones
          "animate-in fade-in zoom-in-95 duration-200",
          "open:animate-in open:fade-in open:zoom-in-95",

          className
        )}
      >
        {/* Contenedor de contenido */}
        <div className="p-6 space-y-4">
          {/* Título */}
          <h2
            id="modal-title"
            className="text-lg font-semibold text-foreground flex items-center gap-2"
          >
            <svg
              className="w-5 h-5 text-amber-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {title}
          </h2>

          {/* Descripción */}
          <div id="modal-description" className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </div>
        </div>

        {/* Separador */}
        <hr className="bg-border" />

        {/* Acciones */}
        <div className="flex gap-3 p-4 justify-end bg-muted/30">
          <button
            form="confirm-form"
            type="button"
            onClick={handleCancel}
            disabled={isConfirming || isLoading}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium",
              "bg-secondary text-secondary-foreground",
              "hover:bg-secondary/90",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "transition-colors duration-200",
              {
                "opacity-50 cursor-not-allowed": isConfirming || isLoading,
              }
            )}
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming || isLoading}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium",
              "text-white transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              {
                // Default variant
                "bg-primary hover:bg-primary/90 focus:ring-primary":
                  confirmVariant === "default",

                // Destructive variant
                "bg-destructive hover:bg-destructive/90 focus:ring-destructive":
                  confirmVariant === "destructive",

                // Loading y disabled states
                "opacity-50 cursor-not-allowed": isConfirming || isLoading,
              }
            )}
          >
            {isConfirming || isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Procesando...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </dialog>
    );
  }
);

ConfirmModal.displayName = "ConfirmModal";
