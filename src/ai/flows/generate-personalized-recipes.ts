'use server';
/**
 * @fileOverview A Genkit flow for generating personalized recipes.
 * 
 * NOTE: This flow uses ai.generate() for single-turn generation. 
 * For multi-turn interactions or tool-heavy logic, refer to assistant-chat-flow.ts
 * which uses the stateful ai.chat() session API to prevent metadata loss.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const IngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  category: z
    .enum([
      'vegetables',
      'fruits',
      'meat',
      'seafood',
      'dairy',
      'condiments',
      'pantry items',
      'frozen goods',
      'other',
    ])
    .describe('The category of the ingredient.'),
  quantity: z.number().describe('The quantity of the ingredient.'),
  unit: z.string().describe('The unit of measurement for the ingredient (e.g., kg, pieces, cups).'),
  expirationDate: z.string().datetime().describe('The expiration date of the ingredient in ISO 8601 format.'),
  location: z.enum(['fridge', 'freezer', 'pantry']).describe('The storage location of the ingredient.'),
  notes: z.string().optional().describe('Any additional notes about the ingredient.'),
});

const UserProfileSchema = z.object({
  name: z.string().describe('The name of the user.'),
  ageRange: z.string().optional().describe('The age range of the user (e.g., "25-34").'),
  gender: z.string().optional().describe('The gender of the user.'),
  height: z.number().optional().describe('The height of the user in cm.'),
  weight: z.number().optional().describe('The weight of the user in kg.'),
  healthGoals: z.array(z.string()).describe('User\'s health goals (e.g., "weight loss", "muscle gain").'),
  dietPreferences: z.array(
    z.enum([
      'low carb',
      'low sugar',
      'low sodium',
      'high protein',
      'vegetarian',
      'pescatarian',
      'dairy-free',
      'gluten-free',
      'vegan',
      'keto',
    ])
  ).describe('User\'s dietary preferences.'),
  healthConcerns: z.array(
    z.enum([
      'diabetes',
      'high blood pressure',
      'high cholesterol',
      'kidney concerns',
      'celiac disease',
    ])
  ).describe('User\'s health concerns.'),
  allergies: z.array(z.string()).describe('User\'s food allergies (e.g., "peanuts", "shellfish").'),
  foodsToAvoid: z.array(z.string()).describe('Specific foods the user wishes to avoid.'),
  preferredCuisine: z.array(z.string()).describe('User\'s preferred cuisines (e.g., "Italian", "Mexican").'),
  cookingSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']).describe('User\'s cooking skill level.'),
  householdSize: z.number().int().min(1).describe('Number of people in the household.'),
});

const GeneratePersonalizedRecipesInputSchema = z.object({
  inventoryItems: z.array(IngredientSchema).describe('A list of ingredients currently available in the user\'s inventory, prioritized by expiration date.'),
  userProfile: UserProfileSchema.describe('The user\'s health and dietary profile.'),
  servings: z.number().int().min(1).optional().describe('The desired number of servings for the recipe.'),
  cookingTimePreference: z.enum(['short (under 30 min)', 'medium (30-60 min)', 'long (over 60 min)']).optional().describe('Preferred cooking time.'),
  cuisinePreference: z.string().optional().describe('Specific cuisine preference for this recipe generation (overrides user profile if specified).'),
  numberOfRecipes: z.number().int().min(1).max(5).default(3).describe('The number of recipe suggestions to generate.'),
});
export type GeneratePersonalizedRecipesInput = z.infer<typeof GeneratePersonalizedRecipesInputSchema>;

// Output Schema
const RecipeOutputSchema = z.object({
  title: z.string().describe('The title of the recipe.'),
  shortDescription: z.string().describe('A brief description of the recipe.'),
  healthMatchReason: z.string().describe('An explanation of why this recipe matches the user\'s health needs and preferences.'),
  prepTime: z.string().describe('Estimated preparation time (e.g., "15 minutes").'),
  cookTime: z.string().describe('Estimated cooking time (e.g., "30 minutes").'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the recipe.'),
  ingredientsUsed: z.array(z.string()).describe('A list of ingredients from the inventory used in this recipe.'),
  missingIngredients: z.array(z.string()).describe('A list of missing ingredients that need to be purchased.'),
  instructions: z.array(z.string()).describe('Step-by-step cooking instructions.'),
  nutritionalEstimates: z.object({
    calories: z.number().optional().describe('Estimated calories per serving.'),
    carbs: z.number().optional().describe('Estimated carbohydrates per serving (in grams).'),
    protein: z.number().optional().describe('Estimated protein per serving (in grams).'),
    fat: z.number().optional().describe('Estimated fat per serving (in grams).'),
  }).describe('Estimated nutritional information per serving.'),
  healthNotes: z.array(z.string()).describe('Important health-related notes (e.g., "diabetic-friendly", "low sodium", "high protein"). Must include a note about any ingredients to avoid due to allergies. These notes are supportive wellness guidance only and not medical advice.'),
  substitutionSuggestions: z.array(z.string()).optional().describe('Optional suggestions for ingredient substitutions.'),
});

const GeneratePersonalizedRecipesOutputSchema = z.object({
  recipes: z.array(RecipeOutputSchema).describe('A list of personalized recipe suggestions.'),
});
export type GeneratePersonalizedRecipesOutput = z.infer<typeof GeneratePersonalizedRecipesOutputSchema>;

export async function generatePersonalizedRecipes(
  input: GeneratePersonalizedRecipesInput
): Promise<GeneratePersonalizedRecipesOutput> {
  return generatePersonalizedRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecipeGeneratorPrompt',
  input: {schema: GeneratePersonalizedRecipesInputSchema},
  output: {schema: GeneratePersonalizedRecipesOutputSchema},
  prompt: `You are NutriFridge AI, an expert recipe generator specializing in creating personalized, health-aware meals.\nYour goal is to generate {{{numberOfRecipes}}} unique recipes based on the user's available ingredients, dietary preferences, health concerns, and allergies.\nPrioritize using ingredients that are close to their expiration date to reduce food waste.\nStrictly adhere to all health concerns and allergies – absolutely *never* suggest a recipe containing an allergenic or restricted ingredient.\nDo not make any unsafe medical claims or state that a recipe can cure diseases; clearly label recipe suggestions as supportive wellness guidance only.\n\nHere is the user's profile and current inventory:\n\nUser Profile:\n- Name: {{{userProfile.name}}}\n- Health Goals: {{#if userProfile.healthGoals}}{{#each userProfile.healthGoals}}\n  - {{{this}}}{{/each}}{{else}} None{{/if}}\n- Diet Preferences: {{#if userProfile.dietPreferences}}{{#each userProfile.dietPreferences}}\n  - {{{this}}}{{/each}}{{else}} None{{/if}}\n- Health Concerns: {{#if userProfile.healthConcerns}}{{#each userProfile.healthConcerns}}\n  - {{{this}}}{{/each}}{{else}} None{{/if}}\n- Allergies: {{#if userProfile.allergies}}{{#each userProfile.allergies}}\n  - {{{this}}}{{/each}}{{else}} None{{/if}}\n- Foods to Avoid: {{#if userProfile.foodsToAvoid}}{{#each userProfile.foodsToAvoid}}\n  - {{{this}}}{{/each}}{{else}} None{{/if}}\n- Preferred Cuisine: {{#if userProfile.preferredCuisine}}{{#each userProfile.preferredCuisine}}\n  - {{{this}}}{{/each}}{{else}} None{{/if}}\n- Cooking Skill Level: {{{userProfile.cookingSkillLevel}}}\n- Household Size: {{{userProfile.householdSize}}} people\n\nCurrent Inventory (prioritizing soon-to-expire items):\n{{#if inventoryItems}}{{#each inventoryItems}}\n- {{{name}}} (Category: {{{category}}}, Quantity: {{{quantity}}} {{{unit}}}, Expires: {{{expirationDate}}}, Location: {{{location}}})\n{{/each}}{{else}} No items in inventory.\n{{/if}}\n\nRecipe Preferences for this request:\n- Desired Servings: {{#if servings}}{{{servings}}}{{else}}Not specified{{/if}}\n- Cooking Time Preference: {{#if cookingTimePreference}}{{{cookingTimePreference}}}{{else}}Any{{/if}}\n- Specific Cuisine Preference: {{#if cuisinePreference}}{{{cuisinePreference}}}{{else}}Any (consider user profile)\n{{/if}}\n\nBased on the above information, generate {{{numberOfRecipes}}} recipes.\nFor each recipe, provide the following details in JSON format:\n- Recipe title\n- A short description of the meal.\n- A clear explanation of *why* this recipe matches the user's health needs, diet preferences, and utilizes expiring inventory.\n- Estimated preparation time (e.g., "15 minutes").\n- Estimated cooking time (e.g., "30 minutes").\n- Difficulty level (easy, medium, hard).\n- A list of ingredients *from the inventory* that are used.\n- A list of *missing ingredients* that need to be purchased.\n- Step-by-step cooking instructions.\n- Estimated nutritional information *per serving* (calories, carbs, protein, fat).\n- Specific health notes (e.g., "diabetic-friendly", "low sodium", "high protein", "avoid due to peanut allergy"). Ensure any allergies or avoided foods are explicitly mentioned if they are relevant to the recipe's suitability.\n- Optional substitution suggestions for certain ingredients.\n\nRemember to strictly avoid all listed allergies and foods to avoid. Prioritize expiring ingredients.\nProvide only the JSON object containing the 'recipes' array as the output, with no additional text or formatting outside the JSON.\n`,
});

const generatePersonalizedRecipesFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedRecipesFlow',
    inputSchema: GeneratePersonalizedRecipesInputSchema,
    outputSchema: GeneratePersonalizedRecipesOutputSchema,
  },
  async (input) => {
    // Sort inventory items by expiration date, soonest first, before passing to the prompt.
    const sortedInventory = [...input.inventoryItems].sort((a, b) => {
      const dateA = new Date(a.expirationDate).getTime();
      const dateB = new Date(b.expirationDate).getTime();
      return dateA - dateB;
    });

    const inputForPrompt = {
      ...input,
      inventoryItems: sortedInventory, // Use sorted inventory
    };

    // Requirement 3: Use ai.generate() or prompts which correctly handle single turns.
    // For multi-turn with tool results, use ai.chat() sessions.
    const { output } = await prompt(inputForPrompt);
    return output!;
  }
);
