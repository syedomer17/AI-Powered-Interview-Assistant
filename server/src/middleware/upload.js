import multer from 'multer';

const storage = multer.memoryStorage();
const FILE_LIMIT_MB = 5;

function fileFilter(_req, file, cb){
  const ok = ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (ok.includes(file.mimetype) || /\.(pdf|docx)$/i.test(file.originalname)) return cb(null, true);
  cb(Object.assign(new Error('Only PDF/DOCX files allowed'), { status: 400 }));
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: FILE_LIMIT_MB * 1024 * 1024 } });