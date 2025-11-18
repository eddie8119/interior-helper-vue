import { Request, Response } from 'express';

import { supabase } from '@/lib/supabase';
import { LoginSchema } from '@/schemas/loginSchema';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginSchema;

    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !sessionData.session || !sessionData.user) {
      return res.status(401).json({
        success: false,
        message: signInError?.message || 'Invalid email or password',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.user_metadata?.name,
          createdAt: sessionData.user.created_at,
        },
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed (unexpected error)',
      detail: error,
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error || !data.session) {
      return res.status(401).json({
        success: false,
        message: error?.message || 'Invalid refresh token',
      });
    }

    res.json({
      success: true,
      data: {
        access_token: data.session.access_token,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
    });
  }
};

// ==================== SSO 登入 ====================
export const ssoLogin = async (req: Request, res: Response) => {
  try {
    const { provider } = req.params as { provider: 'google' | 'facebook' | 'apple' };

    if (!['google', 'facebook', 'apple'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SSO provider',
      });
    }

    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/sso/callback?provider=${provider}`;

    // 生成 OAuth 授權 URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'facebook' | 'apple',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      console.error('SSO login error:', error);
      return res.status(500).json({
        success: false,
        message: error?.message || 'Failed to generate SSO login URL',
      });
    }

    res.json({
      success: true,
      data: {
        url: data.url,
      },
      message: 'SSO login URL generated successfully',
    });
  } catch (error) {
    console.error('SSO login error:', error);
    res.status(500).json({
      success: false,
      message: 'SSO login failed',
    });
  }
};

export const ssoCallback = async (req: Request, res: Response) => {
  try {
    const { provider } = req.params as { provider: 'google' | 'facebook' | 'apple' };
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      });
    }

    if (!['google', 'facebook', 'apple'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SSO provider',
      });
    }

    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !sessionData.session || !sessionData.user) {
      console.error('SSO callback error:', exchangeError);
      return res.status(401).json({
        success: false,
        message: exchangeError?.message || 'SSO authentication failed',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.user_metadata?.name || sessionData.user.user_metadata?.full_name,
          avatar: sessionData.user.user_metadata?.avatar_url,
          provider: sessionData.user.app_metadata?.provider,
          createdAt: sessionData.user.created_at,
        },
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      },
      message: 'SSO login successful',
    });
  } catch (error) {
    console.error('SSO callback error:', error);
    res.status(500).json({
      success: false,
      message: 'SSO authentication failed',
    });
  }
};
