import { memo } from "react";
import { cn } from "@/lib/utils";
import { KPIData } from "../../types";
import { TrendingUp, TrendingDown, Minus, DollarSign, Package, ShoppingCart, AlertTriangle } from "lucide-react";

interface KPICardProps {
  data: KPIData;
  className?: string;
}

const KPICardComponent = ({
  data,
  className
}: KPICardProps) => {
  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('es-MX').format(value);
    }
  };
  const getChangeIcon = () => {
    if (!data.change) return null;
    switch (data.changeType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };
  const getChangeColorClass = () => {
    switch (data.changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };
  const getContextualIcon = () => {
    const iconClass = "w-5 h-5";
    if (data.label.includes("Ventas")) return <DollarSign className={iconClass} />;
    if (data.label.includes("Productos")) return <Package className={iconClass} />;
    if (data.label.includes("Ticket")) return <ShoppingCart className={iconClass} />;
    if (data.label.includes("Stock")) return <AlertTriangle className={iconClass} />;
    return null;
  };

  return <div className={cn(
      "bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              {getContextualIcon()}
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {data.label}
            </p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground break-words">
            {formatValue(data.value, data.format)}
          </p>
        </div>
        {data.change !== undefined && <div className={cn("flex items-center gap-1 text-sm font-medium flex-shrink-0 ml-2", getChangeColorClass())}>
            {getChangeIcon()}
            <span>{data.change > 0 ? '+' : ''}{data.change}%</span>
          </div>}
      </div>
    </div>;
};

// Memoized export for performance
export const KPICard = memo(KPICardComponent);