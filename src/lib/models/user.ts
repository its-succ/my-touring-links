import type { User } from '@auth/sveltekit';
import { writable } from 'svelte/store';
import z from 'zod';
import type { ZodShape } from './zod-shape';

type UserStore = {
  loggedIn: boolean;
  user: User | undefined;
};

export const userStore = writable<UserStore>({ loggedIn: false, user: undefined });

const userShape: ZodShape<Required<User>> = {
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().url()
};

export const userSchema = z.object(userShape);
