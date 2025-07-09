import { getRequestEvent } from '$app/server';
import type { PageServerLoad } from './$types';
import { status } from 'http-status';
import { error } from '@sveltejs/kit';
import { get } from '$lib/server/services/touring-service';

export const load: PageServerLoad = async ({ params }) => {
  if (params.id === 'new') return;

  const { locals } = getRequestEvent();
  const session = await locals.auth();
  const user = session?.user;
  const loggedIn = !!user;
  if (!loggedIn) {
    error(status.UNAUTHORIZED, { message: 'Unauthorized' });
  }
  const touring = await get(user, params.id);
  if (touring === undefined) {
    error(status.NOT_FOUND, { message: 'Not found' });
  }
  return {
    touring
  };
};
