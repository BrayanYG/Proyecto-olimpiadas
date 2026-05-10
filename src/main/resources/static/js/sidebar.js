document.addEventListener('DOMContentLoaded', function() {
    // Inject dynamic CSS for the premium white sidebar
    const style = document.createElement('style');
    style.innerHTML = `
        #sidebar {
            background-color: #ffffff !important;
            border-right: 1px solid #e5e2e1 !important;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .nav-item {
            margin: 4px 12px !important;
            padding: 12px 16px !important;
            border-radius: 12px !important;
            color: #5d3f3c !important;
            transition: all 0.2s ease !important;
            display: flex !important;
            align-items: center !important;
            gap: 16px !important;
            text-decoration: none !important;
        }
        .nav-item:hover {
            background-color: #f6f3f2 !important;
            color: #ad0017 !important;
        }
        .nav-item.active {
            background-color: #ad0017 !important;
            color: #ffffff !important;
            box-shadow: 0 4px 12px rgba(173,0,23,0.2) !important;
        }
        .nav-item.active .material-symbols-outlined {
            font-variation-settings: 'FILL' 1 !important;
        }
        .sidebar-collapsed {
            width: 88px !important;
        }
        .sidebar-collapsed .nav-label, 
        .sidebar-collapsed .config-text,
        .sidebar-collapsed .profile-info {
            display: none !important;
        }
        .sidebar-collapsed .nav-item {
            justify-content: center !important;
            padding: 12px 0 !important;
        }
        .sidebar-collapsed .profile-card {
            padding: 8px !important;
            margin: 0 12px !important;
            justify-content: center !important;
        }
        .profile-card {
            background-color: #f0eded !important;
            margin: 0 16px 16px 16px !important;
            padding: 12px !important;
            border-radius: 16px !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            color: #1c1b1b !important;
            text-decoration: none !important;
            transition: all 0.2s ease !important;
        }
        .profile-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
        }
        .profile-icon-box {
            background-color: #ad0017 !important;
            color: #ffffff !important;
            width: 40px !important;
            height: 40px !important;
            border-radius: 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
        }
        .divider {
            height: 1px !important;
            background: #e5e2e1 !important;
            margin: 16px 24px !important;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Get current filename
    let currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    if (currentPage === '' || currentPage === '/') currentPage = 'dashboard.html';

    const menuItems = [
        { id: 'dashboard.html', label: 'Dashboard', icon: 'grid_view' },
        { id: 'eventos.html', label: 'Eventos', icon: 'calendar_today' },
        { id: 'instituciones.html', label: 'Instituciones', icon: 'account_balance' },
        { id: 'equipos.html', label: 'Equipos', icon: 'group' },
        { id: 'participantes.html', label: 'Participantes', icon: 'person' },
        { id: 'deportes.html', label: 'Deportes', icon: 'sports_kabaddi' },
        { id: 'sorteo.html', label: 'Grupos', icon: 'apps' },
        { id: 'calendario.html', label: 'Calendario', icon: 'event' },
        { id: 'resultados.html', label: 'Resultados', icon: 'emoji_events' }
    ];

    let menuHtml = `<nav class="flex-1 flex flex-col pt-4 overflow-y-auto no-scrollbar">`;
    
    menuItems.forEach(item => {
        const isActive = currentPage === item.id;
        const activeClass = isActive ? 'active' : '';
        
        menuHtml += `
            <a class="nav-item ${activeClass}" href="${item.id}">
                <span class="material-symbols-outlined">${item.icon}</span>
                <span class="font-label-md text-sm nav-label">${item.label}</span>
            </a>`;
    });

    menuHtml += `</nav>`;

    // Bottom section
    menuHtml += `
        <div class="mt-auto">
            <div class="divider"></div>
            <a href="../index.html" class="nav-item mb-2">
                <span class="material-symbols-outlined">logout</span>
                <span class="font-label-md text-sm nav-label">Cerrar sesión</span>
            </a>
            <button class="nav-item w-[calc(100%-24px)] mb-4" onclick="toggleSidebarCollapse()">
                <span class="material-symbols-outlined" id="collapse-icon">menu_open</span>
                <span class="font-label-md text-sm nav-label">Contraer</span>
            </button>
            
            <a href="perfil.html" class="profile-card">
                <div class="profile-icon-box">
                    <span class="material-symbols-outlined">settings</span>
                </div>
                <div class="profile-info overflow-hidden">
                    <p class="font-label-md text-sm font-bold truncate">Ver Perfil</p>
                    <p class="text-[10px] opacity-60">v2.4.0-peru</p>
                </div>
            </a>
        </div>`;

    sidebar.innerHTML = menuHtml;
});

// Sidebar logic
function toggleSidebarCollapse() {
    const sidebar = document.getElementById('sidebar');
    const icon = document.getElementById('collapse-icon');
    if (!sidebar) return;
    
    sidebar.classList.toggle('sidebar-collapsed');
    if (sidebar.classList.contains('sidebar-collapsed')) {
        if (icon) icon.innerText = 'menu';
    } else {
        if (icon) icon.innerText = 'menu_open';
    }
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    
    sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('hidden');
    
    if (sidebar.classList.contains('mobile-open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Global functions for HTML onclicks
window.toggleSidebarCollapse = toggleSidebarCollapse;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleMobileSidebar = toggleMobileMenu;
