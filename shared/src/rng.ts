/**
 * Seeded random number generator — Mulberry32
 * Fast, deterministic, good enough for name generation.
 */

export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Advance state and return next 32-bit integer */
  next(): number {
    let z = (this.state += 0x6d2b79f5);
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    this.state = z;
    return (z ^ (z >>> 14)) >>> 0;
  }

  /** Float in [0, 1) */
  float(): number {
    return this.next() / 4294967296;
  }

  /** Integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return min + Math.floor(this.float() * (max - min + 1));
  }

  /** Weighted random selection from an array of items with weights */
  weighted<T>(items: Array<{ item: T; weight: number }>): T {
    const total = items.reduce((sum, i) => sum + i.weight, 0);
    let roll = this.float() * total;
    for (const { item, weight } of items) {
      roll -= weight;
      if (roll <= 0) return item;
    }
    return items[items.length - 1].item;
  }

  /** Pick a random element from an array */
  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }

  /** Shuffle array in-place (Fisher-Yates) */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
