"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ChefHat, Activity } from 'lucide-react';

interface RecipeCardProps {
  recipe: any;
  onClick?: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <Card 
      className="overflow-hidden border-none bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{recipe.title}</h3>
          <Badge className="bg-accent/20 text-accent-foreground border-none">
            {recipe.difficultyLevel}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {recipe.shortDescription}
        </p>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="w-3 h-3" />
            <span>{recipe.nutritionalEstimates?.calories} kcal</span>
          </div>
          {recipe.healthNotes?.slice(0, 2).map((note: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="text-[10px] py-0 px-2 rounded-full font-normal">
              {note}
            </Badge>
          ))}
        </div>

        <div className="mt-2 pt-3 border-t flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary">View Full Recipe</span>
        </div>
      </div>
    </Card>
  );
}