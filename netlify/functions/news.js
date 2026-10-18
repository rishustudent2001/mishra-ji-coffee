/** Mishra Ji Coffee with News — Netlify Function RSS aggregator.
 * Public RSS feeds only; no API key required. Returns normalized headlines.
 */
const ALLOWED_CATEGORIES = new Set(['top','india','ghaziabad','up','world','business','tech','sports','entertainment','health']);
const FEEDS = {
  hi: {
    top: ['https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi','https://api.livehindustan.com/feeds/rss/ncr/ghaziabad/rssfeed.xml','https://api.livehindustan.com/feeds/rss/uttar-pradesh/rssfeed.xml'],
    india: ['https://news.google.com/rss/headlines/section/geo/India?hl=hi&gl=IN&ceid=IN:hi'],
    ghaziabad: ['https://api.livehindustan.com/feeds/rss/ncr/ghaziabad/rssfeed.xml','https://www.amarujala.com/rss/ghaziabad.xml','https://news.google.com/rss/search?q=Ghaziabad&hl=hi&gl=IN&ceid=IN:hi'],
    up: ['https://api.livehindustan.com/feeds/rss/uttar-pradesh/rssfeed.xml','https://www.amarujala.com/rss/uttar-pradesh.xml','https://news.google.com/rss/search?q=Uttar+Pradesh&hl=hi&gl=IN&ceid=IN:hi'],
    world: ['https://news.google.com/rss/headlines/section/topic/WORLD?hl=hi&gl=IN&ceid=IN:hi'],
    business: ['https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=hi&gl=IN&ceid=IN:hi'],
    tech: ['https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=hi&gl=IN&ceid=IN:hi'],
    sports: ['https://news.google.com/rss/headlines/section/topic/SPORTS?hl=hi&gl=IN&ceid=IN:hi'],
    entertainment: ['https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=hi&gl=IN&ceid=IN:hi'],
    health: ['https://news.google.com/rss/headlines/section/topic/HEALTH?hl=hi&gl=IN&ceid=IN:hi']
  },
  en: {
    top: ['https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en','https://news.google.com/rss/headlines/section/geo/India?hl=en-IN&gl=IN&ceid=IN:en'],
    india: ['https://news.google.com/rss/headlines/section/geo/India?hl=en-IN&gl=IN&ceid=IN:en'],
    ghaziabad: ['https://news.google.com/rss/search?q=Ghaziabad&hl=en-IN&gl=IN&ceid=IN:en'],
    up: ['https://news.google.com/rss/search?q=Uttar+Pradesh&hl=en-IN&gl=IN&ceid=IN:en'],
    world: ['https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-IN&gl=IN&ceid=IN:en'],
    business: ['https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en'],
    tech: ['https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en'],
    sports: ['https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-IN&gl=IN&ceid=IN:en'],
    entertainment: ['https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-IN&gl=IN&ceid=IN:en'],
    health: ['https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-IN&gl=IN&ceid=IN:en']
  }
};
const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=120, s-maxage=180'};
function json(data,status=200){ return new Response(JSON.stringify(data),{status,headers}); }
function decodeEntities(s='') {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));
}
function tag(xml,name){const re=new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i');const m=xml.match(re);return m?decodeEntities(m[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()):'';}
function parseFeed(xml,feedUrl){
  const entries=xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi)||xml.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi)||[];
  return entries.map(entry=>{
    const title=tag(entry,'title');let link=tag(entry,'link');
    if(!link){const lm=entry.match(/<link[^>]+href=["']([^"']+)["']/i);if(lm)link=decodeEntities(lm[1]);}
    const date=tag(entry,'pubDate')||tag(entry,'published')||tag(entry,'updated');const raw=tag(entry,'description')||tag(entry,'summary')||tag(entry,'content');
    const description=raw.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,420);
    const source=tag(entry,'source')||(()=>{try{return new URL(feedUrl).hostname.replace(/^www\./,'')}catch{return 'News source'}})();
    const im=entry.match(/<media:content[^>]+url=["']([^"']+)['"]|<enclosure[^>]+url=["']([^"']+)['"]/i);
    let pubDate=new Date().toISOString();if(date){const parsed=new Date(date);if(!Number.isNaN(parsed.getTime()))pubDate=parsed.toISOString();}
    return {title,link,pubDate,description,img:im?(im[1]||im[2]):null,source};
  }).filter(x=>x.title&&/^https?:\/\//i.test(x.link));
}
async function fetchFeed(url){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),7500);
  try{const r=await fetch(url,{signal:controller.signal,headers:{'User-Agent':'MishraJiCoffeeWithNews/1.0 (RSS reader)'}});if(!r.ok)throw new Error(`Feed returned ${r.status}`);const xml=await r.text();if(!/<rss\b|<feed\b|<rdf:RDF\b/i.test(xml))throw new Error('Not an RSS/Atom feed');return parseFeed(xml,url);}
  finally{clearTimeout(timer);}
}
export default async (request) => {
  const url=new URL(request.url);
  if(request.method!=='GET')return json({error:'GET only'},405);
  if(url.pathname.endsWith('/health'))return json({ok:true,service:'Mishra Ji Coffee with News',time:new Date().toISOString()});
  const category=(url.searchParams.get('category')||'top').toLowerCase();const lang=url.searchParams.get('lang')==='en'?'en':'hi';
  if(!ALLOWED_CATEGORIES.has(category))return json({error:'Unknown category',allowed:[...ALLOWED_CATEGORIES]},400);
  const feeds=FEEDS[lang][category]||FEEDS[lang].top;const results=await Promise.allSettled(feeds.map(fetchFeed));
  const items=results.flatMap(r=>r.status==='fulfilled'?r.value:[]).sort((a,b)=>new Date(b.pubDate)-new Date(a.pubDate));const seen=new Set();
  const unique=items.filter(item=>{const key=item.title.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();if(!key||seen.has(key))return false;seen.add(key);return true;}).slice(0,40);
  if(!unique.length)return json({items:[],category,lang,updatedAt:new Date().toISOString(),warning:'Configured RSS feeds returned no items. Retry shortly.'},502);
  return json({items:unique,category,lang,updatedAt:new Date().toISOString(),feedsAttempted:feeds.length,feedsSucceeded:results.filter(r=>r.status==='fulfilled').length});
};
