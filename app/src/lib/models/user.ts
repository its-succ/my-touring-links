import type { UserInfo } from 'firebase/auth';
import { writable } from 'svelte/store';

type UserStore = {
  loggedIn: boolean;
  user: UserInfo | false;
};

export const userStore = writable<UserStore>({ loggedIn: false, user: false });
