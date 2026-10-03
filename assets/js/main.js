/* ========== ZACHTE PAGINA-OVERGANG (fade-in bij load, fade-out bij interne link) ========== */
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fade-in: 'js-loading' (gezet door een inline <script> in <head>, vóór de eerste paint)
  // weer weghalen zodra dit script draait — de CSS-transitie in style.css doet de rest.
  // Zonder JS wordt de klasse nooit gezet, dus blijft de pagina gewoon zichtbaar.
  if (prefersReducedMotion) {
    document.documentElement.classList.remove('js-loading');
    return; // geen fade-out-interceptie bij reduced motion: normale, directe navigatie
  }
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('js-loading');
  });

  const FADE_MS = 300;
  const normalizePath = (p) => (p.replace(/index\.html$/, '').replace(/\/$/, '')) || '/';

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const a = e.target.closest('a');
    if (!a) return;
    if (a.target && a.target !== '_self') return; // _blank etc. -> normale navigatie
    if (a.hasAttribute('download')) return;

    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (err) {
      return;
    }

    if (url.origin !== window.location.origin) return; // externe link: normale navigatie
    if (normalizePath(url.pathname) === normalizePath(window.location.pathname)) return; // zelfde pagina: laat de smooth-scroll/hash dit afhandelen

    e.preventDefault();
    document.documentElement.classList.add('page-leaving');
    setTimeout(() => {
      window.location.href = url.href;
    }, FADE_MS);
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  /* ========== MOBILE MENU ========== */
  const header = document.querySelector('header');
 const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

const closeMobileMenu = () => {
  if (!mobileMenu) return;
  mobileMenu.classList.add('hidden');
};

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // Sluit menu zodra je op een link klikt (paginalinks én de #expertise-anchor) —
  // dit moet vóór de eventuele navigatie/scroll gebeuren, anders "flitst" de
  // pagina door de layout-shift van het inklappende menu.
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu());
  });
}

  /* ========== STICKY HEADER: .scrolled BIJ SCROLL ========== */
  if (header) {
    const updateHeaderScrolled = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    updateHeaderScrolled();
    window.addEventListener('scroll', updateHeaderScrolled, { passive: true });
  }


  /* ========== SMOOTH SCROLL (steunt op CSS scroll-margin-top voor header-offset) ========== */
  function smoothScrollTo(hash, pushHistory = true) {
    const target = document.querySelector(hash);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (pushHistory) {
      history.pushState(null, '', hash);
    }
  }

  // Als je op een hash refresht/aankomt (index.html#expertise, ...) → juiste offset
  if (window.location.hash) {
    setTimeout(() => {
      smoothScrollTo(window.location.hash, false);
    }, 50);
  }

  /* ========== REVEAL ANIMATIES (IntersectionObserver) ========== */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ========== JAAR IN FOOTER ========== */
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();

  /* ========== POLICY MODAL (PRIVACY / VOORWAARDEN) ========== */
  const modal = document.getElementById('policyModal');
  const btnPrivacy = document.getElementById('btnPrivacy');
  const btnTerms = document.getElementById('btnTerms');

  if (modal && btnPrivacy && btnTerms) {
    const backdrop = modal.querySelector('.modal-backdrop-enter');

    const switchTab = (tabName) => {
      const tabs = modal.querySelectorAll('.policy-tab');
      const panels = modal.querySelectorAll('.policy-panel');

      tabs.forEach((tabBtn) => {
        const active = tabBtn.dataset.tab === tabName;
        tabBtn.classList.toggle('tab-active', active);
        tabBtn.setAttribute('aria-selected', String(active));
      });

      panels.forEach((panel) => {
        const active = panel.id === `policy-${tabName}`;
        panel.classList.toggle('hidden', !active);
      });
    };

    const trapFocus = (modalEl) => {
      const focusables = modalEl.querySelectorAll(
        'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      modalEl.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
    };

    const openModal = (tabName) => {
      switchTab(tabName);
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('overflow-hidden');

      modal.querySelector('.modal-panel-enter')?.classList.add('is-in');
      backdrop?.classList.add('is-in');

      trapFocus(modal);
    };

    const closeModal = () => {
      modal.querySelector('.modal-panel-enter')?.classList.remove('is-in');
      backdrop?.classList.remove('is-in');

      setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('overflow-hidden');
      }, 200);
    };

    btnPrivacy.addEventListener('click', () => openModal('privacy'));
    btnTerms.addEventListener('click', () => openModal('terms'));

    modal.querySelectorAll('[data-close-modal]').forEach((el) =>
      el.addEventListener('click', closeModal)
    );

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.dataset.closeModal !== undefined) {
        closeModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    modal.querySelectorAll('.policy-tab').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    modal.querySelectorAll('.acc-btn').forEach((btn) => {
      btn.setAttribute('type', 'button');
      btn.addEventListener('click', () => {
        const panel = btn.nextElementSibling;
        const open = panel.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }
});


const waFloat = document.getElementById('waFloat');
const footerEl = document.querySelector('footer');
// Alleen de onderste regel (copyright + Privacy/Voorwaarden) kan de zwevende knop
// echt overlappen — niet de hele footer. Zo verbergt de knop niet te vroeg op
// kortere pagina's waar de footer al (bijna) in beeld is bij het laden.
const footerLegalRow = footerEl ? footerEl.querySelector('.border-t.border-white\\/15') : null;

if (waFloat && (footerLegalRow || footerEl) && 'IntersectionObserver' in window) {
  const ioWa = new IntersectionObserver(
    (entries) => {
      waFloat.classList.toggle('wa-hide', entries[0].isIntersecting);
    },
    { threshold: 0.15 }
  );

  ioWa.observe(footerLegalRow || footerEl);
}

document.addEventListener("DOMContentLoaded", () => {
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  if (!counters.length) return;

  const animate = (el) => {
    if (el.dataset.done === "1") return;
    el.dataset.done = "1";

    const target = Number(el.dataset.count || el.getAttribute("data-count")) || 0;
    const isPercent = (el.dataset.suffix || "").includes("%") || el.textContent.trim().includes("%");

    const duration = 1200;
    const start = performance.now();
    const from = 0;

    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const value = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
      el.textContent = value + (isPercent ? "%" : "");
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  // Als IO bestaat → netjes bij in beeld komen
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });

    counters.forEach((el) => io.observe(el));
    return;
  }

  // Fallback
  counters.forEach(animate);
});

/* ========== SCROLL-CHOREOGRAFIE (GSAP + ScrollTrigger) ========== */
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Reduced motion of GSAP niet geladen -> niets aanraken, content blijft zichtbaar (CSS-default)
  if (prefersReducedMotion || typeof gsap === 'undefined') return;

  const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const run = () => {
    /* ---- 1) HERO: intro bij load (geen scroll) ---- */
    const hero = document.querySelector('#hero');
    if (hero) {
      const label = hero.querySelector('p.font-mono');
      const line = hero.querySelector('.h-px');
      const h1 = hero.querySelector('h1');
      const lede = hero.querySelector('p.text-ink-muted');
      const ctaRow = hero.querySelector('.mt-10.flex.flex-wrap.items-center.justify-center.gap-4');
      const subline = hero.querySelector('p.text-sm.text-ink-muted');
      const trustRow = hero.querySelector('.border-t.border-line.flex.flex-wrap');

      const heroGroups = [
        [label, line].filter(Boolean),
        [h1].filter(Boolean),
        [lede].filter(Boolean),
        [ctaRow, subline].filter(Boolean),
        [trustRow].filter(Boolean)
      ].filter((g) => g.length);

      if (heroGroups.length) {
        gsap.set(heroGroups.flat(), { autoAlpha: 0, y: 20 });
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } });
        heroGroups.forEach((group, i) => {
          heroTl.to(group, { autoAlpha: 1, y: 0, clearProps: 'all' }, i * 0.12);
        });
      }
    }

    if (!hasScrollTrigger) return; // rest van de choreografie vraagt scroll-detectie

    /* ---- 2) SECTIE-KOPPEN: label + lijntje + H2 + lede bij scroll ---- */
    ['#expertise', '#diensten', '#werkwijze', '#over', '#contact'].forEach((sel) => {
      const section = document.querySelector(sel);
      if (!section) return;

      const label = section.querySelector('p.font-mono');
      const line = section.querySelector('.h-px');
      const heading = section.querySelector('h2');
      const lede = heading && heading.nextElementSibling && heading.nextElementSibling.tagName === 'P'
        ? heading.nextElementSibling
        : null;
      const targets = [label, line, heading, lede].filter(Boolean);
      if (!targets.length) return;

      gsap.set(targets, { autoAlpha: 0, y: 24 });
      gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none none' }
      }).to(targets, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1, clearProps: 'all' });
    });

    /* ---- 3) LIJST-ITEMS MET STAGGER (expertise / diensten / werkwijze) ---- */
    const revealStaggerGroup = (items, { y = 16, duration = 0.6 } = {}) => {
      if (!items || !items.length) return;
      gsap.set(items, { autoAlpha: 0, y });
      gsap.timeline({
        scrollTrigger: {
          trigger: items[0].parentElement,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }).to(items, { autoAlpha: 1, y: 0, duration, ease: 'power3.out', stagger: 0.1, clearProps: 'all' });
    };

    revealStaggerGroup(document.querySelectorAll('#expertise article'));
    revealStaggerGroup(document.querySelectorAll('#diensten article'));
    revealStaggerGroup(document.querySelectorAll('#werkwijze .space-y-10 > div'));

    /* ---- 4) STATS-BAND: cijfers komen in met scale + fade (count-up blijft ongewijzigd) ---- */
    const statsSection = Array.from(document.querySelectorAll('section')).find(
      (s) => s.classList.contains('bg-brand-900') && !s.id
    );
    if (statsSection) {
      const numberSpans = Array.from(statsSection.querySelectorAll('[data-count]'));
      const pairs = numberSpans.flatMap((span) => [span, span.nextElementSibling].filter(Boolean));
      if (pairs.length) {
        gsap.set(pairs, { autoAlpha: 0, scale: 0.96, transformOrigin: 'left center' });
        gsap.timeline({
          scrollTrigger: { trigger: statsSection, start: 'top 80%', toggleActions: 'play none none none' }
        }).to(pairs, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08, clearProps: 'all' });
      }
    }

    /* ---- 5) FRAMED PHOTOS: subtiele reveal (scale 1.05 -> 1 + fade) ---- */
    document.querySelectorAll('.framed-photo').forEach((wrap) => {
      const img = wrap.querySelector('img');
      gsap.set(wrap, { autoAlpha: 0 });
      if (img) gsap.set(img, { scale: 1.05 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: wrap, start: 'top 85%', toggleActions: 'play none none none' }
      });
      tl.to(wrap, { autoAlpha: 1, duration: 0.9, ease: 'power3.out', clearProps: 'all' }, 0);
      if (img) tl.to(img, { scale: 1, duration: 0.9, ease: 'power3.out', clearProps: 'all' }, 0);
    });

    /* ---- Herberekenen na volledige load (afbeeldingen, fonts, ...) ---- */
    window.addEventListener('load', () => ScrollTrigger.refresh());
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
