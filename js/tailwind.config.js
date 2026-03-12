/**
 * ============================================
 * TAILWIND CSS CONFIGURATION
 * ============================================
 * 
 * Configuración personalizada de Tailwind para
 * Tenuta Re di Roma
 * 
 * Author: Tined Solutions
 * Version: 1.0.0
 */

tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#546a2f",
                "background-light": "#f7f7f6",
                "background-dark": "#1a1d15",
                "metro-orange": "#ea580c"
            },
            fontFamily: {
                "display": ["Work Sans", "sans-serif"],
                "serif": ["Noto Serif", "serif"],
                "title": ["Playfair Display", "Noto Serif", "serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
};
