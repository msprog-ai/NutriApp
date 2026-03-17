"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Refrigerator, ChefHat, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Fridge', icon: Refrigerator, href: '/inventory' },
    { label: 'AI Chat', icon: MessageSquare, href: '/chat' },
    { label: 'Planner', icon: Calendar, href: '/meal-plan' },
    { label: 'Recipes', icon: ChefHat, href: '/recipes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-border flex justify-around items-center py-2 safe-area-bottom z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ios-tap-active",
              isActive ? "text-primary translate-y-[-2px]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-6 h-6 transition-all", isActive && "stroke-[2.5px]")} />
            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
