import type { PageServerLoad } from './$types';
import { status } from 'http-status';
import { error } from '@sveltejs/kit';
import { get } from '$lib/server/services/shared-service';

export const load: PageServerLoad = async ({ params }) => {
  const touring = await get(params.id);
  if (touring === undefined) {
    error(status.NOT_FOUND, { message: 'Not found' });
  }
  return {
    touring
  };
};
