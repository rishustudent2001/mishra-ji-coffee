MISHRA JI COFFEE WITH NEWS — NETLIFY PACKAGE

Is package mein website aur news backend dono hain. Website ka main page index.html hai; Netlify Function RSS feeds server-side fetch karega. Alag Cloudflare Worker ki zarurat nahi.

NETLIFY PAR DEPLOY KARNE KA AASAN TARIKA
1. ZIP extract karein. Folder ke andar index.html, netlify.toml aur netlify/functions/news.mjs hone chahiye.
2. Netlify par login karein: https://app.netlify.com/
3. “Add new site” / “Deploy manually” option kholein. Agar manual drag-and-drop deploy aapke account UI mein functions build/deploy nahi karta, to GitHub method use karein (recommended):
   a. Is folder ke saare contents ek GitHub repository mein upload karein.
   b. Netlify mein Add new site → Import an existing project → GitHub repo select karein.
   c. Build command blank chhodein; Publish directory `.` rakhein. netlify.toml bhi ye settings set karta hai.
   d. Deploy site par click karein.
4. Deploy hone ke baad apni site URL par ye test kholein:
   `https://YOUR-SITE.netlify.app/.netlify/functions/news?category=ghaziabad&lang=hi`
   JSON mein `items` array aaye to backend response kar raha hai. `/.netlify/functions/news/health` health check hai.
5. Site homepage kholein, Hindi/English switch karein, India, Ghaziabad, UP aur World categories check karein. Refresh bhi test karein.

IMPORTANT
- Backend URL HTML mein manually bharna nahi hai; site same-origin `/.netlify/functions/news` endpoint use karti hai.
- Agar deploy drag-and-drop se functions deploy na hon, GitHub-connected deploy use karein. Netlify Functions ke liye project source aur `netlify/functions` directory build ke dauran available honi chahiye.
- Ye package Netlify par deploy nahi kiya gaya hai; live RSS feed access publisher/network ke hisab se fail ya change ho sakta hai. Agar ek feed fail ho to baaki configured feeds se headlines aa sakti hain.
- News source links headlines ke saath diye jaate hain. RSS terms/attribution ka dhyan rakhein, especially public/commercial use mein.
- API key ki zarurat nahi hai; RSS sources use ho rahe hain.
