import crypto from "node:crypto";

const SUPABASE_URL = "https://czxodxdafflgencvnjgg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eG9keGRhZmZsZ2VuY3ZuamdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTc0OTQsImV4cCI6MjA5MzkzMzQ5NH0.N_gRGz18zdhNmq250vYV4vvJPCbv8xWWaRnkn5SzttU";

const clean = (s) => String(s || "").trim().replace(/\s+/g, " ");
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Método no permitido" });

  const firstName = clean(req.body?.firstName);
  const lastName = clean(req.body?.lastName);
  const option = Number(req.body?.option);
  const deviceId = clean(req.body?.deviceId);

  if (firstName.length < 2 || lastName.length < 2) {
    return res.status(400).json({ message: "Nombre y apellido son obligatorios." });
  }
  if (!Number.isInteger(option) || option < 1 || option > 10) {
    return res.status(400).json({ message: "Opción inválida." });
  }
  if (deviceId.length < 8) {
    return res.status(400).json({ message: "Identificador del dispositivo inválido." });
  }

  try {
    const r = await fetch(SUPABASE_URL + "/rest/v1/rpc/cast_vote", {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        p_first_name: firstName,
        p_last_name: lastName,
        p_option: option,
        p_device_hash: sha256(deviceId)
      })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("Supabase vote error:", data);
      return res.status(503).json({ message: "El servicio de votos se está inicializando. Intenta nuevamente en un momento." });
    }
    if (data?.ok === false && data?.code === "duplicate") {
      return res.status(409).json({ message: "Ya existe un voto registrado con este nombre/apellido o desde este dispositivo." });
    }
    if (data?.ok === false) {
      return res.status(400).json({ message: "No fue posible registrar este voto." });
    }
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "No se pudo guardar el voto." });
  }
}
