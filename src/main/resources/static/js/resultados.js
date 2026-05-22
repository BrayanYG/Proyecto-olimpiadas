// resultados.js - Lógica interactiva para la Gestión de Resultados de las Olimpiadas

const API_BASE = window.location.port === "8081" ? "" : "http://localhost:8081";
const API_ENCUENTROS = `${API_BASE}/api/encuentros`;
const API_DEPORTES = `${API_BASE}/api/deportes`;

// Estado global de la aplicación
let encuentros = [];
let deportes = [];
let tabActivo = 'pendientes'; // 'pendientes' o 'finalizados'
let partidoSeleccionadoId = null;
let isMockMode = false;

// Datos ficticios (Mock) de respaldo por si el backend no tiene registros o falla la API
const MOCK_DEPORTES = [
    { id: 1, nombre: "Fútbol" },
    { id: 2, nombre: "Vóley" },
    { id: 3, nombre: "Básquetbol" }
];

const MOCK_ENCUENTROS = [
    {
        id: 9991,
        evento: { id: 1, nombre: "Torneo de Fútbol Masculino", deporte: { id: 1, nombre: "Fútbol" } },
        equipoLocal: { id: 101, nombre: "Perú", categoria: "JUVENIL U-18" },
        equipoVisitante: { id: 102, nombre: "Argentina", categoria: "JUVENIL U-18" },
        fechaHora: "2026-05-22T14:00:00",
        lugar: "Estadio Nacional",
        estado: "PENDIENTE",
        resultado: null
    },
    {
        id: 9992,
        evento: { id: 2, nombre: "Copa Vóley Femenino", deporte: { id: 2, nombre: "Vóley" } },
        equipoLocal: { id: 105, nombre: "Brasil", categoria: "MAYORES" },
        equipoVisitante: { id: 106, nombre: "Chile", categoria: "MAYORES" },
        fechaHora: "2026-05-22T16:30:00",
        lugar: "Coliseo Cerrado",
        estado: "FINALIZADO",
        resultado: {
            id: 201,
            puntosLocal: 2,
            puntosVisitante: 1,
            observaciones: "[Goles]: Brasil: Set 1 (25), Set 3 (15) | Chile: Set 2 (22) | [Tarjetas]: Ninguna | [Obs]: Excelente encuentro de vóley femenino."
        }
    },
    {
        id: 9993,
        evento: { id: 3, nombre: "Campeonato Básquet Libre", deporte: { id: 3, nombre: "Básquetbol" } },
        equipoLocal: { id: 107, nombre: "Colombia", categoria: "MAYORES" },
        equipoVisitante: { id: 108, nombre: "Ecuador", categoria: "MAYORES" },
        fechaHora: "2026-05-23T09:00:00",
        lugar: "Polideportivo San Borja",
        estado: "PENDIENTE",
        resultado: null
    },
    {
        id: 9994,
        evento: { id: 1, nombre: "Torneo de Fútbol Masculino", deporte: { id: 1, nombre: "Fútbol" } },
        equipoLocal: { id: 103, nombre: "Uruguay", categoria: "JUVENIL U-18" },
        equipoVisitante: { id: 104, nombre: "Paraguay", categoria: "JUVENIL U-18" },
        fechaHora: "2026-05-23T11:00:00",
        lugar: "Estadio Nacional",
        estado: "PENDIENTE",
        resultado: null
    }
];

// Inicialización del DOM
document.addEventListener("DOMContentLoaded", () => {
    configurarEventos();
    cargarDatos();
});

// Configurar los listeners básicos
function configurarEventos() {
    const tabPendientes = document.getElementById("tabPendientes");
    const tabFinalizados = document.getElementById("tabFinalizados");
    
    if (tabPendientes && tabFinalizados) {
        tabPendientes.addEventListener("click", () => {
            cambiarTab('pendientes');
        });
        tabFinalizados.addEventListener("click", () => {
            cambiarTab('finalizados');
        });
        // Agregar clases cursor-pointer para mejor UX
        tabPendientes.classList.add("cursor-pointer");
        tabFinalizados.classList.add("cursor-pointer");
    }
}

// Cargar información inicial desde la API (con fallback de mock si falla o está vacía)
async function cargarDatos() {
    try {
        // Cargar Deportes
        const resDeportes = await fetch(API_DEPORTES);
        if (resDeportes.ok) {
            deportes = await resDeportes.json();
        } else {
            throw new Error("No se pudo cargar deportes de la API");
        }
        
        // Cargar Encuentros
        const resEncuentros = await fetch(API_ENCUENTROS);
        if (resEncuentros.ok) {
            encuentros = await resEncuentros.json();
        } else {
            throw new Error("No se pudo cargar encuentros de la API");
        }
        
        isMockMode = false;
        console.log("Datos cargados correctamente desde la API del backend.");
    } catch (error) {
        console.warn("Fallo al conectar con la API o base de datos vacía. Activando simulación local (Mock):", error);
        isMockMode = true;
        cargarDatosMock();
    }
    
    poblarFiltroDeportes();
    renderizarResultados();
}

// Cargar datos desde localStorage o variables MOCK
function cargarDatosMock() {
    const localDeportes = localStorage.getItem("olimpiadas_deportes");
    const localEncuentros = localStorage.getItem("olimpiadas_encuentros");
    
    if (localDeportes) {
        deportes = JSON.parse(localDeportes);
    } else {
        deportes = MOCK_DEPORTES;
        localStorage.setItem("olimpiadas_deportes", JSON.stringify(deportes));
    }
    
    if (localEncuentros) {
        encuentros = JSON.parse(localEncuentros);
    } else {
        encuentros = MOCK_ENCUENTROS;
        localStorage.setItem("olimpiadas_encuentros", JSON.stringify(encuentros));
    }
}

// Poblar select filtroDeporte
function poblarFiltroDeportes() {
    const select = document.getElementById("filtroDeporte");
    if (!select) return;
    
    select.innerHTML = '<option value="">Todos los Deportes</option>';
    
    deportes.forEach(deporte => {
        const option = document.createElement("option");
        option.value = deporte.id;
        option.textContent = deporte.nombre;
        select.appendChild(option);
    });
    
    select.onchange = () => {
        renderizarResultados();
    };
}

// Alternar entre pestañas Pendientes / Finalizados
function cambiarTab(tab) {
    tabActivo = tab;
    const tabPendientes = document.getElementById("tabPendientes");
    const tabFinalizados = document.getElementById("tabFinalizados");
    
    if (tabPendientes && tabFinalizados) {
        if (tab === 'pendientes') {
            tabPendientes.className = "flex-1 md:flex-none px-6 md:px-lg py-sm rounded-lg bg-surface-container-lowest text-primary font-bold shadow-sm text-label-md cursor-pointer";
            tabFinalizados.className = "flex-1 md:flex-none px-6 md:px-lg py-sm rounded-lg text-secondary hover:text-on-surface transition-colors text-label-md cursor-pointer";
        } else {
            tabFinalizados.className = "flex-1 md:flex-none px-6 md:px-lg py-sm rounded-lg bg-surface-container-lowest text-primary font-bold shadow-sm text-label-md cursor-pointer";
            tabPendientes.className = "flex-1 md:flex-none px-6 md:px-lg py-sm rounded-lg text-secondary hover:text-on-surface transition-colors text-label-md cursor-pointer";
        }
    }
    renderizarResultados();
}

// Renderizar las tarjetas de partidos
function renderizarResultados() {
    const contenedor = document.getElementById("contenedorResultados");
    if (!contenedor) return;
    
    // Limpiar contenedor
    contenedor.innerHTML = "";
    
    // Si no hay ningún encuentro registrado en la base de datos
    if (encuentros.length === 0) {
        contenedor.innerHTML = `
            <div class="bg-surface-container-low p-8 rounded-xl border border-outline-variant text-center my-4">
              <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-2">emoji_events</span>
              <p class="font-body-md text-on-surface-variant">No hay datos disponibles</p>
            </div>
        `;
        return;
    }
    
    const filtroDeporteVal = document.getElementById("filtroDeporte")?.value;
    
    // Filtrar por deporte y pestaña activa
    let encuentrosFiltrados = encuentros.filter(encuentro => {
        // Filtro Deporte
        if (filtroDeporteVal) {
            const depId = encuentro.evento?.deporte?.id || encuentro.equipoLocal?.deporte?.id;
            if (depId != filtroDeporteVal) {
                return false;
            }
        }
        
        // Filtro Estado (Pestaña)
        if (tabActivo === 'pendientes') {
            return encuentro.estado !== 'FINALIZADO';
        } else {
            return encuentro.estado === 'FINALIZADO';
        }
    });
    
    if (encuentrosFiltrados.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-12 text-secondary bg-surface-container-low rounded-xl border border-outline-variant/30">
                <span class="material-symbols-outlined text-4xl mb-2 text-outline">emoji_events</span>
                <p class="font-body-md">No se encontraron partidos ${tabActivo === 'pendientes' ? 'pendientes' : 'finalizados'} para la selección.</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por fecha cronológicamente
    encuentrosFiltrados.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
    
    encuentrosFiltrados.forEach(encuentro => {
        const id = encuentro.id;
        const local = encuentro.equipoLocal?.nombre || 'Local';
        const visitante = encuentro.equipoVisitante?.nombre || 'Visitante';
        const localSigla = obtenerSigla(local);
        const visitanteSigla = obtenerSigla(visitante);
        const categoria = encuentro.equipoLocal?.categoria || 'Libre';
        const fechaHoraStr = formatearFecha(encuentro.fechaHora);
        const eventoNombre = encuentro.evento?.nombre || 'Competencia';
        const lugar = encuentro.lugar || 'Sede por confirmar';
        const isFinalizado = encuentro.estado === 'FINALIZADO';
        
        let puntosLocal = 0;
        let puntosVisitante = 0;
        if (encuentro.resultado) {
            puntosLocal = encuentro.resultado.puntosLocal ?? 0;
            puntosVisitante = encuentro.resultado.puntosVisitante ?? 0;
        }
        
        const inputLocalId = `input-local-${id}`;
        const inputVisitanteId = `input-visitante-${id}`;
        
        const card = document.createElement("div");
        card.className = "bg-surface-container-low rounded-xl p-4 md:p-6 flex flex-col xl:flex-row items-center gap-md md:gap-lg border border-outline-variant hover:shadow-md transition-shadow animate-fade-in";
        
        const inputAttrs = isFinalizado 
            ? `readonly disabled class="w-12 h-12 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-black bg-surface-container-high border-2 border-outline rounded-lg text-on-surface-variant opacity-75 cursor-not-allowed"`
            : `class="w-12 h-12 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-black bg-surface-container-low border-2 border-outline rounded-lg focus:border-primary focus:ring-0 text-on-surface"`;
            
        let actionButtonsHTML = "";
        if (isFinalizado) {
            actionButtonsHTML = `
                <div class="flex flex-col gap-sm w-full xl:w-auto min-w-[200px] shrink-0">
                    <div class="bg-secondary-container text-on-secondary-container w-full py-2.5 rounded-lg font-bold text-sm text-center uppercase tracking-wider flex items-center justify-center gap-xs">
                        <span class="material-symbols-outlined text-sm">check_circle</span>
                        Finalizado
                    </div>
                    <button
                        onclick="abrirModalAnotacion(${id})"
                        class="bg-transparent border-2 border-outline text-secondary w-full py-2.5 rounded-lg font-label-md text-sm hover:bg-surface-container transition-all flex items-center justify-center gap-xs cursor-pointer active:scale-95 duration-150"
                    >
                        <span class="material-symbols-outlined text-sm">description</span>
                        Hoja de Anotación
                    </button>
                </div>
            `;
        } else {
            actionButtonsHTML = `
                <div class="flex flex-col gap-sm w-full xl:w-auto min-w-[200px] shrink-0">
                    <button
                        onclick="confirmarResultado(${id}, '${inputLocalId}', '${inputVisitanteId}')"
                        class="bg-primary text-on-primary w-full py-2.5 rounded-lg font-label-md text-sm hover:brightness-95 transition-all cursor-pointer active:scale-95 duration-150"
                    >
                        Confirmar Resultado
                    </button>
                    <button
                        onclick="abrirModalAnotacion(${id})"
                        class="bg-transparent border-2 border-outline text-secondary w-full py-2.5 rounded-lg font-label-md text-sm hover:bg-surface-container transition-all flex items-center justify-center gap-xs cursor-pointer active:scale-95 duration-150"
                    >
                        <span class="material-symbols-outlined text-sm">description</span>
                        Hoja de Anotación
                    </button>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="flex-1 flex flex-col gap-xs w-full xl:w-1/4 min-w-0">
                <div class="flex items-center gap-xs flex-wrap">
                    <span class="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full text-[10px] font-bold uppercase">${categoria}</span>
                    <span class="text-on-surface-variant text-[10px] whitespace-nowrap">${fechaHoraStr}</span>
                </div>
                <h3 class="font-title-lg text-title-lg text-primary font-bold truncate" title="${eventoNombre}">
                    ${eventoNombre}
                </h3>
                <p class="text-secondary text-sm truncate" title="Fase Clasificatoria - ${lugar}">
                    Fase Clasificatoria - ${lugar}
                </p>
            </div>
            <!-- Centered Score Area -->
            <div class="flex items-center justify-center gap-4 sm:gap-lg px-2 sm:px-md py-md bg-surface-container-lowest rounded-xl border border-outline-variant/30 w-full xl:flex-1 min-w-0">
                <div class="flex flex-col items-center gap-xs min-w-[70px] sm:min-w-[80px] flex-1 min-w-0">
                    <div class="w-12 h-12 sm:w-14 sm:h-14 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl shadow-sm uppercase shrink-0">
                        ${localSigla}
                    </div>
                    <span class="font-label-md text-[10px] sm:text-xs uppercase truncate w-full text-center font-semibold text-on-surface" title="${local}">${local}</span>
                </div>
                <div class="flex items-center gap-2 sm:gap-sm shrink-0">
                    <input
                        id="${inputLocalId}"
                        min="0"
                        type="number"
                        value="${puntosLocal}"
                        ${inputAttrs}
                    />
                    <span class="text-xl sm:text-2xl font-bold text-primary">-</span>
                    <input
                        id="${inputVisitanteId}"
                        min="0"
                        type="number"
                        value="${puntosVisitante}"
                        ${inputAttrs}
                    />
                </div>
                <div class="flex flex-col items-center gap-xs min-w-[70px] sm:min-w-[80px] flex-1 min-w-0">
                    <div class="w-12 h-12 sm:w-14 sm:h-14 bg-secondary-fixed-dim text-on-secondary-fixed rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl shadow-sm uppercase shrink-0">
                        ${visitanteSigla}
                    </div>
                    <span class="font-label-md text-[10px] sm:text-xs uppercase truncate w-full text-center font-semibold text-on-surface" title="${visitante}">${visitante}</span>
                </div>
            </div>
            <!-- Action Buttons -->
            ${actionButtonsHTML}
        `;
        
        // Agregar validaciones estrictas al teclado
        if (!isFinalizado) {
            const inputs = card.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                input.addEventListener('keydown', (e) => {
                    if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
                        e.preventDefault();
                    }
                });
                input.addEventListener('input', (e) => {
                    let val = e.target.value;
                    val = val.replace(/\D/g, ''); // Eliminar letras y caracteres especiales
                    if (val === '') {
                        e.target.value = '';
                    } else {
                        e.target.value = String(Math.max(0, parseInt(val, 10)));
                    }
                });
                input.addEventListener('blur', (e) => {
                    if (e.target.value === '') {
                        e.target.value = '0';
                    }
                });
            });
        }
        
        contenedor.appendChild(card);
    });
}

// Confirmar y guardar el marcador del partido
async function confirmarResultado(idPartido, inputLocalId, inputVisitanteId) {
    const message = "¿Está seguro de que desea confirmar el resultado? Una vez confirmado, no se podrá modificar.";
    const scoreLocalVal = document.getElementById(inputLocalId)?.value;
    const scoreVisitanteVal = document.getElementById(inputVisitanteId)?.value;
    
    if (scoreLocalVal === "" || scoreVisitanteVal === "") {
        if (window.showToast) {
            window.showToast("Debe ingresar marcadores válidos", "warning");
        } else {
            alert("Debe ingresar marcadores válidos");
        }
        return;
    }
    
    const scoreLocal = parseInt(scoreLocalVal, 10);
    const scoreVisitante = parseInt(scoreVisitanteVal, 10);
    
    if (isNaN(scoreLocal) || isNaN(scoreVisitante) || scoreLocal < 0 || scoreVisitante < 0) {
        if (window.showToast) {
            window.showToast("Los marcadores deben ser números enteros positivos", "warning");
        } else {
            alert("Los marcadores deben ser números enteros positivos");
        }
        return;
    }
    
    // Obtener observaciones ya guardadas en localStorage o en el objeto del partido
    let observacionesCompletas = "";
    const todasIncidencias = JSON.parse(localStorage.getItem("olimpiadas_incidencias") || "{}");
    const incidenciasPartido = todasIncidencias[idPartido];
    if (incidenciasPartido) {
        const goles = incidenciasPartido.goles || "";
        const tarjetas = incidenciasPartido.tarjetas || "";
        const obs = incidenciasPartido.observaciones || "";
        observacionesCompletas = `[Goles]: ${goles} | [Tarjetas]: ${tarjetas} | [Obs]: ${obs}`;
    } else {
        const encuentro = encuentros.find(e => e.id == idPartido);
        if (encuentro && encuentro.resultado?.observaciones) {
            observacionesCompletas = encuentro.resultado.observaciones;
        }
    }

    const realizarConfirmacion = async () => {
        if (!isMockMode) {
            try {
                const response = await fetch(`${API_BASE}/api/resultados`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        idPartido: idPartido,
                        scoreLocal: scoreLocal,
                        scoreVisitante: scoreVisitante,
                        observaciones: observacionesCompletas || null
                    })
                });
                
                if (response.ok) {
                    const resultadoGuardado = await response.json();
                    if (window.showToast) {
                        window.showToast("Resultado confirmado con éxito", "success");
                    }
                    
                    // Actualizar estado local
                    const encuentro = encuentros.find(e => e.id == idPartido);
                    if (encuentro) {
                        encuentro.estado = "FINALIZADO";
                        encuentro.resultado = resultadoGuardado;
                    }
                    renderizarResultados();
                } else {
                    const errData = await response.json().catch(() => ({}));
                    const msg = errData.message || "Error al guardar el resultado";
                    if (window.showToast) {
                        window.showToast(msg, "error");
                    }
                }
            } catch (error) {
                console.error("Error al conectar con la API:", error);
                if (window.showToast) {
                    window.showToast("Error de red al registrar el resultado", "error");
                }
            }
        } else {
            // Simulación Local
            const encuentro = encuentros.find(e => e.id == idPartido);
            if (encuentro) {
                encuentro.estado = "FINALIZADO";
                encuentro.resultado = {
                    puntosLocal: scoreLocal,
                    puntosVisitante: scoreVisitante,
                    observaciones: encuentro.resultado?.observaciones || ""
                };
                
                localStorage.setItem("olimpiadas_encuentros", JSON.stringify(encuentros));
                
                if (window.showToast) {
                    window.showToast("Resultado confirmado con éxito (Simulación Local)", "success");
                }
                renderizarResultados();
            } else {
                if (window.showToast) {
                    window.showToast("Partido no encontrado", "error");
                }
            }
        }
    };

    if (window.showConfirm) {
        window.showConfirm(message, realizarConfirmacion);
    } else {
        if (confirm(message)) {
            await realizarConfirmacion();
        }
    }
}

// Abrir el modal de hoja de anotación
function abrirModalAnotacion(idPartido) {
    partidoSeleccionadoId = idPartido;
    console.log("Abriendo hoja de anotación para el partido ID:", idPartido);
    
    const encuentro = encuentros.find(e => e.id == idPartido);
    if (!encuentro) {
        if (window.showToast) {
            window.showToast("Encuentro no encontrado", "error");
        }
        return;
    }
    
    const infoDiv = document.getElementById("modalAnotacionInfo");
    if (infoDiv) {
        const local = encuentro.equipoLocal?.nombre || 'Local';
        const visitante = encuentro.equipoVisitante?.nombre || 'Visitante';
        const evento = encuentro.evento?.nombre || 'Competencia';
        const lugar = encuentro.lugar || 'Sede';
        const fecha = formatearFecha(encuentro.fechaHora);
        
        infoDiv.innerHTML = `
            <div class="flex flex-col gap-1 text-sm text-on-surface">
                <div class="font-bold text-primary text-base flex items-center justify-between">
                    <span>${local} vs ${visitante}</span>
                    <span class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">${encuentro.estado}</span>
                </div>
                <div class="font-semibold text-on-surface-variant">${evento}</div>
                <div class="text-secondary text-xs flex items-center gap-1 mt-1">
                    <span class="material-symbols-outlined text-xs">location_on</span> ${lugar} • 
                    <span class="material-symbols-outlined text-xs">schedule</span> ${fecha}
                </div>
            </div>
        `;
    }
    
    // Cargar incidencias previas
    let goles = "";
    let tarjetas = "";
    let obs = "";
    
    const todasIncidencias = JSON.parse(localStorage.getItem("olimpiadas_incidencias") || "{}");
    const incidenciasPartido = todasIncidencias[idPartido];
    
    if (incidenciasPartido) {
        goles = incidenciasPartido.goles || "";
        tarjetas = incidenciasPartido.tarjetas || "";
        obs = incidenciasPartido.observaciones || "";
    } else if (encuentro.resultado?.observaciones) {
        const obsText = encuentro.resultado.observaciones;
        if (obsText.includes("[Goles]:") || obsText.includes("[Tarjetas]:") || obsText.includes("[Obs]:")) {
            const golesMatch = obsText.match(/\[Goles\]:\s*(.*?)(?=\s*\[Tarjetas\]:|\s*\[Obs\]:|$)/s);
            const tarjetasMatch = obsText.match(/\[Tarjetas\]:\s*(.*?)(?=\s*\[Obs\]:|$)/s);
            const obsMatch = obsText.match(/\[Obs\]:\s*(.*?)$/s);
            
            goles = golesMatch ? golesMatch[1].trim() : "";
            tarjetas = tarjetasMatch ? tarjetasMatch[1].trim() : "";
            obs = obsMatch ? obsMatch[1].trim() : obsText;
        } else {
            obs = obsText;
        }
    }
    
    const inpGoles = document.getElementById("modalAnotacionGoles");
    const inpTarjetas = document.getElementById("modalAnotacionTarjetas");
    const inpObs = document.getElementById("modalAnotacionObs");
    
    if (inpGoles) inpGoles.value = goles;
    if (inpTarjetas) inpTarjetas.value = tarjetas;
    if (inpObs) inpObs.value = obs;
    
    const modal = document.getElementById("modalAnotacion");
    if (modal) {
        modal.classList.remove("hidden");
    }
}

// Cerrar el modal de hoja de anotación
function cerrarModalAnotacion() {
    const modal = document.getElementById("modalAnotacion");
    if (modal) {
        modal.classList.add("hidden");
    }
    partidoSeleccionadoId = null;
}

// Guardar los datos de la hoja de anotación
function guardarAnotacion() {
    if (!partidoSeleccionadoId) return;
    
    const encuentro = encuentros.find(e => e.id == partidoSeleccionadoId);
    if (!encuentro) {
        if (window.showToast) {
            window.showToast("Encuentro no encontrado para guardar la anotación", "error");
        }
        return;
    }
    
    const goles = document.getElementById("modalAnotacionGoles")?.value || "";
    const tarjetas = document.getElementById("modalAnotacionTarjetas")?.value || "";
    const observaciones = document.getElementById("modalAnotacionObs")?.value || "";
    
    console.log("Guardando incidencias para el partido ID:", partidoSeleccionadoId, {
        goles: goles,
        tarjetas: tarjetas,
        observaciones: observaciones
    });
    
    // Guardar estructuradamente en LocalStorage
    const todasIncidencias = JSON.parse(localStorage.getItem("olimpiadas_incidencias") || "{}");
    todasIncidencias[partidoSeleccionadoId] = {
        goles: goles,
        tarjetas: tarjetas,
        observaciones: observaciones
    };
    localStorage.setItem("olimpiadas_incidencias", JSON.stringify(todasIncidencias));
    
    const observacionesCompletas = `[Goles]: ${goles} | [Tarjetas]: ${tarjetas} | [Obs]: ${observaciones}`;
    
    if (!isMockMode) {
        // Guardar en el backend sincronizado
        fetch(`${API_BASE}/api/resultados`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idPartido: partidoSeleccionadoId,
                scoreLocal: encuentro.resultado?.puntosLocal || 0,
                scoreVisitante: encuentro.resultado?.puntosVisitante || 0,
                observaciones: observacionesCompletas
            })
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Sincronización fallida con el backend");
        }).then(resultadoGuardado => {
            encuentro.resultado = resultadoGuardado;
            if (window.showToast) {
                window.showToast("Hoja de anotación guardada correctamente en el servidor", "success");
            }
            renderizarResultados();
        }).catch(err => {
            console.error("Error al sincronizar estadísticas:", err);
            if (window.showToast) {
                window.showToast("Estadísticas guardadas de forma local (Servidor no disponible)", "warning");
            }
        });
    } else {
        // Guardar localmente
        if (!encuentro.resultado) {
            encuentro.resultado = { puntosLocal: 0, puntosVisitante: 0 };
        }
        encuentro.resultado.observaciones = observacionesCompletas;
        
        if (isMockMode) {
            localStorage.setItem("olimpiadas_encuentros", JSON.stringify(encuentros));
        }
        
        if (window.showToast) {
            window.showToast("Estadísticas de la anotación guardadas localmente", "success");
        }
        renderizarResultados();
    }
    
    cerrarModalAnotacion();
}

// Helpers útiles
function obtenerSigla(nombre) {
    if (!nombre) return "EQ";
    const palabras = nombre.trim().split(/\s+/);
    if (palabras.length >= 2) {
        return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
}

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

// Exponer funciones globales para llamadas inline del HTML
window.abrirModalAnotacion = abrirModalAnotacion;
window.cerrarModalAnotacion = cerrarModalAnotacion;
window.guardarAnotacion = guardarAnotacion;
window.confirmarResultado = confirmarResultado;
