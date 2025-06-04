import type { User } from '@auth/sveltekit';
import { writable } from 'svelte/store';

type UserStore = {
  loggedIn: boolean;
  user: User | undefined;
};

export const userStore = writable<UserStore>({ loggedIn: false, user: undefined });
