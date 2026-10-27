export type AiScanResult = {
  name: string;
  tcgType: "pokemon" | "yugioh" | "magic";
  set: string;
  number: string | null;
  rarity: string;
  estimatedCondition: string;
  confidence: number;
  cardApiId: string | null;
  passcode: string | null;
  scryfallId: string | null;
  edition: string | null;
  hp: number | null;
  variant: string | null;
  language: string | null;
  visualDescription: string | null;
};

export interface IAiScanService {
  recognizeCard(imageBase64: string): Promise<AiScanResult>;
}
