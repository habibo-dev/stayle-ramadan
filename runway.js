/* <runway-section> — عرض دوّار ثلاثي الأبعاد لإطلالات القمصان */
(function () {
  const S = window.STAYLE;
  const mod = (a, n) => ((a % n) + n) % n;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = n => String(n).padStart(2, '0');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ICON = {
    plus: '<svg class="i-plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 4v16M4 12h16"/></svg>',
    check: '<svg class="i-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.5 12.5l5 5L19.5 7"/></svg>'
  };

  class RunwaySection extends HTMLElement {
    connectedCallback() {
      if (this._on) return; this._on = true;
      this.n = S.looks.length; this.N = this.n * Math.ceil(8 / this.n);
      this.index = 0; this.target = 0; this.cur = reduce ? 0 : -1.15; this.vel = 0;
      this.playing = false; this.engaged = false; this.panelHover = false; this.dragging = false; this.zoomed = false; this.visible = false;
      this.build(); this.cache(); this.bind();
      this.measure(); this.setIndex(0, true); this.render();
      this.observe();
      if (this.dataset.autoplay === 'true' && !reduce) this.play(true);
    }

    /* ---------- DOM ---------- */
    pins(p) {
      return [
        { x: 51, y: 5, t: 'الياقة', d: p.collarName },
        { x: 20, y: 44, t: 'الكم والكفّ', d: 'كفّ مخيّط بإحكام وكم واسع' },
        { x: 45, y: 33, t: 'القماش', d: p.fabric }
      ];
    }
    figure(l, cls) {
      return `<span class="rw__shadow"></span><div class="rw__figure"><div class="rw__art"><img src="${S.art(l.main, 0)}" alt="${l.name}" draggable="false" ${cls}></div></div>`;
    }
    row(p, k, first) {
      return `<li class="rw__item" data-rw-card="${k}" data-pid="${p.id}" style="--i:${k}">
        ${first && p.new ? '<span class="rw__tag"><span class="rw__tag-text">جديد</span></span>' : ''}
        <a class="rw__media" href="#p-${p.id}" tabindex="-1" aria-hidden="true"><img src="${S.art(p, 0)}" alt="" loading="lazy"><span class="rw__num">${k}</span></a>
        <div class="rw__info"><span class="rw__type">${p.en} · ${S.CUTS[p.cut]}</span>
          <a class="rw__name" href="#p-${p.id}">قميص ${p.brand}</a>
          <span class="rw__price"><span>${S.fmt(p.price)}</span><span class="rw__size-pick" data-sz></span></span></div>
        <button class="rw__add" data-rw-add aria-expanded="false" aria-label="اختر اللون والمقاس: قميص ${p.brand}">${ICON.plus}${ICON.check}</button>
        <div class="rw__picker-host" hidden></div></li>`;
    }
    build() {
      const L = S.looks;
      const total = L.map(l => l.items.reduce((a, id) => a + S.byId[id].price, 0));
      this.innerHTML = `
      <div class="rw__sticky"><div class="rw__grid">
        <div class="rw__left">
          <div class="rw__head"><div class="rw__intro">
            <span class="rw__eyebrow">مجموعة رمضان ١٤٤٨</span>
            <h2 class="rw__title">قميصك لرمضان.</h2>
            <p class="rw__sub">ست إطلالات كاملة للمسجد والاعتكاف والمناسبات. اضغط على القميص لترى تفاصيله.</p></div>
            <span class="rw__sr" aria-live="polite" aria-atomic="true" data-rw-live></span></div>
          <div class="rw__stage" data-rw-stage tabindex="0" role="region" aria-roledescription="carousel" aria-label="إطلالات القمصان — استخدم الأسهم أو اسحب لتغيير الإطلالة">
            <div class="rw__moon" aria-hidden="true"></div>
            <div class="rw__actors" data-rw-actors>${L.map((l, i) => `<div class="rw__model" data-rw-model data-index="${i}" aria-hidden="true">${this.figure(l, '')}<button class="rw__hit" data-rw-go="${i}" aria-label="إطلالة ${i + 1}: ${l.name}" tabindex="-1"></button></div>`).join('')}</div>
            <div class="rw__heroes" data-rw-heroes>${L.map((l, i) => `<div class="rw__hero${i ? '' : ' is-on'}" data-rw-hero data-index="${i}" data-label="إطلالة ${i + 1}: ${l.name}"><div class="rw__morph">${this.figure(l, '')}<button class="rw__zoom" data-rw-zoom aria-label="عرض الإطلالة: ${l.name}" tabindex="-1"></button></div></div>`).join('')}</div>
            <span class="rw__sweep"></span>
            <span class="rw__cursor" data-rw-cursor><span class="rw__cursor-in"><span class="rw__cursor-label rw__cursor-drag">اسحب</span><span class="rw__cursor-label rw__cursor-view">عرض</span></span></span>
            <span class="rw__walk"><span class="rw__walk-line"></span></span>
          </div>
          <div class="rw__controls">
            <button class="rw__icon" data-rw-prev aria-label="الإطلالة السابقة"><svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7h24M19 1l6 6-6 6"/></svg></button>
            <div class="rw__ticks">${L.map((l, i) => `<button class="rw__tick" data-rw-tick="${i}" aria-current="${i === 0}" aria-label="إطلالة ${i + 1}: ${l.name}"><span class="rw__tick-bar"></span><span class="rw__tick-label">${pad(i + 1)}<span class="rw__tick-name">&nbsp;&nbsp;${l.name}</span></span></button>`).join('')}</div>
            <button class="rw__icon rw__auto" data-rw-auto aria-pressed="false" aria-label="تشغيل تلقائي"><svg class="i-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17 4.5v15L4.5 12z"/></svg><svg class="i-pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z"/></svg></button>
            <button class="rw__icon" data-rw-next aria-label="الإطلالة التالية"><svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M25 7H1M7 1L1 7l6 6"/></svg></button>
          </div>
          <div class="rw__lb" data-rw-lb hidden role="dialog" aria-modal="false" aria-label="عرض الإطلالة">
            <button class="rw__lb-x" data-rw-close aria-label="إغلاق">✕</button>
            <div class="rw__lb-txt"><span class="rw__lb-kick" data-lb-kick></span><h3 data-lb-name></h3><p data-lb-brand></p><p class="rw__lb-hint">اضغط على النقاط لترى كل تفصيلة.</p></div>
            <div class="rw__lb-stage"><div class="rw__lb-fig" data-lb-fig></div></div>
          </div>
        </div>
        <aside class="rw__panel" aria-label="في هذه الإطلالة"><div class="rw__panel-inner">
          <div class="rw__panel-head"><h3 class="rw__panel-title">في هذه الإطلالة</h3><span class="rw__label" data-rw-pieces>٣ قمصان</span></div>
          ${L.map((l, i) => `<div class="rw__look-panel${i ? '' : ' is-in'}" data-rw-panel="${i}" ${i ? 'hidden' : ''}>
            <div class="rw__mhead"><span class="rw__mhead-title">${l.name}</span><span class="rw__label">٣ قمصان</span></div>
            <ul class="rw__items" role="list">${l.items.map((id, k) => this.row(S.byId[id], k + 1, k === 0)).join('')}</ul>
            <div class="rw__bundle">
              <div class="rw__bundle-top"><div><span class="rw__bundle-title">أكمل الإطلالة</span><span class="rw__bundle-note">قميص لكل أسبوع: اشترِ الثلاثة ووفّر ١٠٪</span></div>
              <div class="rw__bundle-price"><s>${S.fmt(total[i])}</s><strong>${S.fmt(total[i] * (1 - S.BUNDLE_OFF))}</strong></div></div>
              <button class="rw__bundle-btn" data-rw-bundle>أضف الإطلالة كاملة إلى الحقيبة</button></div>
          </div>`).join('')}
        </div></aside>
      </div></div>`;
    }

    cache() {
      const q = s => this.querySelector(s), qa = s => [...this.querySelectorAll(s)];
      this.stage = q('[data-rw-stage]'); this.actors = q('[data-rw-actors]'); this.heroesEl = q('[data-rw-heroes]');
      this.bodies = qa('[data-rw-model]');
      this.bodies.slice(0, this.n).forEach(b => { const c = b.cloneNode(true); c.dataset.rwClone = ''; c.querySelector('img').loading = 'lazy'; this.actors.appendChild(c); });
      this.bodies = qa('[data-rw-model]');
      this.bodies.forEach((b, a) => { b.dataset.index = a; b.querySelector('[data-rw-go]').dataset.rwGo = a % this.n; });
      this.heroes = qa('[data-rw-hero]'); this.ticks = qa('[data-rw-tick]'); this.panels = qa('[data-rw-panel]');
      this.live = q('[data-rw-live]'); this.pieces = q('[data-rw-pieces]'); this.autoBtn = q('[data-rw-auto]');
      this.cursor = q('[data-rw-cursor]'); this.lb = q('[data-rw-lb]');
    }

    /* ---------- القياس ---------- */
    measure() {
      const desk = innerWidth >= 1100;
      if (desk) {
        let hh = 0; document.querySelectorAll('.site-top').forEach(e => hh += e.offsetHeight);
        this.style.setProperty('--rw-frame-h', Math.max(560, innerHeight - hh) + 'px');
      } else this.style.removeProperty('--rw-frame-h');
      this.W = this.stage.clientWidth; this.H = this.stage.clientHeight;
      this.fs = 1.08;
      this.modelH = Math.max(200, Math.round((this.H - 34 - 18) / this.fs));
      this.stage.style.setProperty('--rw-model-h', this.modelH + 'px');
      this.stage.style.setProperty('--rw-fs', this.fs);
      this.stage.style.setProperty('--rw-hx', this.W * 0.5 + 'px');
      this.stage.style.setProperty('--rw-hy', '34px');
      this.bodies.forEach(b => b.w = this.modelH * 0.5);
      this.kick();
    }

    /* ---------- رسم الحلقة ---------- */
    put(b, x, bottom, scale, op, blur, z) {
      const w = b.w;
      if (x + w * scale / 2 < -4 || x - w * scale / 2 > this.W + 4) op = 0;
      b.style.transform = `translate3d(${x.toFixed(1)}px,${(-bottom).toFixed(1)}px,0) translateX(-50%) scale(${scale.toFixed(4)})`;
      b.style.opacity = op.toFixed(3); b.style.zIndex = z;
      b.style.visibility = op < 0.01 ? 'hidden' : 'visible';
      b.style.pointerEvents = op < 0.5 ? 'none' : '';
      const bl = Math.round(blur * 10) / 10;
      if (bl !== b._bl) { b._bl = bl; b.style.filter = bl > 0.05 ? `blur(${bl}px)` : ''; }
    }
    render() {
      const W = this.W, H = this.H, mob = W < 750;
      const cx = W / 2, R = (mob ? 0.72 : 0.62) * W, P = (mob ? 1.9 : 1.65) * W;
      const floor = H - 34, horizon = 0.36 * H, step = Math.PI * 2 / this.N;
      this.bodies.forEach((b, a) => {
        let phi = ((a - this.cur) * step) % (Math.PI * 2);
        if (phi > Math.PI) phi -= Math.PI * 2; if (phi <= -Math.PI) phi += Math.PI * 2;
        const z = R * (1 - Math.cos(phi)), persp = P / (P + z), sl = Math.abs(phi) / step;
        const scale = persp * (1 + (this.fs - 1) * clamp(1 - sl, 0, 1));
        const x = cx - R * Math.sin(phi) * persp;               /* مرآة لاتجاه RTL */
        const feet = horizon + (floor - horizon) * persp;
        const blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
        let op = clamp((Math.cos(phi) + 0.55) / 0.3, 0, 1);
        if (this.still && sl < 0.02) op = 0;
        this.put(b, x, H - feet, scale, op, blur, Math.round(scale * 1000));
      });
    }
    setStill(v) {
      if (this.still === v) return; this.still = v;
      this.classList.toggle('rw--still', v);
    }
    kick() {
      if (this._raf) return;
      if (this._ready && !this.visible) { this.render(); return; }
      this._last = 0;
      const K = 95, C = 2 * Math.sqrt(K);
      const tick = t => {
        const dt = this._last ? Math.min(0.034, (t - this._last) / 1000) : 1 / 60; this._last = t;
        const h = dt / 3;
        for (let i = 0; i < 3; i++) { const acc = -K * (this.cur - this.target) - C * this.vel; this.vel += acc * h; this.cur += this.vel * h; }
        const settled = Math.abs(this.cur - this.target) <= 0.0005 && Math.abs(this.vel) <= 0.0005 && !this.dragging;
        if (settled) { this.cur = this.target; this.vel = 0; this.setStill(true); } else this.setStill(false);
        this.render();
        if (settled || document.hidden || !this.visible) { this._raf = 0; return; }
        this._raf = requestAnimationFrame(tick);
      };
      this._raf = requestAnimationFrame(tick);
    }

    /* ---------- التنقل ---------- */
    moveTo(T) { this.target = T; this.setStill(false); this.setIndex(mod(T, this.n)); this.kick(); }
    next() { this.moveTo(Math.round(this.target) + 1); }
    prev() { this.moveTo(Math.round(this.target) - 1); }
    go(i) { let d = mod(i - this.index, this.n); if (d > this.n / 2) d -= this.n; if (d) this.moveTo(Math.round(this.target) + d); }

    setIndex(i, silent) {
      const changed = i !== this.index || silent;
      this.index = i;
      this.bodies.forEach((b, a) => {
        const k = ((mod(a - Math.round(this.target) + this.N / 2, this.N)) - this.N / 2);
        const ok = k !== 0 && Math.abs(k) <= 2, hit = b.querySelector('.rw__hit');
        hit.tabIndex = ok ? 0 : -1; b.setAttribute('aria-hidden', ok ? 'false' : 'true');
      });
      if (!changed) return;
      this.closeLb(true);
      this.style.setProperty('--rw-progress', ((i + 1) / this.n).toFixed(3));
      this.heroes.forEach((h, j) => {
        const on = j === i; h.classList.toggle('was', h.classList.contains('is-on') && !on); h.classList.toggle('is-on', on);
        h.setAttribute('aria-hidden', !on); h.querySelector('.rw__zoom').tabIndex = on ? 0 : -1;
      });
      this.ticks.forEach((t, j) => { t.setAttribute('aria-current', j === i); t.classList.toggle('is-past', j < i); });
      this.panels.forEach((p, j) => { p.hidden = j !== i; p.classList.remove('is-in'); });
      const act = this.panels[i]; void act.offsetWidth; act.classList.add('is-in');
      this.pieces.textContent = '٣ قمصان'; this.pieces.classList.remove('is-swap'); void this.pieces.offsetWidth; this.pieces.classList.add('is-swap');
      if (!silent) {
        this.live.textContent = `إطلالة ${i + 1}: ${S.looks[i].name}`;
        if (!reduce) { this.stage.classList.remove('is-sweep'); void this.stage.offsetWidth; this.stage.classList.add('is-sweep'); }
      }
      this.restartBar();
    }

    /* ---------- التشغيل التلقائي ---------- */
    play(on) {
      this.playing = on; this.classList.toggle('is-playing', on); this.autoBtn.setAttribute('aria-pressed', on);
      this.autoBtn.setAttribute('aria-label', on ? 'إيقاف التشغيل التلقائي' : 'تشغيل تلقائي');
      this.restartBar();
    }
    restartBar() {
      clearTimeout(this._timer);
      this.ticks.forEach(t => t.classList.remove('is-run'));
      if (!this.playing) return;
      void this.offsetWidth; this.ticks[this.index].classList.add('is-run');
      this._timer = setTimeout(() => {
        if (this.playing && this.visible && !this.dragging && !document.hidden && !this.panelHover && !this.zoomed && !this.engaged) this.next();
        else this.restartBar();
      }, +this.dataset.speed || 5000);
    }
    engage() { this.engaged = true; if (this.playing) this.play(false); }

    /* ---------- النافذة المنبثقة ---------- */
    openLb() {
      const l = S.looks[this.index], p = l.main;
      this.zoomed = true; this.engage();
      this.lb.querySelector('[data-lb-kick]').textContent = `إطلالة ${pad(this.index + 1)} / ${pad(this.n)}`;
      this.lb.querySelector('[data-lb-name]').textContent = l.name;
      this.lb.querySelector('[data-lb-brand]').textContent = `قميص ${p.brand} · ${p.en}`;
      const fig = this.lb.querySelector('[data-lb-fig]');
      fig.innerHTML = `<img src="${S.art(p, 0)}" alt="${l.name}" draggable="false">` + this.pins(p).map((pn, i) =>
        `<button class="rw__pin" style="left:${pn.x}%;top:${pn.y}%;--pi:${i}" data-pin="${i}" aria-label="${pn.t}: ${pn.d}"><span class="rw__pin-dot">${i + 1}</span><span class="rw__pin-tip"><b>${pn.t}</b>${pn.d}</span></button>`).join('');
      this.lb.hidden = false; void this.lb.offsetWidth; this.lb.classList.add('is-open');
      this.lb.querySelector('[data-rw-close]').focus({ preventScroll: true });
    }
    closeLb(quiet) {
      if (this.lb.hidden) return;
      this.lb.classList.remove('is-open'); this.lb.hidden = true; this.zoomed = false;
      if (!quiet) this.stage.focus({ preventScroll: true });
    }

    /* ---------- الأحداث ---------- */
    bind() {
      const st = this.stage;
      this.addEventListener('click', e => {
        const t = e.target;
        if (t.closest('[data-rw-prev]')) { this.prev(); return; }
        if (t.closest('[data-rw-next]')) { this.next(); return; }
        const tk = t.closest('[data-rw-tick]'); if (tk) { this.go(+tk.dataset.rwTick); return; }
        if (t.closest('[data-rw-auto]')) { if (!this.playing) this.engaged = false; this.play(!this.playing); return; }
        if (this._moved) { this._moved = false; return; }
        const go = t.closest('[data-rw-go]'); if (go) { this.go(+go.dataset.rwGo); return; }
        if (t.closest('[data-rw-zoom]')) { this.openLb(); return; }
        if (t.closest('[data-rw-close]')) { this.closeLb(); return; }
        const pin = t.closest('[data-pin]');
        if (pin) { const was = pin.classList.contains('is-open'); this.lb.querySelectorAll('.rw__pin').forEach(x => x.classList.remove('is-open')); pin.classList.toggle('is-open', !was); this.engage(); return; }
        if (t.closest('.rw__panel')) this.panelClick(e);
      });

      /* سحب / تمرير */
      let sx = 0, st0 = 0, down = false, lastX = 0, lastT = 0, v = 0;
      const unit = () => Math.max(120, 0.3 * this.W);
      st.addEventListener('pointerdown', e => {
        if (e.button) return; down = true; this._moved = false; sx = lastX = e.clientX; st0 = this.target; lastT = performance.now(); v = 0;
      });
      addEventListener('pointermove', e => {
        if (!down) return;
        const dx = e.clientX - sx;
        if (!this.dragging && Math.abs(dx) > 6) { this.dragging = true; this._moved = true; st.classList.add('is-drag'); try { st.setPointerCapture(e.pointerId); } catch (_) { } }
        if (this.dragging) {
          this.target = st0 + dx / unit();                        /* السحب لليمين = التالي (RTL) */
          const now = performance.now(); v = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
          this.setStill(false); this.kick();
        }
      });
      const up = () => {
        if (!down) return; down = false;
        if (this.dragging) {
          this.dragging = false; st.classList.remove('is-drag');
          const T = Math.round(this.target + clamp(v * 0.9, -1.2, 1.2)); this.moveTo(T);
          setTimeout(() => { this._moved = false; }, 0);
        }
      };
      addEventListener('pointerup', up); addEventListener('pointercancel', up);

      let wheelLock = 0;
      st.addEventListener('wheel', e => {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Date.now() < wheelLock) return;
        e.preventDefault(); wheelLock = Date.now() + 600; e.deltaX < 0 ? this.next() : this.prev();
      }, { passive: false });
      this.addEventListener('keydown', e => {
        if (e.key === 'Escape') { this.closeLb(); return; }
        if (e.target !== st && !st.contains(e.target)) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); this.next(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); this.prev(); }
        else if (e.key === 'Enter' && e.target === st) this.openLb();
      });

      /* المؤشر المخصص */
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        st.addEventListener('pointermove', e => {
          const r = st.getBoundingClientRect();
          this.cursor.style.transform = `translate3d(${e.clientX - r.left}px,${e.clientY - r.top}px,0)`;
          this.cursor.classList.add('is-on');
          this.cursor.classList.toggle('is-view', !!e.target.closest('.rw__zoom'));
        });
        st.addEventListener('pointerleave', () => this.cursor.classList.remove('is-on'));
      } else this.cursor.remove();

      /* لوحة المنتجات */
      const panel = this.querySelector('.rw__panel');
      panel.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') this.panelHover = true; });
      panel.addEventListener('pointerleave', () => { if (this.panelHover) { this.panelHover = false; this.restartBar(); } });

      let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => this.measure(), 120); });
      new ResizeObserver(() => this.measure()).observe(st);
    }

    panelClick(e) {
      const t = e.target;
      this.engage();
      const add = t.closest('[data-rw-add]');
      if (add) { this.togglePicker(add.closest('.rw__item')); return; }
      const bun = t.closest('[data-rw-bundle]');
      if (bun) this.addBundle(bun.closest('.rw__look-panel'));
    }
    togglePicker(li, force) {
      const host = li.querySelector('.rw__picker-host'), btn = li.querySelector('.rw__add');
      const open = force !== undefined ? force : host.hidden;
      host.hidden = !open; btn.setAttribute('aria-expanded', open); li.classList.toggle('is-open', open);
      if (open && !host.firstChild) {
        const p = S.byId[li.dataset.pid];
        const pk = window.Stayle.picker(p, {
          onColor: i => { li.querySelector('.rw__media img').src = S.art(p, i); },
          onSize: s => { li.querySelector('[data-sz]').textContent = '· ' + s; },
          onAdd: it => {
            window.Stayle.Bag.add(it); this.togglePicker(li, false);
            btn.classList.add('is-added'); setTimeout(() => btn.classList.remove('is-added'), 1800);
          }
        });
        li._pk = pk; host.appendChild(pk);
      }
    }
    addBundle(panel) {
      const rows = [...panel.querySelectorAll('.rw__item')], miss = [];
      rows.forEach(li => {
        if (!li._pk || !li._pk.state.size) miss.push(li);
      });
      if (miss.length) {
        miss.forEach(li => this.togglePicker(li, true));
        window.Stayle.status('اختر المقاس لـ: ' + miss.map(li => 'قميص ' + S.byId[li.dataset.pid].brand).join('، '));
        return;
      }
      rows.forEach(li => window.Stayle.Bag.add({ id: li.dataset.pid, color: li._pk.state.color, size: li._pk.state.size, bundle: true }, true));
      window.Stayle.status('أُضيفت الإطلالة كاملة بخصم ١٠٪');
      rows.forEach(li => this.togglePicker(li, false));
    }

    /* ---------- الظهور ---------- */
    observe() {
      this.classList.add('rw--js');
      const io = new IntersectionObserver(es => {
        this.visible = es[0].isIntersecting; if (this.visible) { this.kick(); this.restartBar(); }
      }, { threshold: 0 });
      io.observe(this);
      const io2 = new IntersectionObserver(es => {
        if (!es[0].isIntersecting) return; io2.disconnect();
        requestAnimationFrame(() => requestAnimationFrame(() => { this.classList.add('is-revealed'); this.target = 0; this.kick(); }));
      }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
      io2.observe(this);
      if (reduce) this.classList.add('is-revealed');
      document.addEventListener('visibilitychange', () => { if (!document.hidden) { this.kick(); this.restartBar(); } });
      this._ready = true;
    }
  }
  customElements.define('runway-section', RunwaySection);
})();
