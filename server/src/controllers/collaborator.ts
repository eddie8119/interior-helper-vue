import camelcaseKeys from 'camelcase-keys';
import { Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { supabase } from '@/lib/supabase';

// ==================== Project Collaborators ====================

// Get all collaborators for a specific project (includes global collaborators)
export const getProjectCollaborators = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const projectId = req.params.projectId;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission',
      });
    }

    // Get project-specific collaborators
    const { data: projectCollaborators, error: projectError2 } = await supabase
      .from('ProjectCollaborators')
      .select('*')
      .eq('project_id', projectId);

    if (projectError2) {
      console.error('Error fetching project collaborators:', projectError2);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project collaborators',
        error: projectError2.message,
      });
    }

    // Get global collaborators
    const { data: globalCollaborators, error: globalError } = await supabase
      .from('GlobalCollaborators')
      .select('*')
      .eq('owner_id', userId);

    if (globalError) {
      console.error('Error fetching global collaborators:', globalError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch global collaborators',
        error: globalError.message,
      });
    }

    // Create a map of project collaborators by email for quick lookup
    const projectCollabMap = new Map(
      (projectCollaborators || []).map((pc: any) => [pc.collaborator_email, pc])
    );

    // Merge collaborators: project-specific override global
    const mergedCollaborators: any[] = [];

    // Add all project-specific collaborators
    (projectCollaborators || []).forEach((pc: any) => {
      mergedCollaborators.push({
        id: pc.id,
        project_id: pc.project_id,
        user_id: pc.user_id,
        collaborator_email: pc.collaborator_email,
        role: pc.role,
        is_global: false,
        global_role: null,
        created_at: pc.created_at,
        updated_at: pc.updated_at,
      });
    });

    // Add global collaborators (if not overridden by project-specific)
    (globalCollaborators || []).forEach((gc: any) => {
      const projectCollab = projectCollabMap.get(gc.collaborator_email);
      if (projectCollab) {
        // Update existing entry to include global role info
        const existing = mergedCollaborators.find(
          (c) => c.collaborator_email === gc.collaborator_email
        );
        if (existing) {
          existing.is_global = true;
          existing.global_role = gc.role;
        }
      } else {
        // Add as global collaborator
        mergedCollaborators.push({
          id: gc.id,
          project_id: projectId,
          user_id: userId,
          collaborator_email: gc.collaborator_email,
          role: gc.role,
          is_global: true,
          global_role: gc.role,
          created_at: gc.created_at,
          updated_at: gc.updated_at,
        });
      }
    });

    // Sort by created_at descending
    mergedCollaborators.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(mergedCollaborators, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching project collaborators:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// Add a collaborator to a specific project
export const addProjectCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const projectId = req.params.projectId;
    const snakeCaseData = snakecaseKeys(req.body, { deep: true });
    const { collaborator_email, role = 'viewer' } = snakeCaseData;

    if (!projectId || !collaborator_email) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and collaborator email are required',
      });
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission',
      });
    }

    // Check if collaborator already exists
    const { data: existingCollaborator } = await supabase
      .from('ProjectCollaborators')
      .select('id')
      .eq('project_id', projectId)
      .eq('collaborator_email', collaborator_email)
      .single();

    if (existingCollaborator) {
      return res.status(409).json({
        success: false,
        message: 'Collaborator already exists for this project',
      });
    }

    // Add the collaborator
    const { data: collaborator, error } = await supabase
      .from('ProjectCollaborators')
      .insert([
        {
          project_id: projectId,
          user_id: userId,
          collaborator_email,
          role,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding project collaborator:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add collaborator',
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Collaborator added successfully',
      data: camelcaseKeys(collaborator, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error adding project collaborator:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// Update a project collaborator's role
export const updateProjectCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId, collaboratorId } = req.params;
    const snakeCaseData = snakecaseKeys(req.body, { deep: true });
    const { role } = snakeCaseData;

    if (!projectId || !collaboratorId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, collaborator ID, and role are required',
      });
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission',
      });
    }

    // Update the collaborator
    const { data: collaborator, error } = await supabase
      .from('ProjectCollaborators')
      .update({ role })
      .eq('id', collaboratorId)
      .eq('project_id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project collaborator:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update collaborator',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Collaborator updated successfully',
      data: camelcaseKeys(collaborator, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error updating project collaborator:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// Remove a collaborator from a specific project
export const removeProjectCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId, collaboratorId } = req.params;

    if (!projectId || !collaboratorId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and collaborator ID are required',
      });
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission',
      });
    }

    // Remove the collaborator
    const { error } = await supabase
      .from('ProjectCollaborators')
      .delete()
      .eq('id', collaboratorId)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error removing project collaborator:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove collaborator',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Collaborator removed successfully',
    });
  } catch (error: any) {
    console.error('Unexpected error removing project collaborator:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// ==================== Global Collaborators ====================

// Get all global collaborators for the current user
export const getGlobalCollaborators = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get all global collaborators for this user
    const { data: collaborators, error } = await supabase
      .from('GlobalCollaborators')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching global collaborators:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch global collaborators',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(collaborators || [], { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching global collaborators:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// Add a global collaborator
export const addGlobalCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const snakeCaseData = snakecaseKeys(req.body, { deep: true });
    const { collaborator_email, role = 'viewer' } = snakeCaseData;

    if (!collaborator_email) {
      return res.status(400).json({
        success: false,
        message: 'Collaborator email is required',
      });
    }

    // Check if collaborator already exists
    const { data: existingCollaborator } = await supabase
      .from('GlobalCollaborators')
      .select('id')
      .eq('owner_id', userId)
      .eq('collaborator_email', collaborator_email)
      .single();

    if (existingCollaborator) {
      return res.status(409).json({
        success: false,
        message: 'Global collaborator already exists',
      });
    }

    // Add the global collaborator
    const { data: collaborator, error } = await supabase
      .from('GlobalCollaborators')
      .insert([
        {
          owner_id: userId,
          collaborator_email,
          role,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding global collaborator:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add global collaborator',
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Global collaborator added successfully',
      data: camelcaseKeys(collaborator, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error adding global collaborator:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// Update a global collaborator's role
export const updateGlobalCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { collaboratorId } = req.params;
    const snakeCaseData = snakecaseKeys(req.body, { deep: true });
    const { role } = snakeCaseData;

    if (!collaboratorId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Collaborator ID and role are required',
      });
    }

    // Update the global collaborator
    const { data: collaborator, error } = await supabase
      .from('GlobalCollaborators')
      .update({ role })
      .eq('id', collaboratorId)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating global collaborator:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update global collaborator',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Global collaborator updated successfully',
      data: camelcaseKeys(collaborator, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error updating global collaborator:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// Remove a global collaborator
export const removeGlobalCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { collaboratorId } = req.params;

    if (!collaboratorId) {
      return res.status(400).json({
        success: false,
        message: 'Collaborator ID is required',
      });
    }

    // Remove the global collaborator
    const { error } = await supabase
      .from('GlobalCollaborators')
      .delete()
      .eq('id', collaboratorId)
      .eq('owner_id', userId);

    if (error) {
      console.error('Error removing global collaborator:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove global collaborator',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Global collaborator removed successfully',
    });
  } catch (error: any) {
    console.error('Unexpected error removing global collaborator:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// ==================== Helper Functions ====================

// Check if a user has access to a project (either as owner, project collaborator, or global collaborator)
// Project-specific permissions override global permissions
export const checkProjectAccess = async (
  projectId: string,
  userEmail: string
): Promise<{ hasAccess: boolean; role?: string; isOwner: boolean }> => {
  try {
    // Check if user is the owner
    const { data: project } = await supabase
      .from('Projects')
      .select('user_id, Users!inner(email)')
      .eq('id', projectId)
      .single();

    if (project && (project as any).Users?.email === userEmail) {
      return { hasAccess: true, role: 'owner', isOwner: true };
    }

    // Check if user is a project-specific collaborator (priority over global)
    const { data: projectCollaborator } = await supabase
      .from('ProjectCollaborators')
      .select('role')
      .eq('project_id', projectId)
      .eq('collaborator_email', userEmail)
      .single();

    if (projectCollaborator) {
      // Project-specific role takes precedence
      return { hasAccess: true, role: projectCollaborator.role, isOwner: false };
    }

    // Check if user is a global collaborator (fallback if no project-specific role)
    if (project) {
      const { data: globalCollaborator } = await supabase
        .from('GlobalCollaborators')
        .select('role')
        .eq('owner_id', (project as any).user_id)
        .eq('collaborator_email', userEmail)
        .single();

      if (globalCollaborator) {
        // Use global role if no project-specific override exists
        return { hasAccess: true, role: globalCollaborator.role, isOwner: false };
      }
    }

    return { hasAccess: false, isOwner: false };
  } catch (error) {
    console.error('Error checking project access:', error);
    return { hasAccess: false, isOwner: false };
  }
};
