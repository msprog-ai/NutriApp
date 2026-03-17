
"use client";

import { useState } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { RecipeCard } from '@/components/nutrifridge/recipe-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChefHat, Sparkles, Loader2, Info, ShoppingCart, CalendarPlus } from 'lucide-react';
import { generatePersonalizedRecipes } from '@/ai/flows/generate-personalized-recipes';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { InventoryItem, UserProfile } from '@/types/app';

export default function RecipesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [generating, setGenerating] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

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

  const handleGenerate = async () => {
    if (!profile || !inventory || inventory.length === 0) {
      toast({ title: "Inventory empty", description: "Add some items to your fridge first!", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const result = await generatePersonalizedRecipes({
        inventoryItems: inventory as any,
        userProfile: profile as any,
        numberOfRecipes: 3,
        cookingTimePreference: 'short (under 30 min)'
      });
      setRecipes(result.recipes);
      toast({ title: "Chef AI has spoken!", description: "Found 3 delicious matches for you." });
    } catch (e) {
      toast({ title: "Failed to generate recipes", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleAddToMealPlan = (recipe: any) => {
    if (!user || !firestore) return;

    const colRef = collection(firestore, 'users', user.uid, 'meal_plan_entries');
    const data = {
      userId: user.uid,
      recipeTitle: recipe.title,
      planDate: new Date().toISOString().split('T')[0],
      mealType: 'dinner',
      servings: profile?.householdSize || 1,
      isCooked: false,
      plannedAt: new Date().toISOString(),
      nutritionalInfo: recipe.nutritionalEstimates
    };

    addDocumentNonBlocking(colRef, data);
    toast({ title: "Added to your meal plan!" });
  };

  const handleAddToShoppingList = (missingIngredients: string[]) => {
    if (!user || !firestore || !missingIngredients.length) return;
    
    const colRef = collection(firestore, 'users', user.uid, 'shopping_list_items');
    
    missingIngredients.forEach(name => {
      addDocumentNonBlocking(colRef, {
        userId: user.uid,
        name,
        quantity: 1,
        unit: 'pcs',
        isBought: false,
        addedAt: new Date().toISOString()
      });
    });
    
    toast({ title: "Missing items added to shopping list!" });
  };

  if (isUserLoading || isProfileLoading || isInventoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Recipe Ideas</h1>
          <p className="text-sm text-muted-foreground">Smart suggestions for your inventory</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
      </header>

      <section className="mb-8">
        <div className="bg-primary text-white p-6 rounded-[2rem] relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Ready to cook?</h2>
            <p className="text-sm opacity-90 mb-4 leading-relaxed">Let AI create the perfect meal based on your available ingredients and health goals.</p>
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl w-full h-14 font-bold shadow-lg ios-tap-active"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate My Meals
                </>
              )}
            </Button>
          </div>
          <ChefHat className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 text-white" />
        </div>
      </section>

      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white rounded-2xl p-1 shadow-sm h-12 mb-6 border border-border">
          <TabsTrigger value="suggestions" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">Suggestions</TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">Favorites</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suggestions" className="space-y-4">
          {recipes.length > 0 ? (
            recipes.map((recipe, idx) => (
              <RecipeCard key={idx} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-bold text-lg">No suggestions yet</h3>
              <p className="text-sm text-muted-foreground mt-1 px-8">Tap the button above to see what you can cook today.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-border opacity-60">
            <p className="text-muted-foreground font-medium">Coming soon: Save your favorite recipes!</p>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-md h-[90vh] p-0 flex flex-col rounded-t-[2.5rem] border-none shadow-2xl">
          {selectedRecipe && (
            <>
              <DialogHeader className="p-8 pb-4 text-left">
                <DialogTitle className="text-3xl font-bold pr-6 leading-tight">{selectedRecipe.title}</DialogTitle>
                <div className="flex gap-2 mt-3">
                  <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[10px]">{selectedRecipe.difficultyLevel}</Badge>
                  <Badge className="bg-accent/20 text-accent-foreground border-none font-bold uppercase tracking-wider text-[10px]">{selectedRecipe.cookTime}</Badge>
                </div>
              </DialogHeader>
              <ScrollArea className="flex-1 px-8 pb-8">
                <div className="space-y-8">
                  <div className="bg-primary/5 p-5 rounded-[2rem] border border-primary/10">
                    <h4 className="font-bold mb-2 flex items-center gap-2 text-primary text-sm">
                      <Sparkles className="w-4 h-4" /> Why this match?
                    </h4>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      "{selectedRecipe.healthMatchReason}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-5 rounded-3xl">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Calories</p>
                      <p className="text-2xl font-bold">{selectedRecipe.nutritionalEstimates?.calories} <span className="text-xs font-normal">kcal</span></p>
                    </div>
                    <div className="bg-muted/30 p-5 rounded-3xl">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Protein</p>
                      <p className="text-2xl font-bold">{selectedRecipe.nutritionalEstimates?.protein} <span className="text-xs font-normal">g</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-4 text-lg">Ingredients Used</h4>
                    <ul className="space-y-3">
                      {selectedRecipe.ingredientsUsed.map((ing: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          <span className="text-muted-foreground font-medium">{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedRecipe.missingIngredients?.length > 0 && (
                    <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-orange-700">Missing Items</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider text-orange-600 hover:bg-orange-100"
                          onClick={() => handleAddToShoppingList(selectedRecipe.missingIngredients)}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" /> Add all to list
                        </Button>
                      </div>
                      <ul className="space-y-3">
                        {selectedRecipe.missingIngredients.map((ing: string, i: number) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-orange-800/70">
                            <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" /> {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold mb-4 text-lg">Instructions</h4>
                    <ol className="space-y-6">
                      {selectedRecipe.instructions.map((step: string, i: number) => (
                        <li key={i} className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-2xl bg-primary text-white flex items-center justify-center text-xs font-bold shadow-md">{i+1}</span>
                          <span className="text-sm text-muted-foreground leading-relaxed pt-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-accent/5 p-6 rounded-[2rem] border border-accent/20">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" /> Nutrition & Health
                    </h4>
                    <ul className="space-y-2">
                      {selectedRecipe.healthNotes.map((note: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span> {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="p-8 border-t mt-auto gap-3">
                <Button 
                  className="w-full rounded-2xl h-16 text-lg font-bold shadow-lg ios-tap-active flex gap-2" 
                  onClick={() => handleAddToMealPlan(selectedRecipe)}
                >
                  <CalendarPlus className="w-5 h-5" /> Add to Meal Plan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
