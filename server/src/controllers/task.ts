import camelcaseKeys from 'camelcase-keys';
import { Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { supabase } from '@/lib/supabase';

// 獲取專案下的所有任務
export const getTasksByProjectId = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const projectId = req.params.projectId;

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
        message: 'Project not found or you do not have permission to access it',
        error: projectError.message,
      });
    }

    // 查詢專案下的所有任務
    const { data: tasks, error: tasksError } = await supabase
      .from('Tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks',
        error: tasksError.message,
      });
    }

    // 為每個任務獲取材料
    const processedTasks = await Promise.all(
      tasks.map(async (task) => {
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

    // 轉換為駝峰式命名並返回
    return res.status(200).json({
      success: true,
      data: camelcaseKeys(processedTasks, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching tasks:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// 獲取單個任務詳情
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const taskId = req.params.id;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required',
      });
    }

    // 查詢任務詳情，包括關聯的材料
    const { data: task, error: taskError } = await supabase
      .from('Tasks')
      .select(
        `
        *,
        TaskMaterials(*)
      `
      )
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (taskError) {
      console.error('Error fetching task:', taskError);
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to access it',
        error: taskError.message,
      });
    }

    // 處理任務數據，將材料整合到任務中
    const { TaskMaterials, ...taskData } = task;
    // 在返回前移除敏感欄位
    const { user_id, ...safeTask } = taskData;
    const processedTask = {
      ...safeTask,
      materials: TaskMaterials || [],
    };

    // 轉換為駝峰式命名並返回
    return res.status(200).json({
      success: true,
      data: camelcaseKeys(processedTask, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching task:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// 創建新任務
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const projectId = req.params.projectId;

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
        message: 'Project not found or you do not have permission to access it',
        error: projectError.message,
      });
    }

    const snakeCaseData = snakecaseKeys(req.body, { deep: true });
    const { title, description, construction_type, reminder_datetime, materials } = snakeCaseData;

    // 驗證必要欄位
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    // 開始一個事務來創建任務及其材料
    // 1. 創建任務
    const { data: task, error: taskError } = await supabase
      .from('Tasks')
      .insert([
        {
          title,
          description,
          construction_type,
          reminder_datetime,
          project_id: projectId,
          user_id: userId,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (taskError) {
      console.error('Error creating task:', taskError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create task',
        error: taskError.message,
      });
    }

    // 2. 如果有材料，創建材料記錄
    let taskMaterials = [];
    if (materials && Array.isArray(materials) && materials.length > 0) {
      // Filter out empty materials
      const validMaterials = materials.filter(
        (m: any) => m.name && m.name.trim() !== ''
      );

      if (validMaterials.length > 0) {
        const materialsToInsert = validMaterials.map((material: any) => ({
          task_id: task.id,
          name: material.name,
          quantity: material.quantity,
          unit_price: material.unit_price,
          user_id: userId,
        }));

        const { data: insertedMaterials, error: materialsError } = await supabase
          .from('TaskMaterials')
          .insert(materialsToInsert)
          .select();

        if (materialsError) {
          console.error('Error creating task materials:', materialsError);
          // 不中斷流程，但記錄錯誤
        } else {
          taskMaterials = insertedMaterials || [];
        }
      }
    }

    // 組合返回數據
    const { user_id, ...safeTask } = task;
    const taskWithMaterials = {
      ...safeTask,
      materials: taskMaterials,
    };

    // 轉換為駝峰式命名並返回
    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: camelcaseKeys(taskWithMaterials, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error creating task:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// 更新任務
export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const taskId = req.params.id;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required',
      });
    }

    // 首先檢查任務是否存在並屬於當前用戶
    const { data: existingTask, error: taskError } = await supabase
      .from('Tasks')
      .select('id, project_id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (taskError) {
      console.error('Error fetching task:', taskError);
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to update it',
        error: taskError.message,
      });
    }

    const snakeCaseData = snakecaseKeys(req.body, { deep: true });
    const { title, description, construction_type, reminder_datetime, materials, status } =
      snakeCaseData;

    // 更新任務
    const { data: updatedTask, error: updateError } = await supabase
      .from('Tasks')
      .update({
        title,
        description,
        construction_type,
        reminder_datetime,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating task:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update task',
        error: updateError.message,
      });
    }

    // 如果有材料更新，處理材料
    let taskMaterials = [];
    if (materials) {
      // 1. 刪除現有材料
      const { error: deleteError } = await supabase
        .from('TaskMaterials')
        .delete()
        .eq('task_id', taskId);

      if (deleteError) {
        console.error('Error deleting task materials:', deleteError);
        // 不中斷流程，但記錄錯誤
      }

      // 2. 插入新材料
      if (materials.length > 0) {
        const materialsToInsert = materials.map((material: any) => ({
          task_id: taskId,
          name: material.name,
          quantity: material.quantity,
          unit_price: material.unit_price,
          user_id: userId,
        }));

        const { data: insertedMaterials, error: materialsError } = await supabase
          .from('TaskMaterials')
          .insert(materialsToInsert)
          .select();

        if (materialsError) {
          console.error('Error updating task materials:', materialsError);
          // 不中斷流程，但記錄錯誤
        } else {
          taskMaterials = insertedMaterials;
        }
      }
    } else {
      // 如果沒有提供材料，獲取現有材料
      const { data: existingMaterials } = await supabase
        .from('TaskMaterials')
        .select('*')
        .eq('task_id', taskId);

      taskMaterials = existingMaterials || [];
    }

    // 組合返回數據
    const { user_id, ...safeTask } = updatedTask;
    const taskWithMaterials = {
      ...safeTask,
      materials: taskMaterials,
    };

    // 轉換為駝峰式命名並返回
    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: camelcaseKeys(taskWithMaterials, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error updating task:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// 批量更新任務
export const updateTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const projectId = req.params.projectId;

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
        message: 'Project not found or you do not have permission to access it',
        error: projectError.message,
      });
    }

    const snakeCaseData = snakecaseKeys(req.body, { deep: true });
    const { tasks } = snakeCaseData;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tasks array is required',
      });
    }

    // 批量更新任務
    const updatedTasks: Array<Record<string, any>> = [];
    const errors: string[] = [];

    // 使用 Promise.all 並行處理所有任務更新
    await Promise.all(
      tasks.map(async (task: any) => {
        try {
          // 確保任務屬於指定的專案
          if (task.project_id !== projectId) {
            errors.push(`Task ${task.id} does not belong to the specified project`);
            return;
          }

          // 更新任務
          const { data: updatedTask, error: updateError } = await supabase
            .from('Tasks')
            .update({
              title: task.title,
              description: task.description,
              construction_type: task.construction_type,
              reminder_datetime: task.reminder_datetime,
              status: task.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', task.id)
            .eq('user_id', userId)
            .select()
            .single();

          if (updateError) {
            errors.push(`Error updating task ${task.id}: ${updateError.message}`);
            return;
          }

          // 處理材料更新
          if (task.materials) {
            // 刪除現有材料
            await supabase.from('TaskMaterials').delete().eq('task_id', task.id);

            // 插入新材料
            if (task.materials.length > 0) {
              const materialsToInsert = task.materials.map((material: any) => ({
                task_id: task.id,
                name: material.name,
                quantity: material.quantity,
                unit_price: material.unit_price,
                user_id: userId,
              }));

              const { data: insertedMaterials, error: materialsError } = await supabase
                .from('TaskMaterials')
                .insert(materialsToInsert)
                .select();

              if (materialsError) {
                errors.push(
                  `Error updating materials for task ${task.id}: ${materialsError.message}`
                );
              } else {
                updatedTasks.push({
                  ...updatedTask,
                  materials: insertedMaterials,
                });
              }
            } else {
              updatedTasks.push({
                ...updatedTask,
                materials: [],
              });
            }
          } else {
            // 如果沒有提供材料，獲取現有材料
            const { data: existingMaterials } = await supabase
              .from('TaskMaterials')
              .select('*')
              .eq('task_id', task.id);

            updatedTasks.push({
              ...updatedTask,
              materials: existingMaterials || [],
            });
          }
        } catch (error: any) {
          errors.push(`Unexpected error processing task ${task.id}: ${error.message}`);
        }
      })
    );

    // 返回結果
    return res.status(200).json({
      success: true,
      message:
        errors.length > 0 ? 'Some tasks updated with errors' : 'All tasks updated successfully',
      data: camelcaseKeys(updatedTasks, { deep: true }),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Unexpected error updating tasks:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};

// 刪除任務
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const taskId = req.params.id;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required',
      });
    }

    // 首先檢查任務是否存在並屬於當前用戶
    const { data: task, error: taskError } = await supabase
      .from('Tasks')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (taskError) {
      console.error('Error fetching task:', taskError);
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it',
        error: taskError.message,
      });
    }

    // 開始一個事務來刪除任務及其材料
    // 1. 首先刪除關聯的材料
    const { error: materialsDeleteError } = await supabase
      .from('TaskMaterials')
      .delete()
      .eq('task_id', taskId);

    if (materialsDeleteError) {
      console.error('Error deleting task materials:', materialsDeleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete task materials',
        error: materialsDeleteError.message,
      });
    }

    // 2. 然後刪除任務本身
    const { error: taskDeleteError } = await supabase
      .from('Tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (taskDeleteError) {
      console.error('Error deleting task:', taskDeleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete task',
        error: taskDeleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task and associated materials deleted successfully',
    });
  } catch (error: any) {
    console.error('Unexpected error deleting task:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};
