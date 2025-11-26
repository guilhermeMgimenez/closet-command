import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, className }: StatCardProps) => {
  return (
    <Card className={cn(
      "group relative p-6 overflow-hidden transition-all duration-300",
      "hover:shadow-elevated hover:-translate-y-1",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
      className
    )}>
      <div className="relative flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold text-foreground tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <div className={cn(
                "flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full",
                trend.isPositive 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
              )}>
                <span className="text-base">{trend.isPositive ? "↑" : "↓"}</span>
                <span>{trend.value}</span>
              </div>
            </div>
          )}
        </div>
        <div className={cn(
          "relative p-4 rounded-2xl transition-all duration-300",
          "bg-gradient-to-br from-primary/10 to-primary/5",
          "group-hover:scale-110 group-hover:shadow-glow"
        )}>
          <Icon className="h-7 w-7 text-primary" />
          <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-colors duration-300" />
        </div>
      </div>
    </Card>
  );
};
