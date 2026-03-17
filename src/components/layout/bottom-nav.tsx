"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Refrigerator, ChefHat, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Fridge', icon: Refrigerator, href: '/inventory' },
    { label: 'Recipes', icon: ChefHat, href: '/recipes' },
    { label: 'Shopping', icon: ShoppingCart, href: '/shopping' },
    { label: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around items-center py-2 safe-area-bottom z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}