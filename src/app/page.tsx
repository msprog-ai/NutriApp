"use client";

import { useEffect } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { InventoryItemCard } from '@/components/nutrifridge/inventory-item-card';
import { Button } from '@/components/ui/button';
import { Plus, Flame, Heart, ArrowRight, Loader2, ShoppingBag, LogIn } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile && !user?.isAnonymous) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-6 bg-white">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
          <Flame className="w-12 h-12 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">NutriFridge AI</h1>
          <p className="text-muted-foreground mt-2">Personalized nutrition and smart inventory management.</p>
        </div>
        <div className="w-full space-y-3">
          <Button size="lg" className="w-full rounded-2xl py-6 text-lg font-bold" asChild>
            <Link href="/onboarding">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full rounded-2xl py-6 text-lg font-bold border-2" asChild>
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
    .slice(0, 3);

  const inventorySummary = {
    total: inventory?.length || 0,
    fridge: inventory?.filter(i => i.location === 'fridge').length || 0,
    freezer: inventory?.filter(i => i.location === 'freezer').length || 0,
    pantry: inventory?.filter(i => i.location === 'pantry').length || 0,
  };

  return (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-muted-foreground text-sm font-medium">Welcome back,</p>
          <h1 className="text-2xl font-bold">{profile?.name || 'Chef'}! 👋</h1>
        </div>
        <Link href="/profile">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
        </Link>
      </header>

      {user?.isAnonymous && !profile && (
        <Card className="mb-8 p-5 rounded-3xl border-none bg-orange-50 border border-orange-100">
          <div className="flex gap-4 items-start">
            <LogIn className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-orange-800">Limited Guest Access</h3>
              <p className="text-xs text-orange-700/80 mt-1">Complete onboarding or sign in to save your recipes and inventory.</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" asChild className="rounded-xl bg-orange-500 hover:bg-orange-600">
                  <Link href="/onboarding">Setup Profile</Link>
                </Button>
                <Button size="sm" variant="outline" asChild className="rounded-xl border-orange-200 bg-white text-orange-600">
                  <Link href="/auth">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <section className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-primary text-white p-4 rounded-3xl">
          <div className="flex justify-between items-start mb-2">
            <RefrigeratorIcon className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{inventorySummary.total}</span>
          </div>
          <p className="text-xs opacity-90">Items in Stock</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-border">
          <div className="flex justify-between items-start mb-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-2xl font-bold">{expiringSoon.length}</span>
          </div>
          <p className="text-xs text-muted-foreground">Expiring Soon</p>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <Button variant="secondary" className="rounded-2xl flex flex-col h-auto py-4 gap-2 text-[10px]" asChild>
          <Link href="/inventory">
            <Plus className="w-5 h-5" />
            <span>Inventory</span>
          </Link>
        </Button>
        <Button className="rounded-2xl flex flex-col h-auto py-4 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground text-[10px]" asChild>
          <Link href="/recipes">
            <ChefHatIcon className="w-5 h-5" />
            <span>Cook AI</span>
          </Link>
        </Button>
        <Button variant="outline" className="rounded-2xl flex flex-col h-auto py-4 gap-2 text-[10px]" asChild>
          <Link href="/shopping">
            <ShoppingBag className="w-5 h-5" />
            <span>Shopping</span>
          </Link>
        </Button>
      </div>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Expiring Soon</h2>
          <Link href="/inventory" className="text-primary text-sm font-semibold flex items-center gap-1">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {expiringSoon.length > 0 ? (
            expiringSoon.map(item => (
              <InventoryItemCard key={item.id} item={item} />
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed text-muted-foreground">
              <p>Everything is fresh! 🥦</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-accent/10 p-5 rounded-3xl mb-8 flex gap-4 border border-accent/20">
        <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shrink-0">
          <ActivityIcon className="w-6 h-6 text-accent-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-sm mb-1 text-accent-foreground">Personalized Tip</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Based on your preference for <strong>{profile?.dietPreferences?.[0] || 'healthy meals'}</strong>, try exploring our latest recommendations.
          </p>
        </div>
      </section>

      <div className="text-center p-4">
        <p className="text-[10px] text-muted-foreground leading-tight italic">
          “This app provides food guidance for informational purposes only and is not a substitute for professional medical advice.”
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

function RefrigeratorIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z"/><path d="M5 10h14"/><path d="M15 7v6"/><path d="M15 15v3"/></svg>
  )
}

function ChefHatIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><path d="M6 17h12"/></svg>
  )
}

function ActivityIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  )
}
