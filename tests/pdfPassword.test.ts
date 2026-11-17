import { describe, expect, it, vi } from 'vitest';

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: () => ({
    promise: Promise.reject(Object.assign(new Error('Password required'), { name: 'PasswordException' })),
  }),
}));

import { validateAndExtractResume } from '../src/utils/fileExtractor';

describe('Password-Protected PDF Validation (PRD 5.2 PDF-005)', () => {
  it('PDF-005: Rejects password-protected PDF with actionable error message', async () => {
    const bytes = new TextEncoder().encode('%PDF-1.4\n%locked');
    const file = new File([bytes], 'encrypted_resume.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    });

    await expect(validateAndExtractResume(file, 10)).rejects.toMatchObject({
      message: 'Password-protected PDF',
    });
  });
});
