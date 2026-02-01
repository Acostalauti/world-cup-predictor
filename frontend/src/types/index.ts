import type { components } from "./api";

// Extend Match type with new fields not in OpenAPI schema
export interface Match extends components["schemas"]["Match"] {
  fifaMatchId?: string;
  manualOverride?: boolean;
  updatedAt?: string;
  editable?: boolean; // Computed field from backend
}

// Extend Prediction with fields not in OpenAPI schema
export interface Prediction extends components["schemas"]["Prediction"] {
  pointsBreakdown?: string;
  notified?: boolean;
}

// New type: Prediction with full match data (from /predictions/detailed)
export interface PredictionWithMatch {
  id: string;
  matchId: string;
  userId: string;
  homeScore: number;
  awayScore: number;
  points?: number;
  pointsBreakdown?: string;
  notified: boolean;
  match: Match;
}

// Re-export common types from API schema
export type User = components["schemas"]["User"];
export type Group = components["schemas"]["Group"];
export type MatchStatus = "upcoming" | "live" | "finished";

// Helper type for MatchCard component
export interface MatchCardPrediction {
  home: number;
  away: number;
  points?: number;
  pointsBreakdown?: string;
}
