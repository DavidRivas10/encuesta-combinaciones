import crypto from "node:crypto";

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(command) {
  if (!redisUrl || !redisToken) throw new Error("storage_not_configured");
  const r = await fetch(redisUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error("redis_error");
  return r.json();
}
const clean=s=>String(s||"").trim().replace(/\s+/g," ");
const key=s=>crypto.createHash("sha256").update(s.toLowerCase()).digest("hex");

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({message:"Método no permitido"});
  try{
    const firstName=clean(req.body?.firstName), lastName=clean(req.body?.lastName);
    const option=String(req.body?.option||""), deviceId=clean(req.body?.deviceId);
    if(firstName.length<2 || lastName.length<2) return res.status(400).json({message:"Nombre y apellido son obligatorios."});
    if(!/^(10|[1-9])$/.test(option)) return res.status(400).json({message:"Opción inválida."});
    if(deviceId.length<8) return res.status(400).json({message:"Identificador de dispositivo inválido."});

    const fullName=`${firstName} ${lastName}`;
    const nameKey=`poll:voter:name:${key(fullName)}`;
    const deviceKey=`poll:voter:device:${key(deviceId)}`;
    const lua=`
      if redis.call('EXISTS', KEYS[1]) == 1 or redis.call('EXISTS', KEYS[2]) == 1 then return 0 end
      redis.call('SET', KEYS[1], ARGV[1])
      redis.call('SET', KEYS[2], ARGV[1])
      redis.call('HINCRBY', KEYS[3], ARGV[1], 1)
      redis.call('HSET', KEYS[4], ARGV[2], cjson.encode({name=ARGV[3],option=ARGV[1],at=ARGV[4]}))
      return 1
    `;
    const voterHash=key(fullName);
    const out=await redis(["EVAL",lua,"4",nameKey,deviceKey,"poll:counts","poll:voters",option,voterHash,fullName,new Date().toISOString()]);
    if(Number(out.result)!==1) return res.status(409).json({message:"Ya existe un voto de esta persona o dispositivo."});
    return res.status(201).json({ok:true});
  }catch(e){
    if(e.message==="storage_not_configured") return res.status(503).json({message:"El almacenamiento de votos aún no está configurado."});
    console.error(e);return res.status(500).json({message:"No se pudo guardar el voto."});
  }
}