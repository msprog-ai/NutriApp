import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  /**
   * Requirement 6: Make the model configurable.
   * Defaulting to gemini-1.5-flash for stability, but allowing override via env.
   */
  model: process.env.GENAI_MODEL || 'googleai/gemini-1.5-flash',
});
