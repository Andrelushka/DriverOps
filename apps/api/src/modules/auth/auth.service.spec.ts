import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth.service.js';
import { UnauthorizedException } from '@nestjs/common';
import { ServiceUnavailableException } from '@nestjs/common';

const { getClaimsMock } = vi.hoisted(() => ({
  getClaimsMock: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getClaims: getClaimsMock,
    },
  })),
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.stubEnv('SUPABASE_URL', 'https://driverops-test.supabase.co');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key');
    getClaimsMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the user ID from verified access token claims', async () => {
    getClaimsMock.mockResolvedValue({
      data: {
        claims: {
          sub: 'user-123',
          iss: 'https://driverops-test.supabase.co/auth/v1',
          aud: 'authenticated',
          role: 'authenticated',
        },
      },
      error: null,
    });

    const service = new AuthService();

    await expect(
      service.verifyAccessToken('valid-test-token'),
    ).resolves.toEqual({ id: 'user-123' });

    expect(getClaimsMock).toHaveBeenCalledWith('valid-test-token');
    expect(getClaimsMock).toHaveBeenCalledTimes(1);
  });

  it('rejects tokens that Supabase cannot verify', async () => {
    getClaimsMock.mockResolvedValue({
      data: null,
      error: new Error('Invalid JWT'),
    });

    const service = new AuthService();

    await expect(
      service.verifyAccessToken('invalid-test-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(getClaimsMock).toHaveBeenCalledWith('invalid-test-token');
  });

  it.each([
    {
      name: 'issuer',
      overrides: { iss: 'https://other-project.supabase.co/auth/v1' },
    },
    {
      name: 'audience',
      overrides: { aud: 'anonymous' },
    },
    {
      name: 'role',
      overrides: { role: 'anon' },
    },
    {
      name: 'subject',
      overrides: { sub: '' },
    },
  ])('rejects tokens with an invalid $name', async ({ overrides }) => {
    const claims = {
      sub: 'user-123',
      iss: 'https://driverops-test.supabase.co/auth/v1',
      aud: 'authenticated',
      role: 'authenticated',
      ...overrides,
    };

    getClaimsMock.mockResolvedValue({
      data: { claims },
      error: null,
    });

    const service = new AuthService();

    await expect(
      service.verifyAccessToken('test-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it.each(['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY'])(
    'rejects missing %s configuration',
    (variable) => {
      vi.stubEnv(variable, '');

      expect(() => new AuthService()).toThrow(
        'Supabase authentication configuration is missing.',
      );
    },
  );

  it('rejects access when token verification unexpectedly fails', async () => {
    getClaimsMock.mockRejectedValue(
      new Error('Authentication provider unavailable'),
    );

    const service = new AuthService();

    await expect(
      service.verifyAccessToken('test-token'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('reports a temporary authentication service failure', async () => {
    getClaimsMock.mockResolvedValue({
      data: null,
      error: {
        name: 'AuthRetryableFetchError',
        message: 'Authentication service unavailable',
        status: 503,
      },
    });

    const service = new AuthService();

    await expect(
      service.verifyAccessToken('test-token'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
