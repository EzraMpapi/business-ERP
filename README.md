# BusinessSphere ERP v2.0

## Deploy to Netlify
```bash
npm install && npm run build
# drag dist/ to netlify.com/drop
```

## Deploy to Vercel
```bash
npm install -g vercel && vercel --prod
```

## Local Dev
```bash
npm install && npm run dev
```

## Connect Supabase
Edit src/shared/supabase.js:
```
const SUPABASE_URL = "https://YOUR.supabase.co";
const SUPABASE_ANON_KEY = "your-key";
```
