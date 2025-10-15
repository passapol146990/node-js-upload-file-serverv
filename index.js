import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// โฟลเดอร์เก็บไฟล์
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ตั้งค่า multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = uuidv4();
    cb(null, `${id}${ext}`);
  },
});
const upload = multer({ storage });

// ✅ โหลดไฟล์ทั้งหมด
app.get("/files", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: "ไม่สามารถอ่านโฟลเดอร์ได้" });
    res.json({ files });
  });
});

// ✅ อัปโหลดไฟล์
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์" });
  }
  res.json({
    message: "อัปโหลดไฟล์สำเร็จ",
    filename: req.file.filename,
    originalname: req.file.originalname,
    url: `/file/${req.file.filename}`,
  });
});

// ✅ โหลดไฟล์ตามชื่อ (id)
app.get("/file/:id", (req, res) => {
  const filePath = path.join(uploadDir, req.params.id);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "ไม่พบไฟล์" });
  }
  res.sendFile(filePath);
});

// ✅ ลบไฟล์
app.delete("/file/:id", (req, res) => {
  const filePath = path.join(uploadDir, req.params.id);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "ไม่พบไฟล์" });
  }

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: "ลบไฟล์ไม่สำเร็จ" });
    res.json({ message: "ลบไฟล์สำเร็จ", filename: req.params.id });
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
