// ==========================================================================
// ZENTARA VENTURE STUDIO - INTERACTIVE JS
// ==========================================================================

// 0. Page Preloader Dismissal Controller
(function initPagePreloader() {
  const dismissPreloader = () => {
    const preloader = document.getElementById('pagePreloader');
    if (preloader && !preloader.classList.contains('is-loaded')) {
      setTimeout(() => {
        preloader.classList.add('is-loaded');
        setTimeout(() => {
          preloader.remove();
        }, 700);
      }, 400);
    }
  };

  if (document.readyState === 'complete') {
    dismissPreloader();
  } else {
    window.addEventListener('load', dismissPreloader);
    // Fallback safety timeout so user is never stuck
    setTimeout(dismissPreloader, 2500);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 0.0 LENIS SMOOTH SCROLLING ENGINE & GSAP SCROLLTRIGGER SYNCHRONIZATION
  // ==========================================================================
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
    });

    // Synchronize Lenis scroll event with GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    // Connect Lenis RAF to GSAP Ticker for smooth 60/120fps lockstep
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(500, 33);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Expose lenis instance globally
    window.lenis = lenis;

    // Smooth scroll for internal anchor navigation
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#' && !anchor.classList.contains('trigger-contact-modal')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, { offset: -60, duration: 0.9 });
          }
        }
      });
    });
  }

  // 0. Sticky Navigation Bar & Mobile Menu Drawer Controls
  const navbar = document.querySelector('.navbar');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

  if (navbar) {
    let isSticky = false;
    const updateNavbarSticky = (y) => {
      const shouldBeSticky = y > 30;
      if (shouldBeSticky !== isSticky) {
        isSticky = shouldBeSticky;
        if (isSticky) {
          navbar.classList.add('is-sticky');
        } else {
          navbar.classList.remove('is-sticky');
        }
      }
    };

    if (lenis) {
      lenis.on('scroll', (e) => {
        updateNavbarSticky(e.scroll);
      });
    } else {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateNavbarSticky(window.scrollY);
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
    updateNavbarSticky(window.scrollY);
  }

  // Mobile Menu Fullscreen Overlay Controls
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileOverlayCloseBtn = document.getElementById('mobileOverlayCloseBtn');
  const mobileProductsTrigger = document.getElementById('mobileProductsTrigger');
  const mobileProductsDropdown = document.getElementById('mobileProductsDropdown');

  const openMobileOverlay = () => {
    if (mobileNavOverlay) {
      mobileNavOverlay.classList.add('active');
      mobileNavOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      if (window.lenis) window.lenis.stop();
    }
  };

  const closeMobileOverlay = () => {
    if (mobileNavOverlay) {
      mobileNavOverlay.classList.remove('active');
      mobileNavOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (window.lenis) window.lenis.start();
    }
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMobileOverlay();
    });
  }

  if (mobileOverlayCloseBtn) {
    mobileOverlayCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileOverlay();
    });
  }

  if (mobileProductsTrigger && mobileProductsDropdown) {
    mobileProductsTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      mobileProductsDropdown.classList.toggle('dropdown-active');
    });
  }

  // Close mobile overlay on clicking link items
  if (mobileNavOverlay) {
    const overlayLinks = mobileNavOverlay.querySelectorAll('a');
    overlayLinks.forEach(link => {
      link.addEventListener('click', closeMobileOverlay);
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileOverlay();
    }
  });

  // 1. Contact Modal Controls
  const modalOverlay = document.getElementById('contactModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const contactTriggers = document.querySelectorAll('.trigger-contact-modal');
  const contactForm = document.getElementById('contactForm');

  const openModal = () => {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
  };

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
  };

  contactTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.form-submit-btn');
      submitBtn.textContent = 'Sending...';
      submitBtn.style.opacity = '0.7';

      setTimeout(() => {
        submitBtn.textContent = 'Message Sent! ✓';
        submitBtn.style.background = '#10b981';
        submitBtn.style.opacity = '1';

        setTimeout(() => {
          closeModal();
          contactForm.reset();
          submitBtn.textContent = 'Send Message';
          submitBtn.style.background = '';
        }, 1500);
      }, 1000);
    });
  }

  // 2. Partner Network Dynamic Tabs
  const tabItems = document.querySelectorAll('.tab-pill-item');
  const networkDesc = document.getElementById('networkDesc');

  const tabContents = {
    'startup-network': 'Over time we have built a strong network of founders, startups, and technology partners. These collaborations allow us to combine different expertise, move faster, and create better products.',
    'strategic-partnerships': 'We collaborate directly with global venture funds, cloud providers, and enterprise software leaders to accelerate our portfolio companies from day one.',
    'industry-experience': 'Our advisors bring decades of hands-on operator experience across AI, FinTech, SaaS, Healthcare, and DeepTech verticals.'
  };

  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      tabItems.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetKey = tab.getAttribute('data-tab');
      if (networkDesc && tabContents[targetKey]) {
        networkDesc.style.opacity = '0';
        setTimeout(() => {
          networkDesc.textContent = tabContents[targetKey];
          networkDesc.style.opacity = '1';
        }, 150);
      }
    });
  });

  // 3. Smooth Hover Card Tilt Effects
  const cards = document.querySelectorAll('.specialists-blue-card, .philosophy-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);
      
      const tiltX = (y / (rect.height / 2)) * -4;
      const tiltY = (x / (rect.width / 2)) * 4;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // 4. GSAP Cinematic Banner Slider Animation System
  const bannerStage = document.getElementById('gsapPromoBanner');
  if (bannerStage && typeof gsap !== 'undefined') {
    const gsapSlides = bannerStage.querySelectorAll('.gsap-slide');
    const gsapTabs = bannerStage.querySelectorAll('.gsap-nav-tab');
    const gsapPrevBtn = bannerStage.querySelector('.gsap-prev-btn');
    const gsapNextBtn = bannerStage.querySelector('.gsap-next-btn');
    const gsapBackdrop = document.getElementById('gsapStageBackdrop');
    const gsapProgressFill = document.getElementById('gsapProgressFill');

    let currentSlideIdx = 0;
    let isSlideAnimating = false;
    const totalGsapSlides = gsapSlides.length;
    const SLIDE_DURATION = 5; // 5s per slide
    let progressTween = null;

    // Initialize initial slide state
    gsapSlides.forEach((slide, idx) => {
      if (idx === 0) {
        gsap.set(slide, { display: 'block', opacity: 1 });
      } else {
        gsap.set(slide, { display: 'none', opacity: 0 });
      }
    });

    const animateInSlide = (targetIndex) => {
      const slide = gsapSlides[targetIndex];
      const badge = slide.querySelector('.gsap-badge-wrap');
      const title = slide.querySelector('.gsap-title');
      const desc = slide.querySelector('.gsap-description');
      const chips = slide.querySelectorAll('.gsap-chip');
      const cta = slide.querySelector('.gsap-primary-cta');
      const statCard = slide.querySelector('.gsap-stat-card');
      const targetGradient = slide.getAttribute('data-gradient');

      // Morph background gradient
      if (gsapBackdrop && targetGradient) {
        gsap.to(gsapBackdrop, {
          background: targetGradient,
          duration: 1,
          ease: 'power2.out'
        });
      }

      // Display slide container
      gsap.set(slide, { display: 'block', opacity: 1 });

      // Check if on mobile screen
      const isMobile = window.innerWidth <= 768;

      // Choreographed GSAP timeline
      const tl = gsap.timeline({
        onComplete: () => {
          isSlideAnimating = false;
        }
      });

      tl.fromTo(badge, 
        { y: isMobile ? -10 : -20, opacity: 0, scale: 0.9 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
      )
      .fromTo(title, 
        { y: isMobile ? 20 : 35, opacity: 0, rotateX: isMobile ? 0 : -15 }, 
        { y: 0, opacity: 1, rotateX: 0, duration: 0.6, ease: 'power3.out' }, 
        '-=0.25'
      )
      .fromTo(desc, 
        { y: isMobile ? 12 : 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' }, 
        '-=0.4'
      )
      .fromTo(chips, 
        { x: isMobile ? -12 : -25, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, 
        '-=0.3'
      )
      .fromTo(cta, 
        { y: isMobile ? 15 : 25, opacity: 0, scale: 0.95 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.4)' }, 
        '-=0.3'
      )
      .fromTo(statCard, 
        { scale: 0.85, opacity: 0, rotate: isMobile ? 0 : 3 }, 
        { scale: 1, opacity: 1, rotate: 0, duration: 0.6, ease: 'power3.out' }, 
        '-=0.5'
      );
    };

    const animateOutSlide = (oldIndex, newIndex) => {
      const oldSlide = gsapSlides[oldIndex];
      isSlideAnimating = true;

      gsap.to(oldSlide, {
        opacity: 0,
        y: -15,
        scale: 0.98,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(oldSlide, { display: 'none', y: 0, scale: 1 });
          currentSlideIdx = newIndex;
          updateTabButtons(currentSlideIdx);
          animateInSlide(currentSlideIdx);
          startProgressFill();
        }
      });
    };

    const goToSlide = (nextIndex) => {
      if (isSlideAnimating || nextIndex === currentSlideIdx) return;
      stopProgressFill();
      animateOutSlide(currentSlideIdx, nextIndex);
    };

    const updateTabButtons = (idx) => {
      gsapTabs.forEach((tab, tIdx) => {
        const isActive = tIdx === idx;
        tab.classList.toggle('active', isActive);
        if (isActive) {
          const parent = tab.parentElement;
          if (parent && typeof parent.scrollTo === 'function') {
            const tabLeft = tab.offsetLeft;
            const tabWidth = tab.offsetWidth;
            const parentWidth = parent.clientWidth;
            parent.scrollTo({
              left: tabLeft - (parentWidth / 2) + (tabWidth / 2),
              behavior: 'smooth'
            });
          }
        }
      });
    };

    const startProgressFill = () => {
      if (!gsapProgressFill) return;
      gsap.killTweensOf(gsapProgressFill);
      gsap.set(gsapProgressFill, { width: '0%' });
      progressTween = gsap.to(gsapProgressFill, {
        width: '100%',
        duration: SLIDE_DURATION,
        ease: 'none',
        onComplete: () => {
          const next = (currentSlideIdx + 1) % totalGsapSlides;
          goToSlide(next);
        }
      });
    };

    const stopProgressFill = () => {
      if (progressTween) progressTween.kill();
      if (gsapProgressFill) gsap.killTweensOf(gsapProgressFill);
    };

    if (gsapNextBtn) {
      gsapNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide((currentSlideIdx + 1) % totalGsapSlides);
      });
    }

    if (gsapPrevBtn) {
      gsapPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide((currentSlideIdx - 1 + totalGsapSlides) % totalGsapSlides);
      });
    }

    gsapTabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetIdx = parseInt(tab.getAttribute('data-index'), 10);
        goToSlide(targetIdx);
      });
    });

    bannerStage.addEventListener('mouseenter', () => {
      if (progressTween) progressTween.pause();
    });

    bannerStage.addEventListener('mouseleave', () => {
      if (progressTween) progressTween.resume();
    });

    // Touch swipe gesture support for mobile phone experience
    let touchStartX = 0;
    let touchStartY = 0;

    bannerStage.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    bannerStage.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Swipe horizontal threshold 40px, ensuring horizontal intent
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) {
            // Swipe Left -> Next
            goToSlide((currentSlideIdx + 1) % totalGsapSlides);
          } else {
            // Swipe Right -> Prev
            goToSlide((currentSlideIdx - 1 + totalGsapSlides) % totalGsapSlides);
          }
        }
      }
    }, { passive: true });

    // Dynamic Background Gradient ScrollTrigger Transition from #FFE2AF to #e4da4f50
    if (typeof ScrollTrigger !== 'undefined' && bannerStage) {
      ScrollTrigger.create({
        trigger: bannerStage,
        start: "top 80%",
        end: "bottom 20%",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          // Smoothly interpolate RGB from #FFE2AF (255, 226, 175) down to #e4da4f50 (rgba(228, 218, 79, 0.31))
          const r = Math.round(255 + (228 - 255) * p);
          const g = Math.round(226 + (218 - 226) * p);
          const b = Math.round(175 + (79 - 175) * p);
          const alpha1 = (1 - 0.3 * p).toFixed(2);
          const alpha2 = (0.7 - 0.39 * p).toFixed(2);
        }
      });
    }

    animateInSlide(0);
    startProgressFill();
  }

  /* ==========================================================================
     5. HONORS & RECOGNITIONS SINGLE CARD 5-SECOND AUTO-SHOWCASE
     ========================================================================== */
  const singleCards = document.querySelectorAll('.award-single-card');
  const singleContainer = document.getElementById('awardsSingleCard');
  const awardsPrevBtn = document.getElementById('awardsPrevBtn');
  const awardsNextBtn = document.getElementById('awardsNextBtn');
  const awardsCurrentIndexEl = document.getElementById('awardsCurrentIndex');
  const awardsStage = document.querySelector('.awards-single-stage');

  if (singleCards.length > 0) {
    let singleIndex = 0;
    const totalSingle = singleCards.length;
    let singleTimer = null;

    const updateStageHeight = () => {
      const activeCard = singleCards[singleIndex];
      if (activeCard && awardsStage && window.innerWidth <= 992) {
        const h = activeCard.offsetHeight;
        if (h > 0) {
          awardsStage.style.minHeight = `${h + 10}px`;
        }
      }
    };

    const showSingleCard = (idx) => {
      singleIndex = (idx + totalSingle) % totalSingle;
      singleCards.forEach((card, i) => {
        card.classList.toggle('active', i === singleIndex);
      });
      if (awardsCurrentIndexEl) {
        awardsCurrentIndexEl.textContent = String(singleIndex + 1).padStart(2, '0');
      }
      setTimeout(updateStageHeight, 50);
    };

    const nextSingleCard = () => {
      showSingleCard(singleIndex + 1);
    };

    const prevSingleCard = () => {
      showSingleCard(singleIndex - 1);
    };

    const startSingleTimer = () => {
      if (!singleTimer) {
        singleTimer = setInterval(nextSingleCard, 5000); // 5 seconds
      }
    };

    const stopSingleTimer = () => {
      if (singleTimer) {
        clearInterval(singleTimer);
        singleTimer = null;
      }
    };

    if (awardsPrevBtn) {
      awardsPrevBtn.addEventListener('click', () => {
        stopSingleTimer();
        prevSingleCard();
        startSingleTimer();
      });
    }

    if (awardsNextBtn) {
      awardsNextBtn.addEventListener('click', () => {
        stopSingleTimer();
        nextSingleCard();
        startSingleTimer();
      });
    }

    if (singleContainer) {
      singleContainer.addEventListener('mouseenter', stopSingleTimer);
      singleContainer.addEventListener('mouseleave', startSingleTimer);

      // Mobile Touch Swipe Support
      let touchStartX = 0;
      let touchEndX = 0;

      singleContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopSingleTimer();
      }, { passive: true });

      singleContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff < 0) {
            nextSingleCard();
          } else {
            prevSingleCard();
          }
        }
        startSingleTimer();
      }, { passive: true });
    }

    window.addEventListener('resize', updateStageHeight);
    updateStageHeight();
    startSingleTimer();
  }

  /* ==========================================================================
     5.5 GUIDING PRINCIPLES MOBILE INTERACTIVE FLUID SWITCHER & SWIPE
     ========================================================================== */
  const vmTabs = document.querySelectorAll('.vm-switch-tab');
  const vmPanels = document.querySelectorAll('[data-panel]');
  const vmBentoContainer = document.getElementById('vmBentoContainer');
  const tabList = ['vision', 'mission', 'values'];

  if (vmTabs.length > 0 && vmPanels.length > 0) {
    let currentVmTab = 'vision';

    const switchVmPanel = (tabName) => {
      currentVmTab = tabName;
      vmTabs.forEach(tab => {
        const isActive = tab.dataset.tab === tabName;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      vmPanels.forEach(panel => {
        const isMatch = panel.dataset.panel === tabName;
        panel.classList.toggle('panel-active', isMatch);
      });
    };

    vmTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchVmPanel(tab.dataset.tab);
      });
    });

    // Mobile Swipe Gesture Support for Guiding Principles
    if (vmBentoContainer) {
      let vmTouchStartX = 0;
      let vmTouchEndX = 0;

      vmBentoContainer.addEventListener('touchstart', (e) => {
        vmTouchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      vmBentoContainer.addEventListener('touchend', (e) => {
        if (window.innerWidth > 768) return;
        vmTouchEndX = e.changedTouches[0].screenX;
        const diff = vmTouchEndX - vmTouchStartX;
        if (Math.abs(diff) > 40) {
          const currentIndex = tabList.indexOf(currentVmTab);
          if (diff < 0) {
            // Swipe left -> next tab
            const nextIdx = Math.min(tabList.length - 1, currentIndex + 1);
            switchVmPanel(tabList[nextIdx]);
          } else {
            // Swipe right -> prev tab
            const prevIdx = Math.max(0, currentIndex - 1);
            switchVmPanel(tabList[prevIdx]);
          }
        }
      }, { passive: true });
    }

    // Set initial active state
    switchVmPanel('vision');
  }

  /* ==========================================================================
     6. HERE'S WHY YOU CAN TRUST US — GSAP HORIZONTAL SCROLL (DESKTOP) & SPATIAL STEPPER (MOBILE)
     ========================================================================== */
  const trustSection = document.getElementById('trust-milestones');
  const trustTrack = document.getElementById('trustTrack');
  const trustViewport = document.getElementById('trustViewport');
  const trustCards = document.querySelectorAll('.trust-card-item');
  const trustActivePath = document.getElementById('trustActivePath');
  const trustCurrentStep = document.getElementById('trustCurrentStep');
  const trustProgressFill = document.getElementById('trustProgressFill');
  const trustPrevBtn = document.getElementById('trustPrevBtn');
  const trustNextBtn = document.getElementById('trustNextBtn');
  const trustPills = document.querySelectorAll('.trust-pill-tab');

  if (trustSection && trustTrack && trustCards.length > 0) {
    let currentCardIdx = 0;
    const totalCards = trustCards.length;
    let scrollToCard = null;

    // Stat Number Counter Animation Helper
    const animateStatCounter = (cardEl) => {
      const counterEl = cardEl.querySelector('.stat-counter');
      if (!counterEl) return;
      const targetVal = parseInt(counterEl.getAttribute('data-count'), 10);
      if (isNaN(targetVal)) return;

      const duration = 1200; // ms
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.floor(ease * targetVal);

        counterEl.textContent = currentVal.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counterEl.textContent = targetVal.toLocaleString();
        }
      };

      requestAnimationFrame(updateCount);
    };

    // Update active card, pill tabs, and step indicators
    const updateActiveStep = (idx) => {
      if (idx < 0) idx = 0;
      if (idx >= totalCards) idx = totalCards - 1;
      currentCardIdx = idx;

      if (trustCurrentStep) {
        trustCurrentStep.textContent = `0${idx + 1}`;
      }
      if (trustProgressFill) {
        trustProgressFill.style.width = `${((idx + 1) / totalCards) * 100}%`;
      }

      trustCards.forEach((card, i) => {
        const isActive = (i === idx);
        card.classList.toggle('active', isActive);
        if (isActive && !card.dataset.counted) {
          card.dataset.counted = 'true';
          animateStatCounter(card);
        }
      });

      trustPills.forEach((pill, i) => {
        const isActive = (i === idx);
        pill.classList.toggle('active', isActive);
        if (isActive && typeof pill.scrollIntoView === 'function') {
          try {
            pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          } catch (e) {}
        }
      });
    };

    // Wire up Mobile Milestone Switcher Tabs
    trustPills.forEach((pill, i) => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.innerWidth <= 768 || !scrollToCard) {
          updateActiveStep(i);
        } else {
          scrollToCard(i);
        }
      });
    });

    // Touch Swipe Gesture Navigation for Phone
    if (trustViewport) {
      let trustTouchStartX = 0;
      let trustTouchEndX = 0;

      trustViewport.addEventListener('touchstart', (e) => {
        trustTouchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      trustViewport.addEventListener('touchend', (e) => {
        if (window.innerWidth > 768) return;
        trustTouchEndX = e.changedTouches[0].screenX;
        const diff = trustTouchEndX - trustTouchStartX;
        if (Math.abs(diff) > 40) {
          if (diff < 0) {
            // Swipe left -> next milestone
            updateActiveStep(currentCardIdx + 1);
          } else {
            // Swipe right -> prev milestone
            updateActiveStep(currentCardIdx - 1);
          }
        }
      }, { passive: true });
    }

    // Prev / Next Button Triggers
    if (trustNextBtn) {
      trustNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.innerWidth <= 768 || !scrollToCard) {
          updateActiveStep(currentCardIdx + 1);
        } else {
          scrollToCard(Math.min(totalCards - 1, currentCardIdx + 1));
        }
      });
    }

    if (trustPrevBtn) {
      trustPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.innerWidth <= 768 || !scrollToCard) {
          updateActiveStep(currentCardIdx - 1);
        } else {
          scrollToCard(Math.max(0, currentCardIdx - 1));
        }
      });
    }

    // Initialize SVG Path length
    const getPathLength = () => {
      if (trustActivePath) {
        try {
          return trustActivePath.getTotalLength() || 2800;
        } catch (e) {
          return 2800;
        }
      }
      return 2800;
    };

    let pathLength = getPathLength();
    if (trustActivePath) {
      trustActivePath.style.strokeDasharray = `${pathLength}px`;
      trustActivePath.style.strokeDashoffset = `${pathLength}px`;
    }

    // Desktop GSAP Horizontal Scroll Setup with matchMedia
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize"
      });

      ScrollTrigger.matchMedia({
        // Desktop Only (> 768px): Pinned Sinusoidal Path Drawing & Plane Flight
        "(min-width: 769px)": function() {
          const getScrollAmount = () => {
            const trackWidth = trustTrack.scrollWidth;
            const viewportWidth = trustViewport.clientWidth;
            return Math.max(0, trackWidth - viewportWidth);
          };

          const getScrollDistance = () => {
            return Math.min(1350, Math.max(1000, (totalCards - 1) * 320));
          };

          const svgCanvasWrapper = document.querySelector('.trust-svg-canvas-wrapper');
          const planeCanvasWrapper = document.querySelector('.trust-plane-canvas-wrapper');
          const tweenTargets = [trustTrack];
          if (svgCanvasWrapper) tweenTargets.push(svgCanvasWrapper);
          if (planeCanvasWrapper) tweenTargets.push(planeCanvasWrapper);

          const scrollTween = gsap.to(tweenTargets, {
            x: () => -getScrollAmount(),
            ease: "none",
            scrollTrigger: {
              trigger: trustSection,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              scrub: 1,
              invalidateOnRefresh: true,
              start: "top 70px",
              end: () => `+=${getScrollDistance()}`,
              onUpdate: (self) => {
                const progress = self.progress || 0;

                // 1. Dynamic continuous SVG line drawing
                if (trustActivePath && pathLength) {
                  const currentOffset = pathLength * (1 - progress);
                  trustActivePath.style.strokeDashoffset = `${currentOffset}px`;
                }

                // 2. Position and orient animated Plane.svg along the tip of the line
                const trustPlaneLeader = document.getElementById('trustPlaneLeader');
                if (trustPlaneLeader && trustActivePath && pathLength) {
                  try {
                    const currentDist = progress * pathLength;
                    const p = trustActivePath.getPointAtLength(currentDist);
                    const pNext = trustActivePath.getPointAtLength(Math.min(pathLength, currentDist + 6));
                    const angleDeg = Math.atan2(pNext.y - p.y, pNext.x - p.x) * (180 / Math.PI);
                    trustPlaneLeader.setAttribute('transform', `translate(${p.x}, ${p.y}) rotate(${angleDeg})`);
                  } catch (e) {}
                }

                // 3. Update active card & indicators
                const cardIndex = Math.min(totalCards - 1, Math.floor(progress * totalCards + 0.05));
                updateActiveStep(cardIndex);
              }
            }
          });

          scrollToCard = (index) => {
            if (!scrollTween || !scrollTween.scrollTrigger) return;
            const st = scrollTween.scrollTrigger;
            const targetProgress = index / (totalCards - 1);
            const targetScroll = st.start + (st.end - st.start) * targetProgress;
            window.scrollTo({
              top: targetScroll,
              behavior: 'smooth'
            });
          };

          trustCards.forEach((card, i) => {
            card.addEventListener('click', () => {
              scrollToCard(i);
            });
          });
        },

        // Mobile Only (<= 768px): Unpinned, zero horizontal scroll
        "(max-width: 768px)": function() {
          scrollToCard = null;
          updateActiveStep(0);
        }
      });
    }

    // Set initial active milestone
    updateActiveStep(0);
  }

  /* ==========================================================================
     7. FEATURED SOLUTION — 3D CIRCULAR ROTATING ORBIT & MOBILE 3D CYLINDER
     ========================================================================== */
  const orbitSection = document.getElementById('featured-solutions');
  const orbitCards = document.querySelectorAll('.orbit-card-item');
  const orbitPills = document.querySelectorAll('.orbit-pill');
  const orbitStageContainer = document.getElementById('orbitStageContainer');

  if (orbitSection && orbitCards.length > 0) {
    const totalOrbitCards = orbitCards.length;
    let closestCardIndex = 0;
    let isMobileSwiping = false;
    let mobileTouchStartX = 0;
    let mobileRotationOffset = 0;

    const updateOrbitPositions = (rawProgress) => {
      const progress = Math.min(1, Math.max(0, rawProgress || 0));
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth < 1024 && !isMobile;

      let maxFocal = -999;

      if (isMobile) {
        // PHONE-FIRST 3D CYLINDER PERSPECTIVE (Natural, Compact & Fluid)
        const rxMobile = Math.min(window.innerWidth * 0.38, 140);
        const arcLimit = 1.85;
        const totalRotation = (progress * Math.PI * 1.5) + mobileRotationOffset;

        orbitCards.forEach((card, i) => {
          const baseAngle = (i / totalOrbitCards) * Math.PI * 2;
          const rawAngle = baseAngle + totalRotation;

          let angle = ((rawAngle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
          if (angle > Math.PI) angle -= Math.PI * 2;

          const absAngle = Math.abs(angle);
          const isVisibleOnFront = absAngle <= arcLimit;

          if (!isVisibleOnFront) {
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
            card.style.pointerEvents = 'none';
            card.classList.remove('in-focus');
          } else {
            card.style.visibility = 'visible';
            card.style.pointerEvents = 'auto';

            const x = rxMobile * Math.sin(angle);
            const z = -85 * (1 - Math.cos(angle));
            const y = 6 * Math.sin(angle * 0.5);
            const rotY = -(angle * (180 / Math.PI)) * 0.30;

            const proximityFactor = Math.max(0, 1 - (absAngle / arcLimit));
            const focalFactor = Math.max(0, Math.cos(angle));

            if (focalFactor > maxFocal) {
              maxFocal = focalFactor;
              closestCardIndex = i;
            }

            const scale = 0.82 + 0.28 * Math.pow(proximityFactor, 1.2);
            const opacity = Math.min(1, Math.max(0, proximityFactor * 1.9));
            const zIndex = Math.round(100 + proximityFactor * 500);

            card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotY}deg) scale(${scale})`;
            card.style.opacity = opacity;
            card.style.zIndex = zIndex;

            card.classList.toggle('in-focus', focalFactor > 0.88);
          }
        });
      } else {
        // DESKTOP & TABLET EXPANSIVE 3D ARC WHEEL (Left-to-Right layout)
        const totalRotation = progress * (Math.PI * 0.5);
        const cardHalfW = isTablet ? 38 : 48;
        const leftBoundary = -(window.innerWidth * 0.5) + cardHalfW + (isTablet ? 16 : 24);

        const rx = Math.abs(leftBoundary);
        const cx = -rx;
        const cy = 0;
        const ry = isTablet ? 220 : 280;
        const arcLimit = 1.80;

        orbitCards.forEach((card, i) => {
          const baseAngle = (i / totalOrbitCards) * Math.PI * 2;
          const rawAngle = baseAngle + totalRotation;

          let angle = ((rawAngle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
          if (angle > Math.PI) angle -= Math.PI * 2;

          const absAngle = Math.abs(angle);
          const isVisibleOnRight = absAngle <= arcLimit;

          if (!isVisibleOnRight) {
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
            card.style.pointerEvents = 'none';
            card.classList.remove('in-focus');
          } else {
            card.style.visibility = 'visible';
            card.style.pointerEvents = 'auto';

            const x = cx + rx * Math.cos(angle);
            const y = cy + ry * Math.sin(angle);

            const proximityFactor = Math.max(0, 1 - (absAngle / arcLimit));
            const focalFactor = Math.max(0, Math.cos(angle));

            if (focalFactor > maxFocal) {
              maxFocal = focalFactor;
              closestCardIndex = i;
            }

            const scale = 0.35 + 0.95 * Math.pow(proximityFactor, 1.35);
            const opacity = Math.min(1, Math.max(0, proximityFactor * 1.55));
            const zIndex = Math.round(100 + proximityFactor * 500);

            card.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
            card.style.opacity = opacity;
            card.style.zIndex = zIndex;

            card.classList.toggle('in-focus', focalFactor > 0.86);
          }
        });
      }

      // Update indicator pills if present
      if (orbitPills.length > 0) {
        orbitPills.forEach((pill, pIdx) => {
          pill.classList.toggle('active', pIdx === closestCardIndex);
        });
      }
    };

    // Initialize base positions immediately
    updateOrbitPositions(0);

    // Mobile Touch Gesture Support for effortless spinning
    if (orbitStageContainer) {
      orbitStageContainer.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          mobileTouchStartX = e.touches[0].clientX;
          isMobileSwiping = true;
        }
      }, { passive: true });

      orbitStageContainer.addEventListener('touchmove', (e) => {
        if (!isMobileSwiping || window.innerWidth > 768) return;
        if (e.touches && e.touches.length > 0) {
          const currentX = e.touches[0].clientX;
          const deltaX = currentX - mobileTouchStartX;
          mobileTouchStartX = currentX;
          mobileRotationOffset -= deltaX * 0.005;
          updateOrbitPositions(0);
        }
      }, { passive: true });

      orbitStageContainer.addEventListener('touchend', () => {
        isMobileSwiping = false;
      }, { passive: true });
    }

    // Register with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.matchMedia({
        // Desktop (> 768px): Pinned 3D Arc Wheel
        "(min-width: 769px)": function() {
          const orbitRotationDist = 1000;
          const desktopTrigger = ScrollTrigger.create({
            trigger: orbitSection,
            start: "top 70px",
            end: `+=${orbitRotationDist}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              updateOrbitPositions(self.progress || 0);
            }
          });

          // Interactive Click on Pills
          orbitPills.forEach((pill) => {
            pill.addEventListener('click', (e) => {
              e.stopPropagation();
              const targetIdx = parseInt(pill.getAttribute('data-index'), 10);
              if (!isNaN(targetIdx) && desktopTrigger) {
                const targetProgress = Math.min(1, targetIdx / (totalOrbitCards - 1));
                const targetScroll = desktopTrigger.start + (desktopTrigger.end - desktopTrigger.start) * targetProgress;
                window.scrollTo({
                  top: targetScroll,
                  behavior: 'smooth'
                });
              }
            });
          });
        },

        // Mobile (<= 768px): Unpinned Smooth Viewport Scrub (Zero Pinning, Natural Bottom Section Flow)
        "(max-width: 768px)": function() {
          ScrollTrigger.create({
            trigger: orbitSection,
            start: "top 85%",
            end: "bottom 15%",
            scrub: 1,
            onUpdate: (self) => {
              if (!isMobileSwiping) {
                updateOrbitPositions(self.progress);
              }
            }
          });
        }
      });
    }
  }

  /* ==========================================================================
     8. HIGH-PERFORMANCE GSAP SCROLL-REVEAL SYSTEM (60/120 FPS FLUID MOTION)
     ========================================================================== */
  const initScrollRevealSystem = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Accessibility check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set([
        '.navbar', '.hero-pitch-text', '.hero-main-title', '.hero-book-visit-btn',
        '.service-card-item', '.trust-badge', '.trust-main-heading', '.trust-sub-heading',
        '.trust-controls-group', '.trust-mobile-pills', '.gsap-banner-stage',
        '.orbit-badge', '.orbit-main-heading', '.orbit-guide-ellipse-svg',
        '.why-beema-glass-card', '.why-eyebrow-badge', '.why-mob-img', '.why-main-title',
        '.why-quote-card', '.why-body-desc', '.why-benefit-card', '.why-stage-glow',
        '.mobile-app-glass-card', '.app-eyebrow-badge', '.app-main-title', '.app-subtitle',
        '.app-features-list li', '.app-store-btns-row a', '.app-showcase-img', '.app-stage-glow',
        '.awards-header-wrap', '.awards-single-stage', '.vm-pill-badge', '.vm-section-title',
        '.vm-mobile-switcher', '.vision-bento', '.mission-bento', '.values-bento-header',
        '.value-bento-item', '.partners-badge', '.partners-main-title', '.partners-sub-title',
        '.partner-box', '.footer-top-wrap', '.footer-nav-col', '.comm-block', '.footer-legal-wrap'
      ], { opacity: 1, y: 0, x: 0, scale: 1, clipPath: 'none', clearProps: 'all' });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Responsive ScrollReveal Controller
    ScrollTrigger.matchMedia({
      
      // ========================================================================
      // A. DESKTOP & TABLET PROFILE (min-width: 769px) - Silky Smooth & Fluid
      // ========================================================================
      '(min-width: 769px)': function() {
        
        // 1. HERO SECTION (Instant, Natural Appearance — Zero Jumps, Zero Lag)
        const heroCard = document.querySelector('.hero-card');
        if (heroCard) {
          const heroTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

          heroTl
            .fromTo('.navbar', 
              { y: -10, opacity: 0.7 }, 
              { y: 0, opacity: 1, duration: 0.4, clearProps: 'all' }
            )
            .fromTo('.hero-pitch-text', 
              { opacity: 0.5, y: 8 }, 
              { opacity: 1, y: 0, duration: 0.4, clearProps: 'all' }, 
              '-=0.25'
            )
            .fromTo('.hero-main-title', 
              { opacity: 0.6, y: 12 }, 
              { opacity: 1, y: 0, duration: 0.45, clearProps: 'all' }, 
              '-=0.25'
            )
            .fromTo('.hero-book-visit-btn', 
              { opacity: 0.7, scale: 0.98 }, 
              { opacity: 1, scale: 1, duration: 0.4, clearProps: 'all' }, 
              '-=0.3'
            );
        }

        // 2. INSURANCE SERVICES GRID (Staggered Matrix Flow from Below)
        const servicesSection = document.querySelector('.insurance-services-section');
        if (servicesSection) {
          gsap.fromTo('.service-card-item', 
            {
              y: 40,
              opacity: 0,
              scale: 0.96
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.7,
              ease: 'power3.out',
              stagger: {
                each: 0.035,
                from: 'start',
                grid: 'auto'
              },
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: servicesSection,
                start: 'top 85%',
                once: true
              }
            }
          );
        }

        // 3. TRUST SECTION HEADER
        const trustSectionEl = document.getElementById('trust-milestones');
        if (trustSectionEl) {
          const trustTl = gsap.timeline({
            scrollTrigger: {
              trigger: trustSectionEl,
              start: 'top 85%',
              once: true
            }
          });

          trustTl
            .fromTo('.trust-badge', 
              { y: 15, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity' }
            )
            .fromTo('.trust-main-heading', 
              { y: 40, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', clearProps: 'transform,opacity' }, 
              '-=0.3'
            )
            .fromTo('.trust-sub-heading', 
              { y: 25, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.45'
            )
            .fromTo('.trust-controls-group', 
              { y: 20, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.4'
            );
        }

        // 4. GSAP CINEMATIC PROMO BANNER SECTION ENTRANCE
        const bannerSectionEl = document.getElementById('gsapPromoBanner');
        if (bannerSectionEl) {
          gsap.fromTo('.gsap-banner-stage', 
            {
              y: 40,
              opacity: 0,
              scale: 0.98
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.8,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: bannerSectionEl,
                start: 'top 82%',
                once: true
              }
            }
          );
        }

        // 5. FEATURED SOLUTIONS (3D ORBIT) HEADER
        const orbitSectionEl = document.getElementById('featured-solutions');
        if (orbitSectionEl) {
          const orbitTl = gsap.timeline({
            scrollTrigger: {
              trigger: orbitSectionEl,
              start: 'top 85%',
              once: true
            }
          });

          orbitTl
            .fromTo('.orbit-badge', 
              { y: 15, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity' }
            )
            .fromTo('.orbit-main-heading', 
              { y: 40, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', clearProps: 'transform,opacity' }, 
              '-=0.3'
            )
            .fromTo('.orbit-guide-ellipse-svg', 
              { opacity: 0, scale: 0.97 }, 
              { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out', clearProps: 'opacity,transform' }, 
              '-=0.4'
            );
        }

        // 6. WHY BEEMAAA.COM SECTION CHOREOGRAPHY
        const whyBeemaSection = document.getElementById('why-beema');
        if (whyBeemaSection) {
          const whyTl = gsap.timeline({
            scrollTrigger: {
              trigger: whyBeemaSection,
              start: 'top 80%',
              once: true
            }
          });

          whyTl
            .fromTo('.why-beema-glass-card', 
              { y: 35, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity' }
            )
            .fromTo('.why-eyebrow-badge', 
              { y: 15, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.45'
            )
            .fromTo('.why-mob-img', 
              { 
                y: 45, 
                scale: 0.96, 
                opacity: 0,
                clipPath: 'inset(10% 0 0 0)' 
              }, 
              { 
                y: 0, 
                scale: 1, 
                opacity: 1, 
                clipPath: 'inset(0% 0 0 0)', 
                duration: 0.9, 
                ease: 'power3.out',
                clearProps: 'clipPath'
              }, 
              '-=0.35'
            )
            .fromTo('.why-main-title', 
              { y: 45, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', clearProps: 'transform,opacity' }, 
              '-=0.75'
            )
            .fromTo('.why-quote-card', 
              { y: 30, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', clearProps: 'transform,opacity' }, 
              '-=0.55'
            )
            .fromTo('.why-body-desc', 
              { y: 25, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.45'
            )
            .fromTo('.why-benefit-card', 
              { y: 35, opacity: 0, scale: 0.97 }, 
              { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity' }, 
              '-=0.4'
            );
        }

        // 7. BEEMAAA MOBILE APP EXPERIENCE SECTION
        const appSection = document.getElementById('app');
        if (appSection) {
          const appTl = gsap.timeline({
            scrollTrigger: {
              trigger: appSection,
              start: 'top 80%',
              once: true
            }
          });

          appTl
            .fromTo('.mobile-app-glass-card', 
              { y: 35, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity' }
            )
            .fromTo('.app-eyebrow-badge', 
              { y: 15, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.45'
            )
            .fromTo('.app-main-title', 
              { y: 45, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', clearProps: 'transform,opacity' }, 
              '-=0.35'
            )
            .fromTo('.app-subtitle', 
              { y: 25, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.45'
            )
            .fromTo('.app-features-list li', 
              { x: -18, y: 12, opacity: 0 }, 
              { x: 0, y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.06, clearProps: 'transform,opacity' }, 
              '-=0.4'
            )
            .fromTo('.app-store-btns-row a', 
              { y: 20, scale: 0.96, opacity: 0 }, 
              { y: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.4)', stagger: 0.08, clearProps: 'transform,opacity' }, 
              '-=0.3'
            )
            .fromTo('.app-showcase-img', 
              { 
                y: 50, 
                scale: 0.96, 
                opacity: 0, 
                clipPath: 'inset(10% 0 0 0)' 
              }, 
              { 
                y: 0, 
                scale: 1, 
                opacity: 1, 
                clipPath: 'inset(0% 0 0 0)', 
                duration: 0.95, 
                ease: 'power3.out',
                clearProps: 'clipPath'
              }, 
              '-=0.7'
            );
        }

        // 8. HONORS & RECOGNITIONS AWARDS SHOWCASE
        const awardsSection = document.getElementById('awards');
        if (awardsSection) {
          const awardsTl = gsap.timeline({
            scrollTrigger: {
              trigger: awardsSection,
              start: 'top 80%',
              once: true
            }
          });

          awardsTl
            .fromTo('.awards-header-wrap', 
              { y: 25, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'transform,opacity' }
            )
            .fromTo('.awards-single-stage', 
              { y: 35, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', clearProps: 'transform,opacity' }, 
              '-=0.4'
            )
            .fromTo('.award-single-card.active .award-img-stage img', 
              { 
                y: 25, 
                scale: 0.97, 
                clipPath: 'inset(8% 0 0 0)' 
              }, 
              { 
                y: 0, 
                scale: 1, 
                clipPath: 'inset(0% 0 0 0)', 
                duration: 0.8, 
                ease: 'power3.out',
                clearProps: 'clipPath'
              }, 
              '-=0.5'
            )
            .fromTo(['.award-single-card.active .award-item-title', '.award-single-card.active .award-item-desc'], 
              { y: 20, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.08, clearProps: 'transform,opacity' }, 
              '-=0.55'
            );
        }

        // 9. GUIDING PRINCIPLES (Vision, Mission & Core Values Bento Grid)
        const vmSection = document.getElementById('vision-mission');
        if (vmSection) {
          const vmTl = gsap.timeline({
            scrollTrigger: {
              trigger: vmSection,
              start: 'top 80%',
              once: true
            }
          });

          vmTl
            .fromTo(['.vm-pill-badge', '.vm-section-title'], 
              { y: 40, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity' }
            )
            .fromTo('.vision-bento', 
              { y: 45, scale: 0.97, opacity: 0 }, 
              { y: 0, scale: 1, opacity: 1, duration: 0.75, ease: 'power3.out', clearProps: 'transform,opacity' }, 
              '-=0.4'
            )
            .fromTo('.mission-bento', 
              { y: 45, scale: 0.97, opacity: 0 }, 
              { y: 0, scale: 1, opacity: 1, duration: 0.75, ease: 'power3.out', clearProps: 'transform,opacity' }, 
              '-=0.65'
            )
            .fromTo('.values-bento-header', 
              { y: 20, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.3'
            )
            .fromTo('.value-bento-item', 
              { y: 35, scale: 0.97, opacity: 0 }, 
              { y: 0, scale: 1, opacity: 1, duration: 0.65, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity' }, 
              '-=0.4'
            );
        }

        // 10. OUR BUSINESS PARTNERS SECTION
        const partnersSection = document.getElementById('partners');
        if (partnersSection) {
          const partnersTl = gsap.timeline({
            scrollTrigger: {
              trigger: partnersSection,
              start: 'top 80%',
              once: true
            }
          });

          partnersTl
            .fromTo(['.partners-badge', '.partners-main-title', '.partners-sub-title'], 
              { y: 35, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.07, clearProps: 'transform,opacity' }
            )
            .fromTo('.partner-box', 
              { y: 25, scale: 0.94, opacity: 0 }, 
              { 
                y: 0, 
                scale: 1, 
                opacity: 1, 
                duration: 0.55, 
                ease: 'power2.out', 
                stagger: {
                  each: 0.025,
                  from: 'start',
                  grid: 'auto'
                },
                clearProps: 'transform,opacity'
              }, 
              '-=0.4'
            );
        }

        // 11. MODERN MINIMAL PROFESSIONAL FOOTER CHOREOGRAPHY
        const footerSection = document.getElementById('site-footer');
        if (footerSection) {
          const footerTl = gsap.timeline({
            scrollTrigger: {
              trigger: footerSection,
              start: 'top 88%',
              once: true
            }
          });

          footerTl
            .fromTo('.footer-top-wrap', 
              { y: 25, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'transform,opacity' }
            )
            .fromTo('.footer-nav-col', 
              { y: 30, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', stagger: 0.05, clearProps: 'transform,opacity' }, 
              '-=0.4'
            )
            .fromTo('.comm-block', 
              { y: 25, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.06, clearProps: 'transform,opacity' }, 
              '-=0.3'
            )
            .fromTo('.footer-legal-wrap', 
              { y: 12, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.2'
            );
        }

      },

      // ========================================================================
      // B. MOBILE PHONE PROFILE (max-width: 768px) - Compact & High-Performance
      // ========================================================================
      '(max-width: 768px)': function() {
        
        // 1. Mobile Hero Intro (Instant settle)
        const heroCard = document.querySelector('.hero-card');
        if (heroCard) {
          gsap.fromTo('.navbar', 
            { y: -10, opacity: 0.8 }, 
            { y: 0, opacity: 1, duration: 0.35, clearProps: 'all' }
          );
          gsap.fromTo('.hero-pitch-text', 
            { opacity: 0.6, y: 6 }, 
            { opacity: 1, y: 0, duration: 0.35, clearProps: 'all' }
          );
          gsap.fromTo('.hero-main-title', 
            { opacity: 0.7, y: 8 }, 
            { opacity: 1, y: 0, duration: 0.4, clearProps: 'all' }
          );
          gsap.fromTo('.hero-book-visit-btn', 
            { opacity: 0.8, scale: 0.98 }, 
            { opacity: 1, scale: 1, duration: 0.35, clearProps: 'all' }
          );
        }

        // 2. Mobile Insurance Services Grid
        const servicesSection = document.querySelector('.insurance-services-section');
        if (servicesSection) {
          gsap.fromTo('.service-card-item', 
            { y: 20, opacity: 0, scale: 0.98 }, 
            { 
              y: 0, 
              opacity: 1, 
              scale: 1, 
              duration: 0.5, 
              ease: 'power2.out', 
              stagger: 0.025, 
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: servicesSection,
                start: 'top 85%',
                once: true
              }
            }
          );
        }

        // 3. Mobile Trust Header
        const trustSectionEl = document.getElementById('trust-milestones');
        if (trustSectionEl) {
          gsap.fromTo(['.trust-badge', '.trust-main-heading', '.trust-sub-heading', '.trust-mobile-pills', '.trust-controls-group'], 
            { y: 20, opacity: 0 }, 
            { 
              y: 0, 
              opacity: 1, 
              duration: 0.55, 
              stagger: 0.05, 
              ease: 'power2.out', 
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: trustSectionEl,
                start: 'top 85%',
                once: true
              }
            }
          );
        }

        // 4. Mobile GSAP Banner Stage Entrance
        const bannerSectionEl = document.getElementById('gsapPromoBanner');
        if (bannerSectionEl) {
          gsap.fromTo('.gsap-banner-stage', 
            { y: 25, opacity: 0, scale: 0.98 }, 
            { 
              y: 0, 
              opacity: 1, 
              scale: 1, 
              duration: 0.6, 
              ease: 'power2.out', 
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: bannerSectionEl,
                start: 'top 85%',
                once: true
              }
            }
          );
        }

        // 5. Mobile Featured Solutions Orbit Header
        const orbitSectionEl = document.getElementById('featured-solutions');
        if (orbitSectionEl) {
          gsap.fromTo(['.orbit-badge', '.orbit-main-heading'], 
            { y: 20, opacity: 0 }, 
            { 
              y: 0, 
              opacity: 1, 
              duration: 0.55, 
              stagger: 0.06, 
              ease: 'power2.out', 
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: orbitSectionEl,
                start: 'top 85%',
                once: true
              }
            }
          );
        }

        // 6. Mobile Why Beema Section
        const whyBeemaSection = document.getElementById('why-beema');
        if (whyBeemaSection) {
          const whyTl = gsap.timeline({
            scrollTrigger: {
              trigger: whyBeemaSection,
              start: 'top 82%',
              once: true
            }
          });

          whyTl
            .fromTo('.why-beema-glass-card', 
              { y: 20, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out', clearProps: 'transform,opacity' }
            )
            .fromTo('.why-mob-img', 
              { y: 25, opacity: 0, scale: 0.98 }, 
              { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.3'
            )
            .fromTo(['.why-main-title', '.why-quote-card', '.why-body-desc'], 
              { y: 20, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.35'
            )
            .fromTo('.why-benefit-card', 
              { y: 20, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.3'
            );
        }

        // 7. Mobile App Experience Section
        const appSection = document.getElementById('app');
        if (appSection) {
          const appTl = gsap.timeline({
            scrollTrigger: {
              trigger: appSection,
              start: 'top 82%',
              once: true
            }
          });

          appTl
            .fromTo('.mobile-app-glass-card', 
              { y: 20, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out', clearProps: 'transform,opacity' }
            )
            .fromTo(['.app-eyebrow-badge', '.app-main-title', '.app-subtitle'], 
              { y: 20, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.55, stagger: 0.05, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.3'
            )
            .fromTo('.app-features-list li', 
              { x: -12, opacity: 0 }, 
              { x: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.35'
            )
            .fromTo('.app-store-btns-row a', 
              { y: 12, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: 'back.out(1.4)', clearProps: 'transform,opacity' }, 
              '-=0.25'
            )
            .fromTo('.app-showcase-img', 
              { y: 25, opacity: 0, scale: 0.98 }, 
              { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power2.out', clearProps: 'transform,opacity' }, 
              '-=0.35'
            );
        }

        // 8. Mobile Awards Showcase
        const awardsSection = document.getElementById('awards');
        if (awardsSection) {
          gsap.fromTo(['.awards-header-wrap', '.awards-single-stage'], 
            { y: 20, opacity: 0 }, 
            { 
              y: 0, 
              opacity: 1, 
              duration: 0.55, 
              stagger: 0.06, 
              ease: 'power2.out', 
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: awardsSection,
                start: 'top 85%',
                once: true
              }
            }
          );
        }

        // 9. Mobile Guiding Principles Bento Grid
        const vmSection = document.getElementById('vision-mission');
        if (vmSection) {
          gsap.fromTo(['.vm-pill-badge', '.vm-section-title', '.vm-mobile-switcher', '.vm-bento-card', '.values-bento-header', '.value-bento-item'], 
            { y: 20, opacity: 0 }, 
            { 
              y: 0, 
              opacity: 1, 
              duration: 0.55, 
              stagger: 0.035, 
              ease: 'power2.out', 
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: vmSection,
                start: 'top 85%',
                once: true
              }
            }
          );
        }

        // 10. Mobile Partners Section
        const partnersSection = document.getElementById('partners');
        if (partnersSection) {
          gsap.fromTo(['.partners-badge', '.partners-main-title', '.partners-sub-title'], 
            { y: 20, opacity: 0 }, 
            { 
              y: 0, 
              opacity: 1, 
              duration: 0.5, 
              stagger: 0.05, 
              ease: 'power2.out', 
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: partnersSection,
                start: 'top 85%',
                once: true
              }
            }
          );

          gsap.fromTo('.partner-box', 
            { y: 15, opacity: 0, scale: 0.96 }, 
            { 
              y: 0, 
              opacity: 1, 
              scale: 1, 
              duration: 0.45, 
              stagger: 0.02, 
              ease: 'power2.out', 
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: partnersSection,
                start: 'top 85%',
                once: true
              }
            }
          );
        }

        // 11. Mobile Footer
        const footerSection = document.getElementById('site-footer');
        if (footerSection) {
          gsap.fromTo(['.footer-top-wrap', '.footer-nav-col', '.comm-block', '.footer-legal-wrap'], 
            { y: 15, opacity: 0 }, 
            { 
              y: 0, 
              opacity: 1, 
              duration: 0.45, 
              stagger: 0.035, 
              ease: 'power2.out', 
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: footerSection,
                start: 'top 90%',
                once: true
              }
            }
          );
        }

      }
    });
  };

  // Launch the Scroll-Reveal Animation Engine
  initScrollRevealSystem();

  // Final Global ScrollTrigger Synchronization & Layout Refresh
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    window.addEventListener('load', () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    document.querySelectorAll('img').forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', () => ScrollTrigger.refresh());
      }
    });
  }
});

