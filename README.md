# NutriFridge AI

NutriFridge AI is a smart kitchen assistant that helps you manage your fridge inventory, reduce food waste, and generate personalized recipes based on your health goals and available ingredients.

## 🚀 Local Development

Follow these steps to get the app running on your machine:

1. **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Setup**:
   - Open the `.env` file in the root directory.
   - Replace `your_gemini_api_key_here` with your actual API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. **Run the App**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:9002`.
5. **Explore AI Flows (Optional)**:
   To test the Genkit AI flows in a graphical interface:
   ```bash
   npm run genkit:dev
   ```

## 📱 Key Features
- **Smart Inventory**: Track ingredients and expiry dates with a built-in camera scanner.
- **AI Recipe Generator**: Get personalized meal ideas based on your fridge contents and health profile.
- **Meal Planner**: Schedule your week and track "cooked" status.
- **AI Assistant**: Multi-turn chat for nutrition advice and cooking tips using stateful Genkit sessions.
- **Shopping List**: Automatically track missing ingredients from suggested recipes.

## ☁️ Deployment

### GitHub & Firebase App Hosting

1. **Initialize Git**:
   ```bash
   git init
   git remote add origin https://github.com/msprog-ai/NutriApp.git
   git add .
   git commit -m "Initial NutriFridge AI codebase"
   git push -u origin main
   ```

2. **Connect to Firebase**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Select your project.
   - Navigate to **App Hosting** and connect your GitHub repository.
   - During setup, add `GOOGLE_GENAI_API_KEY` to the Environment Variables.

---
*Note: This app provides food guidance for informational purposes only and is not a substitute for professional medical advice.*
