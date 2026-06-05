export function calculateBuyPriority({ priority, createdAt, dealScore }) {
  const priorityWeights = { high: 40, medium: 25, low: 10 };
  const daysOnList = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const ageScore = Math.min(30, daysOnList * 2);
  const dealScoreContribution =
    dealScore !== null && dealScore !== undefined ? dealScore * 0.3 : 0;
  const raw = priorityWeights[priority] + ageScore + dealScoreContribution;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

export function getPriorityLabel(score) {
  if (score >= 70) return "High Priority";
  if (score >= 45) return "Medium Priority";
  return "Low Priority";
}

export function getPriorityTier(score) {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}
