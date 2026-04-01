import xlsx from 'xlsx';
import { parse as parseCsv } from 'csv-parse/sync';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractRawRows(file) {
  const ext = file.originalname.toLowerCase().split('.').pop();

  if (ext === 'csv') {
    const records = parseCsv(file.buffer.toString('utf8'), { columns: true, skip_empty_lines: true });
    return records.map(row => Object.values(row));
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const allRows = [];
    workbook.SheetNames.forEach(name => {
      const sheet = workbook.Sheets[name];
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      rows.forEach(r => allRows.push(r));
    });
    return allRows;
  }

  if (ext === 'txt') {
    return file.buffer
      .toString('utf8')
      .split('\n')
      .map(line => line.split(/[;,|\t]/));
  }

  if (ext === 'pdf') {
    const data = await pdfParse(file.buffer);
    return data.text.split('\n').map(line => [line]);
  }

  if (ext === 'docx' || ext === 'doc') {
    const data = await mammoth.extractRawText({ buffer: file.buffer });
    return data.value.split('\n').map(line => [line]);
  }

  throw new Error('Formato no soportado');
}
