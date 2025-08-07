import { arrivalTimeJsonSchema } from '$lib/models/touring';
import { save } from '$lib/server/services/shared-service';
import { get } from '$lib/server/services/touring-service';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { status } from 'http-status';

/**
 * share calced touring
 */
export const PUT: RequestHandler = async ({ locals, request, params }) => {
  const session = await locals.auth();
  const user = session?.user;
  if (!user) return error(status.UNAUTHORIZED);

  const requestBoby = await request.json();
  const validate = arrivalTimeJsonSchema.safeParse(requestBoby);
  if (!validate.success || params.id === undefined) return error(status.BAD_REQUEST);
  const touring = await get(user, params.id);
  if (touring === undefined) error(status.NOT_FOUND, { message: 'Not found' });

  const results = await save(user, touring, requestBoby);
  return json({ id: results.id });
};
