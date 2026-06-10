import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  CONFIRMADA: "bg-accent text-accent-foreground",
  BLOQUEADA: "bg-warning text-warning-foreground",
  PENDIENTE: "bg-warning/80 text-warning-foreground",
  PENDIENTE_REVISION: "bg-warning text-warning-foreground",
  CANCELADA: "bg-destructive text-destructive-foreground",
  VENCIDA: "bg-muted text-muted-foreground",
  ABIERTA: "bg-destructive text-destructive-foreground",
  EN_PROCESO: "bg-warning text-warning-foreground",
  RESUELTA: "bg-accent text-accent-foreground",
  OPERATIVO: "bg-accent text-accent-foreground",
  DAÑADO: "bg-destructive text-destructive-foreground",
};

export const StatusBadge = ({ status, label, className }: { status: string; label?: string; className?: string }) => (
  <Badge className={cn(map[status] || "bg-secondary text-secondary-foreground", "whitespace-nowrap border-0 font-semibold shadow-sm", className)}>{label || status}</Badge>
);
