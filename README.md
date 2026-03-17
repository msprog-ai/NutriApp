# NutriFridge AI

NutriFridge AI is a smart kitchen assistant that helps you manage your fridge inventory, reduce food waste, and generate personalized recipes based on your health goals and available ingredients.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory and add your Google AI API Key:
```env
GOOGLE_GENAI_API_KEY=your_api_key_here
# Optional: Override the default model
# GENAI_MODEL=googleai/gemini-1.5-pro
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:9002](http://localhost:9002) with your browser to see the app.

### 4. Run Genkit Developer UI (Optional)
To test and debug AI flows directly:
```bash
npm run genkit:dev
```

## Key Features
- **Smart Inventory**: Track expiry dates with visual alerts.
- **AI Recipe Generator**: Creates meals from items you already have.
- **Personalized Onboarding**: Tailors suggestions to your allergies and diets.
- **AI Kitchen Assistant**: Multi-turn chat for cooking advice.
- **Meal Planner**: Schedule your week and track "cooked" status.
- **Shopping List**: Automatically track missing ingredients.
