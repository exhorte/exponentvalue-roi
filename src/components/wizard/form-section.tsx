import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** En-tête de section : pastille d'icône, titre, description, contrôle optionnel à droite. */
export function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 p-5", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background shadow-xs">
            <Icon className="size-4" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Carte de formulaire : en-tête + contenu séparé par un filet. */
export function FormSection({
  icon,
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
}) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <SectionHeader icon={icon} title={title} description={description} action={action} />
      {children && <div className={cn("border-t p-5", contentClassName)}>{children}</div>}
    </Card>
  );
}
