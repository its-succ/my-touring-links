import { type Spot, type Location, placeShape, spotShape } from './place';
import z from 'zod';
import type { ZodShape } from './zod-shape';

type ArrivalTime = {
  arrivalTime: number;
};

type SharedPlace = (Spot & ArrivalTime) | (Location & ArrivalTime);

const sharedSpotShape: ZodShape<Spot & ArrivalTime> = {
  ...spotShape,
  arrivalTime: z.number()
};

const sharedPlaceShape: ZodShape<Location & ArrivalTime> = {
  ...placeShape,
  arrivalTime: z.number()
};

/**
 * 共有場所スキーマ
 */
export const sharedPlaceSchema = z.union([z.object(sharedSpotShape), z.object(sharedPlaceShape)]);

export type SharedTouringJSON = { [index: string]: SharedPlace[] };
export const sharedTouringJsonSchema = z.record(z.array(sharedPlaceSchema));
