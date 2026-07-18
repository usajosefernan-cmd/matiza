import { jaccardSimilarity, normalizeText } from './text-utils.js';

export function clusterItems(items, threshold = 0.32) {
  const clusters = [];
  for (const item of items || []) {
    const text = `${item.detected_claim || ''} ${item.text || ''}`.trim();
    let best = null;
    let bestScore = 0;
    for (const cluster of clusters) {
      const score = jaccardSimilarity(text, cluster.centroid_text);
      if (score > bestScore) {
        best = cluster;
        bestScore = score;
      }
    }
    if (best && bestScore >= threshold) {
      best.items.push(item);
      best.centroid_text = `${best.centroid_text} ${text}`.slice(0, 5000);
      best.max_virality = Math.max(best.max_virality, Number(item.virality_score || 0));
      best.max_risk = Math.max(best.max_risk, Number(item.risk_score || 0));
    } else {
      clusters.push({
        id: `cluster-${clusters.length + 1}`,
        centroid_text: normalizeText(text).slice(0, 2000),
        items: [item],
        max_virality: Number(item.virality_score || 0),
        max_risk: Number(item.risk_score || 0)
      });
    }
  }
  return clusters.sort((a, b) => (b.items.length + b.max_virality + b.max_risk) - (a.items.length + a.max_virality + a.max_risk));
}
