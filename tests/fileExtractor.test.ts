import { describe, expect, it } from 'vitest';
import {
  DocumentValidationError,
  validateAndExtractResume,
} from '../src/utils/fileExtractor';
import { buildRealDocxBytes } from './fixtures';

function makeTestFile(content: Uint8Array | string, name: string, type: string): File {
  const part: BlobPart = typeof content === 'string' ? content : new Uint8Array(content);
  const blob = new File([part], name, { type });
  if (typeof blob.arrayBuffer !== 'function') {
    Object.defineProperty(blob, 'arrayBuffer', {
      value: async () => {
        if (typeof content === 'string') return new TextEncoder().encode(content).buffer;
        return content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength);
      },
    });
  }
  return blob;
}

describe('File Upload Validation & Document Extraction (PRD 5.1–5.3)', () => {
  it('UP-006/007/008: Rejects .txt, .png, .exe, and .doc files cleanly', async () => {
    for (const [name, mime] of [
      ['notes.txt', 'text/plain'],
      ['photo.png', 'image/png'],
      ['malware.exe', 'application/octet-stream'],
      ['legacy.doc', 'application/msword'],
    ]) {
      const f = makeTestFile('hello', name, mime);
      await expect(validateAndExtractResume(f, 10)).rejects.toMatchObject({
        message: 'Unsupported file format',
      });
    }
  });

  it('UP-009: Rejects zero-byte file with DocumentValidationError', async () => {
    const emptyPdf = makeTestFile(new Uint8Array(0), 'empty.pdf', 'application/pdf');
    await expect(validateAndExtractResume(emptyPdf, 10)).rejects.toThrow(DocumentValidationError);
    await expect(validateAndExtractResume(emptyPdf, 10)).rejects.toMatchObject({
      message: 'Empty document',
    });
  });

  it('UP-013: Rejects files larger than configured maxSizeMb', async () => {
    const big = makeTestFile(new Uint8Array(2 * 1024 * 1024), 'big_resume.pdf', 'application/pdf');
    await expect(validateAndExtractResume(big, 1)).rejects.toMatchObject({
      message: 'File exceeds size limit',
    });
  });

  it('UP-010: Rejects corrupted PDF content with clear processing error', async () => {
    const corrupt = makeTestFile('NOT A REAL PDF BINARY', 'corrupt.pdf', 'application/pdf');
    await expect(validateAndExtractResume(corrupt, 10)).rejects.toMatchObject({
      message: 'Corrupted PDF document',
    });
  });

  it('UP-011 / DOCX-007: Rejects corrupted DOCX archive with clear processing error', async () => {
    const corruptDocx = makeTestFile(
      'NOT A ZIP ARCHIVE',
      'corrupt.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    await expect(validateAndExtractResume(corruptDocx, 10)).rejects.toMatchObject({
      message: 'Corrupted or unreadable DOCX',
    });
  });

  it('DOCX-001/UP-001/UP-014: Extracts real text and SHA-256 hash from valid OpenXML DOCX with unicode filename', async () => {
    const docxBytes = await buildRealDocxBytes(
      'Rohan Verma | rohan.verma@example.com | Skills: Python, FastAPI, React, SQL | CGPA: 8.8'
    );
    const file = makeTestFile(
      docxBytes,
      'Rohan Verma — Résumé (2026).docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    const res = await validateAndExtractResume(file, 10);

    expect(res.fileType).toBe('DOCX');
    expect(res.sha256Hash).toMatch(/^[a-f0-9]{64}$/);
    expect(res.isScannedPdfFallback).toBe(false);
    expect(res.extractedText).toContain('Rohan Verma');
    expect(res.extractedText).toContain('FastAPI');
    expect(res.base64Pdf).toBeUndefined();
  });

  it('DOCX-006: Rejects DOCX with empty paragraph text cleanly', async () => {
    const emptyDocxBytes = await buildRealDocxBytes('   ');
    const file = makeTestFile(
      emptyDocxBytes,
      'blank.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    await expect(validateAndExtractResume(file, 10)).rejects.toMatchObject({
      message: 'Empty DOCX document',
    });
  });
});
