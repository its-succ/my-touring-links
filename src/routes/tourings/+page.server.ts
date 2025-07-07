import { getRequestEvent } from '$app/server';
import { all } from '$lib/server/services/touring-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const { locals } = getRequestEvent();
  const session = await locals.auth();
  const user = session?.user;
  const loggedIn = !!user;
  const tourings = loggedIn ? await all(user) : [];
  return {
    tourings
  };
};
