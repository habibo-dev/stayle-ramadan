/* STAYLE — بيانات المتجر */
(function () {
  /* صور المنتجات: img/<المنتج>-<رقم اللون>.webp — خلفية شفافة. استبدلها بصور منتجاتك بنفس الأسماء */
  const art = (p, colorIdx) => 'img/' + p.id + '-' + (colorIdx || 0) + '.webp';

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

  window.STAYLE = { products, byId, looks, SIZES, CUTS, art, fmt, BUNDLE_OFF: 0.1,
    WHATSAPP: '213557496406' /* ← ضع رقم واتساب المتجر هنا بصيغة دولية بدون + */ };
})();
