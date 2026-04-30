import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../middleware/auth.js';
import { getDB } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const db = await getDB();
    const { category, style, customPrompt } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    console.log(`[Smart Generate] Processing image for user ${req.user.id}, category: ${category}, style: ${style}`);

    const imageBytes = fs.readFileSync(req.file.path);
    const imageBase64 = imageBytes.toString('base64');
    const imageMimeType = req.file.mimetype;

    // Hardcode some beautiful responsive designs (Heuristic generation)
    const designs = [
      {
        title: 'Modern Oasis',
        styleTag: 'Modern',
        description: `A clean, minimalist ${category || 'room'} featuring sleek lines and contemporary lighting.`
      },
      {
        title: 'Rustic Retreat',
        styleTag: 'Rustic',
        description: `A warm, inviting ${category || 'space'} with natural wood elements and cozy textures.`
      },
      {
        title: 'Coastal Serenity',
        styleTag: 'Coastal',
        description: `Light, airy ${category || 'interior'} with soft blues and sandy tones for a relaxing vibe.`
      },
      {
        title: 'Luxury Elevation',
        styleTag: 'Luxury',
        description: `Premium materials and sophisticated finishes transform this ${category || 'room'} into a lavish retreat.`
      },
      {
        title: 'Industrial Edge',
        styleTag: 'Industrial',
        description: `Urban inspired ${category || 'room'} with raw materials like brick, metal, and concrete.`
      },
      {
        title: 'Boho Chic',
        styleTag: 'Bohemian',
        description: `Eclectic and relaxed ${category || 'environment'} with layered patterns and plants.`
      }
    ];

    // Static URLs for the generated images to simulate an image rendering engine
    const generatedImages = [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1024&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55dd1b4279c?w=1024&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1024&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1024&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7eaa511?w=1024&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1024&q=80'
    ];


    await db.run(
      `INSERT INTO projects (userId, category, style, prompts, images, originalImage)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        category || 'room',
        style || 'Modern',
        JSON.stringify(designs.map(d => d.description)),
        JSON.stringify(generatedImages),
        `data:${imageMimeType};base64,${imageBase64}`
      ]
    );

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      designs,
      images: generatedImages,
      originalImage: `data:${imageMimeType};base64,${imageBase64}`
    });

  } catch (error) {
    console.error('[Smart Generate] Error:', error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: 'Generation failed', message: error.message });
  }
});

router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const db = await getDB();
    const projects = await db.all(
      `SELECT id, category, style, prompts, images, originalImage, createdAt 
       FROM projects 
       WHERE userId = ? 
       ORDER BY createdAt DESC`,
      [req.user.id]
    );

    const formattedProjects = projects.map(p => ({
      ...p,
      prompts: p.prompts ? JSON.parse(p.prompts) : [],
      images: p.images ? JSON.parse(p.images) : []
    }));

    res.json({ success: true, projects: formattedProjects });
  } catch (error) {
    console.error('[Smart Generate] Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

export default router;
