export type CardRecognitionResult = {
  name: string;
  setName: string | null;
  cardNumber: string | null;
  rarity: string | null;
  confidence: number;
  cardApiId: string | null;
  estimatedCondition: "mint" | "near_mint" | "played" | "damaged";
};

export type ConditionAssessment = {
  condition: "mint" | "near_mint" | "played" | "damaged";
  confidence: number;
  details: string;
};

export interface IAiProvider {
  recognizeCard(imageBase64: string): Promise<CardRecognitionResult>;
  assessCondition(imageBase64: string): Promise<ConditionAssessment>;
}
