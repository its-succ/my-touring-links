import type { TouringEntity } from '$lib/models/entity';
import type { User } from '@auth/sveltekit';
import { findAllByUser, findById, store } from '$lib/server/models/touring';

export const save = async (user: User, entity: TouringEntity): Promise<TouringEntity> => {
  return store(user, entity);
};

export const all = async (user: User): Promise<TouringEntity[]> => {
  return findAllByUser(user);
};

export const get = async (user: User, id: string): Promise<TouringEntity | undefined> => {
  return findById(user, id);
};
