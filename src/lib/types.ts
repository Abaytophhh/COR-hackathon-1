export type Language = "ru" | "kk";
export type Localized = Record<Language, string>;
export type VerificationStatus = "trust" | "fake" | "partial";

export interface Source {
  type: "article" | "video";
  url: string;
  title: Localized;
  organization: string;
}

export interface Claim {
  text: Localized;
  status: VerificationStatus;
  explanation: Localized;
  source_indices: number[];
}

export interface Question {
  id: string;
  question: Localized;
  category: "it" | "medicine" | "history" | "astronomy" | "science";
  ai_model: string;
  ai_answer: Localized;
  highlight: Localized;
  human_verification: {
    status: VerificationStatus;
    expert_answer: Localized;
    claims: Claim[];
    sources: Source[];
  };
  comments?: unknown[];
  origin?: {
    url: string;
    date: string;
    model: string;
    reported_confidence: number;
    reported_status: VerificationStatus;
  };
}
