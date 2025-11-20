import camelcaseKeys from 'camelcase-keys';
import { Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { supabase } from '@/lib/supabase';
// 用於概覽頁面
export const getOverviewProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // 查詢資料庫中屬於當前用戶的所有專案，並關聯任務
    const { data: projects, error } = await supabase
      .from('Projects')
      .select(
        `
        *,
        Tasks(*)
      `
      )
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

    // 在返回前處理數據，移除敏感欄位並整合任務
    const safeProjects = projects?.map((project) => {
      const { user_id, Tasks, ...safeProject } = project;

      // 處理任務數據，移除敏感欄位
      const safeTasks = Tasks
        ? Tasks.map((task: any) => {
            const { user_id: taskUserId, ...safeTask } = task;
            return safeTask;
          })
        : [];

      return {
        ...safeProject,
        tasks: safeTasks,
      };
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

// 獲取用戶作為協作者參與的專案（不包括擁有的）
export const getCollaboratingProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // 獲取用戶的 email
    const { data: user } = await supabase
      .from('Users')
      .select('email')
      .eq('id', userId)
      .single();

    const userEmail = user?.email;

    // 查詢用戶作為協作者的專案（project-specific）
    const { data: projectCollaborations } = await supabase
      .from('ProjectCollaborators')
      .select('project_id, Projects(*)')
      .eq('collaborator_email', userEmail);

    // 查詢用戶作為全域協作者可訪問的專案
    const { data: globalCollaborations } = await supabase
      .from('GlobalCollaborators')
      .select('owner_id')
      .eq('collaborator_email', userEmail);

    const ownerIds = globalCollaborations?.map((gc) => gc.owner_id) || [];
    let globalProjects: any[] = [];

    if (ownerIds.length > 0) {
      const { data: gProjects } = await supabase
        .from('Projects')
        .select('*')
        .in('user_id', ownerIds)
        .order('created_at', { ascending: false });
      globalProjects = gProjects || [];
    }

    // 合併協作專案，去重
    const projectMap = new Map();

    // 添加作為協作者的專案
    projectCollaborations?.forEach((pc: any) => {
      if (pc.Projects) {
        projectMap.set(pc.Projects.id, pc.Projects);
      }
    });

    // 添加全域協作者可訪問的專案
    globalProjects.forEach((project) => {
      projectMap.set(project.id, project);
    });

    const collaboratingProjects = Array.from(projectMap.values());

    // 在返回前移除敏感欄位
    const safeProjects = collaboratingProjects.map((project) => {
      const { user_id, ...safeProject } = project;
      return safeProject;
    });

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(safeProjects, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching collaborating projects:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// 獲取當前用戶的所有案件列表（包括擁有和協作的）
export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // 獲取用戶的 email
    const { data: user } = await supabase
      .from('Users')
      .select('email')
      .eq('id', userId)
      .single();

    const userEmail = user?.email;

    // 查詢資料庫中屬於當前用戶的所有專案
    const { data: ownedProjects, error } = await supabase
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

    // 查詢用戶作為協作者的專案（project-specific）
    const { data: projectCollaborations } = await supabase
      .from('ProjectCollaborators')
      .select('project_id, Projects(*)')
      .eq('collaborator_email', userEmail);

    // 查詢用戶作為全域協作者可訪問的專案
    const { data: globalCollaborations } = await supabase
      .from('GlobalCollaborators')
      .select('owner_id')
      .eq('collaborator_email', userEmail);

    const ownerIds = globalCollaborations?.map((gc) => gc.owner_id) || [];
    let globalProjects: any[] = [];

    if (ownerIds.length > 0) {
      const { data: gProjects } = await supabase
        .from('Projects')
        .select('*')
        .in('user_id', ownerIds)
        .order('created_at', { ascending: false });
      globalProjects = gProjects || [];
    }

    // 合併所有專案，去重
    const projectMap = new Map();
    
    // 添加擁有的專案
    ownedProjects?.forEach((project) => {
      projectMap.set(project.id, project);
    });

    // 添加作為協作者的專案
    projectCollaborations?.forEach((pc: any) => {
      if (pc.Projects) {
        projectMap.set(pc.Projects.id, pc.Projects);
      }
    });

    // 添加全域協作者可訪問的專案
    globalProjects.forEach((project) => {
      projectMap.set(project.id, project);
    });

    const allProjects = Array.from(projectMap.values());

    // 在返回前移除敏感欄位
    const safeProjects = allProjects.map((project) => {
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

    // 獲取用戶的 email
    const { data: user } = await supabase
      .from('Users')
      .select('email')
      .eq('id', userId)
      .single();

    const userEmail = user?.email;

    // 查詢專案資訊
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      return res.status(404).json({
        success: false,
        message: 'Project not found',
        error: projectError?.message,
      });
    }

    // 檢查用戶是否有權限訪問此專案
    const isOwner = project.user_id === userId;
    
    // 檢查是否為專案協作者
    const { data: projectCollaborator } = await supabase
      .from('ProjectCollaborators')
      .select('id')
      .eq('project_id', projectId)
      .eq('collaborator_email', userEmail)
      .single();

    // 檢查是否為全域協作者
    const { data: globalCollaborator } = await supabase
      .from('GlobalCollaborators')
      .select('id')
      .eq('owner_id', project.user_id)
      .eq('collaborator_email', userEmail)
      .single();

    const hasAccess = isOwner || projectCollaborator || globalCollaborator;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this project',
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
    const { title, type, construction_container, floor_plan_urls } = snakeCaseData;

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
          floor_plan_urls,
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
    const { title, type, construction_container, floor_plan_urls } = snakeCaseData;

    // 更新專案
    const { data: updatedProject, error: updateError } = await supabase
      .from('Projects')
      .update({
        title,
        type,
        construction_container,
        floor_plan_urls,
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

// 獲取公開分享的專案（不需要認證）
export const getSharedProject = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    // 查詢專案資訊（檢查是否公開分享）
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('*')
      .eq('id', projectId)
      .eq('is_shared', true)
      .single();

    if (projectError || !project) {
      console.error('Error fetching shared project:', projectError);
      return res.status(404).json({
        success: false,
        message: 'Project not found or not shared publicly',
      });
    }

    // 查詢專案的所有任務
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

    // 為每個任務獲取材料
    const tasksWithMaterials = await Promise.all(
      (tasks || []).map(async (task) => {
        const { data: materials, error: materialsError } = await supabase
          .from('TaskMaterials')
          .select('*')
          .eq('task_id', task.id);

        if (materialsError) {
          console.error(`Error fetching materials for task ${task.id}:`, materialsError);
        }

        const { user_id, ...safeTask } = task;
        return {
          ...safeTask,
          materials: materials || [],
        };
      })
    );

    // 移除敏感欄位
    const { user_id, ...safeProject } = project;

    // 組合返回數據
    const projectWithTasks = {
      ...safeProject,
      tasks: tasksWithMaterials,
    };

    // 轉換為駝峰式命名並返回
    return res.status(200).json({
      success: true,
      data: camelcaseKeys(projectWithTasks, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching shared project:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// 切換專案分享狀態
export const toggleProjectShare = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const projectId = req.params.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    // 檢查專案是否存在並屬於當前用戶
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('id, is_shared')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission',
        error: projectError.message,
      });
    }

    // 切換分享狀態
    const newShareStatus = !project.is_shared;

    const { data: updatedProject, error: updateError } = await supabase
      .from('Projects')
      .update({
        is_shared: newShareStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project share status:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update project share status',
        error: updateError.message,
      });
    }

    const { user_id, ...safeProject } = updatedProject;

    return res.status(200).json({
      success: true,
      message: newShareStatus ? 'Project is now shared' : 'Project sharing disabled',
      data: camelcaseKeys(safeProject),
    });
  } catch (error: any) {
    console.error('Unexpected error toggling project share:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};
