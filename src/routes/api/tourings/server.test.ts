import { describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';
import type { RequestEvent, HttpError } from '@sveltejs/kit';
import { GET, POST } from './+server';
import { zocker } from 'zocker';
import { userSchema } from '$lib/models/user';
import { touringSchema } from '$lib/models/entity';
import { DateTime } from 'luxon';
import { all, save } from '$lib/server/services/touring-service';
import removeUndefinedObjects from 'remove-undefined-objects';

vi.mock('$lib/server/services/touring-service');

describe('POST', () => {
  it('登録するユーザーが取得できないときは401エラーが戻ること', async () => {
    // arrange
    const locals: App.Locals = {
      auth: vi.fn().mockResolvedValue(null),
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    };
    const request = { json: vi.fn() } as unknown as Request;
    const expects: HttpError = {
      status: 401,
      body: { message: 'Error: 401' }
    };
    // action
    expect(() => POST({ locals, request } as unknown as RequestEvent)).rejects.toThrowError(
      expect.objectContaining(expects)
    );
  });
  it('バリデーションエラーがあるときは400エラーが戻ること', async () => {
    // arrange
    const user = zocker(userSchema).generate();
    const locals: App.Locals = {
      auth: vi.fn().mockResolvedValue({ user, expires: faker.date.future().toISOString() }),
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    };
    const request = { json: vi.fn() } as unknown as Request;
    vi.mocked(request.json).mockResolvedValue({ id: faker.string.uuid() });
    const expects: HttpError = {
      status: 400,
      body: { message: 'Error: 400' }
    };
    // action
    expect(() => POST({ locals, request } as unknown as RequestEvent)).rejects.toThrowError(
      expect.objectContaining(expects)
    );
  });
  it('リクエストに問題ないときは保存を呼び出して保存したidを戻すこと', async () => {
    // arrange
    const user = zocker(userSchema).generate();
    const locals: App.Locals = {
      auth: vi.fn().mockResolvedValue({ user, expires: faker.date.future().toISOString() }),
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    };
    const touring = zocker(touringSchema)
      .supply(touringSchema.shape.touring, () => ({
        [DateTime.now().toJSDate().getTime()]: faker.lorem.slug()
      }))
      .generate();
    const request = { json: vi.fn() } as unknown as Request;
    vi.mocked(request.json).mockResolvedValue(touring);
    const id = faker.string.uuid();
    vi.mocked(save).mockResolvedValue({ ...touring, id });
    // action
    const response = await POST({ locals, request } as unknown as RequestEvent);
    // assertion
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id });
  });
});

describe('GET', () => {
  it('取得するユーザーが取得できないときは401エラーが戻ること', async () => {
    // arrange
    const locals: App.Locals = {
      auth: vi.fn().mockResolvedValue(null),
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    };
    const expects: HttpError = {
      status: 401,
      body: { message: 'Error: 401' }
    };
    // action
    expect(() => GET({ locals } as unknown as RequestEvent)).rejects.toThrowError(
      expect.objectContaining(expects)
    );
  });
  it('登録ユーザーの場合は登録されているツーリングの一覧を戻すこと', async () => {
    // arrange
    const user = zocker(userSchema).generate();
    const tourings = zocker(touringSchema)
      .supply(touringSchema.shape.touring, () => ({
        [DateTime.now().toJSDate().getTime()]: faker.lorem.slug()
      }))
      .generateMany(4);
    const locals: App.Locals = {
      auth: vi.fn().mockResolvedValue({ user, expires: faker.date.future().toISOString() }),
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    };
    vi.mocked(all).mockResolvedValue(tourings);
    // action
    const response = await GET({ locals } as unknown as RequestEvent);
    // assertion
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(tourings.map((t) => removeUndefinedObjects(t)));
  });
});
