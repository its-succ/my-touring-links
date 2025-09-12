import type { SharedTouringEntity, TouringEntity } from '$lib/models/entity';
import type { ArrivalTimeJSON } from '$lib/models/touring';
import type { User } from '@auth/sveltekit';
import { findById, store } from '$lib/server/models/shared';

export const save = async (
  user: User,
  touring: TouringEntity,
  arrivalTime: ArrivalTimeJSON
): Promise<SharedTouringEntity> => {
  return store(user, touring, arrivalTime);
};

export const get = async (id: string): Promise<SharedTouringEntity | undefined> => {
  return findById(id);
};
