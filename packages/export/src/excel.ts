// Chú thích: Export ma trận đề sang Excel theo template CV 7991
// Cấu trúc theo mẫu của Bộ GD&ĐT

import ExcelJS from 'exceljs';
import type { Matrix } from '@exam-matrix/shared';

/**
 * Tạo file Excel ma trận đề theo CV 7991
 * Trả về Buffer để upload lên R2
 */
export async function exportMatrixToExcel(matrix: Matrix): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Ma trận đề', {
        views: [{ state: 'frozen', xSplit: 3, ySplit: 3 }],
    });

    // Thiết lập độ rộng cột
    sheet.columns = [
        { key: 'tt', width: 5 }, // TT
        { key: 'topic', width: 15 }, // Chủ đề/Chương
        { key: 'unit', width: 25 }, // Nội dung/Đơn vị kiến thức
        // MCQ: Biết, Hiểu, VD
        { key: 'mcq_nb', width: 6 },
        { key: 'mcq_th', width: 6 },
        { key: 'mcq_vd', width: 6 },
        // Đúng/Sai: Biết, Hiểu, VD
        { key: 'tf_nb', width: 6 },
        { key: 'tf_th', width: 6 },
        { key: 'tf_vd', width: 6 },
        // Trả lời ngắn: Biết, Hiểu, VD
        { key: 'short_nb', width: 6 },
        { key: 'short_th', width: 6 },
        { key: 'short_vd', width: 6 },
        // Tự luận: Biết, Hiểu, VD
        { key: 'essay_nb', width: 6 },
        { key: 'essay_th', width: 6 },
        { key: 'essay_vd', width: 6 },
        // Tổng: Biết, Hiểu, VD
        { key: 'total_nb', width: 7 },
        { key: 'total_th', width: 7 },
        { key: 'total_vd', width: 7 },
        // Tỷ lệ %
        { key: 'percent', width: 8 },
    ];

    // Style cho header
    const headerStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, size: 11 },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } },
    };

    // Row 1: Title
    sheet.mergeCells('A1:S1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ - ${matrix.subject.toUpperCase()} LỚP ${matrix.grade}`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };

    // Row 2-3: Headers
    // Row 2: Main headers
    sheet.mergeCells('A2:A3'); // TT
    sheet.getCell('A2').value = 'TT';
    sheet.getCell('A2').style = headerStyle;

    sheet.mergeCells('B2:B3'); // Chủ đề
    sheet.getCell('B2').value = 'Chủ đề/Chương';
    sheet.getCell('B2').style = headerStyle;

    sheet.mergeCells('C2:C3'); // Nội dung
    sheet.getCell('C2').value = 'Nội dung/Đơn vị kiến thức';
    sheet.getCell('C2').style = headerStyle;

    // Mức độ đánh giá header
    sheet.mergeCells('D2:O2');
    sheet.getCell('D2').value = 'Mức độ đánh giá';
    sheet.getCell('D2').style = headerStyle;

    // Sub-headers cho từng loại câu
    // MCQ
    sheet.mergeCells('D3:F3');
    sheet.getCell('D3').value = 'Nhiều lựa chọn';
    sheet.getCell('D3').style = headerStyle;

    // TF
    sheet.mergeCells('G3:I3');
    sheet.getCell('G3').value = 'Đúng/Sai';
    sheet.getCell('G3').style = headerStyle;

    // SHORT
    sheet.mergeCells('J3:L3');
    sheet.getCell('J3').value = 'Trả lời ngắn';
    sheet.getCell('J3').style = headerStyle;

    // ESSAY
    sheet.mergeCells('M3:O3');
    sheet.getCell('M3').value = 'Tự luận';
    sheet.getCell('M3').style = headerStyle;

    // Tổng
    sheet.mergeCells('P2:R2');
    sheet.getCell('P2').value = 'Tổng';
    sheet.getCell('P2').style = headerStyle;

    // Tỷ lệ %
    sheet.mergeCells('S2:S3');
    sheet.getCell('S2').value = 'Tỷ lệ % điểm';
    sheet.getCell('S2').style = headerStyle;

    // Row 4: Level headers (Biết, Hiểu, VD)
    const levels = ['Biết', 'Hiểu', 'VD'];
    const levelColumns = [
        ['D', 'E', 'F'],
        ['G', 'H', 'I'],
        ['J', 'K', 'L'],
        ['M', 'N', 'O'],
        ['P', 'Q', 'R'],
    ];

    levelColumns.forEach((cols) => {
        levels.forEach((level, i) => {
            const cell = sheet.getCell(`${cols[i]}4`);
            cell.value = level;
            cell.style = headerStyle;
        });
    });

    // Data rows
    let rowIndex = 5;
    let topicIndex = 1;

    for (const topic of matrix.topics) {
        const startRow = rowIndex;

        for (const unit of topic.units) {
            const row = sheet.getRow(rowIndex);

            row.getCell('C').value = unit.name;

            // MCQ
            if (unit.MCQ) {
                row.getCell('D').value = unit.MCQ.NB || '';
                row.getCell('E').value = unit.MCQ.TH || '';
                row.getCell('F').value = unit.MCQ.VD || '';
            }

            // TF
            if (unit.TF) {
                row.getCell('G').value = unit.TF.NB || '';
                row.getCell('H').value = unit.TF.TH || '';
                row.getCell('I').value = unit.TF.VD || '';
            }

            // SHORT
            if (unit.SHORT) {
                row.getCell('J').value = unit.SHORT.NB || '';
                row.getCell('K').value = unit.SHORT.TH || '';
                row.getCell('L').value = unit.SHORT.VD || '';
            }

            // ESSAY
            if (unit.ESSAY) {
                row.getCell('M').value = unit.ESSAY.NB || '';
                row.getCell('N').value = unit.ESSAY.TH || '';
                row.getCell('O').value = unit.ESSAY.VD || '';
            }

            // Apply borders
            for (let col = 1; col <= 19; col++) {
                row.getCell(col).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            }

            rowIndex++;
        }

        // Merge cells cho cột TT và Chủ đề
        if (topic.units.length > 1) {
            sheet.mergeCells(`A${startRow}:A${rowIndex - 1}`);
            sheet.mergeCells(`B${startRow}:B${rowIndex - 1}`);
            sheet.mergeCells(`S${startRow}:S${rowIndex - 1}`);
        }

        sheet.getCell(`A${startRow}`).value = topicIndex;
        sheet.getCell(`A${startRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getCell(`B${startRow}`).value = topic.name;
        sheet.getCell(`B${startRow}`).alignment = { vertical: 'middle', wrapText: true };
        sheet.getCell(`S${startRow}`).value = `${topic.percentScore}%`;
        sheet.getCell(`S${startRow}`).alignment = { vertical: 'middle', horizontal: 'center' };

        topicIndex++;
    }

    // Summary row: Tổng số câu
    const summaryRow1 = sheet.getRow(rowIndex);
    sheet.mergeCells(`A${rowIndex}:C${rowIndex}`);
    summaryRow1.getCell('A').value = 'Tổng số câu';
    summaryRow1.getCell('A').font = { bold: true };

    // Summary row: Tổng số điểm
    rowIndex++;
    const summaryRow2 = sheet.getRow(rowIndex);
    sheet.mergeCells(`A${rowIndex}:C${rowIndex}`);
    summaryRow2.getCell('A').value = 'Tổng số điểm';
    summaryRow2.getCell('A').font = { bold: true };

    // Điền tổng điểm theo CV 7991
    sheet.mergeCells(`D${rowIndex}:F${rowIndex}`);
    summaryRow2.getCell('D').value = `${matrix.summary.MCQ.points} điểm`;

    sheet.mergeCells(`G${rowIndex}:I${rowIndex}`);
    summaryRow2.getCell('G').value = `${matrix.summary.TF.points} điểm`;

    sheet.mergeCells(`J${rowIndex}:L${rowIndex}`);
    summaryRow2.getCell('J').value = `${matrix.summary.SHORT.points} điểm`;

    sheet.mergeCells(`M${rowIndex}:O${rowIndex}`);
    summaryRow2.getCell('M').value = `${matrix.summary.ESSAY.points} điểm`;

    // Export to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
