

document.addEventListener('DOMContentLoaded', () => {

  const carouselImages = [
    'images/hero-image-first-slide.jpg',
    'images/hero-image-first-slide.jpg',
    'images/hero-image-first-slide.jpg',
    'images/hero-image-first-slide.jpg',
    'images/hero-image-first-slide.jpg',
    'images/hero-image-first-slide.jpg',
  ];

  let currentSlide = 0;
  const mainImage = document.getElementById('mainImage');
  const thumbs = document.querySelectorAll('.carousel--thumb');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  /**
   * Updates the carousel to show the given slide index.
   */
  function goToSlide(index) {
    if (index < 0) index = carouselImages.length - 1;
    if (index >= carouselImages.length) index = 0;
    currentSlide = index;

    // Update main image
    mainImage.src = carouselImages[currentSlide];

    // Update thumbnail active state
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentSlide);
    });

    // Keep zoom panel in sync when visible (e.g. user clicked prev/next while hovering)
    if (zoomResult && zoomResult.style.display === 'block') {
      zoomResult.style.backgroundImage = `url(${carouselImages[currentSlide]})`;
    }
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Thumbnail navigation
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const index = parseInt(thumb.dataset.index, 10);
      goToSlide(index);
    });
  });

  // ---- Zoom on Hover ----
  const carouselMain = document.getElementById('carouselMain') || document.querySelector('.carousel--main');
  const zoomLens = document.getElementById('zoomLens');
  const zoomResult = document.getElementById('zoomResult');

  carouselMain.addEventListener('mouseenter', () => {
    zoomLens.style.display = 'block';
    zoomResult.style.display = 'block';
    zoomResult.style.backgroundImage = `url(${carouselImages[currentSlide]})`;
  });

  carouselMain.addEventListener('mouseleave', () => {
    zoomLens.style.display = 'none';
    zoomResult.style.display = 'none';
  });

  carouselMain.addEventListener('mousemove', (e) => {
    const rect = carouselMain.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Lens dimensions
    const lensW = 120;
    const lensH = 120;

    // Clamp lens position within the image bounds
    let lensX = x - lensW / 2;
    let lensY = y - lensH / 2;
    lensX = Math.max(0, Math.min(lensX, rect.width - lensW));
    lensY = Math.max(0, Math.min(lensY, rect.height - lensH));

    zoomLens.style.left = lensX + 'px';
    zoomLens.style.top = lensY + 'px';

    const zoomFactor = 2.5;
    const bgW = rect.width * zoomFactor;
    const bgH = rect.height * zoomFactor;
    const bgX = -(lensX * zoomFactor);
    const bgY = -(lensY * zoomFactor);

    zoomResult.style.backgroundSize = `${bgW}px ${bgH}px`;
    zoomResult.style.backgroundPosition = `${bgX}px ${bgY}px`;
  });

  const stickyHeader = document.getElementById('stickyHeader');
  const heroSection = document.getElementById('heroSection');
  let lastScrollY = 0;
  let heroBottom = 0;

  /**
   * Controls the sticky header visibility based on scroll position.
   * Shows header when scrolling down past the hero, hides when scrolling back up.
   */
  function handleScroll() {
    const scrollY = window.scrollY;
    heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

    if (scrollY > heroBottom && scrollY > lastScrollY) {
      // Scrolling down past hero → show sticky header
      stickyHeader.classList.add('visible');
    } else if (scrollY < lastScrollY || scrollY <= heroBottom) {
      // Scrolling up or back in hero → hide sticky header
      stickyHeader.classList.remove('visible');
    }

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  goToSlide(0);

  const faqList = document.getElementById('faqList');
  if (faqList) {
    const faqItems = faqList.querySelectorAll('.faq--item');

    faqItems.forEach((item) => {
      const question = item.querySelector('.faq--question');

      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all items
        faqItems.forEach((otherItem) => {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq--question').setAttribute('aria-expanded', 'false');
        });

        // Toggle clicked item (if it wasn't already open)
        if (!isActive) {
          item.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ---- Applications Carousel ----
  const appTrack = document.getElementById('appTrack');
  const appPrev = document.getElementById('appPrev');
  const appNext = document.getElementById('appNext');

  if (appTrack && appPrev && appNext) {
    let appScrollPos = 0;
    const cardWidth = 300; // card min-width + gap

    appNext.addEventListener('click', () => {
      const maxScroll = appTrack.scrollWidth - appTrack.parentElement.offsetWidth;
      appScrollPos = Math.min(appScrollPos + cardWidth, maxScroll);
      appTrack.style.transform = `translateX(-${appScrollPos}px)`;
    });

    appPrev.addEventListener('click', () => {
      appScrollPos = Math.max(appScrollPos - cardWidth, 0);
      appTrack.style.transform = `translateX(-${appScrollPos}px)`;
    });
  }

  // ---- Manufacturing Process Tabs (desktop) + Mobile step cards (Prev/Next) ----
  const mfgTabs = document.getElementById('mfgTabs');
  const mfgPanels = document.getElementById('mfgPanels');
  const mfgMobileNav = document.getElementById('mfgMobileNav');
  const mfgMobileBtns = document.getElementById('mfgMobileBtns');
  const mfgCurrentStepEl = document.getElementById('mfgCurrentStep');
  const mfgStepNameEl = document.getElementById('mfgStepName');
  const mfgMobilePrev = document.getElementById('mfgMobilePrev');
  const mfgMobileNext = document.getElementById('mfgMobileNext');

  if (mfgTabs && mfgPanels) {
    const tabs = mfgTabs.querySelectorAll('.manufacturing--tab');
    const panels = mfgPanels.querySelectorAll('.manufacturing--panel');
    const totalSteps = tabs.length;

    function setActiveMfg(index) {
      const i = Math.max(0, Math.min(index, totalSteps - 1));
      const tab = tabs[i];
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const targetPanel = mfgPanels.querySelector(`[data-panel="${target}"]`);
      if (targetPanel) targetPanel.classList.add('active');

      if (mfgCurrentStepEl) mfgCurrentStepEl.textContent = i + 1;
      if (mfgStepNameEl) mfgStepNameEl.textContent = tab.textContent.trim();
      if (mfgMobileNav) mfgMobileNav.setAttribute('aria-hidden', 'false');
      if (mfgMobileBtns) mfgMobileBtns.setAttribute('aria-hidden', 'false');

      if (mfgMobilePrev) {
        mfgMobilePrev.disabled = i === 0;
        mfgMobilePrev.setAttribute('aria-disabled', i === 0 ? 'true' : 'false');
      }
      if (mfgMobileNext) {
        mfgMobileNext.disabled = i === totalSteps - 1;
        mfgMobileNext.setAttribute('aria-disabled', i === totalSteps - 1 ? 'true' : 'false');
      }
    }

    function getActiveMfgIndex() {
      const activeTab = mfgTabs.querySelector('.manufacturing--tab.active');
      if (!activeTab) return 0;
      return Array.from(tabs).indexOf(activeTab);
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach((t) => t.classList.remove('active'));
        panels.forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        const targetPanel = mfgPanels.querySelector(`[data-panel="${target}"]`);
        if (targetPanel) targetPanel.classList.add('active');
        const idx = Array.from(tabs).indexOf(tab);
        if (mfgCurrentStepEl) mfgCurrentStepEl.textContent = idx + 1;
        if (mfgStepNameEl) mfgStepNameEl.textContent = tab.textContent.trim();
        if (mfgMobilePrev) {
          mfgMobilePrev.disabled = idx === 0;
          mfgMobilePrev.setAttribute('aria-disabled', idx === 0 ? 'true' : 'false');
        }
        if (mfgMobileNext) {
          mfgMobileNext.disabled = idx === totalSteps - 1;
          mfgMobileNext.setAttribute('aria-disabled', idx === totalSteps - 1 ? 'true' : 'false');
        }
      });
    });

    if (mfgMobilePrev) {
      mfgMobilePrev.addEventListener('click', () => setActiveMfg(getActiveMfgIndex() - 1));
    }
    if (mfgMobileNext) {
      mfgMobileNext.addEventListener('click', () => setActiveMfg(getActiveMfgIndex() + 1));
    }

    setActiveMfg(0);
  }

  const trustedLogosWrapper = document.getElementById('trustedCompaniesLogos');
  if (trustedLogosWrapper) {
    let isDown = false;
    let startX;
    let scrollLeft;

    trustedLogosWrapper.addEventListener('mousedown', (e) => {
      isDown = true;
      trustedLogosWrapper.classList.add('dragging');
      startX = e.pageX - trustedLogosWrapper.offsetLeft;
      scrollLeft = trustedLogosWrapper.scrollLeft;
    });

    trustedLogosWrapper.addEventListener('mouseleave', () => {
      isDown = false;
      trustedLogosWrapper.classList.remove('dragging');
    });

    trustedLogosWrapper.addEventListener('mouseup', () => {
      isDown = false;
      trustedLogosWrapper.classList.remove('dragging');
    });

    trustedLogosWrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - trustedLogosWrapper.offsetLeft;
      const walk = (x - startX) * 1.5;
      trustedLogosWrapper.scrollLeft = scrollLeft - walk;
    });

    trustedLogosWrapper.addEventListener('wheel', (e) => {
      if (trustedLogosWrapper.scrollWidth <= trustedLogosWrapper.clientWidth) return;
      e.preventDefault();
      trustedLogosWrapper.scrollLeft += e.deltaY;
    }, { passive: false });
  }

  // ---- Testimonials Drag-to-Scroll ----
  const testimonialWrapper = document.querySelector('.testimonials--track-wrapper');
  if (testimonialWrapper) {
    let isDown = false;
    let startX;
    let scrollLeft;

    testimonialWrapper.addEventListener('mousedown', (e) => {
      isDown = true;
      testimonialWrapper.classList.add('dragging');
      startX = e.pageX - testimonialWrapper.offsetLeft;
      scrollLeft = testimonialWrapper.scrollLeft;
    });

    testimonialWrapper.addEventListener('mouseleave', () => {
      isDown = false;
      testimonialWrapper.classList.remove('dragging');
    });

    testimonialWrapper.addEventListener('mouseup', () => {
      isDown = false;
      testimonialWrapper.classList.remove('dragging');
    });

    testimonialWrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - testimonialWrapper.offsetLeft;
      const walk = (x - startX) * 1.5;
      testimonialWrapper.scrollLeft = scrollLeft - walk;
    });
  }

  // ---- Modals: Catalogue (Datasheet) + Request a call back (Quote) ----
  const modalCatalogue = document.getElementById('modalCatalogue');
  const modalRequestCallback = document.getElementById('modalRequestCallback');
  const openCatalogueModalBtn = document.getElementById('openCatalogueModal');
  const closeCatalogueModalBtn = document.getElementById('closeCatalogueModal');
  const modalCatalogueBackdrop = document.getElementById('modalCatalogueBackdrop');
  const closeRequestCallbackModalBtn = document.getElementById('closeRequestCallbackModal');
  const modalRequestCallbackBackdrop = document.getElementById('modalRequestCallbackBackdrop');
  const openRequestModalBtns = document.querySelectorAll('.js-open-request-modal');

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstInput = modalEl.querySelector('.modal--input, .modal--phone-code');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function handleEscape(e) {
    if (e.key !== 'Escape') return;
    if (modalCatalogue && modalCatalogue.classList.contains('is-open')) closeModal(modalCatalogue);
    if (modalRequestCallback && modalRequestCallback.classList.contains('is-open')) closeModal(modalRequestCallback);
  }

  if (openCatalogueModalBtn && modalCatalogue) {
    openCatalogueModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalCatalogue);
    });
  }
  if (closeCatalogueModalBtn) closeCatalogueModalBtn.addEventListener('click', () => closeModal(modalCatalogue));
  if (modalCatalogueBackdrop) modalCatalogueBackdrop.addEventListener('click', () => closeModal(modalCatalogue));

  if (openRequestModalBtns.length && modalRequestCallback) {
    openRequestModalBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(modalRequestCallback);
      });
    });
  }
  if (closeRequestCallbackModalBtn) closeRequestCallbackModalBtn.addEventListener('click', () => closeModal(modalRequestCallback));
  if (modalRequestCallbackBackdrop) modalRequestCallbackBackdrop.addEventListener('click', () => closeModal(modalRequestCallback));

  document.addEventListener('keydown', handleEscape);

  document.getElementById('formCatalogue')?.addEventListener('submit', (e) => {
    e.preventDefault();
    closeModal(modalCatalogue);
  });
  document.getElementById('formRequestCallback')?.addEventListener('submit', (e) => {
    e.preventDefault();
    closeModal(modalRequestCallback);
  });
});
