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

  // Sluit menu zodra je op een link klikt
  mobileMenu.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu());
  });
}


  /* ========== SMOOTH SCROLL MET HEADER-OFFSET + MENU AUTODICHT ========== */
  function smoothScrollTo(hash, pushHistory = true) {
    const target = document.querySelector(hash);
    if (!target) return;

    const headerHeight = header ? header.offsetHeight : 0;
    const extraOffset = 12; // klein beetje ruimte onder de header

    const top =
      target.getBoundingClientRect().top +
      window.pageYOffset -
      headerHeight -
      extraOffset;

    window.scrollTo({ top, behavior: 'smooth' });

    if (pushHistory) {
      history.pushState(null, '', hash);
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;
      if (a.closest('.modal')) return; // geen smooth scroll in modal

      e.preventDefault();
      smoothScrollTo(hash);

      // 👉 menu automatisch dichtklappen als je vanuit het mobile menu klikt
      if (mobileMenu && a.closest('#mobileMenu')) {
        mobileMenu.classList.add('hidden');
      }
    });
  });

  // Als je op een hash refresht (#contact, #inzicht, ...) → juiste offset
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

  /* ========== COUNTERS ========== */
  const counters = document.querySelectorAll('.counter');

  function animateCounter(el) {
    const target = parseInt(el.dataset.target || '0', 10);
    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * progress);
      el.textContent = value.toString();
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              io2.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach((c) => io2.observe(c));
    } else {
      counters.forEach((c) => animateCounter(c));
    }
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

if (waFloat && footerEl && 'IntersectionObserver' in window) {
  const ioWa = new IntersectionObserver(
    (entries) => {
      waFloat.classList.toggle('wa-hide', entries[0].isIntersecting);
    },
    { threshold: 0.15 }
  );

  ioWa.observe(footerEl);
}

// ===== Stats Counter (langzamer) – DATA-TARGET versie =====
(function () {
  // Pak de stats grid in #expertise
  const statsWrap = document.querySelector('#expertise .lg\\:col-span-2.mt-6');
  if (!statsWrap) return;

  const cards = Array.from(statsWrap.children);
  if (!cards.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Langzamer -> hoger = langer
  const DURATION = prefersReduced ? 0 : 2400; // was 1800, nu trager
  const STAGGER = prefersReduced ? 0 : 220;   // tussen cards

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function animateNumber(el, toValue, suffix, onDone) {
    if (DURATION === 0) {
      el.textContent = `${toValue}${suffix}`;
      onDone?.();
      return;
    }

    const start = performance.now();
    const from = 0;

    function frame(now) {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = easeOutCubic(p);
      const current = Math.round(from + (toValue - from) * eased);

      el.textContent = `${current}${suffix}`;

      if (p < 1) requestAnimationFrame(frame);
      else {
        el.textContent = `${toValue}${suffix}`;
        onDone?.();
      }
    }

    requestAnimationFrame(frame);
  }

  function run() {
    cards.forEach((card, i) => {
      const numberEl = card.querySelector('.stat-number');
      if (!numberEl) return;

      const target = parseInt(numberEl.dataset.target, 10);
      const suffix = numberEl.dataset.suffix ?? '%';
      if (!Number.isFinite(target)) return;

      // reset
      card.classList.remove('stat-done');
      numberEl.textContent = `0${suffix}`;

      setTimeout(() => {
        animateNumber(numberEl, target, suffix, () => {
          card.classList.add('stat-done'); // triggert je glow/pop CSS
        });
      }, i * STAGGER);
    });
  }

  // Start wanneer in beeld
  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        run();
        io.disconnect();
      }
    },
    { threshold: 0.25 }
  );

  io.observe(statsWrap);
})();


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
