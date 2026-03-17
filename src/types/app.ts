export type IngredientCategory =
  | 'vegetables'
  | 'fruits'
  | 'meat'
  | 'seafood'
  | 'dairy'
  | 'condiments'
  | 'pantry items'
  | 'frozen goods'
  | 'other';

export type StorageLocation = 'fridge' | 'freezer' | 'pantry';

export interface InventoryItem {
  id: string;
  name: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  expirationDate: string; // ISO 8601
  location: StorageLocation;
  notes?: string;
  userId: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  ageRange?: string;
  gender?: string;
  height?: number;
  weight?: number;
  healthGoals: string[];
  dietPreferences: string[];
  healthConcerns: string[];
  allergies: string[];
  foodsToAvoid: string[];
  preferredCuisine: string[];
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  householdSize: number;
  onboarded: boolean;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  bought: boolean;
  userId: string;
}

export interface MealPlan {
  id: string;
  date: string;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recipeId?: string;
    recipeTitle?: string;
    cooked: boolean;
  }[];
  userId: string;
}