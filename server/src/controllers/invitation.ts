import camelcaseKeys from 'camelcase-keys';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { supabase } from '@/lib/supabase';
import { emailService } from '@/services/notification/email.service';

// ==================== Create Invitations ====================

/**
 * Create a project collaboration invitation
 */
export const createProjectInvitation = async (req: Request, res: Response) => {
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
      .select('id, title, user_id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission',
      });
    }

    // Check if user already has a pending invitation
    const { data: existingInvitation } = await supabase
      .from('CollaboratorInvitations')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('invitee_email', collaborator_email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return res.status(409).json({
        success: false,
        message: 'A pending invitation already exists for this email',
      });
    }

    // Check if user is already a collaborator
    const { data: existingCollaborator } = await supabase
      .from('ProjectCollaborators')
      .select('id')
      .eq('project_id', projectId)
      .eq('collaborator_email', collaborator_email)
      .single();

    if (existingCollaborator) {
      return res.status(409).json({
        success: false,
        message: 'User is already a collaborator on this project',
      });
    }

    // Generate invitation token
    const invitationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('CollaboratorInvitations')
      .insert([
        {
          invitation_type: 'project',
          project_id: projectId,
          inviter_id: userId,
          invitee_email: collaborator_email,
          role,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating project invitation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create invitation',
        error: error.message,
      });
    }

    // Get inviter name
    const { data: inviterData } = await supabase.auth.admin.getUserById(userId);
    const inviterName =
      inviterData?.user?.user_metadata?.name || inviterData?.user?.email || 'Someone';

    // Send invitation email
    await emailService.sendCollaboratorInvitation(
      collaborator_email,
      inviterName,
      'project',
      role,
      invitationToken,
      (project as any).title
    );

    return res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: camelcaseKeys(invitation, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error creating project invitation:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

/**
 * Create a global collaboration invitation
 */
export const createGlobalInvitation = async (req: Request, res: Response) => {
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

    // Check if user already has a pending invitation
    const { data: existingInvitation } = await supabase
      .from('CollaboratorInvitations')
      .select('id, status')
      .eq('invitation_type', 'global')
      .eq('inviter_id', userId)
      .eq('invitee_email', collaborator_email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return res.status(409).json({
        success: false,
        message: 'A pending invitation already exists for this email',
      });
    }

    // Check if user is already a global collaborator
    const { data: existingCollaborator } = await supabase
      .from('GlobalCollaborators')
      .select('id')
      .eq('owner_id', userId)
      .eq('collaborator_email', collaborator_email)
      .single();

    if (existingCollaborator) {
      return res.status(409).json({
        success: false,
        message: 'User is already a global collaborator',
      });
    }

    // Generate invitation token
    const invitationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('CollaboratorInvitations')
      .insert([
        {
          invitation_type: 'global',
          project_id: null,
          inviter_id: userId,
          invitee_email: collaborator_email,
          role,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating global invitation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create invitation',
        error: error.message,
      });
    }

    // Get inviter name
    const { data: inviterData } = await supabase.auth.admin.getUserById(userId);
    const inviterName =
      inviterData?.user?.user_metadata?.name || inviterData?.user?.email || 'Someone';

    // Send invitation email
    await emailService.sendCollaboratorInvitation(
      collaborator_email,
      inviterName,
      'global',
      role,
      invitationToken
    );

    return res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: camelcaseKeys(invitation, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error creating global invitation:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// ==================== Get Invitations ====================

/**
 * Get all invitations for the current user (received)
 */
export const getMyInvitations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userEmail = userData.user.email;

    // Get all pending invitations for this email
    const { data: invitations, error } = await supabase
      .from('CollaboratorInvitations')
      .select('*, Projects(title)')
      .eq('invitee_email', userEmail)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch invitations',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(invitations || [], { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching invitations:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

/**
 * Get invitations sent by the current user
 */
export const getSentInvitations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const { data: invitations, error } = await supabase
      .from('CollaboratorInvitations')
      .select('*, Projects(title)')
      .eq('inviter_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sent invitations:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sent invitations',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(invitations || [], { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching sent invitations:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// ==================== Accept/Reject Invitations ====================

/**
 * Accept an invitation
 */
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationToken } = req.params;
    const userId = (req as any).userId;

    if (!invitationToken) {
      return res.status(400).json({
        success: false,
        message: 'Invitation token is required',
      });
    }

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userEmail = userData.user.email;

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('CollaboratorInvitations')
      .select('*')
      .eq('invitation_token', invitationToken)
      .eq('invitee_email', userEmail)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or already processed',
      });
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Invitation has expired',
      });
    }

    // Add collaborator based on type
    if (invitation.invitation_type === 'project') {
      // Add to ProjectCollaborators
      const { error: collabError } = await supabase.from('ProjectCollaborators').insert([
        {
          project_id: invitation.project_id,
          user_id: invitation.inviter_id,
          collaborator_email: invitation.invitee_email,
          role: invitation.role,
        },
      ]);

      if (collabError) {
        console.error('Error adding project collaborator:', collabError);
        return res.status(500).json({
          success: false,
          message: 'Failed to add collaborator',
        });
      }
    } else {
      // Add to GlobalCollaborators
      const { error: collabError } = await supabase.from('GlobalCollaborators').insert([
        {
          owner_id: invitation.inviter_id,
          collaborator_email: invitation.invitee_email,
          role: invitation.role,
        },
      ]);

      if (collabError) {
        console.error('Error adding global collaborator:', collabError);
        return res.status(500).json({
          success: false,
          message: 'Failed to add collaborator',
        });
      }
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('CollaboratorInvitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Error updating invitation status:', updateError);
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
    });
  } catch (error: any) {
    console.error('Unexpected error accepting invitation:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

/**
 * Reject an invitation
 */
export const rejectInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationId } = req.params;
    const userId = (req as any).userId;

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userEmail = userData.user.email;

    // Update invitation status
    const { error } = await supabase
      .from('CollaboratorInvitations')
      .update({ status: 'rejected' })
      .eq('id', invitationId)
      .eq('invitee_email', userEmail)
      .eq('status', 'pending');

    if (error) {
      console.error('Error rejecting invitation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reject invitation',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation rejected successfully',
    });
  } catch (error: any) {
    console.error('Unexpected error rejecting invitation:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

/**
 * Cancel a sent invitation (by inviter)
 */
export const cancelInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationId } = req.params;
    const userId = (req as any).userId;

    // Delete the invitation
    const { error } = await supabase
      .from('CollaboratorInvitations')
      .delete()
      .eq('id', invitationId)
      .eq('inviter_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error canceling invitation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel invitation',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation canceled successfully',
    });
  } catch (error: any) {
    console.error('Unexpected error canceling invitation:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

/**
 * Get invitation details by token (for unauthenticated users)
 */
export const getInvitationByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const { data: invitation, error } = await supabase
      .from('CollaboratorInvitations')
      .select('*, Projects(title)')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single();

    if (error || !invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or already processed',
      });
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Invitation has expired',
      });
    }

    // Get inviter info
    const { data: inviterData } = await supabase.auth.admin.getUserById(invitation.inviter_id);

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(
        {
          ...invitation,
          inviter_name:
            inviterData?.user?.user_metadata?.name || inviterData?.user?.email || 'Someone',
        },
        { deep: true }
      ),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching invitation by token:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};
