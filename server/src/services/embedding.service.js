export class EmbeddingService {
  async embedText(text) {
    throw new Error("EmbeddingService.embedText must be implemented.");
  }

  async similarity(leftText, rightText) {
    const leftEmbedding = await this.embedText(leftText);
    const rightEmbedding = await this.embedText(rightText);

    const dotProduct = leftEmbedding.reduce((sum, value, index) => sum + value * (rightEmbedding[index] || 0), 0);
    const leftNorm = Math.sqrt(leftEmbedding.reduce((sum, value) => sum + value * value, 0));
    const rightNorm = Math.sqrt(rightEmbedding.reduce((sum, value) => sum + value * value, 0));

    if (!leftNorm || !rightNorm) return 0;
    return Math.max(0, Math.min(1, dotProduct / (leftNorm * rightNorm)));
  }
}

export class MockEmbeddingService extends EmbeddingService {
  async embedText(text) {
    const normalized = (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

    const tokens = normalized ? normalized.split(/\s+/) : [];
    const vector = Array.from({ length: 16 }, () => 0);

    tokens.forEach((token, index) => {
      const bucket = this._hash(token) % vector.length;
      vector[bucket] += 1 + (index % 5);
    });

    return vector;
  }

  _hash(text) {
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

export default MockEmbeddingService;
