import mammoth from "mammoth";

const EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE = /(\+?\d[\d\s\-()]{7,}\d)/;
const NAME_HINT = /(name[:\s\-]*)([A-Za-z][A-Za-z\s.'-]{2,})/i;

export default async function parseResume(file) {
  const { originalname, mimetype, buffer } = file || {};

  if (!buffer || !(buffer instanceof Buffer)) {
    throw Object.assign(new Error("File buffer is missing or invalid"), { status: 400 });
  }

  const lower = originalname.toLowerCase();
  const isPDF = mimetype === "application/pdf" || lower.endsWith(".pdf");
  const isDOCX =
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx");

  let text = "";

  if (isPDF) {
    let pdfParse;
    try {
      // Lazy load to avoid startup crash if module is broken
      const mod = await import("pdf-parse");
      pdfParse = mod.default || mod;
      if (typeof pdfParse !== "function") {
        throw new Error("pdf-parse module did not export a function");
      }
      const data = await pdfParse(buffer);
      text = (data && data.text) || "";
    } catch (err) {
      err.message = `Failed to parse PDF: ${err.message}`;
      throw Object.assign(err, { status: 422 });
    }
  } else if (isDOCX) {
    try {
      const { value } = await mammoth.extractRawText({ buffer });
      text = value || "";
    } catch (err) {
      err.message = `Failed to parse DOCX: ${err.message}`;
      throw Object.assign(err, { status: 422 });
    }
  } else {
    throw Object.assign(new Error("Unsupported file type"), { status: 400 });
  }

  const email = text.match(EMAIL)?.[0];
  const phone = text.match(PHONE)?.[0];

  let name;
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  const hint = lines.find(l => NAME_HINT.test(l));
  if (hint) {
    const m = hint.match(NAME_HINT);
    name = m && m[2] ? m[2].trim() : undefined;
  }
  if (!name) {
    const first = lines.find(l => /[A-Za-z]/.test(l) && !/\d/.test(l) && l.split(/\s+/).length <= 5);
    if (first) name = first;
  }

  return { text, fields: { name, email, phone } };
}