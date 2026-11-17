/* الحقيبة (LocalStorage) + منتقي اللون والمقاس + كتالوج القمصان */
(function () {
  const S = window.STAYLE;
  const $ = (s, r = document) => r.querySelector(s);
  const KEY = 'stayle-bag-v2';

  /* ---------- إشعار ---------- */
  let toastT;
  function status(msg) {
    const el = $('#bag-status'); if (!el) return;
    el.textContent = msg; el.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  /* ---------- الحقيبة ---------- */
  const Bag = {
    items: [],
    load() { try { this.items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { this.items = []; } },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.items)); } catch (e) { /* التخزين غير متاح */ } },
    price(it) { return S.byId[it.id].price * (it.bundle ? 1 - S.BUNDLE_OFF : 1); },
    add(it, silent) {
      const k = [it.id, it.color, it.size, it.bundle ? 1 : 0].join('|');
      const f = this.items.find(x => x.key === k);
      if (f) f.qty++; else this.items.push(Object.assign({ key: k, qty: 1 }, it));
      this.save(); this.paint();
      if (!silent) status('أُضيف إلى الحقيبة: ' + S.byId[it.id].brand + ' — ' + S.byId[it.id].colors[it.color].n + ' · ' + it.size);
    },
    qty(key, d) {
      const it = this.items.find(x => x.key === key); if (!it) return;
      it.qty += d; if (it.qty <= 0) this.items = this.items.filter(x => x !== it);
      this.save(); this.paint();
    },
    count() { return this.items.reduce((a, b) => a + b.qty, 0); },
    total() { return this.items.reduce((a, b) => a + this.price(b) * b.qty, 0); },
    saved() { return this.items.reduce((a, b) => a + (S.byId[b.id].price - this.price(b)) * b.qty, 0); },
    paint() {
      document.querySelectorAll('[data-cart-count]').forEach(e => e.textContent = this.count());
      const list = $('#bag-list'); if (!list) return;
      if (!this.items.length) {
        list.innerHTML = '<li class="bag__empty">حقيبتك فارغة. اختر قميصاً للبدء.</li>';
      } else {
        list.innerHTML = this.items.map(it => {
          const p = S.byId[it.id];
          return `<li class="bag__row"><img src="${S.art(p, it.color)}" alt="" width="56" height="112" loading="lazy">
          <div><b>قميص ${p.brand}</b><span>${p.colors[it.color].n} · المقاس ${it.size}${it.bundle ? ' · عرض الإطلالة' : ''}</span>
          <span>${S.fmt(this.price(it))}</span></div>
          <div class="bag__qty"><button data-q="${it.key}" data-d="-1" aria-label="إنقاص">−</button><span>${it.qty}</span><button data-q="${it.key}" data-d="1" aria-label="زيادة">+</button></div></li>`;
        }).join('');
      }
      $('#bag-total').textContent = S.fmt(this.total());
      const sv = this.saved(); $('#bag-saved').textContent = sv > 0 ? 'وفّرت ' + S.fmt(sv) : '';
      $('#bag-send').disabled = !this.items.length;
    },
    whatsapp() {
      const name = $('#bag-name').value.trim(), phone = $('#bag-phone').value.trim(), city = $('#bag-city').value.trim();
      if (!name || !phone) { status('أدخل الاسم ورقم الهاتف أولاً'); return; }
      const lines = this.items.map(it => {
        const p = S.byId[it.id];
        return `• قميص ${p.brand} — ${p.colors[it.color].n} — ${it.size} × ${it.qty} = ${S.fmt(this.price(it) * it.qty)}`;
      });
      const msg = ['طلب جديد من STAYLE', ...lines, 'المجموع: ' + S.fmt(this.total()), '', 'الاسم: ' + name, 'الهاتف: ' + phone, 'الولاية: ' + (city || '-')].join('\n');
      window.open('https://wa.me/' + S.WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    }
  };

  /* ---------- منتقي اللون والمقاس (مشترك بين اللوحة والكتالوج) ---------- */
  function picker(p, cb) {
    const st = { color: 0, size: null };
    const el = document.createElement('div');
    el.className = 'picker';
    el.innerHTML = `<div class="picker__group"><span class="picker__label">اللون</span><div class="picker__colors" role="radiogroup" aria-label="اللون">${
      p.colors.map((c, i) => `<button type="button" role="radio" aria-checked="${i === 0}" aria-label="${c.n}" title="${c.n}" data-c="${i}" style="--sw:${c.hex}"></button>`).join('')}</div><span class="picker__cname">${p.colors[0].n}</span></div>
    <div class="picker__group"><span class="picker__label">المقاس</span><div class="picker__sizes" role="radiogroup" aria-label="المقاس">${
      S.SIZES.map(s => `<button type="button" role="radio" aria-checked="false" data-s="${s}">${s}</button>`).join('')}</div></div>
    <button type="button" class="picker__ok" data-ok>أضف إلى الحقيبة</button>`;
    el.addEventListener('click', e => {
      const c = e.target.closest('[data-c]'), s = e.target.closest('[data-s]'), ok = e.target.closest('[data-ok]');
      if (c) {
        st.color = +c.dataset.c;
        el.querySelectorAll('[data-c]').forEach(b => b.setAttribute('aria-checked', b === c));
        el.querySelector('.picker__cname').textContent = p.colors[st.color].n;
        cb.onColor && cb.onColor(st.color);
      } else if (s) {
        st.size = s.dataset.s;
        el.querySelectorAll('[data-s]').forEach(b => b.setAttribute('aria-checked', b === s));
        cb.onSize && cb.onSize(st.size);
      } else if (ok) {
        if (!st.size) { status('اختر المقاس أولاً'); el.querySelector('.picker__sizes').classList.remove('shake'); void el.offsetWidth; el.querySelector('.picker__sizes').classList.add('shake'); return; }
        cb.onAdd({ id: p.id, color: st.color, size: st.size });
      }
    });
    el.state = st;
    return el;
  }

  /* ---------- الكتالوج ---------- */
  function catalog() {
    const grid = $('#catalog-grid'), chips = $('#catalog-chips'); if (!grid) return;
    const used = ['all', ...new Set(S.products.map(p => p.cut))];
    chips.innerHTML = used.map((k, i) => `<button type="button" class="chip" aria-pressed="${i === 0}" data-f="${k}">${k === 'all' ? 'الكل' : S.CUTS[k]}</button>`).join('');
    grid.innerHTML = S.products.map(p => `
      <article class="card" id="p-${p.id}" data-cut="${p.cut}">
        <div class="card__fig"><img src="${S.art(p, 0)}" alt="قميص ${p.brand}" width="200" height="400" loading="lazy">${p.new ? '<span class="card__new">جديد</span>' : ''}</div>
        <div class="card__body">
          <span class="card__en">${p.en} · ${S.CUTS[p.cut]}</span>
          <h3>قميص ${p.brand}</h3>
          <p>${p.note}</p>
          <ul class="card__facts"><li>${p.fabric}</li><li>${p.collarName}</li></ul>
          <div class="card__row"><strong>${S.fmt(p.price)}</strong><button type="button" class="btn btn--sm" data-open aria-expanded="false">اختر وأضف</button></div>
          <div class="card__picker" hidden></div>
        </div>
      </article>`).join('');

    chips.addEventListener('click', e => {
      const b = e.target.closest('[data-f]'); if (!b) return;
      chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === b));
      grid.querySelectorAll('.card').forEach(c => c.hidden = !(b.dataset.f === 'all' || c.dataset.cut === b.dataset.f));
    });
    grid.addEventListener('click', e => {
      const btn = e.target.closest('[data-open]'); if (!btn) return;
      const card = btn.closest('.card'), p = S.byId[card.id.slice(2)], host = $('.card__picker', card);
      const open = host.hidden;
      host.hidden = !open; btn.setAttribute('aria-expanded', open);
      if (open && !host.firstChild) {
        host.appendChild(picker(p, {
          onColor: i => { $('.card__fig img', card).src = S.art(p, i); },
          onAdd: it => { Bag.add(it); host.hidden = true; btn.setAttribute('aria-expanded', false); }
        }));
      }
    });
  }

  /* ---------- حوار الحقيبة ---------- */
  function bagDialog() {
    const dlg = $('#bag-dialog');
    $('#open-bag').addEventListener('click', () => { Bag.paint(); dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', ''); });
    dlg.addEventListener('click', e => {
      if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
      const q = e.target.closest('[data-q]'); if (q) Bag.qty(q.dataset.q, +q.dataset.d);
    });
    $('#bag-send').addEventListener('click', () => Bag.whatsapp());
  }

  /* ---------- العد التنازلي لرمضان (تقريبي) ---------- */
  function countdown() {
    const el = $('#cd'); if (!el) return;
    const days = Math.max(0, Math.ceil((new Date('2027-02-08T00:00:00') - new Date()) / 864e5));
    el.textContent = days;
  }

  Bag.load();
  window.Stayle = { Bag, picker, status };
  document.addEventListener('DOMContentLoaded', () => { catalog(); bagDialog(); Bag.paint(); countdown(); });
})();
