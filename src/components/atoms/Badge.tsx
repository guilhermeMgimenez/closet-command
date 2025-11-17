import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  className?: string;
}

export const Badge = ({ children, variant = "default", className }: BadgeProps) => {
  const variantClasses = {
    success: "bg-success text-success-foreground hover:bg-success/80",
    warning: "bg-warning text-warning-foreground hover:bg-warning/80",
  };

  return (
    <ShadcnBadge
      variant={variant === "success" || variant === "warning" ? "default" : variant}
      className={cn(
        variant === "success" && variantClasses.success,
        variant === "warning" && variantClasses.warning,
        className
      )}
    >
      {children}
    </ShadcnBadge>
  );
};
