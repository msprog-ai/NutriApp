"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ChefHat, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const { auth, user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) return;
    setLoading(true);
    try {
      initiateEmailSignIn(auth, email, password);
      toast({ title: "Signing you in...", description: "You'll be redirected shortly." });
      // Redirect happens automatically via the useUser hook in layout/home
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Auth Error", description: error.message });
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) return;
    setLoading(true);
    try {
      initiateEmailSignUp(auth, email, password);
      toast({ title: "Creating account...", description: "Welcome to NutriFridge!" });
      router.push('/onboarding');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Auth Error", description: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col max-w-md mx-auto">
      <header className="mb-10 pt-4">
        <Button variant="ghost" size="icon" asChild className="mb-6 -ml-2 rounded-full">
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">NutriFridge</h1>
        </div>
        <p className="text-muted-foreground">Your AI-powered kitchen companion.</p>
      </header>

      <Card className="border-none shadow-2xl rounded-[2.5rem] p-8 bg-white flex-1 flex flex-col">
        <Tabs defaultValue="login" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-2xl p-1 mb-8">
            <TabsTrigger value="login" className="rounded-xl font-bold">Log In</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl font-bold">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="flex-1">
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold mt-4 ios-tap-active" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="flex-1">
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="name"
                    placeholder="Alex Smith" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="signup-email"
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="signup-password"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold mt-4 ios-tap-active" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </Card>
    </div>
  );
}
