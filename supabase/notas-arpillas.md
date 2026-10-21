# Notas y comandos útiles para Arpillas

### 1. Test curl a Supabase REST
```bash
curl -s "https://kdbndyathjbdxkekltxp.supabase.co/rest/v1/arp_envios?select=*" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkYm5keWF0aGpiZHhrZWtsdHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MTkwOTksImV4cCI6MjEwMTI5NTA5OX0.yiwmcbTezDr0_3om-ZRAZvfo0nEKiUZXZz3um0gvkls"
```

### 2. Regenerar tipos de TypeScript desde Supabase
```bash
npx supabase gen types typescript --project-id kdbndyathjbdxkekltxp > src/lib/supabase/database.types.ts
```

### 3. Generar HMAC para el PIN de una ubicación
```bash
set -a; source .env.local; set +a
node -e "const c=require('crypto'); \
console.log(c.createHmac('sha256', process.env.ARP_SESSION_SECRET) \
.update('pin:4821').digest('hex'))"
```
