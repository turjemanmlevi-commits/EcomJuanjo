(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initAnnouncement(root) {
    $$('[data-announcement]', root).forEach((bar) => {
      const slides = $$('.announcement-bar__slide', bar);
      if (slides.length < 2) return;
      let i = 0;
      setInterval(() => {
        slides[i].classList.remove('is-active');
        i = (i + 1) % slides.length;
        slides[i].classList.add('is-active');
      }, Number(bar.dataset.speed || 5) * 1000);
    });
  }

  const config = window.theme || { routes: {}, strings: {} };
  const routes = Object.assign({ cart: '/cart', cartAdd: '/cart/add', cartChange: '/cart/change', search: '/search', predictiveSearch: '/search/suggest' }, config.routes);
  const strings = config.strings || {};
  const escapeHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // Slide-out panels (menu, cart, filters, search): scroll lock, focus trap, Escape, focus return.
  const openPanels = new Set();
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  function createPanel(panel, overlay, options = {}) {
    if (panel._panel) return panel._panel;
    let trigger = null;
    const isOpen = () => panel.classList.contains('is-open');
    const visibleFocusables = () => $$(FOCUSABLE, panel).filter((el) => el.offsetWidth || el.offsetHeight || el.getClientRects().length);

    const onKeydown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const items = visibleFocusables();
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    function open(from) {
      if (isOpen()) return;
      trigger = from || document.activeElement;
      openPanels.forEach((p) => p !== panel && p._panel.close(false));
      panel.removeAttribute('inert');
      panel.classList.add('is-open');
      if (overlay) overlay.classList.add('is-open');
      if (trigger && trigger.hasAttribute && trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'true');
      openPanels.add(panel);
      document.documentElement.classList.add('scroll-locked');
      document.addEventListener('keydown', onKeydown);
      ((options.initialFocus && options.initialFocus()) || panel).focus({ preventScroll: true });
    }

    function close(returnFocus = true) {
      if (!isOpen()) return;
      panel.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-open');
      panel.setAttribute('inert', '');
      if (trigger && trigger.hasAttribute && trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');
      openPanels.delete(panel);
      if (!openPanels.size) document.documentElement.classList.remove('scroll-locked');
      document.removeEventListener('keydown', onKeydown);
      if (returnFocus && trigger && trigger.focus) trigger.focus({ preventScroll: true });
    }

    if (overlay) overlay.addEventListener('click', () => close());
    panel._panel = { open, close, isOpen };
    return panel._panel;
  }

  function initDrawer() {
    const drawer = $('[data-nav-drawer]');
    if (!drawer || drawer._panel) return;
    const panel = createPanel(drawer, $('[data-drawer-overlay]'));
    $$('[data-drawer-open]').forEach((b) => b.addEventListener('click', () => panel.open(b)));
    $$('[data-drawer-close]', drawer).forEach((b) => b.addEventListener('click', () => panel.close()));
  }

  // ---------------------------------------------------------------------------
  // Cart: AJAX add/change + Section Rendering API to refresh the drawer and cart page.
  // ---------------------------------------------------------------------------
  const cartDrawerEl = () => $('[data-cart-drawer]');
  const useDrawer = () => config.cartType !== 'page' && !!cartDrawerEl() && !document.body.classList.contains('template-cart');

  function cartPanel() {
    const drawer = cartDrawerEl();
    if (!drawer) return null;
    const panel = createPanel(drawer, $('[data-cart-drawer-overlay]'), { initialFocus: () => $('[data-cart-drawer-close]', drawer) });
    if (!drawer.dataset.bound) {
      drawer.dataset.bound = 'true';
      $$('[data-cart-drawer-close]', drawer).forEach((b) => b.addEventListener('click', () => panel.close()));
    }
    return panel;
  }

  const cartSectionIds = () => $$('[data-cart-section]').map((el) => el.dataset.cartSection);

  function renderCartSections(sections) {
    if (!sections) return;
    Object.keys(sections).forEach((id) => {
      const html = sections[id];
      const root = $$('[data-cart-section]').find((el) => el.dataset.cartSection === id);
      if (!root || !html) return;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      $$('[data-cart-replace]', root).forEach((el) => {
        const fresh = $(`[data-cart-replace="${el.dataset.cartReplace}"]`, doc);
        if (!fresh) return;
        el.innerHTML = fresh.innerHTML;
        if (fresh.dataset.cartItemCount != null) el.dataset.cartItemCount = fresh.dataset.cartItemCount;
      });
    });
    const counter = $('[data-cart-item-count]');
    if (counter) {
      const count = Number(counter.dataset.cartItemCount) || 0;
      $$('[data-cart-count]').forEach((badge) => { badge.textContent = count; badge.hidden = count === 0; });
    }
  }

  function showCartError(message) {
    $$('[data-cart-error]').forEach((el) => { el.textContent = message || strings.cartError || ''; el.hidden = false; });
  }

  async function parseCartResponse(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status) throw new Error(data.description || data.message || strings.cartError);
    return data;
  }

  function setCartBusy(busy) {
    $$('[data-cart-replace="contents"]').forEach((el) => {
      el.classList.toggle('is-loading', busy);
      el.setAttribute('aria-busy', String(busy));
    });
  }

  async function changeCartLine(line, quantity) {
    setCartBusy(true);
    try {
      const res = await fetch(`${routes.cartChange}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line, quantity, sections: cartSectionIds(), sections_url: window.location.pathname }),
      });
      const data = await parseCartResponse(res);
      renderCartSections(data.sections);
    } catch (err) {
      showCartError(err.message);
    } finally {
      setCartBusy(false);
    }
  }

  function initCart() {
    if (document.documentElement.dataset.cartBound) return;
    document.documentElement.dataset.cartBound = 'true';
    const timers = {};

    document.addEventListener('click', (e) => {
      const step = e.target.closest('[data-qty-step]');
      if (step) {
        const input = $('input', step.closest('[data-qty]'));
        const min = Number(input.min) || 0;
        const next = Math.max(min, (parseInt(input.value, 10) || 0) + Number(step.dataset.qtyStep));
        if (String(next) !== input.value) {
          input.value = next;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return;
      }

      const remove = e.target.closest('[data-cart-remove]');
      if (remove) {
        e.preventDefault();
        changeCartLine(Number(remove.dataset.cartRemove), 0);
        return;
      }

      const opener = e.target.closest('[data-cart-open]');
      if (opener && useDrawer()) {
        e.preventDefault();
        cartPanel().open(opener);
      }
    });

    // Enter in a cart quantity saves it instead of posting the whole form.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !e.target.matches('input[data-cart-line]')) return;
      e.preventDefault();
      e.target.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Cart quantities save on their own, shortly after the last change.
    document.addEventListener('change', (e) => {
      const input = e.target.closest('input[data-cart-line]');
      if (!input) return;
      const line = Number(input.dataset.cartLine);
      clearTimeout(timers[line]);
      timers[line] = setTimeout(() => changeCartLine(line, Math.max(0, parseInt(input.value, 10) || 0)), 350);
    });

    document.addEventListener('submit', async (e) => {
      const form = e.target.closest('[data-product-form]');
      if (!form || !useDrawer()) return;
      e.preventDefault();
      const button = $('[data-add-to-cart]', form);
      const error = $('[data-product-error]', form.closest('[data-product]') || form);
      if (button) { button.setAttribute('aria-busy', 'true'); button.classList.add('is-loading'); }
      if (error) error.hidden = true;
      try {
        const body = new FormData(form);
        body.append('sections', cartSectionIds().join(','));
        body.append('sections_url', window.location.pathname);
        const res = await fetch(`${routes.cartAdd}.js`, { method: 'POST', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body });
        const data = await parseCartResponse(res);
        renderCartSections(data.sections);
        cartPanel().open(button);
      } catch (err) {
        if (error) { error.textContent = err.message || strings.cartError; error.hidden = false; }
      } finally {
        if (button) { button.removeAttribute('aria-busy'); button.classList.remove('is-loading'); }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Search overlay with live product suggestions (Shopify Predictive Search API).
  // ---------------------------------------------------------------------------
  function initSearch() {
    const modal = $('[data-search-modal]');
    if (!modal || modal._panel) return;
    const input = $('[data-search-input]', modal);
    const results = $('[data-search-results]', modal);
    const panel = createPanel(modal, null, { initialFocus: () => input });
    $$('[data-search-open]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); panel.open(a); }));
    $$('[data-search-close]', modal).forEach((b) => b.addEventListener('click', () => panel.close()));
    if (config.predictiveSearch === false) return;

    let timer;
    let controller;
    const searchUrl = (q) => `${routes.search}?q=${encodeURIComponent(q)}&type=product`;
    const thumb = (src) => {
      if (!src) return '<span class="search-result__image search-result__image--empty"></span>';
      try { const u = new URL(src, window.location.origin); u.searchParams.set('width', '160'); src = u.toString(); } catch (e) {}
      return `<span class="search-result__image"><img src="${escapeHtml(src)}" alt="" loading="lazy" width="80" height="106"></span>`;
    };
    const toCents = (v) => Math.round(parseFloat(v) * 100);

    function render(q, products) {
      if (!products.length) {
        results.innerHTML = `<p class="search-results__empty">${escapeHtml((strings.searchNoResults || '').replace('[terms]', q))}</p>`;
        return;
      }
      const items = products.map((p) => {
        const price = toCents(p.price);
        const compare = toCents(p.compare_at_price_max || 0);
        const priceHtml = compare > price
          ? `<s>${escapeHtml(formatMoney(compare, config.moneyFormat))}</s> <span class="search-result__sale">${escapeHtml(formatMoney(price, config.moneyFormat))}</span>`
          : escapeHtml(formatMoney(price, config.moneyFormat));
        const image = (p.featured_image && p.featured_image.url) || p.image;
        return `<li><a class="search-result" href="${escapeHtml(p.url)}">${thumb(image)}<span class="search-result__info"><span class="search-result__title">${escapeHtml(p.title)}</span><span class="search-result__price">${priceHtml}</span></span></a></li>`;
      }).join('');
      results.innerHTML = `<p class="search-results__heading">${escapeHtml(strings.searchProducts || '')}</p><ul class="search-results__list" role="list">${items}</ul><a class="search-results__all" href="${escapeHtml(searchUrl(q))}">${escapeHtml((strings.searchViewAll || '').replace('[terms]', q))} →</a>`;
    }

    async function run() {
      const q = input.value.trim();
      if (controller) controller.abort();
      if (q.length < 2) { results.innerHTML = ''; return; }
      controller = new AbortController();
      const url = `${routes.predictiveSearch}.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=6&resources[options][unavailable_products]=last`;
      try {
        const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
        const data = await res.json();
        render(q, (data.resources && data.resources.results && data.resources.results.products) || []);
      } catch (err) {
        if (err.name !== 'AbortError') results.innerHTML = '';
      }
    }
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 220); });
  }

  // ---------------------------------------------------------------------------
  // Collection / search filters: drawer, auto-submit sort, clean URLs.
  // ---------------------------------------------------------------------------
  function initFacets(root) {
    $$('[data-facets]', root).forEach((facets) => {
      if (facets.dataset.bound) return;
      facets.dataset.bound = 'true';
      const form = $('[data-facets-form]', facets);
      const drawer = $('[data-facets-drawer]', facets);
      if (drawer) {
        drawer.setAttribute('inert', '');
        const panel = createPanel(drawer, $('[data-facets-overlay]', facets));
        $$('[data-facets-open]', facets).forEach((b) => b.addEventListener('click', () => panel.open(b)));
        $$('[data-facets-close]', facets).forEach((b) => b.addEventListener('click', () => panel.close()));
      }
      const submit = () => {
        const params = new URLSearchParams();
        new FormData(form).forEach((value, key) => { if (value !== '') params.append(key, value); });
        const query = params.toString();
        window.location.href = form.action.split('?')[0] + (query ? `?${query}` : '');
      };
      form.addEventListener('submit', (e) => { e.preventDefault(); submit(); });
      $$('[data-facets-autosubmit]', facets).forEach((el) => el.addEventListener('change', submit));
    });
  }

  // Related products are loaded after the page so they never slow down the product page.
  function initRecommendations(root) {
    $$('[data-recommendations]', root).forEach(async (el) => {
      if (el.children.length || !el.dataset.url) return;
      try {
        const html = await (await fetch(el.dataset.url)).text();
        const fresh = $('[data-recommendations]', new DOMParser().parseFromString(html, 'text/html'));
        if (fresh && fresh.innerHTML.trim()) {
          el.innerHTML = fresh.innerHTML;
          initReveal(el);
        }
      } catch (e) {}
    });
  }

  // Counts down to a real end date; once it has passed the timer is removed.
  function initCountdown(root) {
    $$('[data-countdown]', root).forEach((el) => {
      const end = Date.parse(el.dataset.countdown);
      const timers = $$('[data-countdown-time]', el);
      const hideTimer = () => $$('[data-countdown-part]', el).forEach((n) => n.remove());
      if (isNaN(end)) return hideTimer();
      const pad = (n) => String(n).padStart(2, '0');
      const tick = () => {
        const diff = end - Date.now();
        if (diff <= 0) {
          clearInterval(id);
          return hideTimer();
        }
        const d = Math.floor(diff / 864e5);
        const h = Math.floor((diff % 864e5) / 36e5);
        const m = Math.floor((diff % 36e5) / 6e4);
        const s = Math.floor((diff % 6e4) / 1e3);
        const text = (d ? d + 'd ' : '') + pad(h) + 'h ' + pad(m) + 'm ' + pad(s) + 's';
        timers.forEach((t) => (t.textContent = text));
      };
      const id = setInterval(tick, 1000);
      tick();
    });
  }

  function initHero(root) {
    $$('[data-hero]', root).forEach((hero) => {
      const slides = $$('.hero__slide', hero);
      const dots = $$('.hero__dot', hero);
      if (slides.length < 2) return;
      let i = 0;
      let timer;
      const go = (n) => {
        slides[i].classList.remove('is-active');
        dots[i] && dots[i].classList.remove('is-active');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('is-active');
        dots[i] && dots[i].classList.add('is-active');
      };
      const play = () => {
        clearInterval(timer);
        if (hero.dataset.autoplay === 'true' && !reduceMotion) timer = setInterval(() => go(i + 1), Number(hero.dataset.speed || 7) * 1000);
      };
      dots.forEach((d, n) => d.addEventListener('click', () => { go(n); play(); }));
      play();
    });
  }

  // Reviews wheel. Native scroll-snap does the swiping (momentum, keyboard, screen readers);
  // this feeds each card its distance from the centre so CSS can tilt and drop it along an
  // arc, loops the list with clones, and marks the centred review so its text writes itself in.
  function initTestimonials(root) {
    $$('[data-testimonials]', root).forEach((section) => {
      if (section.dataset.bound) return;
      section.dataset.bound = 'true';
      const slider = $('.testimonials__slider', section);
      const originals = $$('.testimonials__slide', slider);
      const count = originals.length;
      if (!count) return;
      const motion = !reduceMotion;
      const designMode = !!(window.Shopify && window.Shopify.designMode);
      // Five or more reviews fill the wheel on both sides, so it can turn forever.
      const loop = count >= 5 && !designMode;
      const progress = $('[data-progress]', section);
      if (progress) progress.style.setProperty('--count', count);

      // Split each quote into words so they can appear one after another.
      if (motion) {
        $$('.testimonials__text', slider).forEach((quote) => {
          let n = 0;
          const walker = document.createTreeWalker(quote, NodeFilter.SHOW_TEXT);
          const nodes = [];
          while (walker.nextNode()) nodes.push(walker.currentNode);
          nodes.forEach((node) => {
            if (!node.textContent.trim()) return;
            const frag = document.createDocumentFragment();
            node.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
              const word = document.createElement('span');
              word.className = 'testimonials__word';
              word.style.setProperty('--w', n++);
              word.textContent = part;
              frag.appendChild(word);
            });
            node.replaceWith(frag);
          });
          quote.style.setProperty('--words', n);
        });
      }

      if (loop) {
        const clone = (slide) => {
          const copy = slide.cloneNode(true);
          copy.removeAttribute('data-shopify-editor-block');
          copy.setAttribute('aria-hidden', 'true');
          copy.setAttribute('inert', '');
          return copy;
        };
        slider.prepend(...originals.map(clone));
        slider.append(...originals.map(clone));
      }
      const slides = $$('.testimonials__slide', slider);
      const cards = slides.map((s) => $('.testimonials__card', s) || s);
      const first = loop ? count : 0;
      const clampIndex = (i) => Math.max(0, Math.min(slides.length - 1, i));

      let centers = [];
      let step = 1;
      // All cards share one width, so derive positions from the ends: offsetLeft rounds to
      // whole pixels and the error would add up across a long wheel.
      const measure = () => {
        const last = slides.length - 1;
        const cardWidth = parseFloat(getComputedStyle(slides[0]).width) || slides[0].offsetWidth;
        step = last ? (slides[last].offsetLeft - slides[0].offsetLeft) / last : slider.clientWidth || 1;
        centers = slides.map((s, i) => slides[0].offsetLeft + i * step + cardWidth / 2);
      };
      const leftFor = (i) => centers[i] - slider.clientWidth / 2;
      // Re-measure whenever the width changed: after a resize the browser may report the
      // re-snapped scroll position before the ResizeObserver below has run.
      let width = 0;
      const syncLayout = () => {
        if (slider.clientWidth === width) return false;
        width = slider.clientWidth;
        measure();
        return true;
      };

      let active = -1;
      let revealed = false;
      const setActive = (i, instant) => {
        if (i === active) return;
        const prev = slides[active];
        active = i;
        if (!revealed) return;
        if (prev) prev.classList.remove('is-active');
        const slide = slides[i];
        if (instant) slide.classList.add('is-instant');
        slide.classList.add('is-active');
        if (instant) { void slide.offsetWidth; slide.classList.remove('is-instant'); }
      };

      let frame = 0;
      const lastD = [];
      const update = () => {
        frame = 0;
        syncLayout();
        const mid = slider.scrollLeft + slider.clientWidth / 2;
        let nearest = 0;
        let best = Infinity;
        for (let i = 0; i < slides.length; i++) {
          const raw = (centers[i] - mid) / step;
          if (Math.abs(raw) < best) { best = Math.abs(raw); nearest = i; }
          if (!motion) continue;
          const d = Math.round(Math.max(-3, Math.min(3, raw)) * 1000) / 1000;
          if (lastD[i] === d) continue;
          lastD[i] = d;
          cards[i].style.setProperty('--d', d);
          cards[i].style.setProperty('--ad', Math.abs(d));
          cards[i].style.setProperty('--arc', Math.round(d * d * 1000) / 1000);
        }
        setActive(nearest);
        if (progress) {
          const pos = (mid - centers[first]) / step;
          progress.style.setProperty('--p', loop ? ((pos % count) + count) % count : Math.max(0, Math.min(count - 1, pos)));
        }
      };
      const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };

      const goTo = (i, smooth = true) => {
        slider.scrollTo({ left: leftFor(clampIndex(i)), behavior: smooth && motion ? 'smooth' : 'auto' });
      };
      const move = (dir) => {
        let target = active + dir;
        if (!loop && (target < 0 || target >= count)) target = dir > 0 ? 0 : count - 1;
        goTo(target);
      };

      // When the wheel comes to rest on a clone, jump to the matching original. Both look
      // identical, so the swap is invisible and the wheel can keep turning either way.
      let touching = false;
      let drag = null;
      let retries = 0;
      const settle = () => {
        if (touching || drag) return;
        // Snapping back on lets the wheel come to rest on a card.
        slider.classList.remove('is-dragging');
        if (frame) cancelAnimationFrame(frame);
        update();
        if (!loop) return;
        const offCentre = Math.abs(centers[active] - (slider.scrollLeft + slider.clientWidth / 2));
        if (offCentre > 2 && retries++ < 10) { settleWhenIdle(); return; }
        retries = 0;
        const logical = active - first;
        if (logical >= 0 && logical < count) return;
        const target = first + ((logical % count) + count) % count;
        slider.scrollLeft += centers[target] - centers[active];
        setActive(target, true);
        update();
      };
      // Never jump while momentum is still carrying the wheel: wait until scrolling has gone quiet.
      let settleTimer;
      let lastScroll = 0;
      const settleWhenIdle = () => {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => (performance.now() - lastScroll > 140 ? settle() : settleWhenIdle()), 160);
      };
      slider.addEventListener('scroll', () => {
        lastScroll = performance.now();
        requestUpdate();
        settleWhenIdle();
      }, { passive: true });
      slider.addEventListener('scrollend', settle);
      slider.addEventListener('touchstart', () => { touching = true; }, { passive: true });
      const touchEnd = () => { touching = false; settleWhenIdle(); };
      slider.addEventListener('touchend', touchEnd, { passive: true });
      slider.addEventListener('touchcancel', touchEnd, { passive: true });

      // Autoplay: only while on screen, paused on hover or focus, stopped for good once the
      // customer takes the wheel. Never starts when reduced motion is requested.
      const speed = Number(section.dataset.autoplay) || 0;
      const toggle = $('[data-autoplay-toggle]', section);
      let stopped = !speed || !motion;
      let inView = false;
      let hovering = false;
      let focused = false;
      let timer = null;
      const schedule = () => {
        clearInterval(timer);
        timer = null;
        if (!stopped && inView && !hovering && !focused && !document.hidden) {
          // Stops by itself if the theme editor re-renders the section.
          timer = setInterval(() => (section.isConnected ? move(1) : clearInterval(timer)), speed * 1000);
        }
        if (toggle) {
          toggle.classList.toggle('is-paused', stopped);
          toggle.setAttribute('aria-label', stopped ? toggle.dataset.labelPlay : toggle.dataset.labelPause);
        }
      };
      const takeOver = () => { if (!stopped) { stopped = true; schedule(); } };
      if (toggle) toggle.addEventListener('click', () => { stopped = !stopped; if (!stopped) move(1); schedule(); });
      slider.addEventListener('mouseenter', () => { hovering = true; schedule(); });
      slider.addEventListener('mouseleave', () => { hovering = false; schedule(); });
      section.addEventListener('focusin', (e) => { focused = !e.target.closest('[data-autoplay-toggle]'); schedule(); });
      section.addEventListener('focusout', () => { focused = false; schedule(); });
      document.addEventListener('visibilitychange', schedule);
      slider.addEventListener('pointerdown', takeOver);
      slider.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) takeOver(); }, { passive: true });

      $('[data-prev]', section)?.addEventListener('click', () => { takeOver(); move(-1); });
      $('[data-next]', section)?.addEventListener('click', () => { takeOver(); move(1); });
      slider.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        takeOver();
        move(e.key === 'ArrowRight' ? 1 : -1);
      });

      // Mouse: drag the wheel and let go to land on the next review. Touch scrolls natively.
      let suppressClick = false;
      slider.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        drag = { x: e.clientX, left: slider.scrollLeft, from: active, moved: false };
      });
      slider.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        if (!drag.moved) {
          if (Math.abs(dx) < 5) return;
          // Only a real drag captures the pointer, so a plain click still reaches the card.
          drag.moved = true;
          slider.classList.add('is-dragging');
          slider.setPointerCapture(e.pointerId);
        }
        slider.scrollLeft = drag.left - dx;
      });
      const endDrag = (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        const { from, moved } = drag;
        drag = null;
        suppressClick = moved;
        if (!moved) return;
        const jump = Math.max(1, Math.round(Math.abs(dx) / step));
        goTo(Math.abs(dx) > step * 0.12 ? from + (dx < 0 ? jump : -jump) : active);
        // If the wheel was already in place no scroll event follows, so tidy up here.
        setTimeout(() => { if (!drag && Math.abs(slider.scrollLeft - leftFor(active)) < 2) settle(); }, 80);
      };
      slider.addEventListener('pointerup', endDrag);
      slider.addEventListener('pointercancel', endDrag);
      slider.addEventListener('dragstart', (e) => e.preventDefault());
      // Clicking a side card brings it to the centre.
      slider.addEventListener('click', (e) => {
        if (suppressClick) { suppressClick = false; return; }
        const i = slides.indexOf(e.target.closest('.testimonials__slide'));
        if (i > -1 && i !== active) { takeOver(); goTo(i); }
      });

      section.addEventListener('shopify:block:select', (e) => {
        const i = slides.indexOf(e.target.closest('.testimonials__slide'));
        if (i > -1) { takeOver(); goTo(i, false); }
      });

      // Start on the first review (or the middle one when the wheel cannot loop, so it looks balanced).
      syncLayout();
      const start = loop ? first : Math.floor((count - 1) / 2);
      slider.scrollLeft = leftFor(start);
      update();
      slides.forEach((s, i) => s.style.setProperty('--enter', Math.max(0, Math.min(7, i - (start - 3)))));
      if (motion) {
        // Hide the cards for their entrance without animating them out first.
        section.classList.add('is-instant', 'is-wheel');
        void section.offsetWidth;
        section.classList.remove('is-instant');
      }

      // Keep the same review centred when the width changes.
      new ResizeObserver(() => {
        const keep = active;
        if (!syncLayout()) return;
        if (keep > -1) slider.scrollLeft = leftFor(keep);
        update();
      }).observe(slider);

      const enter = () => {
        section.classList.add('is-in');
        // The centred review writes itself in once its card has landed.
        setTimeout(() => {
          revealed = true;
          const i = active;
          active = -1;
          setActive(i);
        }, motion ? 600 : 0);
      };
      if (!('IntersectionObserver' in window)) { inView = true; enter(); schedule(); return; }
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !section.classList.contains('is-in')) enter();
        schedule();
      }, { threshold: 0.2 }).observe(section);
    });
  }

  function initCollapsibles(root) {
    $$('.collapsible-trigger', root).forEach((btn) => {
      const content = document.getElementById(btn.getAttribute('aria-controls'));
      if (!content) return;
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', open);
        content.classList.toggle('is-open', open);
      });
    });
  }

  function initBackToTop(root) {
    $$('[data-back-to-top]', root).forEach((b) => b.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })));
  }

  function initModals(root) {
    $$('[data-modal-open]', root).forEach((b) => {
      const dialog = document.getElementById(b.dataset.modalOpen);
      if (!dialog) return;
      b.addEventListener('click', () => dialog.showModal());
      $$('[data-modal-close]', dialog).forEach((c) => c.addEventListener('click', () => dialog.close()));
      dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
    });
  }

  function formatMoney(cents, format) {
    const value = (cents / 100).toFixed(2);
    const [int, dec] = value.split('.');
    const withSep = (sep) => int.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return format.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
      switch (key) {
        case 'amount_no_decimals': return withSep(',');
        case 'amount_with_comma_separator': return withSep('.') + ',' + dec;
        case 'amount_no_decimals_with_comma_separator': return withSep('.');
        default: return withSep(',') + '.' + dec;
      }
    });
  }

  function initProduct(root) {
    $$('[data-product]', root).forEach((section) => {
      // Gallery
      const slides = $$('.product-main-slide', section);
      const thumbs = $$('.product__thumb', section);
      const showMedia = (id) => {
        if (!slides.some((s) => s.dataset.mediaId === String(id))) return;
        slides.forEach((s) => s.classList.toggle('is-active', s.dataset.mediaId === String(id)));
        thumbs.forEach((t) => t.classList.toggle('is-active', t.dataset.mediaId === String(id)));
      };
      thumbs.forEach((t) => t.addEventListener('click', (e) => { e.preventDefault(); showMedia(t.dataset.mediaId); }));

      // Touch gallery: swipe horizontally while preserving normal vertical scrolling.
      const gallery = $('.product__main-photos', section);
      if (gallery && slides.length > 1) {
        let startX = 0;
        let startY = 0;
        let tracking = false;
        gallery.addEventListener('touchstart', (e) => {
          if (e.touches.length !== 1) return;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          tracking = true;
        }, { passive: true });
        gallery.addEventListener('touchend', (e) => {
          if (!tracking || !e.changedTouches.length) return;
          tracking = false;
          const dx = e.changedTouches[0].clientX - startX;
          const dy = e.changedTouches[0].clientY - startY;
          if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return;
          const activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
          const nextIndex = (activeIndex + (dx < 0 ? 1 : -1) + slides.length) % slides.length;
          showMedia(slides[nextIndex].dataset.mediaId);
        }, { passive: true });
        gallery.addEventListener('touchcancel', () => { tracking = false; }, { passive: true });
      }

      // Variants
      const json = $('[data-variants]', section);
      if (!json) return;
      const variants = JSON.parse(json.textContent);
      const moneyFormat = section.dataset.moneyFormat || '${{amount}}';
      const idInput = $('[name="id"]', section);
      const button = $('[data-add-to-cart]', section);
      const buttonText = $('[data-add-to-cart-text]', section);
      const groups = $$('[data-option-index]', section);

      const update = () => {
        const selected = groups.map((g) => { const c = $('input:checked', g); return c ? c.value : null; });
        groups.forEach((g, i) => { const cur = $('[data-option-current]', g.closest('.variant-wrapper')); if (cur) cur.textContent = selected[i]; });
        const variant = variants.find((v) => v.options.every((o, i) => o === selected[i]));

        if (button) {
          button.disabled = !variant || !variant.available;
          buttonText.textContent = !variant ? button.dataset.textUnavailable : variant.available ? button.dataset.textAdd : button.dataset.textSoldOut;
        }
        if (!variant) return;
        if (idInput) idInput.value = variant.id;

        const onSale = variant.compare_at_price > variant.price;
        $$('[data-price-block]', section).forEach((block) => {
          block.classList.toggle('price-block--sale', onSale);
          $('[data-price]', block).textContent = formatMoney(variant.price, moneyFormat);
          const original = $('[data-compare-price]', block);
          const badge = $('[data-save-badge]', block);
          if (original) { original.hidden = !onSale; original.textContent = onSale ? formatMoney(variant.compare_at_price, moneyFormat) : ''; }
          if (badge) {
            badge.hidden = !onSale;
            if (onSale) badge.textContent = badge.dataset.template.replace('[percent]', Math.round(((variant.compare_at_price - variant.price) * 100) / variant.compare_at_price));
          }
        });

        if (variant.featured_media) showMedia(variant.featured_media.id);
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url);
      };
      groups.forEach((g) => g.addEventListener('change', update));
    });
  }

  // Sections fade in once as they enter the viewport (CSS skips it under reduced motion).
  function initReveal(root) {
    if (!('IntersectionObserver' in window)) return;
    const targets = $$('.index-section, .features, .grid-product', root).filter((el) => !el.closest('.hero') && !el.querySelector('[data-story-animate]'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach((el) => {
      if (el.classList.contains('grid-product')) {
        const siblings = Array.from(el.parentElement.children);
        el.style.setProperty('--reveal-index', siblings.indexOf(el) % 5);
      }
      el.setAttribute('data-reveal', '');
      io.observe(el);
    });
  }

  // Story block (text + overlapping photos): paragraphs appear one by one, photos uncover like a
  // curtain, the signature writes itself last; afterwards the photos drift gently on scroll.
  function initStory(root) {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    $$('[data-story-animate]', root).forEach((row) => {
      if (row.dataset.storyBound) return;
      row.dataset.storyBound = 'true';
      const steps = $$('.feature-row__text > .h1, .feature-row__text .rte > *, .feature-row__text > .btn', row);
      steps.forEach((el, i) => el.style.setProperty('--i', i));
      row.style.setProperty('--story-steps', steps.length);
      row.classList.add('story-ready');

      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        row.classList.add('is-animated');
        io.disconnect();
      }, { threshold: 0.2 });
      io.observe(row);

      // Parallax: the two photos move at opposite speeds, a few pixels at most.
      const wraps = $$('.feature-row__item:not(.feature-row__text) > div', row);
      if (!wraps.length) return;
      let ticking = false;
      let visible = false;
      const update = () => {
        ticking = false;
        if (!window.innerHeight) return;
        const rect = row.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight));
        wraps.forEach((w, i) => w.style.setProperty('--parallax', `${(progress * (i % 2 ? -28 : 18)).toFixed(1)}px`));
      };
      const onScroll = () => { if (visible && !ticking) { ticking = true; requestAnimationFrame(update); } };
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) onScroll(); }).observe(row);
      window.addEventListener('scroll', onScroll, { passive: true });
      update();
    });
  }

  // Mobile: show a compact add-to-cart bar while the main button is off screen.
  function initStickyCart(root) {
    $$('[data-product]', root).forEach((section) => {
      const bar = $('[data-sticky-atc]', section);
      const main = $('[data-add-to-cart]', section);
      if (!bar || !main || !('IntersectionObserver' in window)) return;
      const buy = $('[data-sticky-buy]', bar);
      buy.addEventListener('click', () => main.click());
      new MutationObserver(() => { buy.disabled = main.disabled; }).observe(main, { attributes: true, attributeFilter: ['disabled'] });
      new IntersectionObserver(([entry]) => {
        const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        bar.classList.toggle('is-visible', show);
        bar.setAttribute('aria-hidden', String(!show));
      }).observe(main);
    });
  }

  function init(root) {
    initAnnouncement(root);
    initDrawer();
    initCart();
    initSearch();
    initFacets(root);
    initRecommendations(root);
    initCountdown(root);
    initHero(root);
    initTestimonials(root);
    initCollapsibles(root);
    initBackToTop(root);
    initModals(root);
    initProduct(root);
    initStickyCart(root);
    initStory(root);
    initReveal(root);
  }

  document.addEventListener('DOMContentLoaded', () => init(document));
  document.addEventListener('shopify:section:load', (e) => init(e.target));
})();
