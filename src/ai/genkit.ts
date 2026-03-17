import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  /**
   * The model is configurable via environment variables.
   * Defaulting to gemini-1.5-flash for balanced speed and cost.
   */
  model: process.env.GENAI_MODEL || 'googleai/gemini-1.5-flash',
});
