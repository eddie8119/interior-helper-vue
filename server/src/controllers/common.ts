import camelcaseKeys from 'camelcase-keys';
import { Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { supabase } from '@/lib/supabase';

export const getCommon = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { data, error } = await supabase.from('Common').select('*').eq('user_id', userId);

    if (error) {
      console.error('Error fetching commons:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Failed to fetch common items', error: error.message });
    }

    if (data && data.length > 0) {
      const { user_id, ...rest } = data[0];
      return res.status(200).json({
        success: true,
        data: camelcaseKeys(rest),
      });
    }
  } catch (error) {
    console.error('Server error fetching commons:', error);
    return res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};

export const createCommon = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { construction, unit, project_type } = req.body;

  if (!construction && !unit && !project_type) {
    return res.status(400).json({
      success: false,
      message: 'Either construction or unit or project_type must be provided.',
    });
  }

  try {
    const { data, error } = await supabase
      .from('Common')
      .insert([snakecaseKeys({ userId, construction, unit, project_type })])
      .select()
      .single();

    if (error) {
      console.error('Error creating common item:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Failed to create common item', error: error.message });
    }

    if (data && data.length > 0) {
      const { user_id, ...rest } = data[0];
      return res.status(201).json({
        success: true,
        data: camelcaseKeys(rest),
      });
    }
  } catch (error) {
    console.error('Server error creating common item:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};

export const updateCommon = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { construction, unit, project_type } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!construction && !unit && !project_type) {
    return res.status(400).json({
      success: false,
      message: 'Either construction or unit or project_type must be provided.',
    });
  }

  try {
    const { data, error } = await supabase
      .from('Common')
      .update(snakecaseKeys({ construction, unit, project_type }))
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating common item:', error);
      return res.status(404).json({
        success: false,
        message: 'Common item not found or failed to update',
        error: error.message,
      });
    }

    if (data && data.length > 0) {
      const { user_id, ...rest } = data[0];
      return res.status(200).json({
        success: true,
        data: camelcaseKeys(rest),
      });
    }
  } catch (error) {
    console.error('Server error updating common item:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};

export const deleteCommon = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { error } = await supabase.from('Common').delete().eq('id', id).eq('user_id', userId);

    if (error) {
      console.error('Error deleting common item:', error);
      return res.status(404).json({
        success: false,
        message: 'Common item not found or failed to delete',
        error: error.message,
      });
    }

    res.status(204).send(); // No content
  } catch (error) {
    console.error('Server error deleting common item:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};
