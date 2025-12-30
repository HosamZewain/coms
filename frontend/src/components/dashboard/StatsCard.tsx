import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendValue,
    className
}: StatsCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
                {trend && trendValue && (
                    <div className={cn("flex items-center text-xs mt-2",
                        trend === 'up' ? "text-green-500" :
                            trend === 'down' ? "text-red-500" : "text-gray-500"
                    )}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue} from last month
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
