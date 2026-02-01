/**
 * Points Badge Helpers
 * 
 * Centralized logic for displaying point badges across the app.
 * Used in MatchCard and Predictions page.
 */

/**
 * Get the color classes for a points badge based on the points value
 */
export const getPointsColor = (points?: number): string => {
  if (!points && points !== 0) return "bg-muted text-muted-foreground";
  
  // 5 points = Perfect prediction (Exact result)
  if (points === 5) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  
  // 3-4 points = Winner + goal difference or winner only
  if (points >= 3) return "bg-green-500/10 text-green-600 border-green-500/20";
  
  // 1-2 points = Partial (one score correct)
  if (points > 0) return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  
  // 0 points = No match
  return "bg-muted text-muted-foreground";
};

/**
 * Get human-readable label for point breakdown
 */
export const getPointsLabel = (breakdown?: string): string => {
  const labels: Record<string, string> = {
    exact_result: "¡Exacto!",
    winner_and_goal_diff: "Ganador+Diff",
    winner_only: "Ganador",
    one_score_correct: "Parcial",
    no_match: "Sin puntos",
  };
  
  return breakdown ? labels[breakdown] || "" : "";
};

/**
 * Get formatted points display with + prefix
 */
export const getPointsDisplay = (points?: number): string => {
  if (!points && points !== 0) return "-";
  return points === 0 ? "0" : `+${points}`;
};
