/* Vajda Gyula — interactivity */
(function(){
  'use strict';

  // Scrolled header
  const header = document.querySelector('.header');
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const mobile = document.querySelector('.mobile-menu');
  const closeMobile = () => {
    mobile.classList.remove('open');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
  };
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      toggle.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobile.classList.contains('open')) closeMobile();
    });
    // Close on resize past mobile breakpoint (orientation flip, viewport widen)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 960 && mobile.classList.contains('open')) closeMobile();
    });
  }

  // FAQ
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0';
    });
  });

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Reference filter
  const chips = document.querySelectorAll('.ref-chip');
  const cards = document.querySelectorAll('.ref-card');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    cards.forEach(c => {
      const tags = (c.dataset.tags || '').split(' ');
      const show = f === 'all' || tags.includes(f);
      c.style.display = show ? '' : 'none';
    });
  }));

  // Lightbox
  const lb = document.querySelector('.lightbox');
  const lbCard = lb.querySelector('.lightbox-card');
  const lbStamp = lb.querySelector('[data-lb-stamp]');
  const lbName = lb.querySelector('[data-lb-name]');
  const lbMeta = lb.querySelector('[data-lb-meta]');
  let lbIdx = 0;
  const visibleCards = () => Array.from(cards).filter(c => c.style.display !== 'none');
  function showLb(i) {
    const list = visibleCards();
    if (!list.length) return;
    lbIdx = (i + list.length) % list.length;
    const c = list[lbIdx];
    lbStamp.textContent = c.dataset.stamp || '';
    lbName.textContent = c.dataset.name || '';
    lbMeta.textContent = c.dataset.meta || '';
    const cls = c.querySelector('.img').className;
    lbCard.querySelector('.img').className = cls;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  cards.forEach((c, i) => c.addEventListener('click', () => {
    const list = visibleCards();
    const idx = list.indexOf(c);
    showLb(idx);
  }));
  lb.querySelector('.lightbox-close').addEventListener('click', () => { lb.classList.remove('open'); document.body.style.overflow = ''; });
  lb.querySelector('.lightbox-prev').addEventListener('click', () => showLb(lbIdx - 1));
  lb.querySelector('.lightbox-next').addEventListener('click', () => showLb(lbIdx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) { lb.classList.remove('open'); document.body.style.overflow = ''; } });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') { lb.classList.remove('open'); document.body.style.overflow = ''; }
    if (e.key === 'ArrowLeft') showLb(lbIdx - 1);
    if (e.key === 'ArrowRight') showLb(lbIdx + 1);
  });

  // Form validation
  const form = document.querySelector('.cform');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[data-required]').forEach(field => {
        const wrap = field.closest('.cf');
        const v = (field.value || '').trim();
        let valid = !!v;
        if (field.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        if (field.type === 'tel') valid = /^[+0-9 \-()\/]{6,}$/.test(v);
        wrap.classList.toggle('error', !valid);
        if (!valid) ok = false;
      });
      if (!ok) return;
      form.classList.add('sent');
      const success = form.querySelector('.cform-success');
      success.classList.add('show');
    });
    form.querySelectorAll('input, textarea, select').forEach(f => {
      f.addEventListener('input', () => f.closest('.cf')?.classList.remove('error'));
      f.addEventListener('change', () => f.closest('.cf')?.classList.remove('error'));
    });
  }

  // Smooth-scroll offset (sticky header)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();
