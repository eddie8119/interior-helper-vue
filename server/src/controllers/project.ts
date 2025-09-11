import { supabase } from "@/lib/supabase";

import camelcaseKeys from "camelcase-keys";
import { Request, Response } from "express";
import snakecaseKeys from "snakecase-keys";

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

    // 轉換為駝峰式命名並返回
    return res.status(200).json({
      success: true,
      data: camelcaseKeys(projects, { deep: true }),
    });
  } catch (error: any) {
    console.error('Unexpected error fetching projects:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
}

// 創建新案件
export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const snakeCaseData = snakecaseKeys(req.body, { deep: true });
    const {
      title,
      type,
      construction_container,
    } = snakeCaseData;

    // 驗證必要欄位
    if (
      !title ||
      !type ||
      !construction_container
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
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

    // 轉換回駝峰式命名並返回
    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: camelcaseKeys(project),
    });
  } catch (error: any) {
    console.error('Unexpected error creating project:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
};
