import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { expect } from 'vitest';

export async function expectFirestorePermissionDenied<T>(promise: Promise<T>) {
  const errorResult = await assertFails(promise);
  expect(errorResult.code).toBe('permission-denied' || 'PERMISSION_DENIED');
}

export async function expectFirestorePermissionUpdateSucceeds<T>(promise: Promise<T>) {
  return await assertSucceeds(promise);
}

export async function expectPermissionGetSucceeds<T>(promise: Promise<T>) {
  const result = await assertSucceeds(promise);
  expect(result).not.toBeUndefined();
  return result;
}
