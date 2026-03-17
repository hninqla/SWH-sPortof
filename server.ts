import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const DATA_FILE = path.join(process.cwd(), "portfolio-data.json");

// Initial data if file doesn't exist
const initialData = [
  { 
    title: "Tugas Informatika 1", 
    category: "Kelas X", 
    desc: "Deskripsi tugas pertama saya di kelas X.", 
    imageUrl: "https://picsum.photos/seed/shafdil1/800/600",
    targetUrl: "https://google.com",
    owner: "Shafdil"
  },
  { 
    title: "Proyek Web Wawa", 
    category: "Kelas XI", 
    desc: "Pengembangan website interaktif.", 
    imageUrl: "https://picsum.photos/seed/wawa1/800/600",
    targetUrl: "https://google.com",
    owner: "Wawa"
  },
  { 
    title: "Desain Hanin", 
    category: "Kelas XII", 
    desc: "Karya desain grafis akhir tahun.", 
    imageUrl: "https://picsum.photos/seed/hanin1/800/600",
    targetUrl: "https://google.com",
    owner: "Hanin"
  }
];

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

let supabaseClient: any = null;

function getSupabase() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  
  if (!url || !key) return null;

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key);
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
      return null;
    }
  }
  return supabaseClient;
}

const app = express();
const PORT = 3000;

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// --- Health Check ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Vite / Static Files Setup ---

async function setupVite(app: express.Application) {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }
}

// Error handler global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Jalankan server
setupVite(app).then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start server:", err);
});

export default app;
