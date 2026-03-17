
"use client";

import { useEffect } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { InventoryItemCard } from '@/components/nutrifridge/inventory-item-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Flame, Heart, ArrowRight, Loader2, ShoppingBag, LogIn, ChevronRight, ChefHat, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { UserProfile, InventoryItem } from '@/types/app';

export default function Home() {
  const { user, isUserLoading, auth } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'user_profiles', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'inventory_items');
  }, [firestore, user]);

  const { data: inventory, isLoading: isInventoryLoading } = useCollection<InventoryItem>(inventoryQuery);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle landing state for brand new users
  if (!profile && !user?.isAnonymous) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-8 bg-white">
        <div className="w-28 h-28 bg-primary/10 rounded-[2.5rem] flex items-center justify-center shadow-inner">
          <ChefHat className="w-14 h-14 text-primary" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">NutriFridge AI</h1>
          <p className="text-muted-foreground text-lg px-4 leading-relaxed">Personalized nutrition, smart inventory management, and AI-powered cooking.</p>
        </div>
        <div className="w-full space-y-4 pt-4">
          <Button size="lg" className="w-full rounded-2xl h-16 text-xl font-bold shadow-xl ios-tap-active" asChild>
            <Link href="/onboarding">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full rounded-2xl h-16 text-xl font-bold border-2 ios-tap-active" asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const expiringSoon = (inventory || [])
    .filter(item => {
      const days = differenceInDays(parseISO(item.expirationDate), new Date());
      return days >= 0 && days <= 3;
    })
    .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
    .slice(0, 3);

  const inventorySummary = {
    total: inventory?.length || 0,
    expiring: expiringSoon.length,
  };

  return (
    <div className="pb-28 pt-8 px-6 max-w-md mx-auto min-h-screen bg-muted/20">
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">Kitchen Dashboard</p>
          <h1 className="text-2xl font-bold">{profile?.name ? `Hi, ${profile.name}! 👋` : 'Welcome back! 👋'}</h1>
        </div>
        <Link href="/profile" className="ios-tap-active">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-border">
            <Heart className="w-6 h-6 text-primary" />
          </div>
        </Link>
      </header>

      {user?.isAnonymous && !profile && (
        <Card className="mb-8 p-6 rounded-[2rem] border-none bg-primary/5 border border-primary/10 shadow-sm overflow-hidden relative group">
          <div className="flex gap-4 items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-primary">Complete Setup</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Tell us your health goals to unlock AI meal recommendations.</p>
              <Button size="sm" asChild className="rounded-xl h-10 px-6 font-bold mt-4 shadow-md">
                <Link href="/onboarding">Setup Profile <ArrowRight className="ml-2 w-3 h-3" /></Link>
              </Button>
            </div>
          </div>
          <Sparkles className="absolute -right-2 -bottom-2 w-20 h-20 text-primary/5 rotate-12" />
        </Card>
      )}

      <section className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-primary text-white p-5 rounded-[2.5rem] border-none shadow-lg shadow-primary/20 flex flex-col gap-1 ios-tap-active">
          <RefrigeratorIcon className="w-6 h-6 opacity-60 mb-2" />
          <span className="text-3xl font-black">{inventorySummary.total}</span>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Stocked Items</p>
        </Card>
        <Card className="bg-white p-5 rounded-[2.5rem] border-none shadow-sm flex flex-col gap-1 ios-tap-active">
          <Flame className="w-6 h-6 text-orange-500 mb-2" />
          <span className="text-3xl font-black">{inventorySummary.expiring}</span>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Expiring Soon</p>
        </Card>
      </section>

      <div className="flex flex-col gap-4 mb-10">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="rounded-[2rem] h-20 flex flex-col gap-1 bg-white border-none shadow-sm ios-tap-active" asChild>
            <Link href="/inventory">
              <Plus className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-bold">Add Items</span>
            </Link>
          </Button>
          <Button className="rounded-[2rem] h-20 flex flex-col gap-1 bg-accent text-accent-foreground border-none shadow-sm ios-tap-active" asChild>
            <Link href="/recipes">
              <ChefHat className="w-5 h-5" />
              <span className="text-[10px] font-bold">Cook with AI</span>
            </Link>
          </Button>
          <Button variant="outline" className="rounded-[2rem] h-20 flex flex-col gap-1 bg-white border-none shadow-sm ios-tap-active" asChild>
            <Link href="/shopping">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] font-bold">Shopping List</span>
            </Link>
          </Button>
          <Button variant="outline" className="rounded-[2rem] h-20 flex flex-col gap-1 bg-white border-none shadow-sm ios-tap-active" asChild>
            <Link href="/meal-plan">
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] font-bold">Meal Schedule</span>
            </Link>
          </Button>
        </div>
      </div>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-5 px-1">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Inventory Alerts</h2>
          <Link href="/inventory" className="text-primary text-[11px] font-bold flex items-center gap-1 uppercase tracking-wider">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {expiringSoon.length > 0 ? (
            expiringSoon.map(item => (
              <InventoryItemCard key={item.id} item={item} />
            ))
          ) : (
            <Card className="p-8 text-center bg-white rounded-[2rem] border-2 border-dashed border-muted shadow-none">
              <p className="text-muted-foreground text-sm font-medium">Fridge looks fresh! 🥦</p>
              <Button variant="link" asChild className="mt-2 text-primary font-bold">
                <Link href="/inventory">Manage Stock</Link>
              </Button>
            </Card>
          )}
        </div>
      </section>

      {profile && (
        <Card className="bg-accent/10 p-6 rounded-[2.5rem] border border-accent/20 flex gap-5 ios-tap-active">
          <div className="w-14 h-14 bg-accent rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-sm">
            <ActivityIcon className="w-7 h-7 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1 text-accent-foreground">Personalized Tip</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on your goal for <strong>{profile.healthGoals[0]}</strong>, try adding more {profile.dietPreferences[0] || 'lean proteins'} to your next shopping list.
            </p>
          </div>
        </Card>
      )}

      <footer className="mt-12 text-center px-8">
        <p className="text-[10px] text-muted-foreground leading-relaxed italic opacity-60">
          “This app provides food guidance for informational purposes only and is not a substitute for professional medical advice.”
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}

function RefrigeratorIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z"/><path d="M5 10h14"/><path d="M15 7v6"/><path d="M15 15v3"/></svg>
  )
}

function CalendarIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  )
}

function ActivityIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  )
}
