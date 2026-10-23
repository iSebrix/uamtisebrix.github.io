document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('js-loaded');

    /* ======================================================================
       1. HEADER SCROLL STATE & ACTIVE SECTION TRACKING
       ====================================================================== */
    const siteHeader = document.getElementById('siteHeader');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id]');

    const setActiveNavLink = (activeId) => {
        if (!activeId) return;
        navLinks.forEach((link) => {
            const matches = link.getAttribute('href') === `#${activeId}`;
            link.classList.toggle('active', matches);
        });
    };

    const updateHeaderState = () => {
        if (siteHeader) {
            siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
        }

        // Highlight last section when scrolled to the bottom of the page
        if (sections.length > 0) {
            const scrolledToBottom =
                window.innerHeight + Math.round(window.scrollY) >= document.documentElement.scrollHeight - 40;
            if (scrolledToBottom) {
                const lastSection = sections[sections.length - 1];
                setActiveNavLink(lastSection.getAttribute('id'));
            }
        }
    };

    window.addEventListener('scroll', updateHeaderState, { passive: true });
    updateHeaderState();

    if ('IntersectionObserver' in window && sections.length > 0 && navLinks.length > 0) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveNavLink(entry.target.getAttribute('id'));
                    }
                });
            },
            {
                rootMargin: '-25% 0px -55% 0px',
                threshold: 0
            }
        );

        sections.forEach((sec) => sectionObserver.observe(sec));
    }

    /* ======================================================================
       2. MOBILE NAVIGATION MENU (NO INNERHTML, FULL A11Y)
       ====================================================================== */
    const menuBurger = document.getElementById('menuBurger');
    const menuBurgerIcon = document.getElementById('menuBurgerIcon');
    const navMenu = document.getElementById('navMenu');

    const syncBurgerAppearance = (isOpen) => {
        if (!menuBurger) return;
        menuBurger.setAttribute('aria-expanded', String(isOpen));
        menuBurger.setAttribute(
            'aria-label',
            isOpen ? 'Закрити меню навігації' : 'Відкрити меню навігації'
        );

        if (menuBurgerIcon) {
            menuBurgerIcon.classList.toggle('fa-bars', !isOpen);
            menuBurgerIcon.classList.toggle('fa-xmark', isOpen);
        }
    };

    const closeMobileMenu = () => {
        if (!navMenu || !menuBurger) return;
        navMenu.classList.remove('active');
        syncBurgerAppearance(false);
        document.body.style.overflow = '';
    };

    if (menuBurger && navMenu) {
        menuBurger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            syncBurgerAppearance(isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMobileMenu();
                menuBurger.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    /* ======================================================================
       3. ACCESSIBLE ACCORDIONS WITH DYNAMIC HEIGHT (NO CLIPPING)
       ====================================================================== */
    const accButtons = document.querySelectorAll('.accordion-btn');

    const syncAccordionHeight = (item) => {
        if (!item) return;
        const body = item.querySelector('.accordion-body');
        const btn = item.querySelector('.accordion-btn');
        if (!body || !btn) return;

        const isActive = item.classList.contains('active');
        btn.setAttribute('aria-expanded', String(isActive));

        if (isActive) {
            body.style.maxHeight = `${body.scrollHeight}px`;
        } else {
            body.style.maxHeight = '0px';
        }
    };

    const recalculateAllActiveAccordions = () => {
        document.querySelectorAll('.accordion-item.active').forEach((item) => {
            syncAccordionHeight(item);
        });
    };

    if (accButtons.length > 0) {
        const firstItem = accButtons[0].closest('.accordion-item');
        if (firstItem) {
            firstItem.classList.add('active');
        }

        accButtons.forEach((btn) => {
            const parentItem = btn.closest('.accordion-item');
            syncAccordionHeight(parentItem);

            btn.addEventListener('click', () => {
                const item = btn.closest('.accordion-item');
                if (!item) return;
                item.classList.toggle('active');
                syncAccordionHeight(item);
            });
        });

        window.addEventListener('resize', recalculateAllActiveAccordions);
        window.addEventListener('load', recalculateAllActiveAccordions);

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(recalculateAllActiveAccordions);
        }

        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(recalculateAllActiveAccordions);
            document.querySelectorAll('.accordion-inner').forEach((inner) => ro.observe(inner));
        }
    }

    /* ======================================================================
       4. DISCORD USERNAME COPY TO CLIPBOARD
       ====================================================================== */
    const copyButtons = document.querySelectorAll('.social-copy-btn');

    const copyTextFallback = (text) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    };

    copyButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const textToCopy = btn.getAttribute('data-copy');
            if (!textToCopy) return;

            const textSpan = btn.querySelector('.social-copy-text');
            const statusIcon = btn.querySelector('.copy-status-icon');
            const originalLabel = textSpan ? textSpan.textContent : textToCopy;

            const showSuccess = () => {
                btn.classList.add('is-copied');
                if (textSpan) textSpan.textContent = 'Скопійовано!';
                if (statusIcon) {
                    statusIcon.classList.remove('fa-regular', 'fa-copy');
                    statusIcon.classList.add('fa-solid', 'fa-check');
                }

                if (btn.dataset.timerId) {
                    clearTimeout(Number(btn.dataset.timerId));
                }

                const timerId = window.setTimeout(() => {
                    btn.classList.remove('is-copied');
                    if (textSpan) textSpan.textContent = originalLabel;
                    if (statusIcon) {
                        statusIcon.classList.remove('fa-solid', 'fa-check');
                        statusIcon.classList.add('fa-regular', 'fa-copy');
                    }
                }, 1800);

                btn.dataset.timerId = String(timerId);
            };

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy).then(showSuccess).catch(() => {
                    copyTextFallback(textToCopy);
                    showSuccess();
                });
            } else {
                copyTextFallback(textToCopy);
                showSuccess();
            }
        });
    });

    /* ======================================================================
       5. IMAGE ERROR FALLBACK (EXTERNAL PORTRAIT PROTECTION)
       ====================================================================== */
    const commanderImages = document.querySelectorAll('.commander-img');
    commanderImages.forEach((img) => {
        img.addEventListener('error', () => {
            const wrap = img.closest('.commander-portrait-wrap');
            if (!wrap || wrap.querySelector('.commander-img-fallback')) return;

            img.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = 'commander-img-fallback';
            fallback.setAttribute('aria-hidden', 'true');

            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-user-shield';
            fallback.appendChild(icon);

            wrap.insertBefore(fallback, img);
        });
    });

    /* ======================================================================
       6. SUBTLE SCROLL-TRIGGERED ENTRANCE ANIMATIONS
       ====================================================================== */
    const revealElements = document.querySelectorAll('[data-reveal]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach((el) => el.classList.add('is-visible'));
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px'
            }
        );

        revealElements.forEach((el) => revealObserver.observe(el));
    }
});