"use client";

import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChefHat, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { MealPlanEntry } from '@/types/app';
import { format, parseISO, isToday } from 'date-fns';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function MealPlanPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const mealPlanQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'meal_plan_entries'),
      orderBy('planDate', 'asc')
    );
  }, [firestore, user]);

  const { data: mealPlans, isLoading } = useCollection<MealPlanEntry>(mealPlanQuery);

  const toggleCooked = (entry: MealPlanEntry) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'meal_plan_entries', entry.id);
    updateDocumentNonBlocking(docRef, { 
      isCooked: !entry.isCooked,
      cookedAt: !entry.isCooked ? new Date().toISOString() : null
    });
    toast({ 
      title: entry.isCooked ? "Marked as unplanned" : "Delicious! Meal marked as cooked.",
    });
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group by date
  const groupedMeals = (mealPlans || []).reduce((acc, meal) => {
    const date = meal.planDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, MealPlanEntry[]>);

  const dates = Object.keys(groupedMeals).sort();

  return (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Meal Planner</h1>
          <p className="text-sm text-muted-foreground">Your weekly healthy journey</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <CalendarIcon className="w-5 h-5 text-primary" />
        </div>
      </header>

      {dates.length > 0 ? (
        <div className="space-y-8">
          {dates.map(date => (
            <section key={date} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  isToday(parseISO(date)) ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {isToday(parseISO(date)) ? "Today" : format(parseISO(date), 'EEEE, MMM d')}
                </div>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="space-y-3">
                {groupedMeals[date].map(meal => (
                  <Card 
                    key={meal.id} 
                    className={cn(
                      "p-4 border-none shadow-sm transition-all duration-300",
                      meal.isCooked ? "bg-muted/50 opacity-70" : "bg-white"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                        meal.isCooked ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent-foreground"
                      )}>
                        {meal.isCooked ? <CheckCircle2 className="w-6 h-6" /> : <ChefHat className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold border-none bg-muted px-2 py-0">
                            {meal.mealType}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Clock className="w-2.5 h-2.5" /> {meal.servings} servings
                          </span>
                        </div>
                        <h3 className={cn(
                          "font-bold text-base leading-tight truncate",
                          meal.isCooked && "line-through text-muted-foreground"
                        )}>
                          {meal.recipeTitle}
                        </h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "rounded-full w-10 h-10 shrink-0",
                          meal.isCooked ? "text-primary" : "text-muted-foreground"
                        )}
                        onClick={() => toggleCooked(meal)}
                      >
                        <CheckCircle2 className={cn("w-6 h-6", meal.isCooked && "fill-primary text-white")} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-muted">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarIcon className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h3 className="font-bold text-xl mb-2">No meals planned</h3>
          <p className="text-muted-foreground text-sm px-10 mb-8">
            Browse recipes and add them to your schedule to start your planning journey.
          </p>
          <Button asChild className="rounded-2xl h-12 px-8">
            <Link href="/recipes">Discover Recipes</Link>
          </Button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
