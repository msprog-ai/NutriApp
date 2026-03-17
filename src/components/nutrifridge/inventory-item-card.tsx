"use client";

import { InventoryItem } from '@/types/app';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Refrigerator, Snowflake, Archive, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryItemCardProps {
  item: InventoryItem;
  onClick?: () => void;
}

export function InventoryItemCard({ item, onClick }: InventoryItemCardProps) {
  const daysUntilExpiry = differenceInDays(parseISO(item.expirationDate), new Date());
  
  const getExpiryStatus = () => {
    if (daysUntilExpiry < 0) return { label: 'Expired', color: 'bg-destructive' };
    if (daysUntilExpiry <= 3) return { label: `Expiring in ${daysUntilExpiry}d`, color: 'bg-orange-500' };
    return { label: `Exp. ${format(parseISO(item.expirationDate), 'MMM d')}`, color: 'bg-primary/20 text-primary-foreground' };
  };

  const status = getExpiryStatus();

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer border-none bg-white rounded-2xl flex items-center gap-4"
      onClick={onClick}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        item.location === 'fridge' ? "bg-blue-50 text-blue-500" :
        item.location === 'freezer' ? "bg-indigo-50 text-indigo-500" : "bg-orange-50 text-orange-500"
      )}>
        {item.location === 'fridge' ? <Refrigerator className="w-6 h-6" /> :
         item.location === 'freezer' ? <Snowflake className="w-6 h-6" /> : <Archive className="w-6 h-6" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
        <p className="text-sm text-muted-foreground capitalize">{item.category} • {item.quantity} {item.unit}</p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <Badge variant="outline" className={cn("text-[10px] border-none", status.color, status.label === 'Expired' && 'text-white')}>
          {status.label}
        </Badge>
        {daysUntilExpiry <= 3 && <AlertTriangle className="w-4 h-4 text-orange-500" />}
      </div>
    </Card>
  );
}
