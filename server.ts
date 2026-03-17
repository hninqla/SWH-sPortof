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

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- API Routes (Daftarkan secara langsung agar aktif di Vercel) ---

app.get("/api/portfolio", async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    return res.json(data);
  }
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error("Supabase fetch error:", err.message);
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    res.json(data);
  }
});

app.post("/api/portfolio", async (req, res) => {
  const { username, password, projects } = req.body;
  // Login case-insensitive untuk username
  if (username?.toLowerCase() === "admin" && password === "admin123") {
    const supabase = getSupabase();
    if (!supabase) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2));
      return res.json({ message: "Success (Saved Locally)" });
    }
    try {
      await supabase.from("projects").delete().neq("id", 0);
      const projectsToInsert = projects.map(({ id, created_at, ...rest }: any) => rest);
      await supabase.from("projects").insert(projectsToInsert);
      res.json({ message: "Success (Saved to Supabase)" });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to save to Supabase" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  console.log("--- Login Request ---");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  const cleanUsername = username?.toString().trim().toLowerCase();
  const cleanPassword = password?.toString().trim();

  if (!cleanUsername || !cleanPassword) {
    return res.status(400).json({ 
      success: false, 
      message: "Username and password are required" 
    });
  }

  if (cleanUsername === "admin" && cleanPassword === "admin123") {
    console.log("Login SUCCESS for:", cleanUsername);
    return res.json({ success: true });
  } else {
    console.log("Login FAILED for:", cleanUsername);
    return res.status(401).json({ 
      success: false, 
      message: "Username atau password salah" 
    });
  }
});

// --- Vite / Static Files Setup ---

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Di Vercel, file statis biasanya ditangani oleh Vercel Edge, 
    // tapi kita tetap siapkan fallback di sini.
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }
}

// Jalankan server segera
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Setup Vite setelah server mulai mendengarkan
  setupVite().catch(err => {
    console.error("Vite setup failed:", err);
  });
});

export default app;
