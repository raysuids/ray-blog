// 列表 / 分頁 + 讀取站點設定（含 hero 圖片）
const $ = (s)=>document.querySelector(s);
const postsEl = $('#posts');
const prevBtn = $('#prev');
const nextBtn = $('#next');
const yearEl = document.getElementById('y');
const docTitle = document.getElementById('docTitle');
const siteTitle = document.getElementById('siteTitle');
const siteSubtitle = document.getElementById('siteSubtitle');
const heroImage = document.getElementById('heroImage');
if(yearEl) yearEl.textContent = new Date().getFullYear();

let page = 1, pageSize = 9, total = 0;

async function loadSettings(){
  try{
    const r = await fetch('/api/settings');
    const d = await r.json().catch(()=>({}));
    const t = d.site_title || '我的部落格';
    const s = d.site_subtitle || '分享想法與記錄';
    if(docTitle) docTitle.textContent = t;
    if(siteTitle) siteTitle.textContent = t;
    if(siteSubtitle) siteSubtitle.textContent = s;
    if(heroImage){
      if(d.hero_image){ heroImage.src = d.hero_image; heroImage.style.display=''; }
      else { heroImage.style.display='none'; }
    }
  }catch{}
}

async function load(){
  const url = `/api/posts?page=${page}&page_size=${pageSize}`;
  const r = await fetch(url);
  const d = await r.json().catch(()=>({items:[], total:0}));
  total = d.total || 0;
  postsEl.innerHTML = (d.items||[]).map(p => `
    <article class="card post-card" data-animate onclick="location.href='/post.html?id=${p.id}'">
      <h3 class="post-title">${p.title}</h3>
      <div class="post-meta">${new Date(p.created_at).toLocaleString()}</div>
      ${p.cover_url ? `<img class="post-cover" src="${p.cover_url}" alt="封面"/>` : ''}
    </article>
  `).join('') || '<p class="muted">目前還沒有文章。</p>';
  const els = document.querySelectorAll('[data-animate]');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); } });
  },{threshold:0.12});
  els.forEach(el=>io.observe(el));
  prevBtn.disabled = page<=1;
  nextBtn.disabled = page*pageSize >= total;
}

prevBtn?.addEventListener('click', ()=>{ if(page>1){ page--; load(); }});
nextBtn?.addEventListener('click', ()=>{ if(page*pageSize<total){ page++; load(); }});

if(postsEl){ loadSettings(); load(); }
