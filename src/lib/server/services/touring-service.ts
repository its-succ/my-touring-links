import type { TouringEntity } from '$lib/models/entity';
import type { User } from '@auth/sveltekit';
import { store } from '$lib/server/models/touring';

export const save = async (user: User, entity: TouringEntity): Promise<TouringEntity> => {
  return store(user, entity);
};
