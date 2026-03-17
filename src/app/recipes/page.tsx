"use client";

import { useState } from 'react';
import { useAppData } from '@/hooks/use-app-data';
import { BottomNav } from '@/components/layout/bottom-nav';
import { RecipeCard } from '@/components/nutrifridge/recipe-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChefHat, Sparkles, Loader2, ArrowRight, Info } from 'lucide-react';
import { generatePersonalizedRecipes, GeneratePersonalizedRecipesOutput } from '@/ai/flows/generate-personalized-recipes';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function RecipesPage() {
  const { profile, inventory, loading: dataLoading } = useAppData();
  const [generating, setGenerating] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  const handleGenerate = async () => {
    if (!profile || inventory.length === 0) return;
    setGenerating(true);
    try {
      const result = await generatePersonalizedRecipes({
        inventoryItems: inventory as any,
        userProfile: profile as any,
        numberOfRecipes: 3,
        cookingTimePreference: 'short (under 30 min)'
      });
      setRecipes(result.recipes);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  if (dataLoading) return null;

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
        <div className="bg-primary text-white p-6 rounded-3xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Ready to cook?</h2>
            <p className="text-sm opacity-90 mb-4 leading-relaxed">Let AI create the perfect meal based on your available ingredients and health goals.</p>
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl w-full h-12 font-bold"
              onClick={handleGenerate}
              disabled={generating || inventory.length === 0}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Magic Recipe Generator
                </>
              )}
            </Button>
          </div>
          <ChefHat className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 text-white" />
        </div>
      </section>

      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white rounded-2xl p-1 shadow-sm h-12 mb-6 border border-border">
          <TabsTrigger value="suggestions" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">AI Suggestions</TabsTrigger>
          <TabsTrigger value="expiring" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Expiring Soon</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suggestions" className="space-y-4">
          {recipes.length > 0 ? (
            recipes.map((recipe, idx) => (
              <RecipeCard key={idx} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg">No recipes yet</h3>
              <p className="text-sm text-muted-foreground mt-1 px-8">Click the button above to generate personalized AI recipes from your fridge.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expiring">
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-border">
            <p className="text-muted-foreground">Focusing on items expiring soon...</p>
            <Button variant="ghost" className="mt-4 text-primary font-bold" onClick={handleGenerate}>
              Generate Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-md h-[85vh] p-0 flex flex-col rounded-t-[2.5rem]">
          {selectedRecipe && (
            <>
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-2xl font-bold pr-6">{selectedRecipe.title}</DialogTitle>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-primary/10 text-primary border-none">{selectedRecipe.difficultyLevel}</Badge>
                  <Badge className="bg-accent/20 text-accent-foreground border-none">{selectedRecipe.cookTime}</Badge>
                </div>
              </DialogHeader>
              <ScrollArea className="flex-1 px-6 pb-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold mb-2 flex items-center gap-2 text-primary">
                      <Sparkles className="w-4 h-4" /> Why this match?
                    </h4>
                    <p className="text-sm text-muted-foreground bg-primary/5 p-4 rounded-2xl italic">
                      "{selectedRecipe.healthMatchReason}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Calories</p>
                      <p className="text-xl font-bold">{selectedRecipe.nutritionalEstimates?.calories} kcal</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Protein</p>
                      <p className="text-xl font-bold">{selectedRecipe.nutritionalEstimates?.protein}g</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-3">Ingredients Used</h4>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredientsUsed.map((ing: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedRecipe.missingIngredients?.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-3 text-orange-600">Missing Items</h4>
                      <ul className="space-y-2">
                        {selectedRecipe.missingIngredients.map((ing: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold mb-3">Instructions</h4>
                    <ol className="space-y-4">
                      {selectedRecipe.instructions.map((step: string, i: number) => (
                        <li key={i} className="flex gap-4">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i+1}</span>
                          <span className="text-sm text-muted-foreground leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-accent/10 p-5 rounded-2xl border border-accent/20">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" /> Health Notes
                    </h4>
                    <ul className="space-y-1">
                      {selectedRecipe.healthNotes.map((note: string, i: number) => (
                        <li key={i} className="text-[11px] text-muted-foreground">
                          • {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-2xl text-center">
                    <p className="text-[10px] text-muted-foreground italic leading-tight">
                      “This app provides food guidance for informational purposes only and is not a substitute for professional medical advice.”
                    </p>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="p-6 border-t mt-auto">
                <Button className="w-full rounded-2xl h-14 text-lg font-bold">Add to Meal Plan</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}