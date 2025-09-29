import camelcaseKeys from 'camelcase-keys';
import { Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { supabase } from '@/lib/supabase';

// 獲取當前用戶的所有案件列表
export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // 查詢資料庫中屬於當前用戶的所有專案
    const { data: projects, error } = await supabase
      .from('Projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch projects',
        error: error.message,
      });
    }

    // 在返回前移除敏感欄位
    const safeProjects = projects?.map((project) => {
      const { user_id, ...safeProject } = project;
      return safeProject;
    });

    // 轉換為駝峰式命名並返回
    return res.status(200).json({
      success: true,
      data: camelcaseKeys(safeProjects, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching projects:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const projectId = req.params.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    // 查詢專案資訊
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return res.status(404).json({
        success: false,
        message: 'Project not found',
        error: projectError.message,
      });
    }

    // 查詢關聯的任務
    const { data: tasks, error: tasksError } = await supabase
      .from('Tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project tasks',
        error: tasksError.message,
      });
    }

    // 在返回前移除敏感欄位
    const { user_id, ...safeProject } = project;

    // 組合返回數據
    const projectWithTasks = {
      ...safeProject,
      tasks: tasks || [],
    };

    // 轉換為駝峰式命名並返回
    return res.status(200).json({
      success: true,
      data: camelcaseKeys(projectWithTasks, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching project:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// 創建新案件
export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const snakeCaseData = snakecaseKeys(req.body, { deep: true });
    const { title, type, construction_container } = snakeCaseData;

    // 驗證必要欄位
    if (!title || !type || !construction_container) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // 創建新專案
    const { data: project, error } = await supabase
      .from('Projects')
      .insert([
        {
          title,
          type,
          construction_container,
          user_id: userId,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create project',
        error: error.message,
      });
    }

    // 在返回前移除敏感欄位
    const { user_id, ...safeProject } = project;

    // 轉換回駝峰式命名並返回
    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: camelcaseKeys(safeProject),
    });
  } catch (error: any) {
    console.error('Unexpected error creating project:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// 更新專案
export const updateProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const projectId = req.params.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    // 首先檢查專案是否存在並屬於當前用戶
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to update it',
        error: projectError.message,
      });
    }

    const snakeCaseData = snakecaseKeys(req.body, { deep: true });
    const { title, type, construction_container } = snakeCaseData;

    // 更新專案
    const { data: updatedProject, error: updateError } = await supabase
      .from('Projects')
      .update({
        title,
        type,
        construction_container,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update project',
        error: updateError.message,
      });
    }

    // 在返回前移除敏感欄位
    const { user_id, ...safeProject } = updatedProject;

    // 轉換回駝峰式命名並返回
    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: camelcaseKeys(safeProject),
    });
  } catch (error: any) {
    console.error('Unexpected error updating project:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// 刪除專案
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const projectId = req.params.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    // 首先檢查專案是否存在並屬於當前用戶
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to delete it',
        error: projectError.message,
      });
    }

    try {
      // 1. 首先刪除關聯的任務
      const { error: tasksDeleteError } = await supabase
        .from('Tasks')
        .delete()
        .eq('project_id', projectId);

      if (tasksDeleteError) {
        console.error('Error deleting project tasks:', tasksDeleteError);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete project tasks',
          error: tasksDeleteError.message,
        });
      }

      // 2. 然後刪除專案本身
      const { error: projectDeleteError } = await supabase
        .from('Projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);

      if (projectDeleteError) {
        console.error('Error deleting project:', projectDeleteError);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete project',
          error: projectDeleteError.message,
        });
      }
    } catch (innerError: any) {
      console.error('Transaction error:', innerError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete project and its tasks',
        error: innerError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project and associated tasks deleted successfully',
    });
  } catch (error: any) {
    console.error('Unexpected error deleting project:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};
