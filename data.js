/* STAYLE — بيانات المتجر + مولّد رسومات القمصان (SVG أصلية، ليست صور منتجات حقيقية) */
(function () {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + [r, g, b].map(v => clamp(v, 0, 255).toString(16).padStart(2, '0')).join('');
  }

  let uid = 0;
  /* يرسم رجلاً يرتدي قميصاً كاملاً: اللون، نوع الياقة، الكم، الخامة */
  function qamisSVG(o) {
    const id = 'q' + (++uid);
    const c = o.color, l = shade(c, 0.2), d = shade(c, -0.24), dd = shade(c, -0.4);
    const trim = o.trim || '#b8913a';
    const short = o.sleeves === 'short';
    const light = parseInt(c.slice(1), 16) > 0xb0b0b0;
    const line = light ? shade(c, -0.3) : shade(c, 0.35);

    const sleeveL = short
      ? 'M60 106 L40 112 Q30 140 30 170 L57 172 Q58 142 67 130 Z'
      : 'M60 106 L40 112 Q22 190 19 262 L45 267 Q48 200 67 134 Z';
    const armL = 'M31 166 L19 262 L45 267 L58 166 Z';
    const cuffL = short ? 'M30 170 L57 172' : 'M19 262 L45 267';
    const handL = short ? '' : '<ellipse cx="31" cy="279" rx="9" ry="13" fill="#c68f63"/>';
    const mirror = p => `<g>${p}</g><g transform="translate(200 0) scale(-1 1)">${p}</g>`;

    let collar = '';
    const tassel = `<path d="M100 114 L100 176" stroke="${trim}" stroke-width="1.6"/><circle cx="100" cy="180" r="4.5" fill="${trim}"/>`;
    switch (o.collar) {
      case 'indo':
        collar = `<path d="M79 93 L100 118 L121 93 L127 105 L100 132 L73 105Z" fill="${l}" stroke="${d}" stroke-width="1.4"/><circle cx="100" cy="124" r="2.4" fill="${trim}"/>`; break;
      case 'round':
        collar = `<path d="M82 99 Q100 126 118 99 Q100 114 82 99Z" fill="${dd}"/><path d="M82 99 Q100 126 118 99" fill="none" stroke="${trim}" stroke-width="1.6"/>${o.tassel ? tassel : ''}`; break;
      case 'emirati':
        collar = `<path d="M84 98 Q100 109 116 98 L116 108 Q100 119 84 108Z" fill="${l}" stroke="${d}" stroke-width="1.2"/>${tassel}`; break;
      case 'moroccan':
        collar = `<path d="M82 98 L100 152 L118 98" fill="${dd}" opacity=".55"/><path d="M82 98 L100 152 L118 98" fill="none" stroke="${trim}" stroke-width="3"/><path d="M87 100 L100 140 L113 100" fill="none" stroke="${trim}" stroke-width="1" stroke-dasharray="2 3"/>`; break;
      default:
        collar = `<path d="M84 98 Q100 109 116 98 L116 108 Q100 119 84 108Z" fill="${l}" stroke="${d}" stroke-width="1.2"/>`;
    }

    const placket = o.collar === 'moroccan' ? '' : `<path d="M100 114 L100 218" stroke="${d}" stroke-width="1.2"/>` +
      [132, 152, 172, 192].map(y => `<circle cx="100" cy="${y}" r="1.9" fill="${o.collar === 'indo' || o.detail ? trim : line}"/>`).join('');

    let extra = '';
    if (o.detail === 'embroidery') {
      extra = `<path d="M96 118 L96 214 M104 118 L104 214" stroke="${trim}" stroke-width=".9" stroke-dasharray="1.5 3"/>` +
        `<path d="M${19} 262 L45 267" stroke="${trim}" stroke-width="3"/>`;
    }
    let texture = '';
    if (o.texture === 'crinkle') {
      texture = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i =>
        `<path d="M${48 + i * 2} ${140 + i * 20} q14 -6 28 0 t28 0 t28 0 t26 0" fill="none" stroke="${d}" stroke-width="1" opacity=".28"/>`).join('');
    } else if (o.texture === 'sheen') {
      texture = `<path d="M70 104 L96 104 L88 366 L52 366Z" fill="#fff" opacity=".13"/><path d="M120 104 L130 104 L146 366 L128 366Z" fill="#fff" opacity=".07"/>`;
    }
    const folds = `<path d="M74 230 Q70 300 66 366 M126 230 Q130 300 134 366" fill="none" stroke="${d}" stroke-width="1.1" opacity=".35"/>`;
    const slimW = o.fit === 'slim';
    const hemL = slimW ? 52 : 40, hemR = 200 - hemL, sideL = slimW ? 55 : 47, sideR = 200 - sideL;
    const body = `M62 104 Q100 93 138 104 L${sideR + 2} 150 L${sideR} 300 Q${hemR} 340 ${hemR} 366 Q100 377 ${hemL} 366 Q${hemL} 340 ${sideL} 300 L${sideL - 2} 150 Z`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" role="img" aria-hidden="true">
<defs><linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="${d}"/><stop offset=".3" stop-color="${c}"/><stop offset=".52" stop-color="${l}"/><stop offset=".78" stop-color="${c}"/><stop offset="1" stop-color="${d}"/></linearGradient>
<linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".82" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient></defs>
<path d="M76 366 q-8 8 -4 14 q16 4 28 0 l0 -12Z M124 366 q8 8 4 14 q-16 4 -28 0 l0 -12Z" fill="#2c2420"/>
${short ? mirror(`<path d="${armL}" fill="#c68f63"/>`) : ''}${mirror(handL)}
<path d="${body}" fill="url(#${id}g)"/><path d="${body}" fill="url(#${id}v)"/>
${folds}${texture}
<rect x="88" y="78" width="24" height="30" rx="8" fill="#b57e55"/>
${mirror(`<path d="${sleeveL}" fill="url(#${id}g)" stroke="${d}" stroke-width=".8"/><path d="${cuffL}" stroke="${d}" stroke-width="4" stroke-linecap="round"/>`)}
${placket}${extra}${collar}
<path d="M122 150 L124 172" stroke="${d}" stroke-width="1.1" opacity=".6"/>
<path d="M${hemL + 3} 358 Q100 369 ${hemR - 3} 358" fill="none" stroke="${d}" stroke-width="1" opacity=".5"/>
<ellipse cx="100" cy="54" rx="22" ry="26" fill="#c68f63"/>
<path d="M78 62 Q80 100 100 94 Q120 100 122 62 Q118 84 100 86 Q82 84 78 62Z" fill="#2a211c"/>
<path d="M95 74 Q100 78 105 74" stroke="#7a4a30" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<path d="M77 44 Q100 18 123 44 Q100 38 77 44Z" fill="#f4efe4" stroke="#d8d0bd" stroke-width=".8"/>
<path d="M82 40 Q100 24 118 40" fill="none" stroke="${trim}" stroke-width=".9" stroke-dasharray="2 2.5"/>
</svg>`;
  }

  const uri = s => 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
  const art = (p, colorIdx) => {
    const col = p.colors[colorIdx || 0];
    return uri(qamisSVG({ color: col.hex, collar: p.collar, tassel: p.tassel, sleeves: p.sleeves, texture: p.texture, detail: p.detail, fit: p.fit, trim: p.trim }));
  };

  const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const CUTS = {
    classic: 'كلاسيك', itikaf: 'اعتكاف وصلاة', emirati: 'إماراتي', omani: 'عماني', indo: 'إندونيسي',
    moroccan: 'مغربي', slim: 'سليم فيت', demi: 'نصف كم', crinkle: 'مكرمش', glace: 'غلاصي', gift: 'هدايا'
  };

  const P = (id, brand, en, cut, price, note, fabric, collarName, colors, o) =>
    Object.assign({ id, brand, en, cut, price, note, fabric, collarName, colors: colors.map(([n, hex]) => ({ n, hex })) }, o);

  const products = [
    P('noor', 'النور', 'Al Noor', 'classic', 7900, 'الأكثر رواجاً للفخامة والمناسبات.', 'قطن مصري ممتاز', 'ياقة قائمة ناعمة',
      [['أبيض عاجي', '#f3efe6'], ['بيج رملي', '#e2d3b8'], ['رمادي فاتح', '#cfd3d6']], { collar: 'band', new: true }),
    P('daffah', 'الدفة', 'Al Daffah', 'emirati', 8600, 'جودة القماش الكلاسيكي بقصة خليجية انسيابية.', 'قماش كلاسيكي ثقيل', 'ياقة بخيط متدلٍّ (طربوشة)',
      [['كريمي', '#ece0c8'], ['أبيض', '#f6f3ec'], ['رمادي حجري', '#b9b6ad']], { collar: 'emirati' }),
    P('aseel', 'الأصيل', 'Al Aseel', 'classic', 6200, 'متانة وراحة للاستخدام اليومي.', 'قطن مخلوط متين', 'ياقة قائمة',
      [['سماوي رمادي', '#a9bccb'], ['أبيض', '#f4f1ea'], ['بيج', '#d9c9a8']], { collar: 'band' }),
    P('jassem', 'الجاسم', 'Al Djassem', 'indo', 8900, 'تصميم كلاسيكي راقٍ بتفاصيل دقيقة وتطريز خفيف.', 'قماش مطرّز الحواف', 'ياقة صلبة (علبة)',
      [['كحلي', '#27364f'], ['أبيض', '#f4f1ea'], ['أخضر زيتي', '#4a5a3c']], { collar: 'indo', detail: 'embroidery' }),
    P('khalil', 'الخليل', 'Thawb Al Khalil', 'classic', 6800, 'علامة جزائرية بقطن وتصميم إنجليزي.', 'قطن إنجليزي', 'ياقة قائمة مزدوجة الخياطة',
      [['أخضر غابي', '#41705a'], ['أبيض', '#f4f1ea'], ['رمادي', '#9aa0a3']], { collar: 'band' }),
    P('istikama', 'الاستقامة', 'Istikama', 'itikaf', 5900, 'للألبسة التقليدية والشرعية، واسع وعملي للمسجد.', 'قطن خفيف واسع', 'رقبة مستديرة بسيطة',
      [['رمادي فحمي', '#3d4144'], ['أبيض', '#f4f1ea'], ['بني ترابي', '#7b6551']], { collar: 'round' }),
    P('badr', 'البدر', 'Al Badr', 'slim', 6400, 'قصة عصرية مناسبة للشباب.', 'قطن مرن', 'ياقة قائمة',
      [['أخضر ميرمية', '#8aa08a'], ['أبيض', '#f4f1ea'], ['أسود', '#2a2b2e']], { collar: 'band', fit: 'slim' }),
    P('shiaka', 'الشياكة', 'Al Shiaka', 'classic', 7200, 'تصاميم رسمية معروفة في الأسواق.', 'قماش رسمي ناعم', 'ياقة قائمة',
      [['رمادي مائل للبيج', '#bcab8e'], ['أبيض', '#f4f1ea'], ['كحلي', '#27364f']], { collar: 'band' }),
    P('haramain', 'الحرمين', 'Al Haramain', 'demi', 5400, 'خيار صيفي بنصف كم للأجواء الحارة.', 'قطن صيفي خفيف', 'ياقة قائمة',
      [['أبيض', '#f6f3ec'], ['سماوي فاتح', '#c4d3dc'], ['بيج', '#e0d2b6']], { collar: 'band', sleeves: 'short' }),
    P('wejdan', 'الوجدان', 'El Wejdan', 'omani', 7000, 'أحدث الموديلات بقصة عمانية وتطريز بسيط.', 'قطن ناعم', 'رقبة دائرية بطربوشة',
      [['رملي', '#cdb99a'], ['أبيض', '#f6f3ec'], ['أزرق باهت', '#a3b4c4']], { collar: 'round', tassel: true }),
    P('sabr', 'صبر', 'SABR', 'classic', 3900, 'سعر اقتصادي للاستعمال اليومي.', 'قطن اقتصادي', 'ياقة قائمة',
      [['رمادي', '#99a3ab'], ['أبيض', '#f4f1ea'], ['بيج', '#d6c6a6']], { collar: 'band' }),
    P('rawaa', 'روعة الصفا', 'Rawat Al Safa', 'moroccan', 7500, 'لمسة مغاربية تقليدية بتطريز ذهبي على الصدر.', 'قماش مغربي مطرّز', 'فتحة V مطرزة',
      [['بني قهوة', '#8a5a3b'], ['أبيض', '#f4f1ea'], ['أخضر داكن', '#2f5a48']], { collar: 'moroccan', trim: '#d1a640' }),
    P('fakhir', 'الفاخر', 'Al Fakhir', 'gift', 9500, 'مخصص للهدايا، بلمعة خفيفة وملمس ناعم.', 'غلاصي (Glacé) لامع', 'ياقة قائمة بحواف ذهبية',
      [['أخضر ملكي', '#1f4a3d'], ['كحلي', '#27364f'], ['كريمي', '#ece0c8']], { collar: 'band', texture: 'sheen', trim: '#d1a640' }),
    P('nokhba', 'النخبة', 'Al Nokhba', 'glace', 9900, 'قميص هدايا بقماش غلاصي ناعم ولمعة راقية.', 'غلاصي (Glacé)', 'ياقة قائمة',
      [['أسود', '#2a2b2e'], ['رمادي داكن', '#4b5057'], ['أبيض', '#f4f1ea']], { collar: 'band', texture: 'sheen' }),
    P('dior', 'ديور المكرمش', 'Dior', 'crinkle', 6900, 'موديل شبابي مشهور بقماشه المموج.', 'قماش مكرمش مموج', 'ياقة قائمة',
      [['رمادي رملي', '#d3cdbf'], ['أبيض', '#f4f1ea'], ['زيتي', '#7c8566']], { collar: 'band', texture: 'crinkle' }),
    P('ihram', 'الإحرام', 'El Ihram', 'itikaf', 4800, 'متوفر بكثرة بأسعار مناسبة للجملة والتجزئة.', 'قطن أبيض ناصع', 'ياقة قائمة',
      [['أبيض ناصع', '#f8f6f0'], ['عاجي', '#ece5d4'], ['رمادي فاتح', '#d2d5d6']], { collar: 'band' })
  ];
  const byId = Object.fromEntries(products.map(p => [p.id, p]));

  const looks = [
    { name: 'ليلة القدر', items: ['noor', 'aseel', 'haramain'] },
    { name: 'صلاة التراويح', items: ['daffah', 'wejdan', 'dior'] },
    { name: 'إفطار العائلة', items: ['jassem', 'shiaka', 'nokhba'] },
    { name: 'صلاة الفجر', items: ['khalil', 'badr', 'ihram'] },
    { name: 'الاعتكاف', items: ['istikama', 'rawaa', 'sabr'] },
    { name: 'عيد الفطر', items: ['fakhir', 'nokhba', 'daffah'] }
  ].map(l => Object.assign(l, { main: byId[l.items[0]] }));

  const fmt = n => Math.round(n).toLocaleString('en-US') + ' دج';

  window.STAYLE = { products, byId, looks, SIZES, CUTS, art, qamisSVG, uri, fmt, BUNDLE_OFF: 0.1,
    WHATSAPP: '213557496406' /* ← ضع رقم واتساب المتجر هنا بصيغة دولية بدون + */ };
})();
