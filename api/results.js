const SUPABASE_URL = "https://czxodxdafflgencvnjgg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eG9keGRhZmZsZ2VuY3ZuamdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTc0OTQsImV4cCI6MjA5MzkzMzQ5NH0.N_gRGz18zdhNmq250vYV4vvJPCbv8xWWaRnkn5SzttU";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Método no permitido" });
  try {
    const r = await fetch(SUPABASE_URL + "/rest/v1/rpc/poll_results", {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
      },
      body: "{}"
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("Supabase results error:", data);
      return res.status(503).json({ message: "Resultados temporalmente no disponibles." });
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "No se pudieron cargar los resultados." });
  }
}
