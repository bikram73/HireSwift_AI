import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using Vite asset URL resolution so worker loads offline/locally
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ExtractedDocumentPayload {
  fileName: string;
  fileType: 'PDF' | 'DOCX';
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  extractedText: string;
  base64Pdf?: string;
  objectUrl: string;
  isScannedPdfFallback: boolean;
}

export class DocumentValidationError extends Error {
  reason: string;
  action: string;

  constructor(message: string, reason: string, action: string) {
    super(message);
    this.reason = reason;
    this.action = action;
  }
}

export async function computeFileSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function validateAndExtractResume(
  file: File,
  maxSizeMb: number
): Promise<ExtractedDocumentPayload> {
  const lowerName = file.name.toLowerCase();
  const isPdf = lowerName.endsWith('.pdf');
  const isDocx = lowerName.endsWith('.docx');

  if (!isPdf && !isDocx) {
    throw new DocumentValidationError(
      'Unsupported file format',
      `File "${file.name}" is not a PDF or DOCX document.`,
      'Upload a valid .pdf or .docx resume file.'
    );
  }

  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size === 0) {
    throw new DocumentValidationError(
      'Empty document',
      `"${file.name}" has 0 bytes and contains no readable content.`,
      'Verify the exported resume file and upload a non-empty document.'
    );
  }

  if (file.size > maxBytes) {
    throw new DocumentValidationError(
      'File exceeds size limit',
      `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(2)} MB (limit: ${maxSizeMb} MB).`,
      `Compress the document under ${maxSizeMb} MB or adjust the limit in Settings.`
    );
  }

  const buffer = await file.arrayBuffer();
  const sha256Hash = await computeFileSha256(buffer);
  const objectUrl = URL.createObjectURL(file);

  if (isDocx) {
    try {
      const mammothInput =
        typeof Buffer !== 'undefined'
          ? { arrayBuffer: buffer, buffer: Buffer.from(buffer) }
          : { arrayBuffer: buffer };
      const result = await mammoth.extractRawText(mammothInput as { arrayBuffer: ArrayBuffer });
      const text = (result.value || '').trim();
      if (!text) {
        throw new DocumentValidationError(
          'Empty DOCX document',
          'No text paragraphs could be read from this DOCX file.',
          'Ensure the resume contains selectable text rather than embedded screenshots only.'
        );
      }
      return {
        fileName: file.name,
        fileType: 'DOCX',
        mimeType:
          file.type ||
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: file.size,
        sha256Hash,
        extractedText: text,
        objectUrl,
        isScannedPdfFallback: false,
      };
    } catch (err) {
      if (err instanceof DocumentValidationError) throw err;
      throw new DocumentValidationError(
        'Corrupted or unreadable DOCX',
        'Failed to unpack DOCX archive.',
        'Re-save the document as a clean .docx or .pdf and retry.'
      );
    }
  }

  // PDF extraction via PDF.js with scanned PDF detection
  let extractedText = '';
  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
    const pdfDoc = await loadingTask.promise;
    const pageTexts: string[] = [];
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter(Boolean);
      pageTexts.push(strings.join(' '));
    }
    extractedText = pageTexts.join('\n').trim();
  } catch (err: unknown) {
    const errName = (err as { name?: string })?.name || '';
    const errMsg = (err as { message?: string })?.message || '';
    if (errName === 'PasswordException' || /password/i.test(errMsg)) {
      throw new DocumentValidationError(
        'Password-protected PDF',
        'This PDF requires a password to unlock.',
        'Remove password protection from the PDF and re-upload.'
      );
    }
    throw new DocumentValidationError(
      'Corrupted PDF document',
      'Unable to open PDF structure.',
      'Re-export the PDF using Print to PDF or upload a DOCX version.'
    );
  }

  const isScannedPdfFallback = extractedText.length < 40;
  const base64Pdf = isScannedPdfFallback ? arrayBufferToBase64(buffer) : undefined;
  const MAX_SCANNED_PDF_BASE64_CHARS = 5_800_000; // Accounts for +33% base64 inflation inside 6 MB Netlify payload cap

  if (base64Pdf && base64Pdf.length > MAX_SCANNED_PDF_BASE64_CHARS) {
    throw new DocumentValidationError(
      'Scanned PDF exceeds OCR payload limit',
      `"${file.name}" has no selectable text layer (${(file.size / (1024 * 1024)).toFixed(2)} MB raw → ${(base64Pdf.length / (1024 * 1024)).toFixed(2)} MB base64), exceeding the 6 MB serverless request limit.`,
      'Compress the scanned PDF under 4 MB or export a text-searchable PDF/DOCX.'
    );
  }

  return {
    fileName: file.name,
    fileType: 'PDF',
    mimeType: 'application/pdf',
    sizeBytes: file.size,
    sha256Hash,
    extractedText,
    base64Pdf,
    objectUrl,
    isScannedPdfFallback,
  };
}

export interface ExtractedJobDocument {
  fileName: string;
  fileType: 'PDF' | 'DOCX' | 'TXT';
  extractedText: string;
  base64Pdf?: string;
  isScannedPdfFallback: boolean;
}

export async function validateAndExtractJobDocument(
  file: File,
  maxSizeMb: number
): Promise<ExtractedJobDocument> {
  const lowerName = file.name.toLowerCase();
  const isTxt = lowerName.endsWith('.txt') || lowerName.endsWith('.md');

  if (isTxt) {
    if (file.size === 0) {
      throw new DocumentValidationError(
        'Empty document',
        `"${file.name}" has 0 bytes and contains no readable text.`,
        'Upload a non-empty .txt, .pdf, or .docx job description.'
      );
    }
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new DocumentValidationError(
        'File exceeds size limit',
        `"${file.name}" exceeds ${maxSizeMb} MB.`,
        'Upload a smaller job description file.'
      );
    }
    const text = (await file.text()).trim();
    if (text.length < 15) {
      throw new DocumentValidationError(
        'Job description too short',
        `"${file.name}" contains fewer than 15 characters.`,
        'Provide a more detailed job description or paste the requirements directly.'
      );
    }
    return {
      fileName: file.name,
      fileType: 'TXT',
      extractedText: text,
      isScannedPdfFallback: false,
    };
  }

  const res = await validateAndExtractResume(file, maxSizeMb);
  if (res.objectUrl) {
    URL.revokeObjectURL(res.objectUrl);
  }
  return {
    fileName: res.fileName,
    fileType: res.fileType,
    extractedText: res.extractedText,
    base64Pdf: res.base64Pdf,
    isScannedPdfFallback: res.isScannedPdfFallback,
  };
}
