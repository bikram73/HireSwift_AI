import { describe, expect, it, vi } from 'vitest';

const mockGetDocument = vi.fn();

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: (...args: unknown[]) => mockGetDocument(...args),
}));

import { validateAndExtractResume } from '../src/utils/fileExtractor';

describe('PDF Edge-Case Validation (Password & Scanned Payload Limits)', () => {
  it('PDF-005: Rejects password-protected PDF with actionable error message', async () => {
    mockGetDocument.mockReturnValueOnce({
      get promise() {
        return Promise.reject(Object.assign(new Error('Password required'), { name: 'PasswordException' }));
      },
    });

    const bytes = new TextEncoder().encode('%PDF-1.4\n%locked');
    const file = new File([bytes], 'encrypted_resume.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    });

    await expect(validateAndExtractResume(file, 10)).rejects.toMatchObject({
      message: 'Password-protected PDF',
    });
  });

  it('ISSUE-5: Rejects oversized scanned PDF exceeding 5.8 MB base64 limit for Netlify OCR', async () => {
    mockGetDocument.mockReturnValueOnce({
      promise: Promise.resolve({
        numPages: 1,
        getPage: async () => ({
          getTextContent: async () => ({ items: [] }),
        }),
      }),
    });

    const bytes = new Uint8Array(4_500_000);
    const file = new File([new Uint8Array(bytes)], 'scanned_large.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    });

    await expect(validateAndExtractResume(file, 10)).rejects.toMatchObject({
      message: 'Scanned PDF exceeds OCR payload limit',
    });
  });
});
