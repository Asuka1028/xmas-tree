import { Vector3 } from 'three';

export type TreeState = 'FORMED' | 'CHAOS'; // Kept for compatibility if needed, but App will use numbers mostly.

export interface ParticleData {
  chaosPos: Vector3;
  targetPos: Vector3;
  color: string;
  size: number;
  speed: number;
}

export interface PhotoData {
  id: string;
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface DragState {
  isDragging: boolean;
  startX: number;
  velocity: number;
}