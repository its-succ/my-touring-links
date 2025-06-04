import { writable } from 'svelte/store';

type UserStore = {
  loggedIn: boolean;
  // TODO: ユーザー型はいったんobjectにする
  user: object | false;
};

export const userStore = writable<UserStore>({ loggedIn: false, user: false });
