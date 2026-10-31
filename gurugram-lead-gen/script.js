/* AAJneeti · Gurugram lead generation page interactions */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isDesktop = () => window.innerWidth > 1024;

  /* ---------- Text splitting ---------- */
  $$('[data-split]').forEach(el => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(/\s+/).map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`).join(' ');
  });
  $$('.hero__title .wd').forEach((w, i) => { w.innerHTML = `<span style="--i:${i}">${esc(w.textContent)}</span>`; });

  /* ---------- Count up ---------- */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = 1;
    const to = parseFloat(el.dataset.count ?? el.dataset.num);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const fmt = v => dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN');
    if (reduce) { el.textContent = fmt(to); return; }
    const dur = 1800, t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Preloader → hero entrance ---------- */
  const hero = $('.hero');
  const startHero = () => {
    hero.classList.add('is-in');
    $$('[data-count]', hero).forEach(el => setTimeout(() => countUp(el), 700));
    setTimeout(() => hero.classList.add('is-settled'), 2300);
  };
  const loader = $('.loader');
  if (loader && !reduce) {
    document.body.classList.add('is-loading');
    const out = $('#loaderCount');
    let n = 0;
    const t = setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 8));
      out.textContent = n;
      if (n >= 100) {
        clearInterval(t);
        setTimeout(() => {
          loader.classList.add('is-done');
          document.body.classList.remove('is-loading');
          setTimeout(startHero, 200);
          setTimeout(() => loader.remove(), 1300);
        }, 200);
      }
    }, 40);
  } else {
    loader && loader.remove();
    startHero();
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal], [data-split], .logos').forEach(el => { if (!el.closest('.hero')) io.observe(el); });
  $$('.hero [data-reveal]').forEach(el => setTimeout(() => el.classList.add('is-in'), 0));
  $$('.logos figure').forEach((f, i) => f.style.setProperty('--i', i));

  /* ---------- Marquees ---------- */
  const logoTrack = $('#logoTrack');
  if (logoTrack) {
    const figs = $$('#logoGrid figure');
    for (let r = 0; r < 2; r++) figs.forEach(f => {
      const c = f.cloneNode(true);
      c.removeAttribute('style');
      $('img', c).loading = 'eager';
      logoTrack.appendChild(c);
    });
  }
  $$('.strip__track').forEach(t => { t.innerHTML += t.innerHTML + t.innerHTML; });

  /* ---------- Element refs for the scroll loop ---------- */
  const nav = $('#nav');
  const prog = $('.progress span');
  const totop = $('.totop');
  const splitPhoto = $('.split__photo');
  const bigRows = $$('.bigtype__row');
  const bigSec = $('.bigtype');
  const srows = $$('.srow');
  srows.forEach((r, i) => r.style.setProperty('--k', i));
  const hs = $('#hscroll'), htrack = $('#htrack'), hbar = $('.hscroll__bar span');
  const wordmark = $('.wordmark span');
  const navLinks = $$('.nav__links a').map(a => ({ a, sec: $(a.getAttribute('href')) })).filter(x => x.sec);

  function sizeHScroll() {
    if (!hs) return;
    if (isDesktop() && !reduce) {
      const dist = htrack.scrollWidth - window.innerWidth;
      hs.style.height = `${dist + window.innerHeight}px`;
    } else {
      hs.style.height = '';
      htrack.style.transform = '';
    }
  }

  let lastY = window.scrollY, ticking = false;
  function onScroll() {
    const y = window.scrollY, vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    nav.classList.toggle('is-scrolled', y > 40);
    if (!nav.classList.contains('is-open')) {
      if (y > 500 && y > lastY + 6) nav.classList.add('is-hidden');
      else if (y < lastY - 4) nav.classList.remove('is-hidden');
    }
    lastY = y;
    totop.classList.toggle('is-shown', y > vh * 1.5);

    navLinks.forEach(({ a, sec }) => {
      const r = sec.getBoundingClientRect();
      a.classList.toggle('is-current', r.top < 140 && r.bottom > 140);
    });

    if (!reduce) {
      // split image parallax
      if (splitPhoto) {
        const r = splitPhoto.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) splitPhoto.style.setProperty('--py', `${(r.top + r.height / 2 - vh / 2) * -0.12}px`);
      }

      // giant type slides with scroll
      if (bigSec) {
        const r = bigSec.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const p = (vh - r.top) / (vh + r.height);
          bigRows.forEach(row => { row.style.transform = `translateX(${(p - 0.5) * 40 * Number(row.dataset.shift)}vw)`; });
        }
      }

      // process rows: earlier cards shrink + dim as the next one stacks on top
      if (window.innerWidth > 760) {
        srows.forEach((row, i) => {
          const next = srows[i + 1];
          if (!next) return;
          const rr = row.getBoundingClientRect(), nr = next.getBoundingClientRect();
          const p = clamp((rr.bottom - nr.top) / rr.height);
          row.style.transform = `scale(${1 - p * 0.06})`;
          row.style.filter = `brightness(${1 - p * 0.45})`;
        });
      }

      // pinned horizontal gallery
      if (hs && isDesktop()) {
        const r = hs.getBoundingClientRect();
        const dist = htrack.scrollWidth - window.innerWidth;
        const p = clamp(-r.top / (r.height - vh));
        htrack.style.transform = `translate3d(${-p * dist}px,0,0)`;
        hbar.style.transform = `scaleX(${p})`;
      }

      // footer wordmark rises in
      if (wordmark) {
        const r = wordmark.parentElement.getBoundingClientRect();
        const p = clamp((vh - r.top) / r.height);
        wordmark.style.setProperty('--wy', `${(1 - p) * 40}%`);
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  window.addEventListener('resize', () => { sizeHScroll(); onScroll(); });
  window.addEventListener('load', () => { sizeHScroll(); onScroll(); });
  sizeHScroll(); onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $('.nav__burger');
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', nav.classList.toggle('is-open')));
  $$('.nav__mobile a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }));

  /* ---------- Cursor, hover image, magnetic, spotlight, tilt ---------- */
  const cursor = $('.cursor');
  const hImg = $('.hover-img'), hImgIn = $('.hover-img__in');
  let mx = innerWidth / 2, my = innerHeight / 2;
  if (finePointer && !reduce) {
    const dot = $('.cursor__dot'), ring = $('.cursor__ring');
    let rx = mx, ry = my, ix = mx, iy = my;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.opacity = 1; }, { passive: true });
    (function loop() {
      rx = lerp(rx, mx, 0.2); ry = lerp(ry, my, 0.2);
      ix = lerp(ix, mx, 0.12); iy = lerp(iy, my, 0.12);
      dot.style.transform = `translate(${mx}px,${my}px)`;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      hImg.style.transform = `translate(${ix + 40}px,${iy}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => cursor.classList.toggle('is-hover', !!e.target.closest('a, button, summary, input, select, label')));
    document.addEventListener('mouseleave', () => { cursor.style.opacity = 0; });

    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });

    $$('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1000px) rotateX(${py * -6}deg) rotateY(${px * 8}deg) translateY(-6px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }
  $$('.spot').forEach(el => el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* ---------- Hero: swirl follows the mouse, micro-market cycler ---------- */
  const swirl = $('.hero__swirl-in');
  if (finePointer && !reduce && swirl) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      swirl.style.setProperty('--sx', `${((e.clientX - r.left) / r.width - 0.5) * 60}px`);
      swirl.style.setProperty('--sy', `${((e.clientY - r.top) / r.height - 0.5) * 40}px`);
    });
  }
  const cyc = $('#cycler');
  const places = ['Golf Course Road', 'Golf Course Extension Road', 'Dwarka Expressway', 'Southern Peripheral Road', 'New Gurugram', 'Sohna Road'];
  if (cyc && !reduce) {
    let pi = 0;
    setInterval(() => {
      cyc.classList.add('is-out');
      setTimeout(() => {
        pi = (pi + 1) % places.length;
        cyc.textContent = places[pi];
        cyc.classList.remove('is-out');
        cyc.classList.add('is-in');
        void cyc.offsetWidth;
        cyc.classList.remove('is-in');
      }, 380);
    }, 2400);
  }

  /* ---------- Hero CRM: checks tick, then a qualified lead drops in ---------- */
  const checks = $$('.chk'), feed = $('#crmFeed'), crmCount = $('#crmCount');
  const sample = [
    ['Golf Course Ext. Rd', '₹3–4 Cr', '3 BHK'], ['Dwarka Expressway', '₹2–2.5 Cr', '2 BHK'],
    ['SPR', '₹4–5 Cr', '4 BHK'], ['New Gurugram', '₹1.5 Cr', '3 BHK'],
    ['Sohna Road', '₹1.2 Cr', '2 BHK'], ['Golf Course Road', '₹9 Cr+', 'Luxury'],
  ];
  let leadNo = 4817, si = 0, count = 128;
  function addLead() {
    const [area, budget, type] = sample[si++ % sample.length];
    const li = document.createElement('li');
    li.innerHTML = `<span class="av">#${String(leadNo).slice(-2)}</span><span>Lead #${leadNo++}<span class="meta">${area} · ${budget} · ${type}</span></span><span class="tag">Qualified</span>`;
    feed.prepend(li);
    while (feed.children.length > 3) feed.lastElementChild.remove();
    crmCount.textContent = ++count;
  }
  if (feed) {
    addLead(); addLead(); addLead();
    if (reduce) checks.forEach(c => c.classList.add('is-on'));
    else {
      const cycle = () => {
        checks.forEach(c => c.classList.remove('is-on'));
        checks.forEach((c, i) => setTimeout(() => c.classList.add('is-on'), 350 + i * 420));
        setTimeout(() => { addLead(); setTimeout(cycle, 1500); }, 350 + checks.length * 420 + 200);
      };
      setTimeout(cycle, 2200);
    }
  }

  /* ---------- Market tabs (auto-advance until the user picks one) ---------- */
  const tabs = $$('.tab'), panels = $$('.tp');
  let tabIdx = 0, tabTimer = null, userPicked = false;
  function showTab(i) {
    tabIdx = i;
    tabs.forEach((t, k) => { t.classList.toggle('is-active', k === i); t.setAttribute('aria-selected', k === i); });
    panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
    const num = $('[data-num]', panels[i]);
    if (num) { delete num.dataset.done; countUp(num); }
  }
  tabs.forEach((t, i) => t.addEventListener('click', () => { userPicked = true; clearInterval(tabTimer); showTab(i); }));
  const market = $('#market');
  if (market) new IntersectionObserver(([e]) => {
    clearInterval(tabTimer);
    if (e.isIntersecting && !userPicked && !reduce) {
      if (!market.dataset.seen) { market.dataset.seen = 1; showTab(0); }
      tabTimer = setInterval(() => showTab((tabIdx + 1) % tabs.length), 5000);
    }
  }, { threshold: 0.35 }).observe(market);

  /* ---------- Hotspots list: accordion + floating image preview ---------- */
  const hrows = $$('.hrow');
  hrows.forEach(row => {
    const head = $('.hrow__head', row);
    head.addEventListener('click', () => {
      const open = !row.classList.contains('is-open');
      hrows.forEach(r => { r.classList.remove('is-open'); $('.hrow__head', r).setAttribute('aria-expanded', 'false'); });
      if (open) { row.classList.add('is-open'); head.setAttribute('aria-expanded', 'true'); }
      hImg.classList.remove('is-on');
    });
    if (finePointer && !reduce) {
      head.addEventListener('mouseenter', () => {
        if (row.classList.contains('is-open')) return;
        hImgIn.style.setProperty('--pos', row.dataset.img);
        hImg.classList.add('is-on');
      });
      head.addEventListener('mouseleave', () => hImg.classList.remove('is-on'));
    }
  });

  /* ---------- FAQ: smooth open/close, one at a time ---------- */
  const qas = $$('.qa');
  function closeQa(d) {
    const b = $('.qa__a', d);
    if (reduce) { d.open = false; return; }
    b.animate([{ height: b.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => { d.open = false; };
  }
  qas.forEach(d => $('summary', d).addEventListener('click', e => {
    e.preventDefault();
    if (d.open) return closeQa(d);
    qas.forEach(o => o !== d && o.open && closeQa(o));
    d.open = true;
    if (!reduce) { const b = $('.qa__a', d); b.animate([{ height: '0px', opacity: 0 }, { height: b.scrollHeight + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' }); }
  }));

  /* ---------- Quote form ---------- */
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const form = $('#quoteForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = form.elements;
    const bad = {
      fullname: f.fullname.value.trim().length < 2,
      email: !emailOk(f.email.value.trim()),
      phone: !/^\d{7,13}$/.test(f.phone.value.replace(/\D/g, '')),
    };
    Object.entries(bad).forEach(([k, v]) => f[k].closest('.field').classList.toggle('is-error', v));
    if (Object.values(bad).some(Boolean)) return;
    // TODO: send to the real lead endpoint / CRM
    form.classList.add('is-sent');
  });
  $$('input', form).forEach(i => i.addEventListener('input', () => i.closest('.field')?.classList.remove('is-error')));

  /* ---------- Newsletter ---------- */
  const news = $('#newsForm');
  news.addEventListener('submit', e => {
    e.preventDefault();
    const ok = emailOk(news.elements.newsEmail.value.trim());
    news.classList.toggle('is-error', !ok);
    if (!ok) return;
    $('button span', news).textContent = 'Subscribed ✓';
    news.classList.add('is-sent');
  });

  $('#year').textContent = new Date().getFullYear();
})();
