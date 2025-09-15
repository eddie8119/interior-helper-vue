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
