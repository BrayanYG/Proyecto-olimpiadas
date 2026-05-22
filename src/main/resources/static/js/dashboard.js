// dashboard.js - Lógica del Panel de Control de las Olimpiadas Deportivas
// Creado por Antigravity

const API_BASE = window.location.port === "8081" ? "" : "http://localhost:8081";

// Datos de simulación local (Mock data)
const MOCK_INSTITUCIONES = [
    { id: 1, nombre: "Colegio San Agustín", direccion: "Lima Metropolitana" },
    { id: 2, nombre: "Colegio Santa María", direccion: "Arequipa Sede" },
    { id: 3, nombre: "Colegio Claretiano", direccion: "Trujillo Norte" },
    { id: 4, nombre: "Colegio F. Roosevelt", direccion: "Surco Sede Central" },
    { id: 5, nombre: "Colegio Markham", direccion: "Miraflores" },
    { id: 6, nombre: "Colegio Newton", direccion: "La Molina" },
    { id: 7, nombre: "Colegio San Jorge", direccion: "Miraflores" },
    { id: 8, nombre: "Colegio Villa María", direccion: "La Planicie" },
    { id: 9, nombre: "Colegio Recoleta", direccion: "Chacarilla" },
    { id: 10, nombre: "Colegio Inmaculada", direccion: "Surco" },
    { id: 11, nombre: "Colegio Champagnat", direccion: "Santiago de Surco" },
    { id: 12, nombre: "Colegio Alpamayo", direccion: "Ate" }
];

const MOCK_EQUIPOS = [
    { id: 101, nombre: "San Agustín FC", institucion: MOCK_INSTITUCIONES[0] },
    { id: 102, nombre: "Santa María Basket", institucion: MOCK_INSTITUCIONES[1] },
    { id: 103, nombre: "Claretiano Vóley", institucion: MOCK_INSTITUCIONES[2] },
    { id: 104, nombre: "Roosevelt FC", institucion: MOCK_INSTITUCIONES[3] },
    { id: 105, nombre: "Markham Vóley", institucion: MOCK_INSTITUCIONES[4] },
    { id: 106, nombre: "Newton Basket", institucion: MOCK_INSTITUCIONES[5] },
    { id: 107, nombre: "San Jorge Vóley", institucion: MOCK_INSTITUCIONES[6] },
    { id: 108, nombre: "Villa María FC", institucion: MOCK_INSTITUCIONES[7] },
    { id: 109, nombre: "Recoleta Basket", institucion: MOCK_INSTITUCIONES[8] },
    { id: 110, nombre: "Inmaculada FC", institucion: MOCK_INSTITUCIONES[9] }
];

// Encuentros mock (finalizados para sumar puntos y pendientes para próximos partidos)
const MOCK_ENCUENTROS = [
    // Partidos Finalizados (Los ganadores reciben 1 punto. Los empates no otorgan puntos)
    {
        id: 1,
        evento: { nombre: "Torneo de Fútbol" },
        equipoLocal: MOCK_EQUIPOS[0], // San Agustín FC (Ganador -> 1 punto para San Agustín)
        equipoVisitante: MOCK_EQUIPOS[3], // Roosevelt FC
        fechaHora: "2026-05-18T10:00:00",
        lugar: "Campo Central",
        estado: "FINALIZADO",
        resultado: { puntosLocal: 3, puntosVisitante: 1 }
    },
    {
        id: 2,
        evento: { nombre: "Torneo de Fútbol" },
        equipoLocal: MOCK_EQUIPOS[0], // San Agustín FC (Ganador -> 1 punto para San Agustín)
        equipoVisitante: MOCK_EQUIPOS[7], // Villa María FC
        fechaHora: "2026-05-19T12:00:00",
        lugar: "Campo Central",
        estado: "FINALIZADO",
        resultado: { puntosLocal: 2, puntosVisitante: 0 }
    },
    {
        id: 3,
        evento: { nombre: "Copa Básquetbol" },
        equipoLocal: MOCK_EQUIPOS[1], // Santa María Basket (Ganador -> 1 punto para Santa María)
        equipoVisitante: MOCK_EQUIPOS[5], // Newton Basket
        fechaHora: "2026-05-20T15:00:00",
        lugar: "Coliseo Cerrado",
        estado: "FINALIZADO",
        resultado: { puntosLocal: 85, puntosVisitante: 72 }
    },
    {
        id: 4,
        evento: { nombre: "Torneo de Vóley" },
        equipoLocal: MOCK_EQUIPOS[2], // Claretiano Vóley (Ganador -> 1 punto para Claretiano)
        equipoVisitante: MOCK_EQUIPOS[4], // Markham Vóley
        fechaHora: "2026-05-21T09:00:00",
        lugar: "Coliseo Cerrado",
        estado: "FINALIZADO",
        resultado: { puntosLocal: 3, puntosVisitante: 2 }
    },
    {
        id: 5,
        evento: { nombre: "Copa Básquetbol" },
        equipoLocal: MOCK_EQUIPOS[8], // Recoleta Basket (Ganador -> 1 punto para Recoleta)
        equipoVisitante: MOCK_EQUIPOS[1], // Santa María Basket
        fechaHora: "2026-05-21T11:00:00",
        lugar: "Coliseo Cerrado",
        estado: "FINALIZADO",
        resultado: { puntosLocal: 60, puntosVisitante: 50 }
    },
    
    // Partidos Pendientes (Se mostrarán en "Próximos Partidos" de 10 en 10)
    {
        id: 6,
        evento: { nombre: "Torneo de Fútbol" },
        equipoLocal: MOCK_EQUIPOS[9],
        equipoVisitante: MOCK_EQUIPOS[0],
        fechaHora: "2026-05-24T15:30:00",
        lugar: "Campo Central",
        estado: "PENDIENTE",
        resultado: null
    },
    {
        id: 7,
        evento: { nombre: "Copa Básquetbol" },
        equipoLocal: MOCK_EQUIPOS[1],
        equipoVisitante: MOCK_EQUIPOS[5],
        fechaHora: "2026-05-25T10:00:00",
        lugar: "Polideportivo 2",
        estado: "PENDIENTE",
        resultado: null
    },
    {
        id: 8,
        evento: { nombre: "Torneo de Vóley" },
        equipoLocal: MOCK_EQUIPOS[4],
        equipoVisitante: MOCK_EQUIPOS[6],
        fechaHora: "2026-05-26T16:45:00",
        lugar: "Coliseo Cerrado",
        estado: "PENDIENTE",
        resultado: null
    },
    {
        id: 9,
        evento: { nombre: "Torneo de Fútbol" },
        equipoLocal: MOCK_EQUIPOS[0],
        equipoVisitante: MOCK_EQUIPOS[3],
        fechaHora: "2026-05-27T14:00:00",
        lugar: "Estadio Nacional",
        estado: "PENDIENTE",
        resultado: null
    },
    {
        id: 10,
        evento: { nombre: "Torneo de Vóley" },
        equipoLocal: MOCK_EQUIPOS[2],
        equipoVisitante: MOCK_EQUIPOS[6],
        fechaHora: "2026-05-28T09:30:00",
        lugar: "Coliseo Cerrado",
        estado: "PENDIENTE",
        resultado: null
    },
    {
        id: 11,
        evento: { nombre: "Copa Básquetbol" },
        equipoLocal: MOCK_EQUIPOS[5],
        equipoVisitante: MOCK_EQUIPOS[8],
        fechaHora: "2026-05-29T11:00:00",
        lugar: "Polideportivo 2",
        estado: "PENDIENTE",
        resultado: null
    },
    {
        id: 12,
        evento: { nombre: "Torneo de Fútbol" },
        equipoLocal: MOCK_EQUIPOS[7],
        equipoVisitante: MOCK_EQUIPOS[9],
        fechaHora: "2026-05-30T15:00:00",
        lugar: "Campo Central",
        estado: "PENDIENTE",
        resultado: null
    },
    {
        id: 13,
        evento: { nombre: "Copa Básquetbol" },
        equipoLocal: MOCK_EQUIPOS[1],
        equipoVisitante: MOCK_EQUIPOS[8],
        fechaHora: "2026-06-01T10:00:00",
        lugar: "Polideportivo 2",
        estado: "PENDIENTE",
        resultado: null
    },
    {
        id: 14,
        evento: { nombre: "Torneo de Vóley" },
        equipoLocal: MOCK_EQUIPOS[6],
        equipoVisitante: MOCK_EQUIPOS[2],
        fechaHora: "2026-06-02T16:00:00",
        lugar: "Coliseo Cerrado",
        estado: "PENDIENTE",
        resultado: null
    },
    {
        id: 15,
        evento: { nombre: "Torneo de Fútbol" },
        equipoLocal: MOCK_EQUIPOS[3],
        equipoVisitante: MOCK_EQUIPOS[7],
        fechaHora: "2026-06-03T14:00:00",
        lugar: "Estadio Nacional",
        estado: "PENDIENTE",
        resultado: null
    }
];

const MOCK_CHART_DATA = {
    "Global": {
        labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
        data: [15, 24, 30, 28, 35, 42, 20]
    },
    "Fútbol": {
        labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
        data: [8, 12, 15, 10, 18, 22, 12]
    },
    "Básquet": {
        labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
        data: [7, 8, 10, 12, 10, 15, 5]
    },
    "Voleibol": [] // Vacío para demostrar de forma activa el estado vacío del gráfico
};

// Estados globales de paginación de partidos
let activeChart = null;
let currentMatchesPage = 1;
const matchesPerPage = 10;
let allMatchesData = [];

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    inicializarDashboard();
});

async function inicializarDashboard() {
    // 1. Obtener y renderizar KPIs
    const kpiData = await fetchKPIs();
    
    // Detección de base de datos vacía
    window.isDatabaseEmpty = (!kpiData || Object.keys(kpiData).length === 0 || 
        (kpiData.instituciones === 0 && kpiData.equipos === 0 && kpiData.participantes === 0 && kpiData.deportes === 0));

    renderKPIs(kpiData);

    // 2. Obtener y renderizar Ranking (y Podio de Honor)
    const rankingData = window.isDatabaseEmpty ? [] : await fetchRanking();
    renderRankingList(rankingData);
    renderPodium(rankingData);

    // 3. Obtener y renderizar Próximos Partidos (paginado de 10 en 10)
    allMatchesData = window.isDatabaseEmpty ? [] : await fetchUpcomingMatches();
    currentMatchesPage = 1;
    renderMatchesTable(allMatchesData);

    // 4. Obtener deportes, renderizar filtros e inicializar gráfico (Global)
    const deportes = window.isDatabaseEmpty ? [] : await fetchDeportes();
    inicializarFiltrosGrafico(deportes);
    cargarGraficoPorFiltro("Global");
}

// --- CÁLCULO DINÁMICO DE PUNTOS ---

function calcularPuntosRanking(instituciones, encuentros) {
    const pointsMap = {};

    // Inicializar todos los colegios con 0 puntos por defecto
    instituciones.forEach(inst => {
        pointsMap[inst.id] = 0;
    });

    // Recorrer los encuentros finalizados y dar 1 punto por partido ganado
    encuentros.forEach(encuentro => {
        if (encuentro.estado === 'FINALIZADO' && encuentro.resultado) {
            const pLocal = encuentro.resultado.puntosLocal ?? 0;
            const pVisitante = encuentro.resultado.puntosVisitante ?? 0;

            let winnerEquipo = null;
            if (pLocal > pVisitante) {
                winnerEquipo = encuentro.equipoLocal;
            } else if (pVisitante > pLocal) {
                winnerEquipo = encuentro.equipoVisitante;
            }

            if (winnerEquipo && winnerEquipo.institucion) {
                const instId = winnerEquipo.institucion.id;
                if (instId !== undefined && instId !== null) {
                    if (instId in pointsMap) {
                        pointsMap[instId] += 1;
                    } else {
                        // Fallback in case the institution was not in the initial list
                        pointsMap[instId] = 1;
                    }
                }
            }
        }
    });

    // Mapear cada institución a la estructura del Ranking
    const ranking = instituciones.map(inst => {
        const puntos = pointsMap[inst.id] || 0;
        return {
            nombre: inst.nombre,
            puntos: puntos,
            oro: puntos >= 2,       // Medalla de oro: 2 o más victorias
            plata: puntos === 1,    // Medalla de plata: exactamente 1 victoria
            bronce: false,          // Medalla de bronce (personalizable)
            detalles: inst.direccion || "Sede Olímpica"
        };
    });

    // Ordenar descendente por puntos, y alfabéticamente si empatan
    return ranking.sort((a, b) => {
        if (b.puntos !== a.puntos) {
            return b.puntos - a.puntos;
        }
        return a.nombre.localeCompare(b.nombre);
    });
}

// --- CONSUMO DE DATOS ---

async function fetchKPIs() {
    try {
        const [instRes, equipRes, partRes, depRes] = await Promise.all([
            fetch(`${API_BASE}/api/instituciones`),
            fetch(`${API_BASE}/api/equipos`),
            fetch(`${API_BASE}/api/participantes`),
            fetch(`${API_BASE}/api/deportes`)
        ]);

        let instCount = 0;
        let equipCount = 0;
        let partCount = 0;
        let depCount = 0;

        if (instRes.ok) {
            const data = await instRes.json();
            instCount = Array.isArray(data) ? data.length : 0;
        }
        if (equipRes.ok) {
            const data = await equipRes.json();
            equipCount = Array.isArray(data) ? data.length : 0;
        }
        if (partRes.ok) {
            const data = await partRes.json();
            partCount = Array.isArray(data) ? data.length : 0;
        }
        if (depRes.ok) {
            const data = await depRes.json();
            depCount = Array.isArray(data) ? data.length : 0;
        }

        return {
            instituciones: instCount,
            equipos: equipCount,
            participantes: partCount,
            deportes: depCount
        };
    } catch (e) {
        console.warn("Error al consumir APIs de KPI:", e);
        return {
            instituciones: 0,
            equipos: 0,
            participantes: 0,
            deportes: 0
        };
    }
}

async function fetchRanking() {
    try {
        const res = await fetch(`${API_BASE}/api/instituciones/ranking`);
        if (res.ok) {
            const ranking = await res.json();
            if (ranking && ranking.length > 0) {
                return ranking;
            }
        }
        // Calcular de forma dinámica sobre instituciones y encuentros reales
        const [instRes, encRes] = await Promise.all([
            fetch(`${API_BASE}/api/instituciones`),
            fetch(`${API_BASE}/api/encuentros`)
        ]);
        if (instRes.ok && encRes.ok) {
            const instituciones = await instRes.json();
            const encuentros = await encRes.json();
            if (Array.isArray(instituciones) && instituciones.length > 0) {
                return calcularPuntosRanking(instituciones, Array.isArray(encuentros) ? encuentros : []);
            }
        }
        return [];
    } catch (e) {
        console.warn("Error al consumir API de ranking:", e);
        return [];
    }
}

async function fetchUpcomingMatches() {
    try {
        const res = await fetch(`${API_BASE}/api/encuentros`);
        if (res.ok) {
            const encuentros = await res.json();
            if (Array.isArray(encuentros) && encuentros.length > 0) {
                // Filtrar solo los programados/pendientes
                const pendientes = encuentros.filter(e => e.estado !== 'FINALIZADO');
                return pendientes.map(e => ({
                    deporte: e.evento?.deporte?.nombre || e.evento?.nombre || e.equipoLocal?.deporte?.nombre || "Deporte",
                    equipos: `${e.equipoLocal?.nombre || "Local"} vs ${e.equipoVisitante?.nombre || "Visitante"}`,
                    fechaHora: e.fechaHora,
                    estado: e.estado === "PENDIENTE" ? "Programado" : e.estado
                }));
            }
        }
        return [];
    } catch (e) {
        console.warn("Error al consumir API de encuentros:", e);
        return [];
    }
}

async function fetchDeportes() {
    try {
        const res = await fetch(`${API_BASE}/api/deportes`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                return data;
            }
        }
        return [];
    } catch (e) {
        console.warn("Error al consumir API de deportes:", e);
        return [];
    }
}

async function fetchChartData(deporte) {
    if (window.isDatabaseEmpty) {
        return null;
    }
    try {
        const res = await fetch(`${API_BASE}/api/encuentros`);
        if (!res.ok) return null;
        const encuentros = await res.json();
        if (!Array.isArray(encuentros) || encuentros.length === 0) {
            return null;
        }

        // Filtrar encuentros por deporte
        const filtered = encuentros.filter(e => {
            if (deporte === "Global") return true;
            const sportName = e.evento?.deporte?.nombre || e.evento?.nombre || e.equipoLocal?.deporte?.nombre || "";
            return sportName.toLowerCase().includes(deporte.toLowerCase()) || 
                   (deporte === "Básquet" && sportName.toLowerCase().includes("basquet"));
        });

        if (filtered.length === 0) {
            return null;
        }

        // Días de la semana
        const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const counts = { "Lunes": 0, "Martes": 0, "Miércoles": 0, "Jueves": 0, "Viernes": 0, "Sábado": 0, "Domingo": 0 };

        filtered.forEach(e => {
            if (e.fechaHora) {
                const date = new Date(e.fechaHora);
                const dayName = daysOfWeek[date.getDay()];
                if (dayName in counts) {
                    counts[dayName]++;
                }
            }
        });

        const labels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        const data = labels.map(day => counts[day]);

        if (data.every(val => val === 0)) {
            return null;
        }

        return { labels, data };
    } catch (e) {
        console.error("Error al obtener datos del gráfico:", e);
        return null;
    }
}

// --- RENDERIZADO CON CONTROL DE ESTADOS VACÍOS ---

function renderKPIs(data) {
    const container = document.getElementById("kpi-container");
    if (!container) return;

    container.innerHTML = "";

    // Validación de estado vacío
    if (!data || Object.keys(data).length === 0 || (data.instituciones === 0 && data.equipos === 0 && data.participantes === 0 && data.deportes === 0)) {
        container.innerHTML = `
            <div class="empty-state-message col-span-2 lg:col-span-4 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm w-full">
                <span class="material-symbols-outlined text-5xl text-outline mb-3" style="font-variation-settings: 'FILL' 0;">monitoring</span>
                <p class="font-bold text-base text-on-surface">No hay suficientes datos</p>
                <p class="text-xs text-on-surface-variant mt-1">Registra instituciones, equipos, participantes y deportes para ver las estadísticas.</p>
            </div>`;
        return;
    }

    container.innerHTML = `
        <!-- Tarjeta Instituciones -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div class="p-3 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">account_balance</span>
            </div>
            <div>
                <p class="text-2xl font-extrabold text-on-surface">${data.instituciones || 0}</p>
                <p class="text-xs text-on-surface-variant font-medium">Instituciones</p>
            </div>
        </div>
        <!-- Tarjeta Equipos -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div class="p-3 rounded-lg bg-secondary-container text-secondary flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">group</span>
            </div>
            <div>
                <p class="text-2xl font-extrabold text-on-surface">${data.equipos || 0}</p>
                <p class="text-xs text-on-surface-variant font-medium">Equipos</p>
            </div>
        </div>
        <!-- Tarjeta Participantes -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div class="p-3 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">person</span>
            </div>
            <div>
                <p class="text-2xl font-extrabold text-on-surface">${data.participantes || 0}</p>
                <p class="text-xs text-on-surface-variant font-medium">Participantes</p>
            </div>
        </div>
        <!-- Tarjeta Deportes -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div class="p-3 rounded-lg bg-outline-variant text-outline flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">sports_kabaddi</span>
            </div>
            <div>
                <p class="text-2xl font-extrabold text-on-surface">${data.deportes || 0}</p>
                <p class="text-xs text-on-surface-variant font-medium">Deportes</p>
            </div>
        </div>
    `;
}

function renderPodium(data) {
    const container = document.getElementById("podium-container");
    if (!container) return;

    container.innerHTML = "";

    // Validación de estado vacío
    if (!data || data.length === 0) {
        container.className = "flex flex-col items-center justify-center w-full h-full mt-8";
        container.innerHTML = `
            <div class="empty-state-message flex flex-col items-center justify-center text-center p-4">
                <span class="material-symbols-outlined text-4xl text-outline mb-2 animate-pulse" style="font-variation-settings: 'FILL' 0;">emoji_events</span>
                <p class="font-bold text-sm text-on-surface">No hay suficientes datos</p>
                <p class="text-[10px] text-on-surface-variant mt-1 max-w-[200px]">Se requiere registrar resultados de encuentros finalizados para mostrar el podio de honor.</p>
            </div>`;
        return;
    }
    container.className = "flex items-end gap-2 w-full max-w-[320px] mt-12";

    const first = data[0];
    const second = data[1];
    const third = data[2];

    let html = "";

    // 2do lugar (izquierda)
    if (second) {
        html += `
            <div class="flex flex-col items-center flex-1 min-w-0">
                <span class="text-[10px] leading-tight font-bold text-center text-on-surface w-full break-words min-h-[36px] flex items-center justify-center mb-1" title="${second.nombre}">${second.nombre}</span>
                <span class="text-[9px] text-on-surface-variant font-semibold mb-1">${second.puntos} pts</span>
                <div class="podium-2 w-full bg-secondary-container rounded-t-lg flex items-center justify-center relative mt-2 shadow-inner border border-outline-variant">
                    <span class="material-symbols-outlined text-2xl" style="color: #A0A0A0; font-variation-settings: 'FILL' 1;">military_tech</span>
                    <span class="absolute bottom-2 font-bold text-sm text-on-secondary-container">2</span>
                </div>
            </div>
        `;
    } else {
        html += `<div class="flex-1"></div>`;
    }

    // 1er lugar (centro)
    if (first) {
        html += `
            <div class="flex flex-col items-center flex-1 min-w-0">
                <span class="text-[10px] leading-tight font-bold text-center text-on-surface w-full break-words min-h-[36px] flex items-center justify-center mb-1" title="${first.nombre}">${first.nombre}</span>
                <span class="text-[9px] text-on-surface-variant font-semibold mb-1">${first.puntos} pts</span>
                <div class="podium-1 w-full bg-peruvian-gradient rounded-t-lg flex items-center justify-center relative mt-2 shadow-md">
                    <span class="material-symbols-outlined text-3xl" style="color: #FFD700; font-variation-settings: 'FILL' 1;">emoji_events</span>
                    <span class="absolute bottom-2 font-bold text-sm text-white">1</span>
                </div>
            </div>
        `;
    }

    // 3er lugar (derecha)
    if (third) {
        html += `
            <div class="flex flex-col items-center flex-1 min-w-0">
                <span class="text-[10px] leading-tight font-bold text-center text-on-surface w-full break-words min-h-[36px] flex items-center justify-center mb-1" title="${third.nombre}">${third.nombre}</span>
                <span class="text-[9px] text-on-surface-variant font-semibold mb-1">${third.puntos} pts</span>
                <div class="podium-3 w-full bg-tertiary-container rounded-t-lg flex items-center justify-center relative mt-2 shadow-inner border border-outline-variant">
                    <span class="material-symbols-outlined text-xl" style="color: #CD7F32; font-variation-settings: 'FILL' 1;">military_tech</span>
                    <span class="absolute bottom-2 font-bold text-sm text-white">3</span>
                </div>
            </div>
        `;
    } else {
        html += `<div class="flex-1"></div>`;
    }

    container.innerHTML = html;
}

function renderRankingList(data) {
    const container = document.getElementById("ranking-list");
    if (!container) return;

    container.innerHTML = "";

    // Validación de estado vacío
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state-message flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-white/10 rounded-lg bg-white/5">
                <span class="material-symbols-outlined text-3xl text-white/40 mb-2" style="font-variation-settings: 'FILL' 0;">leaderboard</span>
                <p class="font-bold text-xs text-white">No hay suficientes datos</p>
                <p class="text-[10px] text-white/50 mt-1">El ranking estará disponible una vez que se acumulen puntos en los encuentros finalizados.</p>
            </div>`;
        return;
    }

    // Renderizar solo el top 10 de instituciones (sin botón completo)
    const topRanking = data.slice(0, 10);

    container.innerHTML = topRanking.map((item, index) => `
        <div class="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/5">
            <div class="flex items-center gap-3 min-w-0">
                <span class="font-extrabold text-sm w-5 text-white/50 text-center">${index + 1}</span>
                <div class="min-w-0">
                    <p class="font-bold text-sm text-white truncate" title="${item.nombre}">${item.nombre}</p>
                    <p class="text-[10px] text-white/50 truncate" title="${item.detalles}">${item.detalles}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
                <div class="flex gap-0.5">
                    ${item.oro ? `<span class="material-symbols-outlined text-sm text-[#FFD700]" style="font-variation-settings: 'FILL' 1;">military_tech</span>` : ''}
                    ${item.plata ? `<span class="material-symbols-outlined text-sm text-[#C0C0C0]" style="font-variation-settings: 'FILL' 1;">military_tech</span>` : ''}
                    ${item.bronce ? `<span class="material-symbols-outlined text-sm text-[#CD7F32]" style="font-variation-settings: 'FILL' 1;">military_tech</span>` : ''}
                </div>
                <span class="font-extrabold text-xs text-primary-fixed-dim">${item.puntos} pts</span>
            </div>
        </div>
    `).join("");
}

function renderMatchesTable(data) {
    const tbody = document.getElementById("matches-tbody");
    if (!tbody) return;

    const tableWrapper = tbody.closest(".overflow-x-auto");
    if (!tableWrapper) return;

    // Validación de estado vacío
    if (!data || data.length === 0) {
        tableWrapper.innerHTML = `
            <div class="empty-state-message flex flex-col items-center justify-center text-center py-12 px-6 bg-surface-container-lowest">
                <span class="material-symbols-outlined text-5xl text-outline mb-3" style="font-variation-settings: 'FILL' 0;">calendar_today</span>
                <p class="font-bold text-sm text-on-surface">No hay suficientes datos</p>
                <p class="text-xs text-on-surface-variant mt-1">No hay partidos programados o pendientes registrados en el sistema actualmente.</p>
            </div>`;
        return;
    }

    const totalMatches = data.length;
    const totalPages = Math.ceil(totalMatches / matchesPerPage);
    const startIndex = (currentMatchesPage - 1) * matchesPerPage;
    const endIndex = startIndex + matchesPerPage;
    const matchesToShow = data.slice(startIndex, endIndex);

    // Reconstruir la tabla con la paginación integrada de 10 en 10
    tableWrapper.innerHTML = `
        <table class="w-full text-left min-w-[500px]">
            <thead>
                <tr class="bg-surface-low border-b border-outline-variant text-on-surface-variant font-label-md uppercase tracking-wider text-[10px]">
                    <th class="px-6 py-4">Deporte</th>
                    <th class="px-6 py-4">Equipos</th>
                    <th class="px-6 py-4">Fecha/Hora</th>
                    <th class="px-6 py-4">Estado</th>
                </tr>
            </thead>
            <tbody id="matches-tbody" class="divide-y divide-outline-variant">
                ${matchesToShow.map(match => `
                    <tr class="hover:bg-surface-low/50 transition-colors">
                        <td class="px-6 py-4 text-sm font-semibold text-on-surface">${match.deporte}</td>
                        <td class="px-6 py-4 text-sm text-on-surface-variant font-medium">${match.equipos}</td>
                        <td class="px-6 py-4 text-sm text-on-surface-variant">${formatearFecha(match.fechaHora)}</td>
                        <td class="px-6 py-4 text-xs font-semibold">
                            <span class="px-2.5 py-1 rounded-full bg-primary-fixed text-primary border border-outline-variant/30">
                                ${match.estado}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <!-- Controles de paginación de 10 en 10 -->
        ${totalPages > 1 ? `
        <div class="flex items-center justify-between px-6 py-4 bg-white border-t border-outline-variant">
            <span class="text-xs text-on-surface-variant font-medium">
                Mostrando ${startIndex + 1}-${Math.min(endIndex, totalMatches)} de ${totalMatches} partidos
            </span>
            <div class="flex gap-2">
                <button ${currentMatchesPage === 1 ? 'disabled' : ''} onclick="window.changeMatchesPage(${currentMatchesPage - 1})" class="p-2 border border-outline-variant rounded-lg hover:bg-surface-low text-on-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    <span class="material-symbols-outlined text-sm block">chevron_left</span>
                </button>
                <button ${currentMatchesPage === totalPages ? 'disabled' : ''} onclick="window.changeMatchesPage(${currentMatchesPage + 1})" class="p-2 border border-outline-variant rounded-lg hover:bg-surface-low text-on-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    <span class="material-symbols-outlined text-sm block">chevron_right</span>
                </button>
            </div>
        </div>
        ` : ''}
    `;
}

function changeMatchesPage(newPage) {
    const totalPages = Math.ceil(allMatchesData.length / matchesPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentMatchesPage = newPage;
        renderMatchesTable(allMatchesData);
    }
}

// Exponer la función de cambio de página de forma global
window.changeMatchesPage = changeMatchesPage;

// --- CONFIGURACIÓN Y RENDERIZADO DEL GRÁFICO (CHART.JS) ---

function inicializarFiltrosGrafico(deportes) {
    const container = document.getElementById("chart-filters");
    if (!container) return;

    // Generar el botón "Global" por defecto
    let html = `
        <button
          data-filter="Global"
          class="filter-btn bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer shadow-sm"
        >
          Global
        </button>
    `;

    // Generar botones para los deportes guardados
    if (deportes && deportes.length > 0) {
        deportes.forEach(dep => {
            const nombre = dep.nombre;
            html += `
                <button
                  data-filter="${nombre}"
                  class="filter-btn bg-surface-variant text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap hover:bg-secondary-container cursor-pointer transition-all"
                >
                  ${nombre}
                </button>
            `;
        });
    }

    container.innerHTML = html;

    // Configurar los event listeners
    const buttons = container.querySelectorAll(".filter-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const selectedFilter = e.currentTarget.getAttribute("data-filter");
            
            // Alternar clases activas de los filtros
            buttons.forEach(b => {
                b.className = "filter-btn bg-surface-variant text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap hover:bg-secondary-container cursor-pointer transition-all";
            });
            e.currentTarget.className = "filter-btn bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer shadow-sm";

            // Cargar datos y renderizar gráfico
            cargarGraficoPorFiltro(selectedFilter);
        });
    });
}

async function cargarGraficoPorFiltro(filtro) {
    const chartContainer = document.getElementById("chart-container");
    if (!chartContainer) return;

    // Obtener los datos para este filtro
    const chartData = await fetchChartData(filtro);

    // Destruir gráfico activo si existe
    if (activeChart) {
        activeChart.destroy();
        activeChart = null;
    }

    // Validación de estado vacío
    if (!chartData || !chartData.data || chartData.data.length === 0) {
        chartContainer.innerHTML = `
            <div class="empty-state-message flex flex-col items-center justify-center h-full w-full bg-surface-low/50 rounded-lg p-6 border border-dashed border-outline-variant" style="text-align:center;">
                <span class="material-symbols-outlined text-3xl text-outline mb-1">analytics</span>
                <p class="font-bold text-xs text-on-surface-variant">No hay suficientes datos</p>
                <p class="text-[10px] text-secondary">No se registra rendimiento para el deporte "${filtro}" en esta semana.</p>
            </div>
        `;
        return;
    }

    // Asegurarse de que el canvas exista para renderizar
    chartContainer.innerHTML = `<canvas id="performanceChart"></canvas>`;
    const ctx = document.getElementById("performanceChart").getContext("2d");

    // Configurar tema de tipografía global de Chart.js
    Chart.defaults.font.family = 'Lexend, sans-serif';

    // Generar gradiente para el gráfico de barras (estilo premium)
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, '#d91023'); // Rojo brillante peruanizado
    gradient.addColorStop(1, 'rgba(173, 0, 23, 0.4)'); // Rojo difuminado

    activeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Encuentros Disputados',
                data: chartData.data,
                backgroundColor: gradient,
                borderColor: '#ad0017',
                borderWidth: 1.5,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.6,
                maxBarThickness: 32
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1c1b1b',
                    titleFont: { size: 11, weight: 'bold' },
                    bodyFont: { size: 11 },
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(28, 27, 27, 0.05)',
                        drawTicks: false
                    },
                    ticks: {
                        color: '#5d3f3c',
                        font: { size: 10, weight: 'bold' },
                        precision: 0
                    },
                    border: {
                        dash: [4, 4]
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#5d3f3c',
                        font: { size: 10 }
                    }
                }
            }
        }
    });
}

// --- HELPERS ---

function formatearFecha(fechaStr) {
    if (!fechaStr) return "";
    try {
        const fecha = new Date(fechaStr);
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = meses[fecha.getMonth()];
        const anio = fecha.getFullYear();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        return `${dia} ${mes} ${anio} • ${horas}:${minutos}`;
    } catch (e) {
        return fechaStr;
    }
}
