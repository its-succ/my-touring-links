import { touringSchema } from '$lib/models/entity';
import { save } from '$lib/server/services/touring-service';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { status } from 'http-status';

/**
 * save new touring
 */
export const POST: RequestHandler = async ({ locals, request }) => {
  const session = await locals.auth();
  const user = session?.user;
  if (!user) return error(status.UNAUTHORIZED);

  const requestBoby = await request.json();
  const validate = touringSchema.safeParse(requestBoby);
  if (!validate.success) return error(status.BAD_REQUEST);

  const results = await save(user, requestBoby);
  return json({ id: results.id });
};
