import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  className?: string;
}

export const Badge = ({ children, variant = "default", className }: BadgeProps) => {
  const variantClasses = {
    success: "bg-success/10 text-success border-success/30 shadow-sm hover:bg-success/20",
    warning: "bg-warning/10 text-warning border-warning/30 shadow-sm hover:bg-warning/20",
  };

  return (
    <ShadcnBadge
      variant={variant === "success" || variant === "warning" ? "outline" : variant}
      className={cn(
        "font-semibold px-3 py-1.5 backdrop-blur-sm transition-all duration-200 hover:scale-105 border",
        variant === "success" && variantClasses.success,
        variant === "warning" && variantClasses.warning,
        className
      )}
    >
      {children}
    </ShadcnBadge>
  );
};
