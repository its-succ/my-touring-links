/** @type {import('./$types').LayoutLoad} */

import { browser } from '$app/environment';
import { auth, initializeFirebase } from '$lib/config/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

export const prerender = true;

export async function load({ url }) {
  if (browser) {
    try {
      initializeFirebase();
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.error(ex);
    }
  }

  function getAuthUser(): Promise<User | false> {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => resolve(user ? user : false));
    });
  }

  return {
    getAuthUser,
    url: url.pathname
  };
}
