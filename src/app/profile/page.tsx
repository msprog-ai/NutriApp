"use client";

import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Settings, LogOut, ChevronRight, Shield, Heart, Bell, Loader2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/types/app';

export default function ProfilePage() {
  const { user, isUserLoading, auth } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'user_profiles', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto min-h-screen">
      <header className="flex flex-col items-center gap-4 mb-8">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
            <AvatarFallback className="bg-primary text-white text-3xl font-bold">
              {profile.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <Settings className="w-4 h-4 text-accent-foreground" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground text-sm">Health Enthusiast • {profile.ageRange}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-3xl text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">{profile.height || '—'}</p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Height (cm)</p>
        </div>
        <div className="bg-white p-4 rounded-3xl text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">{profile.weight || '—'}</p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Weight (kg)</p>
        </div>
      </div>

      <section className="space-y-4 mb-8">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-2">Health Profile</h3>
        <Card className="rounded-3xl border-none p-2 space-y-1 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Allergies & Restrictions</p>
              <p className="text-xs text-muted-foreground truncate">{profile.allergies?.join(', ') || 'None'}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          
          <div className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Health Goals</p>
              <p className="text-xs text-muted-foreground truncate">{profile.healthGoals?.join(', ')}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </section>

      <section className="space-y-4 mb-8">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-2">Settings</h3>
        <Card className="rounded-3xl border-none p-2 space-y-1 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Notifications</p>
              <p className="text-xs text-muted-foreground">Expiry alerts, meal reminders</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </section>

      <Button 
        variant="ghost" 
        className="w-full h-14 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive font-bold gap-2"
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5" /> Sign Out
      </Button>

      <div className="mt-8 text-center">
        <p className="text-[10px] text-muted-foreground italic leading-tight max-w-xs mx-auto">
          “This app provides food guidance for informational purposes only and is not a substitute for professional medical advice.”
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
