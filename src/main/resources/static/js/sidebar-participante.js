document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Use vanilla CSS classes defined in style.css to bypass Tailwind CDN limits
    sidebar.className = "";

    // Get current filename from path or default to index.html if root
    let currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === '' || currentPage === '/') currentPage = 'index.html';

    const menuItems = [
        { icon: 'home',            label: 'Inicio',         id: 'index.html' },
        { icon: 'assignment',      label: 'Inscripciones',  id: 'inscripciones.html' },
        { icon: 'account_balance', label: 'Mi instituci\u00f3n', id: 'institucion.html' },
        { icon: 'groups',          label: 'Equipos',        id: 'equipos.html' },
        { icon: 'person',          label: 'Participantes',  id: 'participantes.html' },
        { icon: 'leaderboard',     label: 'Resultados',     id: 'resultados.html' }
    ];

    let menuHtml = `
        <div class="logo-container">
            <div style="background-color: #ad0017; padding: 8px; border-radius: 8px;">
                <span class="material-symbols-outlined text-white" style="font-size: 24px;">workspace_premium</span>
            </div>
            <div class="nav-label">
                <h1 style="font-family: 'Lexend', sans-serif; color: white; font-size: 20px; font-weight: 700; margin: 0;">OLIMPIADAS</h1>
            </div>
        </div>
        <nav style="flex: 1; display: flex; flex-direction: column; gap: 4px; overflow-y: auto;">`;

    menuItems.forEach(item => {
        const isActive = currentPage === item.id;
        const activeStyle = isActive
            ? 'background-color: rgba(255,255,255,0.1); border-left: 4px solid #ad0017; font-weight: 700;'
            : 'border-left: 4px solid transparent;';
        const iconFill = isActive ? "font-variation-settings: 'FILL' 1;" : "";

        menuHtml += `
            <a class="nav-item" style="${activeStyle}" href="${item.id}">
                <span class="material-symbols-outlined" style="${iconFill}">${item.icon}</span>
                <span class="nav-label" style="font-family: 'Lexend', sans-serif; font-size: 14px;">${item.label}</span>
            </a>`;
    });

    menuHtml += `</nav>`;

    // Footer section
    const perfilActive = currentPage === 'perfil.html'
        ? 'background-color: rgba(255,255,255,0.1); border-left: 4px solid #ad0017; font-weight: 700;'
        : 'border-left: 4px solid transparent;';
    const perfilFill = currentPage === 'perfil.html' ? "font-variation-settings: 'FILL' 1;" : "";

    menuHtml += `
        <div class="sidebar-footer" style="padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 4px;">
            <a href="perfil.html" class="nav-item" style="${perfilActive}">
                <span class="material-symbols-outlined" style="${perfilFill}">settings</span>
                <span class="nav-label" style="font-family: 'Lexend', sans-serif; font-size: 14px;">Mi Perfil</span>
            </a>
            <a href="#" onclick="window.logout(); return false;" class="nav-item" style="border-left: 4px solid transparent;">
                <span class="material-symbols-outlined">logout</span>
                <span class="nav-label" style="font-family: 'Lexend', sans-serif; font-size: 14px;">Cerrar sesi\u00f3n</span>
            </a>
            <button class="nav-item" onclick="toggleSidebarCollapse()" style="border-left: 4px solid transparent; background: transparent; border-top:none; border-right:none; border-bottom:none; cursor: pointer;">
                <span class="material-symbols-outlined" id="collapse-icon">menu_open</span>
                <span class="nav-label" style="font-family: 'Lexend', sans-serif; font-size: 14px;">Contraer</span>
            </button>
        </div>`;

    sidebar.innerHTML = menuHtml;

    // ── Corregir el ancho del main-canvas ─────────────────────────────────
    // El sidebar es position:fixed (320px). #main-canvas debe desplazarse
    // a la derecha. setProperty 'important' gana sobre cualquier regla CSS
    // generada dinamicamente por Tailwind CDN.
    const canvas = document.getElementById('main-canvas');
    if (canvas) {
        function applyCanvasMargin() {
            if (window.innerWidth >= 768) {
                const collapsed = sidebar.classList.contains('sidebar-collapsed');
                canvas.style.setProperty('margin-left', collapsed ? '80px' : '320px', 'important');
            } else {
                canvas.style.setProperty('margin-left', '0px', 'important');
            }
        }
        applyCanvasMargin();
        window.addEventListener('resize', applyCanvasMargin);
        window._applyCanvasMargin = applyCanvasMargin;
    }
});

// ── Funciones globales ─────────────────────────────────────────────────────
function toggleSidebarCollapse() {
    const sidebar = document.getElementById('sidebar');
    const icon = document.getElementById('collapse-icon');
    if (!sidebar) return;
    sidebar.classList.toggle('sidebar-collapsed');
    if (icon) icon.innerText = sidebar.classList.contains('sidebar-collapsed') ? 'menu' : 'menu_open';
    if (window._applyCanvasMargin) window._applyCanvasMargin();
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (!sidebar) return;
    sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
}

window.toggleSidebarCollapse = toggleSidebarCollapse;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleMobileSidebar = toggleMobileMenu;
