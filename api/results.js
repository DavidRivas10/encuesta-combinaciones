const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
async function redis(command){
  if(!redisUrl||!redisToken) throw new Error("storage_not_configured");
  const r=await fetch(redisUrl,{method:"POST",headers:{Authorization:`Bearer ${redisToken}`,"Content-Type":"application/json"},body:JSON.stringify(command)});
  if(!r.ok) throw new Error("redis_error"); return r.json();
}
export default async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({message:"Método no permitido"});
  try{
    const out=await redis(["HGETALL","poll:counts"]);
    const arr=Array.isArray(out.result)?out.result:[]; const counts={};
    for(let i=0;i<arr.length;i+=2) counts[arr[i]]=Number(arr[i+1]||0);
    const total=Object.values(counts).reduce((a,b)=>a+b,0);
    res.setHeader("Cache-Control","no-store");
    return res.status(200).json({counts,total});
  }catch(e){
    if(e.message==="storage_not_configured") return res.status(503).json({message:"Almacenamiento no configurado"});
    console.error(e);return res.status(500).json({message:"No se pudieron cargar los resultados"});
  }
}