import { describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';
import type { RequestEvent, HttpError } from '@sveltejs/kit';
import { POST } from './+server';
import { zocker } from 'zocker';
import { userSchema } from '$lib/models/user';

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
});
