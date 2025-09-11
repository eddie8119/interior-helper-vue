import { supabase } from "@/lib/supabase";
import {
  InvoiceDetail,
  InvoiceForList,
  InvoiceItemInsert,
} from "@/types/invoice";
import camelcaseKeys from "camelcase-keys";
import { Request, Response } from "express";
import snakecaseKeys from "snakecase-keys";

// 獲取當前用戶的所有案件列表
export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    let query = supabase.from("Projects").select(
      `
      id,
      invoice_number,
      due_date,
      sales_amount,
      total_amount,
      status,
      note,
      case_id,
      created_at,
      paid_at,
      company:Companies(id, name),
      case:Cases(id, name),
      type,
      is_tax
    `
    );

    // 獲取查詢參數
    const { type, month, year } = req.query;

    query = query.eq("user_id", userId);
    if (type) {
      query = query.eq("type", type);
    }

    if (year && month) {
      const formattedMonth = month.toString().padStart(2, "0");
      const startDate = `${year}-${formattedMonth}-01`;

      // 計算下個月的第一天
      const nextMonth = new Date(
        parseInt(year as string),
        parseInt(month as string),
        1
      );
      const endDate = nextMonth.toISOString().slice(0, 10);

      query = query.gte("due_date", startDate).lt("due_date", endDate);
    } else if (year) {
      // 只有年份的情況
      const startDate = `${year}-01-01`;
      const endDate = `${parseInt(year as string) + 1}-01-01`;

      query = query.gte("due_date", startDate).lt("due_date", endDate);
    }

    // 按創建時間降序排序
    query = query.order("created_at", { ascending: false });

    const { data: invoicesData, error } = await query;

    if (error) {
      console.error("Error fetching invoices:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch invoices",
        error: error.message,
      });
    }

    // Force cast to our defined type after checking for null/undefined.
    const typedInvoices = (invoicesData as unknown as InvoiceForList[]) || [];
    const formattedInvoices = typedInvoices.map((invoice) => ({
      ...invoice,
      due_date: new Date(invoice.due_date).toISOString().split("T")[0],
    }));

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(formattedInvoices, { deep: true }),
    });
  } catch (error: any) {
    console.error("Error in getInvoices:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
};

// 創建新案件
export const createProject = async (req: Request, res: Response) => {
  // 開始一個事務，確保所有操作都成功或都失敗
  try {
    const userId = (req as any).userId;

    // 將前端傳來的駝峰式命名轉換為蛇形命名
    const snakeCaseData = snakecaseKeys(req.body, { deep: true });
    const {
      company, // 公司名稱，要存到 Companies 表的 name 欄位
      invoice_number,
      case_name,
      sales_amount,
      total_amount,
      is_tax,
      issue_date,
      due_date,
      status = "unpaid",
      note,
      invoice_items, // 發票項目，要存到 InvoiceItems 表
      type = "receivable",
    } = snakeCaseData;

    // 驗證必要欄位
    if (
      !company ||
      !case_name ||
      !sales_amount ||
      !total_amount ||
      !issue_date ||
      !due_date
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 計算總金額
    // const total_amount: number = invoice_items.reduce(
    //   (sum, item) =>
    //     sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    //   0
    // );

    // 步驟 1: 檢查公司是否已存在，如果不存在則創建
    let company_id: string;
    const { data: existingCompany, error: companyFetchError } = await supabase
      .from("Companies")
      .select("id")
      .eq("name", company)
      .eq("user_id", userId)
      .single();

    if (companyFetchError && companyFetchError.code !== "PGRST116") {
      // PGRST116 是「沒有找到記錄」的錯誤
      console.error("Error fetching company:", companyFetchError);
      return res.status(500).json({
        success: false,
        message: "Failed to check if company exists",
        error: companyFetchError.message,
      });
    }

    if (existingCompany) {
      // 如果公司已存在，使用現有的 ID
      company_id = existingCompany.id;
    } else {
      // 如果公司不存在，創建新公司
      const { data: newCompanyData, error: companyCreateError } = await supabase
        .from("Companies")
        .insert([
          {
            name: company,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (companyCreateError) {
        console.error("Error creating company:", companyCreateError);
        return res.status(500).json({
          success: false,
          message: "Failed to create company",
          error: companyCreateError.message,
        });
      }

      company_id = newCompanyData.id;
    }

    // 步驟 2: 檢查案件是否已存在，如果不存在則創建
    let case_id: string;
    const { data: existingCase, error: caseFetchError } = await supabase
      .from("Cases")
      .select("id")
      .eq("name", case_name)
      .eq("user_id", userId)
      .single();

    if (caseFetchError && caseFetchError.code !== "PGRST116") {
      console.error("Error fetching case:", caseFetchError);
      return res.status(500).json({
        success: false,
        message: "Failed to check if case exists",
        error: caseFetchError.message,
      });
    }

    if (existingCase) {
      case_id = existingCase.id;
    } else {
      const { data: newCaseData, error: caseCreateError } = await supabase
        .from("Cases")
        .insert([
          {
            name: case_name,
            user_id: userId,
            company_id: company_id,
          },
        ])
        .select()
        .single();

      if (caseCreateError) {
        console.error("Error creating case:", caseCreateError);
        return res.status(500).json({
          success: false,
          message: "Failed to create case",
          error: caseCreateError.message,
        });
      }

      case_id = newCaseData.id;
    }

    // 步驟 3: 創建發票記錄
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("Invoices")
      .insert([
        {
          user_id: userId,
          company_id, // 使用上面獲取或創建的公司 ID
          invoice_number,
          case_id,
          issue_date: new Date(issue_date), // String to Date
          due_date: new Date(due_date),
          sales_amount,
          total_amount,
          is_tax,
          status,
          note,
          type, // 發票類型（應收或應付）
        },
      ])
      .select()
      .single();

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return res.status(500).json({
        success: false,
        message: "Failed to create invoice",
        error: invoiceError.message,
      });
    }

    // 步驟 4: 創建發票項目
    const invoiceItems: InvoiceItemInsert[] = invoice_items.map(
      (item: any) => ({
        user_id: userId,
        invoice_id: invoiceData.id,
        title: item.title || "",
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
      })
    );

    const { error: itemsError } = await supabase
      .from("InvoiceItems")
      .insert(invoiceItems);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);
      // 如果插入項目失敗，刪除剛才創建的發票
      await supabase.from("Invoices").delete().eq("id", invoiceData.id);

      return res.status(500).json({
        success: false,
        message: "Failed to create invoice items",
        error: itemsError.message,
      });
    }

    // 步驟 4: 獲取完整的發票信息，包括項目和公司
    const { data: completeInvoice, error: fetchError } = await supabase
      .from("Invoices")
      .select(
        `
        *,
        company:Companies(id, name, address, contact_person, email, phone),
        items:InvoiceItems(*)
      `
      )
      .eq("id", invoiceData.id)
      .single();
    // 在 select 字串裡寫出關聯語法，就能一次查出多表資料
    // select 關聯語法讓你一次查出所有關聯表的資料
    // 最強的地方： 在一個 endpoint 裡用 select 語法一次查出多表的 JSON 結構. 根據資料表的外鍵自動 JOIN
    // 一般 RESTful API 這通常需要多次查詢、資料組裝，程式碼較多

    if (fetchError) {
      console.error("Error fetching complete invoice:", fetchError);
      return res.status(500).json({
        success: false,
        message: "Invoice created but failed to fetch complete data",
        error: fetchError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: camelcaseKeys(completeInvoice, { deep: true }),
    });
  } catch (error: any) {
    console.error("Error in createInvoice:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
};
