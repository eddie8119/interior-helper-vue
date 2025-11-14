import { Workbook } from 'exceljs';

import type { ProjectResponse, TaskResponse } from '@/types/response';
import type { Alignment } from 'exceljs';

/**
 * Excel 對齊配置
 */
export const CENTER_ALIGNMENT: Alignment = {
  horizontal: 'center',
  vertical: 'middle',
};

/**
 * 以多個專案建立一份 Workbook（每個專案一個 Worksheet）
 */
export const createWorkbookWithProjects = (
  projects: ProjectResponse[],
  t: (key: string) => string
) => {
  const workbook = new Workbook();
  projects.forEach((p) => createProjectWorksheet(workbook, p, t));
  return workbook;
};

/**
 * 下載 Workbook 為 xlsx 檔
 */
export const downloadWorkbook = async (workbook: Workbook, filename: string) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const LEFT_ALIGNMENT: Alignment = {
  horizontal: 'left',
  vertical: 'middle',
  wrapText: true,
};

/**
 * 為 Project 建立 Worksheet
 */
export const createProjectWorksheet = (
  workbook: Workbook,
  project: ProjectResponse,
  t: (key: string) => string
) => {
  const worksheetName = project.title.slice(0, 31);
  const worksheet = workbook.addWorksheet(worksheetName);

  worksheet.columns = [
    { header: '', key: 'property', width: 20 },
    { header: '', key: 'value', width: 40 },
  ];

  worksheet.spliceRows(1, 1);

  /* 專案資訊區塊 (標題) */
  const titleRow = worksheet.addRow({
    property: t('excel.section.project_info'),
    value: '',
  });

  titleRow.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  titleRow.alignment = CENTER_ALIGNMENT;

  /* 專案基本資訊 */
  worksheet.addRow({
    property: t('excel.label.project_name'),
    value: project.title || '-',
  });

  worksheet.addRow({
    property: t('excel.label.project_type'),
    value: t(`option.projectType.${project.type}`) || '-',
  });

  worksheet.addRow({
    property: t('excel.label.created_at'),
    value: project.createdAt ? new Date(project.createdAt).toLocaleString() : '-',
  });

  worksheet.addRow({
    property: t('excel.label.updated_at'),
    value: project.updatedAt ? new Date(project.updatedAt).toLocaleString() : '-',
  });

  worksheet.addRow({});

  /* 施工區域區塊 (標題) */
  const constructionTitleRow = worksheet.addRow({
    property: t('excel.section.construction'),
    value: '',
  });

  constructionTitleRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  constructionTitleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' },
  };

  /* Tasks Header 列 */
  const taskHeader = [
    t('excel.columns.task_title'),
    t('excel.columns.status'),
    t('excel.columns.description'),
  ];

  const tasksHeaderRow = worksheet.addRow(taskHeader);

  tasksHeaderRow.font = { bold: true, color: { argb: 'FF000000' }, size: 11 };
  tasksHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF59D' },
  };
  tasksHeaderRow.alignment = CENTER_ALIGNMENT;

  worksheet.getColumn(2).width = 32;
  worksheet.getColumn(3).width = 14;
  worksheet.getColumn(4).width = 80;

  /* 建立各施工區域與其任務 */
  if (project.constructionContainer?.length) {
    project.constructionContainer.forEach((container) => {
      const nameRow = worksheet.addRow([container.name]);
      worksheet.mergeCells(nameRow.number, 1, nameRow.number, 4);

      nameRow.font = { bold: true };
      nameRow.alignment = CENTER_ALIGNMENT;
      nameRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };

      const tasksForContainer = (project.tasks || []).filter(
        (task: TaskResponse) => String(task.constructionType ?? '') === String(container.id)
      );

      tasksForContainer.forEach((task: TaskResponse) => {
        const row = worksheet.addRow([
          task.title || '-',
          task.status || '-',
          task.description || '-',
        ]);

        row.getCell(2).alignment = LEFT_ALIGNMENT;
        row.getCell(3).alignment = CENTER_ALIGNMENT;
        row.getCell(4).alignment = LEFT_ALIGNMENT;
      });
    });
  } else {
    const noneRow = worksheet.addRow([t('common.none')]);
    worksheet.mergeCells(noneRow.number, 1, noneRow.number, 4);
    noneRow.alignment = CENTER_ALIGNMENT;
  }
};
