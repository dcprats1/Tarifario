import xlsx from 'xlsx';
import { parse as parseCsv } from 'csv-parse/sync';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

function isLikelyHeaderRow(row = []) {
  if (!row.length) return false;
  const asStrings = row.map(cell => String(cell || '').trim().toLowerCase());
  const keywordHits = asStrings.filter(cell => /peso|weight|price|precio|zona|zone|destino|tarifa/.test(cell)).length;
  const numericLike = asStrings.filter(cell => /^\d+(?:[.,]\d+)?$/.test(cell)).length;

  return keywordHits > 0 && numericLike <= Math.floor(asStrings.length / 2);
}

export async function extractRawRows(file) {
  const ext = file.originalname.toLowerCase().split('.').pop();

  if (ext === 'csv') {
    const rows = parseCsv(file.buffer.toString('utf8'), {
      columns: false,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true
    });

    if (rows.length > 0 && isLikelyHeaderRow(rows[0])) {
      return rows.slice(1);
    }

    return rows;
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

  if (ext === 'docx') {
    const data = await mammoth.extractRawText({ buffer: file.buffer });
    return data.value.split('\n').map(line => [line]);
  }

  if (ext === 'doc') {
    throw new Error('Formato .doc (Word legado) no soportado aún. Convierte el archivo a .docx e inténtalo de nuevo.');
  }

  throw new Error('Formato no soportado');
}
