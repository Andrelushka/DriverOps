import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface AuthenticatedUser {
  id: string;
}

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;
  private readonly issuer: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      throw new Error('Supabase authentication configuration is missing.');
    }

    this.issuer = `${url.replace(/\/+$/, '')}/auth/v1`;

    this.supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    let result: Awaited<ReturnType<SupabaseClient['auth']['getClaims']>>;

    try {
      result = await this.supabase.auth.getClaims(token);
    } catch {
      throw new ServiceUnavailableException(
        'Authentication service temporarily unavailable',
      );
    }

    const { data, error } = result;

    if (error?.name === 'AuthRetryableFetchError') {
      throw new ServiceUnavailableException(
        'Authentication service temporarily unavailable',
      );
    }

    if (error || !data?.claims) {
      throw new UnauthorizedException('Invalid access token');
    }

    const claims = data.claims;

    if (
      claims.iss !== this.issuer ||
      claims.aud !== 'authenticated' ||
      claims.role !== 'authenticated' ||
      !claims.sub
    ) {
      throw new UnauthorizedException('Invalid access token');
    }

    return { id: claims.sub };
  }
}
