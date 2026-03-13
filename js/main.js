/**
 * ============================================
 * TENUTA RE DI ROMA - MAIN JAVASCRIPT
 * ============================================
 * 
 * Módulos:
 * 1. MobileMenuController - Gestión del menú móvil
 * 2. DropdownController - Gestión de dropdowns desktop
 * 3. WifiCopyController - Funcionalidad copiar password WiFi
 * 4. ChatbotController - Control del widget de chat
 * 5. HeroCarouselController - Carrusel del hero
 * 
 * Author: Tined Solutions
 * Version: 1.0.0
 */

'use strict';

/* ============================================
   1. MOBILE MENU CONTROLLER
   ============================================ */

const MobileMenuController = (function() {
    // DOM Elements
    let mobileMenuButton = null;
    let mobileMenu = null;
    let mobileSubmenuButtons = null;
    let mobileLinks = null;

    /**
     * Cierra todos los submenús móviles
     */
    function closeAllSubmenus() {
        if (!mobileSubmenuButtons) return;
        
        mobileSubmenuButtons.forEach(button => {
            const submenuId = button.getAttribute('aria-controls');
            const submenu = submenuId ? document.getElementById(submenuId) : null;
            
            button.setAttribute('aria-expanded', 'false');
            
            if (submenu) {
                submenu.classList.remove('open');
                submenu.setAttribute('aria-hidden', 'true');
            }
        });
    }

    /**
     * Alterna la visibilidad del menú móvil
     */
    function toggleMobileMenu() {
        const isExpanded = mobileMenu.classList.contains('open');
        
        if (isExpanded) {
            mobileMenu.classList.remove('open');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 400);
        } else {
            mobileMenu.classList.remove('hidden');
            // Forzar reflow para animación
            void mobileMenu.offsetHeight;
            mobileMenu.classList.add('open');
        }
        
        // Actualizar icono del botón
        const icon = mobileMenuButton.querySelector('span.nav-icon');
        if (icon) {
            icon.textContent = isExpanded ? 'menu' : 'close';
        }
    }

    /**
     * Maneja el click en un botón de submenú
     * @param {HTMLElement} button - Botón clickeado
     */
    function handleSubmenuToggle(button) {
        const submenuId = button.getAttribute('aria-controls');
        const submenu = submenuId ? document.getElementById(submenuId) : null;
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        closeAllSubmenus();

        if (!submenu || isExpanded) return;

        button.setAttribute('aria-expanded', 'true');
        submenu.classList.add('open');
        submenu.setAttribute('aria-hidden', 'false');
    }

    /**
     * Cierra el menú móvil al hacer click en un link
     */
    function handleMobileLinkClick() {
        if (mobileMenu && mobileMenu.classList.contains('open')) {
            closeAllSubmenus();
            mobileMenuButton.click();
        }
    }

    /**
     * Resetea el menú móvil en resize a desktop
     */
    function handleResize() {
        if (window.innerWidth > 1024 && mobileMenu) {
            closeAllSubmenus();
            mobileMenu.classList.remove('open');
            mobileMenu.classList.add('hidden');
            
            const icon = mobileMenuButton?.querySelector('span.nav-icon');
            if (icon) icon.textContent = 'menu';
        }
    }

    /**
     * Inicializa el controlador del menú móvil
     */
    function init() {
        mobileMenuButton = document.getElementById('mobile-menu-button');
        mobileMenu = document.getElementById('mobile-menu');
        mobileSubmenuButtons = document.querySelectorAll('.mobile-submenu-toggle');
        mobileLinks = document.querySelectorAll('.mobile-link');

        if (!mobileMenuButton || !mobileMenu) return;

        // Event listeners
        mobileMenuButton.addEventListener('click', toggleMobileMenu);

        mobileSubmenuButtons.forEach(button => {
            button.addEventListener('click', () => handleSubmenuToggle(button));
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', handleMobileLinkClick);
        });

        window.addEventListener('resize', handleResize);
    }

    // Public API
    return {
        init,
        closeAllSubmenus
    };
})();

/* ============================================
   2. DROPDOWN CONTROLLER
   ============================================ */

const DropdownController = (function() {
    let dropdowns = null;

    /**
     * Cierra todos los menús dropdown
     */
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.add('opacity-0', 'invisible', '-translate-y-2');
        });
    }

    /**
     * Alterna un dropdown específico
     * @param {HTMLElement} menu - Menú dropdown
     */
    function toggleDropdown(menu) {
        const isOpen = !menu.classList.contains('opacity-0');
        
        // Cierra los demás menús
        document.querySelectorAll('.dropdown-menu').forEach(m => {
            if (m !== menu) {
                m.classList.add('opacity-0', 'invisible', '-translate-y-2');
            }
        });
        
        if (isOpen) {
            menu.classList.add('opacity-0', 'invisible', '-translate-y-2');
        } else {
            menu.classList.remove('opacity-0', 'invisible', '-translate-y-2');
        }
    }

    /**
     * Abre un dropdown
     * @param {HTMLElement} menu - Menú dropdown
     */
    function openDropdown(menu) {
        menu.classList.remove('opacity-0', 'invisible', '-translate-y-2');
    }

    /**
     * Cierra un dropdown
     * @param {HTMLElement} menu - Menú dropdown
     */
    function closeDropdown(menu) {
        menu.classList.add('opacity-0', 'invisible', '-translate-y-2');
    }

    /**
     * Inicializa el controlador de dropdowns
     */
    function init() {
        dropdowns = document.querySelectorAll('.dropdown');

        dropdowns.forEach(dropdown => {
            const button = dropdown.querySelector('button');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (!button || !menu) return;

            // Click handler
            button.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) return;
                e.stopPropagation();
                toggleDropdown(menu);
            });

            // Hover handlers (solo en desktop)
            if (window.innerWidth > 1024) {
                dropdown.addEventListener('mouseenter', () => openDropdown(menu));
                dropdown.addEventListener('mouseleave', () => closeDropdown(menu));
            }
        });

        // Cierra dropdowns al hacer click fuera
        document.addEventListener('click', closeAllDropdowns);
    }

    // Public API
    return {
        init,
        closeAllDropdowns
    };
})();

/* ============================================
   3. WIFI COPY CONTROLLER
   ============================================ */

const WifiCopyController = (function() {
    let copyButton = null;
    let passwordElement = null;
    let feedbackElement = null;
    let feedbackTimeout = null;

    /**
     * Fallback para copiar texto en navegadores antiguos
     * @param {string} text - Texto a copiar
     */
    function fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    /**
     * Muestra feedback al usuario
     * @param {string} message - Mensaje a mostrar
     * @param {number} duration - Duración en ms
     */
    function showFeedback(message, duration = 1800) {
        if (!feedbackElement) return;
        
        feedbackElement.textContent = message;
        feedbackElement.classList.remove('opacity-0');
        
        clearTimeout(feedbackTimeout);
        feedbackTimeout = setTimeout(() => {
            feedbackElement.classList.add('opacity-0');
        }, duration);
    }

    /**
     * Copia la password del WiFi al portapapeles
     */
    async function copyPassword() {
        if (!passwordElement) return;

        const passwordText = passwordElement.textContent.trim();

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(passwordText);
            } else {
                fallbackCopyText(passwordText);
            }
            showFeedback('Password copiata', 1800);
        } catch (error) {
            console.error('Error al copiar password:', error);
            showFeedback('Copia non riuscita', 2200);
        }
    }

    /**
     * Inicializa el controlador de copia WiFi
     */
    function init() {
        copyButton = document.getElementById('copy-wifi-password');
        passwordElement = document.getElementById('wifi-password');
        feedbackElement = document.getElementById('wifi-copy-feedback');

        if (copyButton) {
            copyButton.addEventListener('click', copyPassword);
        }
    }

    // Public API
    return {
        init
    };
})();

/* ============================================
   4. CHATBOT CONTROLLER
   ============================================ */

const ChatbotController = (function() {
    let isOpen = false;
    let chatWindow = null;
    let fabOpenIcon = null;
    let fabCloseIcon = null;
    let notificationDot = null;
    let closeTimer = null;
    const CLOSE_ANIMATION_MS = 260;

    /**
     * Muestra la ventana de chat y activa su animación de entrada
     */
    function openWindow() {
        if (!chatWindow) return;

        clearTimeout(closeTimer);
        chatWindow.style.display = 'flex';
        void chatWindow.offsetHeight;
        chatWindow.classList.add('open');
        chatWindow.setAttribute('aria-hidden', 'false');
    }

    /**
     * Cierra la ventana de chat y la desmonta visualmente al terminar la animación
     */
    function closeWindow() {
        if (!chatWindow) return;

        chatWindow.classList.remove('open');
        chatWindow.setAttribute('aria-hidden', 'true');

        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
            if (!isOpen) {
                chatWindow.style.display = 'none';
            }
        }, CLOSE_ANIMATION_MS);
    }

    /**
     * Alterna la visibilidad del chatbot
     */
    function toggle() {
        if (!chatWindow) return;

        isOpen = !isOpen;
        
        if (isOpen) {
            openWindow();
            if (fabOpenIcon) fabOpenIcon.style.display = 'none';
            if (fabCloseIcon) fabCloseIcon.style.display = '';
            if (notificationDot) notificationDot.style.display = 'none';
        } else {
            closeWindow();
            if (fabOpenIcon) fabOpenIcon.style.display = '';
            if (fabCloseIcon) fabCloseIcon.style.display = 'none';
        }
    }

    /**
     * Inicializa el controlador del chatbot
     */
    function init() {
        chatWindow = document.getElementById('chat-widget-window');
        fabOpenIcon = document.getElementById('chat-fab-open');
        fabCloseIcon = document.getElementById('chat-fab-close');
        notificationDot = document.getElementById('chat-notif-dot');

        if (chatWindow) {
            // Evita que un iframe oculto capture gestos en móviles.
            chatWindow.classList.remove('open');
            chatWindow.setAttribute('aria-hidden', 'true');
            chatWindow.style.display = 'none';
        }

        // Exponer función global para onclick inline
        window.toggleChatbot = toggle;
    }

    // Public API
    return {
        init,
        toggle
    };
})();

/* ============================================
   5. HERO CAROUSEL CONTROLLER
   ============================================ */

const HeroCarouselController = (function() {
    let currentSlide = 0;
    let slides = null;
    let indicators = null;
    let progressBar = null;
    let autoAdvanceTimer = null;
    let carouselTrack = null;
    
    // Touch handling
    let touchStartX = 0;
    let touchEndX = 0;
    
    const AUTO_ADVANCE_INTERVAL = 5000;
    const MIN_SWIPE_DISTANCE = 50;

    /**
     * Actualiza las clases de los slides según el índice actual
     */
    function updateSlides() {
        const totalSlides = slides.length;

        slides.forEach((slide, index) => {
            slide.className = 'carousel-item absolute top-0 left-0 w-full h-full';
            
            if (index === currentSlide) {
                slide.classList.add('active');
            } else if (index === (currentSlide + 1) % totalSlides) {
                slide.classList.add('next');
            } else if (index === (currentSlide - 1 + totalSlides) % totalSlides) {
                slide.classList.add('prev');
            } else {
                slide.classList.add('hidden');
            }
        });

        // Actualizar indicadores
        if (indicators) {
            indicators.forEach((indicator, index) => {
                indicator.className = [
                    'w-8 sm:w-12 h-1 sm:h-1.5 rounded-full transition-colors hover:bg-white/60',
                    index === currentSlide ? 'bg-white/40' : 'bg-white/20'
                ].join(' ');
            });
        }

        // Actualizar barra de progreso
        if (progressBar) {
            progressBar.style.width = `${((currentSlide + 1) / totalSlides) * 100}%`;
        }
    }

    /**
     * Reinicia el timer de auto-avance
     */
    function resetAutoAdvance() {
        clearInterval(autoAdvanceTimer);
        autoAdvanceTimer = setInterval(goToNext, AUTO_ADVANCE_INTERVAL);
    }

    /**
     * Avanza al siguiente slide
     */
    function goToNext() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlides();
        resetAutoAdvance();
    }

    /**
     * Retrocede al slide anterior
     */
    function goToPrev() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlides();
        resetAutoAdvance();
    }

    /**
     * Va a un slide específico
     * @param {number} index - Índice del slide
     */
    function goToSlide(index) {
        currentSlide = index;
        updateSlides();
        resetAutoAdvance();
    }

    /**
     * Maneja el inicio del touch
     * @param {TouchEvent} e - Evento touch
     */
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }

    /**
     * Maneja el fin del touch
     * @param {TouchEvent} e - Evento touch
     */
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > MIN_SWIPE_DISTANCE) {
            diff > 0 ? goToNext() : goToPrev();
        }
    }

    /**
     * Inicializa el controlador del carrusel
     */
    function init() {
        carouselTrack = document.querySelector('.carousel-track');
        slides = document.querySelectorAll('.carousel-item');
        indicators = document.querySelectorAll('#hero-indicators button');
        progressBar = document.querySelector('.progress-bar');

        if (!carouselTrack || slides.length === 0) return;

        // Touch events
        carouselTrack.addEventListener('touchstart', handleTouchStart, { passive: true });
        carouselTrack.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Click events en indicadores
        if (indicators) {
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => goToSlide(index));
            });
        }

        // Exponer funciones globales para onclick inline
        window.heroCarouselNext = goToNext;
        window.heroCarouselPrev = goToPrev;

        // Inicializar
        updateSlides();
        resetAutoAdvance();
    }

    // Public API
    return {
        init,
        next: goToNext,
        prev: goToPrev,
        goTo: goToSlide
    };
})();

/* ============================================
   6. LANGUAGE SWITCHER CONTROLLER
   ============================================ */

const LanguageSwitcherController = (function() {
    let switcher = null;
    let trigger = null;
    let dropdown = null;
    let isOpen = false;
    
    /**
     * Abre el dropdown
     */
    function open() {
        if (isOpen) return;
        isOpen = true;
        switcher.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
    }
    
    /**
     * Cierra el dropdown
     */
    function close() {
        if (!isOpen) return;
        isOpen = false;
        switcher.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
    }
    
    /**
     * Alterna el estado del dropdown
     */
    function toggle() {
        isOpen ? close() : open();
    }
    
    /**
     * Maneja el click fuera del dropdown
     * @param {Event} e - Evento click
     */
    function handleClickOutside(e) {
        if (switcher && !switcher.contains(e.target)) {
            close();
        }
    }
    
    /**
     * Maneja la tecla Escape
     * @param {KeyboardEvent} e - Evento teclado
     */
    function handleKeydown(e) {
        if (e.key === 'Escape' && isOpen) {
            close();
            trigger.focus();
        }
    }
    
    /**
     * Inicializa el controlador del language switcher
     */
    function init() {
        switcher = document.getElementById('lang-switcher');
        if (!switcher) return;
        
        trigger = switcher.querySelector('.lang-trigger');
        dropdown = switcher.querySelector('.lang-dropdown');
        
        if (!trigger || !dropdown) return;
        
        // Toggle al hacer click en el trigger
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle();
        });
        
        // Cerrar al hacer click fuera
        document.addEventListener('click', handleClickOutside);
        
        // Cerrar con Escape
        document.addEventListener('keydown', handleKeydown);
        
        // Cerrar al hacer scroll (opcional, mejor UX)
        window.addEventListener('scroll', () => {
            if (isOpen) close();
        }, { passive: true });
    }
    
    // Public API
    return {
        init,
        open,
        close,
        toggle
    };
})();

/* ============================================
   7. FOOD CAROUSEL CONTROLLER
   ============================================ */

const FoodCarouselController = (function() {
    const SWIPE_THRESHOLD = 45;

    /**
     * Obtiene las tarjetas del carrusel
     * @param {HTMLElement} track
     * @returns {HTMLElement[]}
     */
    function getCards(track) {
        return Array.from(track.children);
    }

    /**
     * Indica si el track tiene desplazamiento horizontal real
     * @param {HTMLElement} track
     * @param {HTMLElement[]} cards
     * @returns {boolean}
     */
    function isScrollable(track, cards) {
        return cards.length > 1 && (track.scrollWidth - track.clientWidth) > 4;
    }

    /**
     * Obtiene el índice de la tarjeta más cercana al inicio visible del track
     * @param {HTMLElement} track
     * @param {HTMLElement[]} cards
     * @returns {number}
     */
    function getClosestIndex(track, cards) {
        let closestIndex = 0;
        let minDistance = Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
            const distance = Math.abs(card.offsetLeft - track.scrollLeft);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    /**
     * Posiciona el carrusel en una tarjeta específica
     * @param {HTMLElement} track
     * @param {HTMLElement[]} cards
     * @param {number} index
     */
    function scrollToCard(track, cards, index) {
        const target = cards[index];
        if (!target) return;

        track.scrollTo({
            left: target.offsetLeft,
            behavior: 'smooth'
        });
    }

    /**
     * Desplaza el carrusel una tarjeta hacia la izquierda o derecha con loop infinito
     * @param {HTMLElement} track
     * @param {number} direction - 1 para siguiente, -1 para anterior
     */
    function move(track, direction) {
        const cards = getCards(track);
        if (!isScrollable(track, cards)) return;

        const currentIndex = getClosestIndex(track, cards);
        let nextIndex = currentIndex + direction;

        if (nextIndex >= cards.length) {
            nextIndex = 0;
        } else if (nextIndex < 0) {
            nextIndex = cards.length - 1;
        }

        scrollToCard(track, cards, nextIndex);
    }

    /**
     * Actualiza estado visual y accesibilidad de los botones
     * @param {HTMLElement} track
     * @param {HTMLButtonElement} prevBtn
     * @param {HTMLButtonElement} nextBtn
     */
    function updateButtons(track, prevBtn, nextBtn) {
        const cards = getCards(track);
        const canNavigate = isScrollable(track, cards);

        prevBtn.disabled = !canNavigate;
        nextBtn.disabled = !canNavigate;

        prevBtn.classList.toggle('is-disabled', !canNavigate);
        nextBtn.classList.toggle('is-disabled', !canNavigate);
    }

    /**
     * Configura un carrusel individual
     * @param {HTMLElement} container
     */
    function setupCarousel(container) {
        const track = container.querySelector('.food-carousel-track');
        const prevBtn = container.querySelector('[data-food-carousel-prev]');
        const nextBtn = container.querySelector('[data-food-carousel-next]');

        if (!track || !prevBtn || !nextBtn) return;

        let touchStartX = 0;
        let touchStartY = 0;

        prevBtn.addEventListener('click', () => move(track, -1));
        nextBtn.addEventListener('click', () => move(track, 1));

        track.addEventListener('scroll', () => updateButtons(track, prevBtn, nextBtn), { passive: true });

        track.addEventListener('touchstart', (event) => {
            const touch = event.changedTouches?.[0];
            if (!touch) return;

            touchStartX = touch.screenX;
            touchStartY = touch.screenY;
        }, { passive: true });

        track.addEventListener('touchend', (event) => {
            const touch = event.changedTouches?.[0];
            if (!touch) return;

            const deltaX = touchStartX - touch.screenX;
            const deltaY = Math.abs(touchStartY - touch.screenY);

            if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= deltaY) {
                return;
            }

            deltaX > 0 ? move(track, 1) : move(track, -1);
        }, { passive: true });

        window.addEventListener('resize', () => updateButtons(track, prevBtn, nextBtn), { passive: true });

        updateButtons(track, prevBtn, nextBtn);
    }

    /**
     * Inicializa todos los carruseles de comidas de la página
     */
    function init() {
        const containers = document.querySelectorAll('.food-carousel-container');
        if (containers.length === 0) return;

        containers.forEach(setupCarousel);
    }

    return {
        init
    };
})();

/* ============================================
   INICIALIZACIÓN GLOBAL
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos los módulos
    MobileMenuController.init();
    DropdownController.init();
    WifiCopyController.init();
    ChatbotController.init();
    HeroCarouselController.init();
    FoodCarouselController.init();
    LanguageSwitcherController.init();

    console.log('✅ Tenuta Re di Roma - All modules initialized');
});
