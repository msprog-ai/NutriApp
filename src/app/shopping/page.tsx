"use client";

import { useAppData } from '@/hooks/use-app-data';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ShoppingPage() {
  const { shoppingList, toggleShoppingItem, addToShoppingList, loading } = useAppData();

  if (loading) return null;

  return (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shopping List</h1>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Trash2 className="w-5 h-5 text-muted-foreground" />
        </Button>
      </header>

      <div className="flex gap-2 mb-6">
        <Button className="flex-1 rounded-2xl h-12 gap-2 bg-white text-primary border border-primary/20 hover:bg-primary/5">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {shoppingList.length > 0 ? (
          shoppingList.map(item => (
            <Card key={item.id} className="p-4 border-none bg-white rounded-2xl flex items-center gap-4">
              <Checkbox 
                id={item.id} 
                checked={item.bought} 
                onCheckedChange={(checked) => toggleShoppingItem(item.id, !!checked)}
                className="w-6 h-6 rounded-lg border-primary"
              />
              <label 
                htmlFor={item.id}
                className={cn(
                  "flex-1 text-base font-medium transition-all",
                  item.bought ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {item.name}
              </label>
              <span className="text-sm text-muted-foreground">{item.quantity} {item.unit}</span>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 px-8">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBasket className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="font-bold text-xl mb-2">List is empty</h3>
            <p className="text-muted-foreground text-sm">When you find recipes you love, add missing ingredients here to track your next store visit.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}