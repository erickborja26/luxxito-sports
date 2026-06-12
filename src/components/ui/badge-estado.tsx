import { cn } from "@/lib/utils";
import { Badge } from "./badge";

const statusStyles: Record<string, string> = {
  CONFIRMADA: "bg-accent text-accent-foreground",
  BLOQUEADA: "bg-warning text-warning-foreground",
  PENDIENTE: "bg-warning/80 text-warning-foreground",
  CANCELADA: "bg-destructive text-destructive-foreground",
  VENCIDA: "bg-muted text-muted-foreground",
  ABIERTA: "bg-destructive text-destructive-foreground",
  EN_PROCESO: "bg-warning text-warning-foreground",
  RESUELTA: "bg-accent text-accent-foreground",
  OPERATIVO: "bg-accent text-accent-foreground",
  DAÑADO: "bg-destructive text-destructive-foreground",
};

const defaultStyle = "bg-secondary text-secondary-foreground";

export interface BadgeEstadoProps {
  status: string;
  className?: string;
}

export function BadgeEstado({ status, className }: BadgeEstadoProps) {
  return (
    <Badge className={cn(statusStyles[status] ?? defaultStyle, "font-semibold", className)}>
      {status}
    </Badge>
  );
}
