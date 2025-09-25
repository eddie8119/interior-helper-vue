import camelcaseKeys from 'camelcase-keys';
import { Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { supabase } from '@/lib/supabase';

// Create a new draft
export const createDraft = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { tasks } = snakecaseKeys(req.body, { deep: true });

    // Check if a draft already exists for this user
    const { data: existingDraft, error: fetchError } = await supabase
      .from('Draft')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking for existing draft:', fetchError);
      return res.status(500).json({ success: false, message: 'Error checking for existing draft' });
    }

    if (existingDraft) {
      return res.status(409).json({ success: false, message: 'Draft already exists for this user.' });
    }

    // Create a new draft
    const { data: newDraft, error: createError } = await supabase
      .from('Draft')
      .insert({ user_id: userId, tasks: tasks || [] })
      .select()
      .single();

    if (createError) {
      console.error('Error creating draft:', createError);
      return res.status(500).json({ success: false, message: 'Failed to create draft' });
    }

    const { user_id, ...rest } = newDraft;

    return res.status(201).json({
      success: true,
      data: camelcaseKeys(rest, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error in createDraft:', error);
    return res.status(500).json({ success: false, message: error.message || 'An unexpected error occurred' });
  }
};

// Get a single draft by ID
export const getDraft = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { data, error } = await supabase.from('Draft').select('*').eq('user_id', userId);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Draft not found' });
      }
      console.error('Error fetching draft:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch draft' });
    }

    if (data && data.length > 0) {
      const { user_id, ...rest } = data[0];
      return res.status(200).json({
        success: true,
        data: camelcaseKeys(rest),
      });
    }
    return res.status(200).json({ success: true, data: camelcaseKeys(data, { deep: true }) });
  } catch (error: any) {
    console.error('Unexpected error in getDraft:', error);
    return res.status(500).json({ success: false, message: error.message || 'An unexpected error occurred' });
  }
};

// Update a draft
export const updateDraft = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tasks } = snakecaseKeys(req.body, { deep: true });

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ success: false, message: 'tasks must be an array.' });
    }

    const { data: updatedDraft, error } = await supabase
      .from('Draft')
      .update({
        tasks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Draft not found' });
      }
      console.error('Error updating draft:', error);
      return res.status(500).json({ success: false, message: 'Failed to update draft' });
    }

    const { user_id, ...rest } = updatedDraft;

    return res.status(200).json({
      success: true,
      message: 'Draft updated successfully',
      data: camelcaseKeys(rest, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error updating draft:', error);
    return res.status(500).json({ success: false, message: error.message || 'An unexpected error occurred' });
  }
};

// Delete a draft
export const deleteDraft = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('Draft').delete().eq('id', id);

    if (error) {
      console.error('Error deleting draft:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete draft' });
    }

    return res.status(200).json({ success: true, message: 'Draft deleted successfully' });
  } catch (error: any) {
    console.error('Unexpected error deleting draft:', error);
    return res.status(500).json({ success: false, message: error.message || 'An unexpected error occurred' });
  }
};
