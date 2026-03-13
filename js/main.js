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

    /**
     * Alterna la visibilidad del chatbot
     */
    function toggle() {
        isOpen = !isOpen;
        
        if (isOpen) {
            chatWindow.classList.add('open');
            fabOpenIcon.style.display = 'none';
            fabCloseIcon.style.display = '';
            if (notificationDot) notificationDot.style.display = 'none';
        } else {
            chatWindow.classList.remove('open');
            fabOpenIcon.style.display = '';
            fabCloseIcon.style.display = 'none';
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
   7. MOBILE HORIZONTAL SCROLL GUARD
   ============================================ */

const MobileHorizontalScrollGuardController = (function() {
    let foodScroller = null;
    let chatWidget = null;
    let releaseTimer = null;
    const MOBILE_BREAKPOINT = '(max-width: 1023px)';

    /**
     * Determina si estamos en viewport móvil/tablet
     * @returns {boolean}
     */
    function isMobileViewport() {
        return window.matchMedia(MOBILE_BREAKPOINT).matches;
    }

    /**
     * Bloquea temporalmente la interacción del chat para priorizar el gesto horizontal
     */
    function lockChatPointerEvents() {
        if (!chatWidget || !isMobileViewport()) return;
        chatWidget.classList.add('chat-gesture-lock');
    }

    /**
     * Libera la interacción del chat tras finalizar el gesto
     * @param {number} delay - Retraso en ms
     */
    function unlockChatPointerEvents(delay = 120) {
        if (!chatWidget) return;

        clearTimeout(releaseTimer);
        releaseTimer = setTimeout(() => {
            chatWidget.classList.remove('chat-gesture-lock');
        }, delay);
    }

    /**
     * Limpia estado al pasar a desktop
     */
    function handleResize() {
        if (!chatWidget || isMobileViewport()) return;
        chatWidget.classList.remove('chat-gesture-lock');
    }

    /**
     * Inicializa la protección de scroll horizontal en la sección de restaurantes
     */
    function init() {
        foodScroller = document.querySelector('#mangiare .overflow-x-auto');
        chatWidget = document.getElementById('chat-widget');

        if (!foodScroller || !chatWidget) return;

        foodScroller.addEventListener('touchstart', lockChatPointerEvents, { passive: true });
        foodScroller.addEventListener('touchmove', lockChatPointerEvents, { passive: true });

        const releaseLock = () => unlockChatPointerEvents(120);
        foodScroller.addEventListener('touchend', releaseLock, { passive: true });
        foodScroller.addEventListener('touchcancel', releaseLock, { passive: true });

        // Al desplazarse con inercia mantenemos el lock y lo soltamos al estabilizar.
        foodScroller.addEventListener('scroll', () => {
            lockChatPointerEvents();
            unlockChatPointerEvents(160);
        }, { passive: true });

        window.addEventListener('resize', handleResize, { passive: true });
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
    LanguageSwitcherController.init();
    MobileHorizontalScrollGuardController.init();

    console.log('✅ Tenuta Re di Roma - All modules initialized');
});
