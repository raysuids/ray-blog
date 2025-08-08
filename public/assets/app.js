// 列表 / 搜尋 / 分頁 + 動畫
const $ = (s)=>document.querySelector(s);
const postsEl = $('#posts');
const prevBtn = $('#prev');
const nextBtn = $('#next');
const yearEl = document.getElementById('y');
const qInp = document.getElementById('q');
const qBtn = document.getElementById('search');
if(yearEl) yearEl.textContent = new Date().getFullYear();

let page = 1, pageSize = 9, total = 0, mode = 'list';

async function load(){
  let url = `/api/posts?page=${page}&page_size=${pageSize}`;
  if(mode==='search'){
    const q = encodeURIComponent(qInp.value.trim());
    url = `/api/search?q=${q}`;
  }
  const r = await fetch(url);
  const d = await r.json().catch(()=>({items:[], total:0}));
  total = d.total || (d.items?.length || 0);
  postsEl.innerHTML = (d.items||[]).map(p => `
    <article class="card post-card" data-animate onclick="location.href='/post.html?id=${p.id}'">
      <h3 class="post-title">${p.title}</h3>
      <div class="post-meta">${new Date(p.created_at).toLocaleString()}</div>
      <div class="post-excerpt">${(p.content||'').slice(0,140).replace(/</g,'&lt;')}...</div>
    </article>
  `).join('') || '<p>沒有結果。</p>';
  const els = document.querySelectorAll('[data-animate]');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); } });
  },{threshold:0.12});
  els.forEach(el=>io.observe(el));
  prevBtn?.classList.toggle('hide', mode==='search');
  nextBtn?.classList.toggle('hide', mode==='search');
  prevBtn.disabled = page<=1;
  nextBtn.disabled = page*pageSize >= total;
}

prevBtn?.addEventListener('click', ()=>{ if(page>1){ page--; load(); }});
nextBtn?.addEventListener('click', ()=>{ if(page*pageSize<total){ page++; load(); }});
qBtn?.addEventListener('click', ()=>{ mode='search'; load(); });
qInp?.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ mode='search'; load(); } });

if(postsEl) load();
