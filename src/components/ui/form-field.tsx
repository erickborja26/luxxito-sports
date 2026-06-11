import * as React from "react";

import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, description, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
          {label}
        </Label>
      ) : null}

      <div>{children}</div>

      {description && !error ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
