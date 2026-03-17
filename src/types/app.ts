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
  userId: string;
  name: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  expirationDate: string; // ISO 8601
  location: StorageLocation;
  notes?: string;
  addedAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string; // Matches userId
  name: string;
  ageRange?: string;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  healthGoals: string[];
  dietPreferences: string[];
  healthConcerns: string[];
  allergies: string[];
  foodsToAvoid: string[];
  preferredCuisine: string[];
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  householdSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  whyMatchHealthNeeds: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  ingredients: string[];
  missingIngredients?: string[];
  instructions: string[];
  estimatedCalories?: number;
  estimatedCarbs?: number;
  estimatedProtein?: number;
  estimatedFat?: number;
  healthNotes: string[];
  substitutionSuggestions?: string[];
  cuisineType: string;
  generatedAt: string;
}

export interface ShoppingListItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  isBought: boolean;
  addedAt: string;
  recipeId?: string;
}

export interface MealPlanEntry {
  id: string;
  userId: string;
  recipeId?: string; // Optional if manual entry
  recipeTitle: string; // Denormalized for display
  planDate: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  isCooked: boolean;
  plannedAt: string;
  cookedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'expiring_ingredient' | 'low_stock' | 'meal_reminder';
  message: string;
  relatedEntityId?: string;
  sentTime: string;
  isRead: boolean;
}
