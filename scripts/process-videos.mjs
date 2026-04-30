import fs from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

// Must use dynamic import/require for ffmpeg to work with static paths
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegPath);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VIDEOS_DIR = path.join(PROJECT_ROOT, 'videos');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'videos');

// Create output dir
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Map Room Types to existing video files
const videoMap = {
    'masterbedroom': "Luxury Bedroom Reveal! 2025 Dream Setup.mp4",
    'kids': "Small Kids Bedroom Design _ Space Design _ Blue theme _ 2025 Trending Kids bedroom _ #kids.mp4",
    'kitchen': "300 Stylish Modular Kitchen Designs 2026 _ Top Modern Kitchen Remodeling Ideas_ Home Interior Design.mp4",
    'living': "101 Modern Living Room Interior Design Trends You Need to Know.mp4",
    'dining': "100 Stylish Modern Dining Room Design Ideas 2026 _ New Wooden Dining Tables & Home Interior Trends.mp4",
    'bathroom': "Bathroom Design IDEAS You MUST See Before 2026!.mp4",
    'gym': "100+ Latest Gym Design Ideas _ Luxury gym light design _ Gymnasium Interior Collection 2022 _ I.A.S..mp4",
    'theatre': "Ultimate Home Theater Experience _ Private Cinema at Home #luxury #cinema.mp4",
    'pooja': "Top10 Pooja Room Designs 2024 Mandir Designs_ Morden Latest pooja room design #viral #puja #temple.mp4",
    'garden': "Impressive Garden _ GARDEN _ Great Home Ideas.mp4",
    'terrace': "Most Beautiful Terrace Garden Design of 2025 🌿 _ #TerraceGarden #HomeRenovation.mp4",
    'balcony': "Top 15 Balcony Decor Ideas for 2025 _ Transform Your Outdoor Space _ Balcony Design Trends.mp4",
};

const MUSIC_PATH = path.join(PROJECT_ROOT, 'music.mp3');

function processVideo(type, filename) {
    return new Promise((resolve, reject) => {
        const inputPath = path.join(VIDEOS_DIR, filename);
        const outputPath = path.join(OUTPUT_DIR, `room_${type}.mp4`);

        if (!fs.existsSync(inputPath)) {
            console.warn(`WARNING: Input video not found for ${type}: ${inputPath}`);
            return resolve();
        }

        if (fs.existsSync(outputPath)) {
            console.log(`Skipping ${type}, output already exists.`);
            return resolve();
        }

        console.log(`Processing ${type} -> Crop bottom captions, replace audio...`);

        ffmpeg()
            .input(inputPath)
            .input(MUSIC_PATH)
            // Crop 15% off the bottom to remove typical Shorts/TikTok captions.
            // Scale only down if the source is larger than 1080p to preserve source quality.
            .complexFilter([
                '[0:v]scale=if(gt(iw,1920),1920,iw):-2[scaled]',
                '[scaled]crop=iw:ih*0.85:0:0[v]'
            ])
            .outputOptions([
                '-map [v]',
                '-map 1:a:0',
                '-c:v libx264',
                '-profile:v high',
                '-level 4.2',
                '-preset medium', // Better quality at reasonable speed
                '-crf 20',        // Higher visual quality
                '-pix_fmt yuv420p',
                '-c:a aac',
                '-b:a 192k',
                '-shortest'       // Stop when video ends (music is longer)
            ])
            .save(outputPath)
            .on('end', () => {
                console.log(`Finished processing: ${type}`);
                resolve();
            })
            .on('error', (err) => {
                console.error(`Error processing ${type}:`, err.message);
                reject(err);
            });
    });
}

async function run() {
    try {
        console.log("Starting video processing pipeline...");

        if (!fs.existsSync(MUSIC_PATH)) {
            throw new Error("Music file not found: " + MUSIC_PATH);
        }

        // Process sequentially to not heavily overload the CPU
        for (const [type, filename] of Object.entries(videoMap)) {
            await processVideo(type, filename);
        }

        console.log("All videos processed successfully!");
    } catch (err) {
        console.error("Critical Failure:", err);
        process.exit(1);
    }
}

run();
