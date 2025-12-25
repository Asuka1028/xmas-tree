import { Vector3, MathUtils } from 'three';
import { TREE_HEIGHT, TREE_RADIUS } from './constants';

// Helper to generate a random point on a cone surface (the tree)
export const getConePoint = (height: number, radius: number): Vector3 => {
  const y = MathUtils.randFloat(-height / 2, height / 2);
  const r = radius * (1 - (y + height / 2) / height); // Radius decreases as Y increases
  const theta = MathUtils.randFloat(0, Math.PI * 2);
  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta);
  return new Vector3(x, y, z);
};

// Helper to generate a random point in a sphere (chaos)
export const getSpherePoint = (radius: number): Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};
