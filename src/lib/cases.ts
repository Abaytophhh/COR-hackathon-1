import questions from "@/data/questions.json";
import referenceCases from "@/data/reference-cases.json";
import type { Question } from "./types";

export const CATEGORIES = ["all", "it", "medicine", "history", "astronomy", "science"] as const;
export type CategoryFilter = (typeof CATEGORIES)[number];

export const allCases: Question[] = [...(questions as Question[]), ...(referenceCases as Question[])];

export function findCase(id: string) {
  return allCases.find((item) => item.id === id);
}
