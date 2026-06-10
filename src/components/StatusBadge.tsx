import { cn } from "@/lib/utils";

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

const statusMap: Record<string, StatusConfig> = {
  CONFIRMADA: {
    label: "Confirmada",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    ariaLabel: "Estado confirmada",
  },
  BLOQUEADA: {
    label: "Bloqueada",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-700",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
    ariaLabel: "Estado bloqueada",
  },
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
      </svg>
    ),
    ariaLabel: "Estado pendiente",
  },
  PENDIENTE_REVISION: {
    label: "En Revisión",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    ),
    ariaLabel: "Estado pendiente de revisión",
  },
  CANCELADA: {
    label: "Cancelada",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    ariaLabel: "Estado cancelada",
  },
  VENCIDA: {
    label: "Vencida",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    ariaLabel: "Estado vencida",
  },
  ABIERTA: {
    label: "Abierta",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    ),
    ariaLabel: "Estado abierta",
  },
  EN_PROCESO: {
    label: "En Proceso",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1011.601 2.566 1 1 0 11-1.885-.666A5.002 5.002 0 105.199 7.1A1 1 0 104 4.1V3a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    ariaLabel: "Estado en proceso",
  },
  RESUELTA: {
    label: "Resuelta",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    ariaLabel: "Estado resuelta",
  },
  OPERATIVO: {
    label: "Operativo",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.372a3.066 3.066 0 01-2.812 3.062c-.494.095-.95.33-1.321.703l-.738.738a3.066 3.066 0 01-4.334 0l-.738-.738a3.066 3.066 0 01-1.321-.703 3.066 3.066 0 01-2.812-3.062V6.517a3.066 3.066 0 012.812-3.062zm9.804-1.357a.75.75 0 00-.531.974c1.804 3.561 2.837 6.228 2.837 9.05 0 1.643-.457 3.125-1.278 4.316a.75.75 0 101.202.902c.937-1.234 1.506-2.914 1.506-5.218 0-2.968-1.06-5.809-2.97-9.643a.75.75 0 00-.966-.25z" clipRule="evenodd" />
      </svg>
    ),
    ariaLabel: "Estado operativo",
  },
  DAÑADO: {
    label: "Dañado",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M8.558 4.251c.243-.97 1.179-1.665 2.191-1.665.996 0 1.925.692 2.165 1.652a3.82 3.82 0 00-.330 1.198 3.022 3.022 0 00-1.835-1.835 3.82 3.82 0 00-1.191.35zM15 10a5 5 0 11-10 0 5 5 0 0110 0z" clipRule="evenodd" />
      </svg>
    ),
    ariaLabel: "Estado dañado",
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Componente StatusBadge accesible que implementa "Color + Ícono + Texto"
 *
 * Características:
 * - Color diferenciado por estado
 * - Ícono visual para cada estado
 * - Texto descriptivo del estado
 * - No depende solo del color (WCAG compliant)
 * - Aria-label para contexto adicional
 */
export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusMap[status] || {
    label: status,
    className: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    ariaLabel: `Estado: ${status}`,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        "transition-colors duration-200",
        config.className,
        className
      )}
      aria-label={config.ariaLabel}
      role="status"
    >
      <span className="flex-shrink-0" aria-hidden="true">
        {config.icon}
      </span>
      <span>{config.label}</span>
    </span>
  );
};
