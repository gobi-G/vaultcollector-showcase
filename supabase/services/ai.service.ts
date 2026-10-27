import type { IAiProvider } from "../providers/interfaces/index.ts";

export function createAiService(aiProvider: IAiProvider) {
  return {
    async recognizeCard(_userId: string, imageBase64: string) {
      return aiProvider.recognizeCard(imageBase64);
    },

    async assessCondition(_userId: string, imageBase64: string) {
      return aiProvider.assessCondition(imageBase64);
    },
  };
}
