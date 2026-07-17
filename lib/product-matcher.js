export function normalizeText(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/[_\s]+/g, " ")
    .trim();
}

export function tokenize(str) {
  return normalizeText(str)
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function jaccardSimilarity(a, b) {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = new Set([...setA, ...setB]);

  return intersection / union.size;
}

function weightedSimilarity(a, b) {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const common = tokensA.filter((t) => tokensB.includes(t));
  const maxLen = Math.max(tokensA.length, tokensB.length);
  const minLen = Math.min(tokensA.length, tokensB.length);

  const overlapScore = common.length / maxLen;
  const lengthRatio = minLen / maxLen;
  const jaccard = jaccardSimilarity(a, b);

  return overlapScore * 0.5 + jaccard * 0.3 + lengthRatio * 0.2;
}

export function similarityScore(a, b) {
  return weightedSimilarity(a, b);
}

export function findBestMatch(productName, candidates, threshold) {
  if (!candidates || candidates.length === 0) return null;

  let best = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    if (!candidate.title) continue;
    const score = similarityScore(productName, candidate.title);
    if (score > bestScore) {
      bestScore = score;
      best = { ...candidate, score };
    }
  }

  if (best && best.score >= threshold) {
    return best;
  }

  return null;
}

export function isProductMatch(productName, candidateTitle, threshold) {
  const score = similarityScore(productName, candidateTitle);
  return { match: score >= threshold, score };
}
