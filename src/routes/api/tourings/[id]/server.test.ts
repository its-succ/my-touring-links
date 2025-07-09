import { describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';
import type { RequestEvent, HttpError } from '@sveltejs/kit';
import { DELETE, PUT } from './+server';
import { zocker } from 'zocker';
import { userSchema } from '$lib/models/user';
import { touringSchema } from '$lib/models/entity';
import { placeSchema } from '$lib/models/place';
import { DateTime } from 'luxon';
import { save, del } from '$lib/server/services/touring-service';

vi.mock('$lib/server/services/touring-service');

describe('PUT', () => {
  it('更新するユーザーが取得できないときは401エラーが戻ること', async () => {
    // arrange
    const locals: App.Locals = {
      auth: vi.fn().mockResolvedValue(null),
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    };
    const id = faker.string.uuid();
    const request = { json: vi.fn() } as unknown as Request;
    const expects: HttpError = {
      status: 401,
      body: { message: 'Error: 401' }
    };
    // action
    expect(() =>
      PUT({ locals, request, params: { id } } as unknown as RequestEvent)
    ).rejects.toThrowError(expect.objectContaining(expects));
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
    const id = faker.string.uuid();
    vi.mocked(request.json).mockResolvedValue({ id });
    const expects: HttpError = {
      status: 400,
      body: { message: 'Error: 400' }
    };
    // action
    expect(() =>
      PUT({ locals, request, params: { id } } as unknown as RequestEvent)
    ).rejects.toThrowError(expect.objectContaining(expects));
  });
  it('保存対象のツーリングIDとURLのIDが一致しないときは400エラーが戻ること', async () => {
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
        [DateTime.now().toJSDate().getTime()]: zocker(placeSchema).generateMany(2)
      }))
      .generate();
    const request = { json: vi.fn() } as unknown as Request;
    vi.mocked(request.json).mockResolvedValue(touring);
    vi.mocked(save).mockRejectedValue(Error('呼ばれるはずのないモック'));
    const expects: HttpError = {
      status: 400,
      body: { message: 'Error: 400' }
    };
    // action
    expect(() =>
      PUT({ locals, request, params: { id: faker.string.uuid() } } as unknown as RequestEvent)
    ).rejects.toThrowError(expect.objectContaining(expects));
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
        [DateTime.now().toJSDate().getTime()]: zocker(placeSchema).generateMany(2)
      }))
      .generate();
    const request = { json: vi.fn() } as unknown as Request;
    vi.mocked(request.json).mockResolvedValue(touring);
    vi.mocked(save).mockResolvedValue(touring);
    // action
    const response = await PUT({
      locals,
      request,
      params: { id: touring.id }
    } as unknown as RequestEvent);
    // assertion
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: touring.id });
  });
});

describe('DELETE', () => {
  it('削除するユーザーが取得できないときは401エラーが戻ること', async () => {
    // arrange
    const locals: App.Locals = {
      auth: vi.fn().mockResolvedValue(null),
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    };
    const id = faker.string.uuid();
    const expects: HttpError = {
      status: 401,
      body: { message: 'Error: 401' }
    };
    // action
    expect(() =>
      DELETE({ locals, params: { id } } as unknown as RequestEvent)
    ).rejects.toThrowError(expect.objectContaining(expects));
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
    const expects: HttpError = {
      status: 400,
      body: { message: 'Error: 400' }
    };
    // action
    expect(() => DELETE({ locals, params: {} } as unknown as RequestEvent)).rejects.toThrowError(
      expect.objectContaining(expects)
    );
  });
  it('リクエストに問題ないときは削除を呼び出して削除したidを戻すこと', async () => {
    // arrange
    const user = zocker(userSchema).generate();
    const locals: App.Locals = {
      auth: vi.fn().mockResolvedValue({ user, expires: faker.date.future().toISOString() }),
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    };
    vi.mocked(del).mockResolvedValue();
    const id = faker.string.uuid();
    // action
    const response = await DELETE({
      locals,
      params: { id }
    } as unknown as RequestEvent);
    // assertion
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id });
  });
});
