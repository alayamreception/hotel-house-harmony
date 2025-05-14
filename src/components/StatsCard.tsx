
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  className?: string;
  onClick?: () => void; // Added onClick prop
  trend?: {
    value: number;
    isPositive: boolean;
  };
  }

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
  className,
  onClick, // Added onClick prop
  trend
}) => {
  return (
    <Card className={cn('overflow-hidden', className)} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-4 h-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className={cn(
            "text-xs font-medium mt-1",
            trend.isPositive ? "text-green-500" : "text-red-500"
          )}>
            <span>{trend.isPositive ? '↑' : '↓'} {trend.value}%</span>
            <span className="ml-1">from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
