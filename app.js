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

  // Service cards: tap to expand on touch devices (desktop uses :hover)
  const services = document.querySelectorAll('[data-service]');
  if (services.length && window.matchMedia('(hover: none)').matches) {
    const closeServices = (except) => services.forEach(s => { if (s !== except) s.classList.remove('is-open'); });
    services.forEach(s => s.addEventListener('click', () => {
      const willOpen = !s.classList.contains('is-open');
      closeServices(s);
      s.classList.toggle('is-open', willOpen);
    }));
    document.addEventListener('click', (e) => { if (!e.target.closest('[data-service]')) closeServices(null); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeServices(null); });
  }

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

  const cards = document.querySelectorAll('.ref-card');

  // Lightbox (only on pages that have one)
  const lb = document.querySelector('.lightbox');
  if (lb) {
    const lbCard = lb.querySelector('.lightbox-card');
    const lbStamp = lb.querySelector('[data-lb-stamp]');
    const lbName = lb.querySelector('[data-lb-name]');
    const lbMeta = lb.querySelector('[data-lb-meta]');
    const lbImg = lb.querySelector('[data-lb-img]');
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
      const src = c.querySelector('.img img');
      if (src) { lbImg.src = src.getAttribute('src'); lbImg.alt = src.getAttribute('alt') || ''; }
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    cards.forEach((c) => c.addEventListener('click', () => {
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
  }

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

      const data = new FormData(form);
      const tipus = data.get('tipus') === 'ceg' ? 'Cég / építőipar' : 'Magánszemély';
      const name = (data.get('name') || '').trim();
      const phone = (data.get('phone') || '').trim();
      const email = (data.get('email') || '').trim();
      const service = data.get('service') || '';
      const sizes = (data.get('sizes') || '').trim();
      const message = (data.get('message') || '').trim();

      const subject = `Árajánlatkérés — ${name} (${service})`;
      const body = [
        `Ügyfél típusa: ${tipus}`,
        `Név: ${name}`,
        `Telefon: ${phone}`,
        `E-mail: ${email}`,
        `Szolgáltatás: ${service}`,
        sizes ? `Nyílászáró méretek: ${sizes}` : null,
        '',
        'Részletek:',
        message,
      ].filter((line) => line !== null).join('\n');

      window.location.href = `mailto:vajgy76@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

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
