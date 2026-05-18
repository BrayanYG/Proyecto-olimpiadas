document.addEventListener("DOMContentLoaded", () => {
  injectSidebar();
  setActiveLink();
});

function injectSidebar() {
  const sidebarHTML = `
        <div class="sidebar">
            <div class="brand">
                <span class="icon">🏅</span>
                <span>Olimpiadas Perú</span>
            </div>
            <ul class="nav-links">
                <li><a href="dashboard.html" class="nav-link" id="nav-dashboard">📊 Dashboard</a></li>
                <li><a href="deportes.html" class="nav-link" id="nav-deportes">🏀 Deportes</a></li>
                <li><a href="instituciones.html" class="nav-link" id="nav-instituciones">🏢 Instituciones</a></li>
                <li><a href="equipos.html" class="nav-link" id="nav-equipos">👥 Equipos</a></li>
                <li><a href="calendario.html" class="nav-link" id="nav-calendario">📅 Calendario</a></li>
                <li><a href="sorteo.html" class="nav-link" id="nav-sorteo">🎲 Sorteo de Grupos</a></li>
            </ul>
            <div style="margin-top: auto;">
                <a href="index.html" class="nav-link" style="color: var(--error);">🚪 Cerrar Sesión</a>
            </div>
        </div>
    `;

  const container = document.querySelector(".app-container");
  if (container) {
    container.insertAdjacentHTML("afterbegin", sidebarHTML);
  }
}

function setActiveLink() {
  const path = window.location.pathname;
  const page = path.split("/").pop();

  const links = {
    "dashboard.html": "nav-dashboard",
    "deportes.html": "nav-deportes",
    "instituciones.html": "nav-instituciones",
    "equipos.html": "nav-equipos",
    "calendario.html": "nav-calendario",
    "sorteo.html": "nav-sorteo",
  };

  const activeId = links[page];
  if (activeId) {
    const activeLink = document.getElementById(activeId);
    if (activeLink) activeLink.classList.add("active");
  }
}
