import type { TUser } from '@/types';

export function prepareRequestOptions({
  uuid,
  password,
}: Pick<TUser, 'uuid' | 'password'>): RequestInit {
  return {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${uuid}.${password}`,
    },
  };
}
