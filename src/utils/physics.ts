// === FILE: src/utils/physics.ts ===
export interface Position {
  x: number;
  y: number;
}

export const distance = (a: Position, b: Position): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const circleCollision = (
  a: Position,
  b: Position,
  radiusA: number,
  radiusB: number
): boolean => {
  const dist = distance(a, b);
  return dist < radiusA + radiusB;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const randomRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};
