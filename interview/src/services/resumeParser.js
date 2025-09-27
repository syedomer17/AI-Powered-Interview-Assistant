import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import mammoth from "mammoth";
import fs from "fs/promises";
import path from "path";

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phoneRegex = /(\+?\d[\d\s\-()]{7,}\d)/;

const nameHeuristic = text => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  // Look for potential name patterns
  for (const line of lines) {
    // Skip lines that are too long, contain email, or have common non-name patterns
    if (line.length > 50 || 
        line.includes("@") || 
        line.includes("http") ||
        line.includes("www.") ||
        line.toLowerCase().includes("resume") ||
        line.toLowerCase().includes("curriculum") ||
        /^\d+/.test(line) || // starts with number
        line.includes(":")) {
      continue;
    }
    
    const words = line.split(/\s+/).filter(w => w.length > 0);
    
    // Look for 2-4 words that could be a name
    if (words.length >= 2 && words.length <= 4) {
      // Check if words look like name parts (start with capital letter, no special chars)
      const isNameLike = words.every(word => 
        /^[A-Z][a-z]+$/.test(word) || /^[A-Z]\.?$/.test(word)
      );
      
      if (isNameLike) {
        return line;
      }
    }
  }
  
  // Fallback: return first line that's not too long and doesn't contain common non-name patterns
  return lines.find(l => 
    l.length <= 30 && 
    !l.includes("@") && 
    !l.toLowerCase().includes("resume") &&
    l.split(" ").length <= 4
  ) || "";
};



export async function extractResumeData(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    let raw = "";

    if (ext === ".pdf") {
      try {
        const fileBuffer = await fs.readFile(filePath);
        const loadingTask = pdfjs.getDocument({
          data: fileBuffer,
          useSystemFonts: true
        });
        const pdf = await loadingTask.promise;
        
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          text += pageText + ' ';
        }
        raw = text;
      } catch (pdfError) {
        console.warn("PDF parsing failed:", pdfError.message);
        // Provide a more user-friendly error message
        raw = `Failed to extract text from PDF. The file may be corrupted, password-protected, or image-based. Please try uploading a DOCX file instead.`;
      }
    } else if (ext === ".docx") {
      const { value } = await mammoth.extractRawText({ path: filePath });
      raw = value;
    } else {
      raw = await fs.readFile(filePath, "utf-8");
    }

    if (!raw || raw.trim().length === 0) {
      throw new Error("No text content found in the file");
    }

    const email = raw.match(emailRegex)?.[0] || "";
    const phone = raw.match(phoneRegex)?.[0] || "";
    const name = nameHeuristic(raw) || "";

    return {
      rawText: raw,
      extracted: { 
        name: name.trim(), 
        email: email.trim(), 
        phone: phone.trim() 
      }
    };
  } catch (error) {
    console.error("Resume parsing error:", error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}
