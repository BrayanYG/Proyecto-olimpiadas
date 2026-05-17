// IIFE para inyectar el <style> del header lo antes posible
(function applyHeaderStyles() {
    if (!document.getElementById('participante-header-styles')) {
        const styleTag = document.createElement('style');
        styleTag.id = 'participante-header-styles';
        styleTag.textContent = `
            #header-participante {
                width: 100% !important;
                height: 64px !important;
                min-height: 64px !important;
                max-height: 64px !important;
                box-sizing: border-box !important;
                display: flex !important;
                align-items: center !important;
                position: sticky !important;
                top: 0 !important;
                z-index: 30 !important;
                background-color: rgba(30, 30, 30, 0.97) !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4) !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
                flex-shrink: 0 !important;
            }
        `;
        document.head.appendChild(styleTag);
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // ── 1. Corregir el ancho del main-canvas ──────────────────────────────
    // El sidebar es position:fixed (320px de ancho). #main-canvas debe
    // comenzar donde termina el sidebar. Se aplica con setProperty para
    // ganar sobre cualquier regla que Tailwind CDN genere dinámicamente.
    const canvas = document.getElementById('main-canvas');
    if (canvas) {
        const isDesktop = window.innerWidth >= 768;
        if (isDesktop) {
            canvas.style.setProperty('margin-left', '320px', 'important');
        } else {
            canvas.style.setProperty('margin-left', '0', 'important');
        }

        // Re-aplicar si el usuario redimensiona la ventana
        window.addEventListener('resize', function() {
            const desktop = window.innerWidth >= 768;
            canvas.style.setProperty('margin-left', desktop ? '320px' : '0', 'important');
        });
    }

    // ── 2. Corregir el header ─────────────────────────────────────────────
    const header = document.getElementById('header-participante');
    if (!header) return;

    const isDesktop = window.innerWidth >= 768;

    // Forzar estilos con setProperty (máxima especificidad, gana sobre todo)
    header.style.setProperty('height', '64px', 'important');
    header.style.setProperty('min-height', '64px', 'important');
    header.style.setProperty('max-height', '64px', 'important');
    header.style.setProperty('display', 'flex', 'important');
    header.style.setProperty('align-items', 'center', 'important');
    header.style.setProperty('background-color', 'rgba(30, 30, 30, 0.97)', 'important');
    header.style.setProperty('border-bottom', '1px solid rgba(255, 255, 255, 0.15)', 'important');
    header.style.setProperty('box-shadow', '0 2px 12px rgba(0, 0, 0, 0.4)', 'important');
    header.style.setProperty('position', 'sticky', 'important');
    header.style.setProperty('top', '0', 'important');
    header.style.setProperty('z-index', '30', 'important');
    header.style.setProperty('flex-shrink', '0', 'important');
    header.style.setProperty('width', '100%', 'important');
    header.style.setProperty('box-sizing', 'border-box', 'important');
    header.style.setProperty('padding', isDesktop ? '0 28px' : '0 20px', 'important');

    // ── 3. Inyectar contenido del header ──────────────────────────────────
    const menuBtnHtml = !isDesktop ?
        `<button onclick="toggleMobileMenu()" style="flex-shrink:0;display:flex;align-items:center;justify-content:center;padding:8px;color:white;background:transparent;border:none;cursor:pointer;border-radius:8px;">
            <span class="material-symbols-outlined">menu</span>
        </button>` : '';

    const usuarioStr = localStorage.getItem('usuario');
    let username = "Inca Warriors";
    if (usuarioStr) {
        try {
            const usuario = JSON.parse(usuarioStr);
            if (usuario && usuario.username) {
                username = usuario.username;
            }
        } catch (e) {}
    }

    header.innerHTML = `
        <div style="flex:1;display:flex;align-items:center;gap:16px;min-width:0;width:100%;">
            ${menuBtnHtml}
            <div style="flex:1;min-width:0;">
                <h2 style="font-family:'Lexend',sans-serif;font-size:${isDesktop ? '18px' : '15px'};font-weight:400;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;line-height:1.3;">
                    Participante: <span style="font-weight:700;">${username}</span>
                </h2>
            </div>
            <span style="flex-shrink:0;font-family:'Lexend',sans-serif;font-size:12px;color:rgba(255,255,255,0.55);white-space:nowrap;">ID: 2024-IW-001</span>
        </div>
    `;
});
