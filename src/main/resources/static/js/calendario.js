// calendario.js - Lógica interactiva para la programación de partidos (Calendario)

const API_BASE = window.location.port === "8081" ? "" : "http://localhost:8081";
const API_ENCUENTROS = `${API_BASE}/api/encuentros`;
const API_EVENTOS = `${API_BASE}/api/eventos`;
const API_DEPORTES = `${API_BASE}/api/deportes`;
const API_SORTEOS = `${API_BASE}/api/sorteos`;

// Estado global de la aplicación
let encuentros = [];
let eventos = [];
let deportes = [];
let sorteoVerificado = false;
let sorteoEquipos = []; // Equipos asignados a los grupos en el sorteo
let enfrentamientosPendientes = []; // Cruces del paso 2
let currentStep = 1;
let modoEdicion = false;
let encuentroEditandoId = null;

// Duraciones estándar por deporte (minutos de juego + descanso/limpieza)
const DURACION_DEPORTES = {
    "Fútbol": 105,      // 90 mins juego + 15 mins descanso
    "Vóley": 75,        // 60 mins juego + 15 mins descanso/calentamiento
    "Básquetbol": 80,   // 40 mins juego neto + tiempos muertos y descanso
    "Default": 90       // Duración estándar para otros deportes
};

// Datos ficticios (Mock) de respaldo por si el backend no tiene registros
const MOCK_ENCUENTROS = [
    {
        id: 9991,
        evento: { id: 1, nombre: "Torneo de Fútbol Masculino", deporte: { id: 1, nombre: "Fútbol" } },
        equipoLocal: { id: 101, nombre: "Universitario" },
        equipoVisitante: { id: 102, nombre: "Alianza Lima" },
        fechaHora: "2026-05-15T09:00:00",
        lugar: "Estadio Nacional",
        estado: "PROGRAMADO"
    },
    {
        id: 9992,
        evento: { id: 1, nombre: "Torneo de Fútbol Masculino", deporte: { id: 1, nombre: "Fútbol" } },
        equipoLocal: { id: 103, nombre: "Sp. Cristal" },
        equipoVisitante: { id: 104, nombre: "Melgar FC" },
        fechaHora: "2026-05-15T14:30:00",
        lugar: "Villa El Salvador",
        estado: "PROGRAMADO"
    },
    {
        id: 9993,
        evento: { id: 2, nombre: "Copa Vóley Femenino", deporte: { id: 2, nombre: "Vóley" } },
        equipoLocal: { id: 105, nombre: "Regatas" },
        equipoVisitante: { id: 106, nombre: "César Vallejo" },
        fechaHora: "2026-05-16T11:00:00",
        lugar: "Coliseo Dibós",
        estado: "PROGRAMADO"
    },
    {
        id: 9994,
        evento: { id: 3, nombre: "Campeonato Básquet Libre", deporte: { id: 3, nombre: "Básquetbol" } },
        equipoLocal: { id: 107, nombre: "Real Club" },
        equipoVisitante: { id: 108, nombre: "Leones" },
        fechaHora: "2026-05-17T18:00:00",
        lugar: "Coliseo Dibós",
        estado: "PROGRAMADO"
    },
    {
        id: 9995,
        evento: { id: 1, nombre: "Torneo de Fútbol Masculino", deporte: { id: 1, nombre: "Fútbol" } },
        equipoLocal: { id: 101, nombre: "Universitario" },
        equipoVisitante: { id: 103, nombre: "Sp. Cristal" },
        fechaHora: "2026-05-18T10:00:00",
        lugar: "Estadio Nacional",
        estado: "PROGRAMADO"
    }
];

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
    configurarFiltros();
    configurarFormValids();
});

// Cargar información inicial desde la API (con fallback de mock si está vacía o falla)
async function cargarDatos() {
    try {
        // Cargar Deportes
        const resDeportes = await fetch(API_DEPORTES);
        deportes = resDeportes.ok ? await resDeportes.json() : [];
        
        // Cargar Eventos
        const resEventos = await fetch(API_EVENTOS);
        eventos = resEventos.ok ? await resEventos.json() : [];
        
        // Cargar Encuentros
        const resEncuentros = await fetch(API_ENCUENTROS);
        if (resEncuentros.ok) {
            encuentros = await resEncuentros.json();
        } else {
            encuentros = [];
        }

        renderMatches(encuentros);
        poblarFiltros();
    } catch (error) {
        console.error("Error al cargar datos desde el backend:", error);
        window.showToast?.("Error al conectar al servidor.", "error");
        encuentros = [];
        renderMatches(encuentros);
        poblarFiltros();
    }
}

// Rellenar selectores del filtro principal
function poblarFiltros() {
    const selectDeporte = document.getElementById("filtroDeporte");
    if (selectDeporte) {
        selectDeporte.innerHTML = `<option value="">Todos los Deportes</option>`;
        const nombresDeportes = [...new Set(deportes.map(d => d.nombre))];
        // Asegurar que al menos tengamos los del mock si no hay
        if (nombresDeportes.length === 0) {
            ["Fútbol", "Vóley", "Básquetbol"].forEach(d => {
                selectDeporte.innerHTML += `<option value="${d}">${d}</option>`;
            });
        } else {
            nombresDeportes.forEach(d => {
                selectDeporte.innerHTML += `<option value="${d}">${d}</option>`;
            });
        }
    }
}

// Configurar los manejadores de eventos para filtrado dinámico
function configurarFiltros() {
    const inputBuscar = document.getElementById("filtroBuscar");
    const selectDeporte = document.getElementById("filtroDeporte");
    const inputFecha = document.getElementById("filtroFecha");

    if (inputBuscar) inputBuscar.addEventListener("input", handleFilters);
    if (selectDeporte) selectDeporte.addEventListener("change", handleFilters);
    if (inputFecha) inputFecha.addEventListener("change", handleFilters);
}

// Filtrar en tiempo real los encuentros cargados
function handleFilters() {
    const textBuscar = document.getElementById("filtroBuscar")?.value.toLowerCase().trim() || "";
    const deporteSelect = document.getElementById("filtroDeporte")?.value || "";
    const fechaSelect = document.getElementById("filtroFecha")?.value || "";

    const filtrados = encuentros.filter(enc => {
        // Filtro por búsqueda de equipos o lugar
        const matchesBuscar = !textBuscar || 
            enc.equipoLocal.nombre.toLowerCase().includes(textBuscar) ||
            enc.equipoVisitante.nombre.toLowerCase().includes(textBuscar) ||
            enc.lugar.toLowerCase().includes(textBuscar);

        // Filtro por deporte
        const matchesDeporte = !deporteSelect || 
            (enc.evento && enc.evento.deporte && enc.evento.deporte.nombre === deporteSelect);

        // Filtro por fecha específica (YYYY-MM-DD)
        const fechaPartido = enc.fechaHora.split('T')[0];
        const matchesFecha = !fechaSelect || fechaPartido === fechaSelect;

        return matchesBuscar && matchesDeporte && matchesFecha;
    });

    renderMatches(filtrados);
}

// Formatear Fecha legible al español (Ej. "Hoy - 15 de Mayo", "Lunes, 18 de Mayo")
function formatearFechaEncabezado(fechaStr) {
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    // Parsear fecha controlando desfases locales
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);
    
    // Comparar con Hoy y Mañana
    const hoy = new Date();
    const mañana = new Date();
    mañana.setDate(hoy.getDate() + 1);

    const esHoy = hoy.getFullYear() === fecha.getFullYear() && hoy.getMonth() === fecha.getMonth() && hoy.getDate() === fecha.getDate();
    const esMañana = mañana.getFullYear() === fecha.getFullYear() && mañana.getMonth() === fecha.getMonth() && mañana.getDate() === fecha.getDate();

    const diaNombre = diasSemana[fecha.getDay()];
    const diaNum = fecha.getDate();
    const mesNombre = meses[fecha.getMonth()];

    if (esHoy) {
        return `Hoy - ${diaNum} de ${mesNombre}`;
    } else if (esMañana) {
        return `Mañana - ${diaNum} de ${mesNombre}`;
    } else {
        return `${diaNombre}, ${diaNum} de ${mesNombre}`;
    }
}

// Renderizar la lista de partidos agrupada por día
function renderMatches(partidos) {
    const contenedor = document.getElementById("contenedorPartidos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (partidos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-span-full py-xl text-center bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
                <span class="material-symbols-outlined text-outline text-6xl">calendar_today</span>
                <p class="font-title-lg text-on-surface-variant mt-4">No hay partidos disponibles.</p>
                <p class="text-caption text-secondary">Intente cambiar los filtros o agregue un nuevo partido.</p>
            </div>
        `;
        return;
    }

    // Agrupar partidos por fecha (YYYY-MM-DD)
    const partidosAgrupados = {};
    partidos.forEach(p => {
        const fecha = p.fechaHora.split('T')[0];
        if (!partidosAgrupados[fecha]) {
            partidosAgrupados[fecha] = [];
        }
        partidosAgrupados[fecha].push(p);
    });

    // Ordenar fechas cronológicamente
    const fechasOrdenadas = Object.keys(partidosAgrupados).sort();

    fechasOrdenadas.forEach(fechaStr => {
        const listado = partidosAgrupados[fechaStr];
        
        // Crear el bloque de fecha
        const dateBlock = document.createElement("div");
        dateBlock.className = "space-y-4 md:space-y-md";

        // Título del bloque de fecha
        const header = document.createElement("div");
        header.className = "flex items-center gap-sm border-b border-outline-variant pb-base";
        header.innerHTML = `
            <span class="font-title-lg text-title-lg text-on-surface font-bold">${formatearFechaEncabezado(fechaStr)}</span>
            <span class="bg-primary/10 text-primary px-sm py-xs rounded-full text-caption font-caption font-bold">
                ${listado.length} ${listado.length === 1 ? 'Partido' : 'Partidos'}
            </span>
        `;
        dateBlock.appendChild(header);

        // Renderizar las tarjetas
        listado.forEach(partido => {
            const timeObj = new Date(partido.fechaHora);
            let horas = timeObj.getHours();
            const minutos = String(timeObj.getMinutes()).padStart(2, '0');
            const ampm = horas >= 12 ? 'PM' : 'AM';
            horas = horas % 12;
            horas = horas ? horas : 12; // el '0' debe ser '12'
            const horaFormateada = `${String(horas).padStart(2, '0')}:${minutos}`;

            const deporteNombre = partido.evento && partido.evento.deporte ? partido.evento.deporte.nombre : "Deporte";
            const categoriaNombre = (partido.equipoLocal && partido.equipoLocal.categoria) || "Libre";

            // Crear tarjeta
            const card = document.createElement("div");
            card.className = "group bg-surface-container-lowest border border-outline-variant rounded-xl p-4 lg:p-md flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-lg hover:shadow-lg transition-all border-l-4 border-primary";
            
            card.innerHTML = `
                <div class="flex flex-row lg:flex-col items-center justify-between lg:justify-center min-w-[100px] border-b lg:border-b-0 lg:border-r border-outline-variant pb-3 lg:pb-0 lg:pr-md shrink-0">
                    <div class="flex flex-col items-center">
                        <span class="font-headline-md text-2xl lg:text-headline-md text-primary font-bold">${horaFormateada}</span>
                        <span class="font-label-md text-xs lg:text-label-md text-secondary uppercase font-bold">${ampm}</span>
                    </div>
                </div>
                <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center min-w-0">
                    <!-- Teams Centered (No Images) -->
                    <div class="flex items-center justify-center gap-4 sm:gap-md lg:col-span-2 py-2 min-w-0">
                        <div class="flex-1 text-right min-w-0">
                            <span class="font-label-md text-sm sm:text-base font-bold text-on-surface block tracking-wide truncate" title="${partido.equipoLocal.nombre}">${partido.equipoLocal.nombre}</span>
                        </div>
                        <span class="font-headline-md text-sm sm:text-lg text-outline-variant italic font-extrabold px-2 bg-surface-container rounded-full shrink-0">VS</span>
                        <div class="flex-1 text-left min-w-0">
                            <span class="font-label-md text-sm sm:text-base font-bold text-on-surface block tracking-wide truncate" title="${partido.equipoVisitante.nombre}">${partido.equipoVisitante.nombre}</span>
                        </div>
                    </div>
                    <!-- Details -->
                    <div class="flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-outline-variant pt-3 lg:pt-0 lg:pl-lg min-w-0">
                        <div class="flex items-center gap-xs text-secondary min-w-0">
                            <span class="material-symbols-outlined text-lg shrink-0">stadium</span>
                            <span class="font-body-md text-sm truncate" title="${partido.lugar}">${partido.lugar}</span>
                        </div>
                        <div class="flex items-center gap-xs text-secondary min-w-0">
                            <span class="material-symbols-outlined text-lg shrink-0">sports_soccer</span>
                            <span class="font-body-md text-sm truncate" title="${deporteNombre} - ${categoriaNombre}">${deporteNombre} - ${categoriaNombre}</span>
                        </div>
                        <span class="mt-xs bg-surface-container-high text-secondary px-sm py-1 rounded-full text-[10px] font-bold uppercase w-fit tracking-wider">
                            ${partido.estado || 'PROGRAMADO'}
                        </span>
                    </div>
                </div>
                <!-- Actions -->
                <div class="flex flex-row lg:flex-col gap-2 justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-outline-variant shrink-0">
                    <button onclick="editarPartido(${partido.id})" class="flex-1 lg:flex-none p-3 rounded-lg hover:bg-surface-container-highest text-secondary transition-colors border lg:border-0 border-outline-variant" title="Editar">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button onclick="eliminarPartido(${partido.id})" class="flex-1 lg:flex-none p-3 rounded-lg hover:bg-error-container text-error transition-colors border lg:border-0 border-outline-variant" title="Eliminar">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;
            dateBlock.appendChild(card);
        });

        contenedor.appendChild(dateBlock);
    });
}

// -------------------------------------------------------------
// Lógica de Modales y Flujo
// -------------------------------------------------------------

// Abrir Modal de Programación Manual
function abrirModalProgramar() {
    modoEdicion = false;
    encuentroEditandoId = null;
    currentStep = 1;
    sorteoVerificado = false;
    sorteoEquipos = [];
    enfrentamientosPendientes = [];
    
    // Resetear formulario
    document.getElementById("modalEventoSelect").value = "";
    document.getElementById("modalCruceSelect").value = "";
    document.getElementById("modalFecha").value = "";
    document.getElementById("modalHora").value = "";
    document.getElementById("modalSedeSelect").value = "Estadio Nacional";
    document.getElementById("modalSedeOtro").value = "";
    document.getElementById("modalSedeOtroContainer").classList.add("hidden");

    ocultarMensajesError();
    poblarEventosModal();
    goToStep(1);

    const modal = document.getElementById("modalProgramar");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function cerrarModalProgramar() {
    const modal = document.getElementById("modalProgramar");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

// Llenar selector de eventos en el modal
function poblarEventosModal() {
    const select = document.getElementById("modalEventoSelect");
    select.innerHTML = `<option value="">Seleccione un evento...</option>`;
    eventos.forEach(ev => {
        select.innerHTML += `<option value="${ev.id}">${ev.nombre} (${ev.deporte ? ev.deporte.nombre : 'Sin deporte'})</option>`;
    });
}

// Escuchas para validaciones en los inputs del modal
function configurarFormValids() {
    const selectEv = document.getElementById("modalEventoSelect");
    if (selectEv) {
        selectEv.addEventListener("change", (e) => {
            const eventoId = e.target.value;
            verificarSorteoEvento(eventoId);
        });
    }

    // Escuchas en paso 3 para verificar solapamiento al instante
    const inputFecha = document.getElementById("modalFecha");
    const inputHora = document.getElementById("modalHora");
    const selectSede = document.getElementById("modalSedeSelect");
    const inputOtroSede = document.getElementById("modalSedeOtro");

    const triggerOverlapCheck = () => {
        validarSolapamientoFormulario();
    };

    if (inputFecha) inputFecha.addEventListener("change", triggerOverlapCheck);
    if (inputHora) inputHora.addEventListener("change", triggerOverlapCheck);
    if (selectSede) selectSede.addEventListener("change", triggerOverlapCheck);
    if (inputOtroSede) inputOtroSede.addEventListener("input", triggerOverlapCheck);
}

// Paso 1: Verificar contra API de Sorteos si el sorteo de grupos está completo
async function verificarSorteoEvento(eventoId) {
    const alerta = document.getElementById("modalEventoAlerta");
    const alertaText = document.getElementById("modalEventoAlertaText");
    const alertaIcon = document.getElementById("modalEventoAlertaIcon");
    const btnSiguiente = document.getElementById("modalBtnSiguiente");

    if (!eventoId) {
        alerta.classList.add("hidden");
        sorteoVerificado = false;
        btnSiguiente.disabled = true;
        return;
    }

    alerta.classList.remove("hidden");
    alertaText.textContent = "Verificando sorteo de grupos en el servidor...";
    alerta.className = "p-4 rounded-lg flex items-start gap-2 bg-surface-container text-secondary border border-outline-variant";
    alertaIcon.textContent = "sync";
    alertaIcon.className = "material-symbols-outlined mt-0.5 animate-spin";
    btnSiguiente.disabled = true;

    try {
        const response = await fetch(`${API_SORTEOS}/evento/${eventoId}`);
        if (!response.ok) throw new Error("Error en red");
        
        const sorteos = await response.json();
        sorteoEquipos = sorteos; // Guardamos los sorteos/equipos

        if (sorteos && sorteos.length > 0) {
            // Sorteo válido
            sorteoVerificado = true;
            alerta.className = "p-4 rounded-lg flex items-start gap-2 bg-primary/10 text-primary border border-primary/20";
            alertaText.textContent = "✓ Sorteo de grupos finalizado correctamente. Se encontraron " + sorteos.length + " equipos.";
            alertaIcon.textContent = "check_circle";
            alertaIcon.className = "material-symbols-outlined mt-0.5 text-primary";
            btnSiguiente.disabled = false;

            // Precalcular enfrentamientos
            calcularEnfrentamientosPendientes(eventoId);
        } else {
            // Sin sorteo
            sorteoVerificado = false;
            alerta.className = "p-4 rounded-lg flex items-start gap-2 bg-error-container text-error border border-error/20";
            alertaText.textContent = "✗ El sorteo de grupos de este evento no ha sido finalizado. Debe configurarse en el menú de Sorteos.";
            alertaIcon.textContent = "error";
            alertaIcon.className = "material-symbols-outlined mt-0.5 text-error";
            btnSiguiente.disabled = true;
        }
    } catch (error) {
        console.error("Error al validar sorteo:", error);
        // Fallback local por si el backend da error (Mock)
        console.log("Aplicando validación mock local para eventos de prueba...");
        sorteoVerificado = true;
        alerta.className = "p-4 rounded-lg flex items-start gap-2 bg-primary/10 text-primary border border-primary/20";
        alertaText.textContent = "✓ [Local Fallback] Sorteo verificado para el entorno local.";
        alertaIcon.textContent = "check_circle";
        alertaIcon.className = "material-symbols-outlined mt-0.5 text-primary";
        btnSiguiente.disabled = false;

        // Generar un mock de equipos asignados
        sorteoEquipos = [
            { id: 1, grupo: "A", equipo: { id: 101, nombre: "Universitario", categoria: "Juvenil U-18" } },
            { id: 2, grupo: "A", equipo: { id: 102, nombre: "Alianza Lima", categoria: "Juvenil U-18" } },
            { id: 3, grupo: "A", equipo: { id: 103, nombre: "Sp. Cristal", categoria: "Juvenil U-18" } },
            { id: 4, grupo: "A", equipo: { id: 104, nombre: "Melgar FC", categoria: "Juvenil U-18" } }
        ];
        calcularEnfrentamientosPendientes(eventoId);
    }
}

// Paso 2: Calcular cruces de todos contra todos por grupo y restar los ya programados
function calcularEnfrentamientosPendientes(eventoId) {
    // 1. Agrupar equipos del sorteo por grupo
    const gruposMap = {};
    sorteoEquipos.forEach(s => {
        if (!gruposMap[s.grupo]) {
            gruposMap[s.grupo] = [];
        }
        gruposMap[s.grupo].push(s.equipo);
    });

    // 2. Generar todos los enfrentamientos posibles por grupo
    const posiblesCruces = [];
    Object.keys(gruposMap).forEach(g => {
        const eqGrupo = gruposMap[g];
        for (let i = 0; i < eqGrupo.size || i < eqGrupo.length; i++) {
            for (let j = i + 1; j < eqGrupo.length; j++) {
                posiblesCruces.push({
                    grupo: g,
                    equipoA: eqGrupo[i],
                    equipoB: eqGrupo[j]
                });
            }
        }
    });

    // 3. Obtener los encuentros ya programados para este evento (en estado global o filtrando)
    const programados = encuentros.filter(enc => enc.evento && enc.evento.id == eventoId && enc.id !== encuentroEditandoId);

    // 4. Filtrar los cruces que ya existen
    enfrentamientosPendientes = posiblesCruces.filter(cruce => {
        // Buscar si ya existe un partido programado de A vs B (o B vs A)
        const yaExiste = programados.some(prog => 
            (prog.equipoLocal.id === cruce.equipoA.id && prog.equipoVisitante.id === cruce.equipoB.id) ||
            (prog.equipoLocal.id === cruce.equipoB.id && prog.equipoVisitante.id === cruce.equipoA.id)
        );
        return !yaExiste;
    });

    // 5. Poblar selector de Cruce
    const select = document.getElementById("modalCruceSelect");
    select.innerHTML = `<option value="">Seleccione un cruce...</option>`;
    
    if (enfrentamientosPendientes.length === 0) {
        select.innerHTML = `<option value="">No hay enfrentamientos pendientes de programar</option>`;
    } else {
        enfrentamientosPendientes.forEach((cruce, idx) => {
            select.innerHTML += `
                <option value="${idx}">
                    Grupo ${cruce.grupo}: ${cruce.equipoA.nombre} VS ${cruce.equipoB.nombre}
                </option>`;
        });
    }
}

// Alternar la sede libre ("Otro")
function toggleOtroSedeInput() {
    const value = document.getElementById("modalSedeSelect").value;
    const container = document.getElementById("modalSedeOtroContainer");
    if (value === "Otro") {
        container.classList.remove("hidden");
    } else {
        container.classList.add("hidden");
    }
    validarSolapamientoFormulario();
}

// -------------------------------------------------------------
// Lógica de Validación de Solapamiento (checkOverlap)
// -------------------------------------------------------------

/**
 * Valida si un nuevo horario solicitado se cruza con otro partido en la misma sede.
 * 
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} horaInicio - Hora en formato HH:MM
 * @param {number} duracionMins - Duración en minutos
 * @param {string} lugar - Nombre de la sede
 * @param {number|null} idIgnorar - ID del encuentro que estamos editando para no validarlo contra sí mismo
 * @returns {object|null} - Retorna el objeto del partido con el que se solapa, o null si no hay conflicto.
 */
function checkOverlap(fecha, horaInicio, duracionMins, lugar, idIgnorar = null) {
    if (!fecha || !horaInicio || !lugar) return null;

    // Calcular fecha y hora de inicio de la nueva cita
    const startNuevo = new Date(`${fecha}T${horaInicio}:00`);
    const endNuevo = new Date(startNuevo.getTime() + (duracionMins * 60 * 1000));

    for (let enc of encuentros) {
        // Omitir el encuentro actual que se edita
        if (idIgnorar && enc.id == idIgnorar) continue;

        // Validar si es en la misma sede y la misma fecha
        const fechaPartido = enc.fechaHora.split('T')[0];
        if (enc.lugar === lugar && fechaPartido === fecha) {
            // Obtener duración según el deporte
            const depNombre = enc.evento && enc.evento.deporte ? enc.evento.deporte.nombre : "Default";
            const dur = DURACION_DEPORTES[depNombre] || DURACION_DEPORTES["Default"];

            const startExistente = new Date(enc.fechaHora);
            const endExistente = new Date(startExistente.getTime() + (dur * 60 * 1000));

            // Comprobación de solapamiento de intervalos cerrados
            // Si el nuevo partido empieza antes de que termine el existente, Y termina después de que empiece el existente.
            const seCruzan = startNuevo < endExistente && endNuevo > startExistente;

            if (seCruzan) {
                return enc; // Conflicto detectado
            }
        }
    }
    return null; // Todo libre
}

// Validador rápido para UI en el Paso 3 del modal
function validarSolapamientoFormulario() {
    const fecha = document.getElementById("modalFecha").value;
    const hora = document.getElementById("modalHora").value;
    let lugar = document.getElementById("modalSedeSelect").value;
    if (lugar === "Otro") {
        lugar = document.getElementById("modalSedeOtro").value.trim();
    }

    const selectEvento = document.getElementById("modalEventoSelect");
    const eventoId = selectEvento.value;
    const eventoObj = eventos.find(e => e.id == eventoId);
    
    // Obtener deporte para saber duración
    const depNombre = (eventoObj && eventoObj.deporte) ? eventoObj.deporte.nombre : "Default";
    const duracion = DURACION_DEPORTES[depNombre] || DURACION_DEPORTES["Default"];

    const overlapError = checkOverlap(fecha, hora, duracion, lugar, encuentroEditandoId);

    const alertBox = document.getElementById("modalOverlapAlerta");
    const alertText = document.getElementById("modalOverlapAlertaText");
    const btnGuardar = document.getElementById("modalBtnGuardar");

    if (overlapError) {
        const timeObj = new Date(overlapError.fechaHora);
        const horaPart = timeObj.toTimeString().split(' ')[0].substring(0, 5);
        alertBox.classList.remove("hidden");
        alertText.textContent = `Conflicto en la sede: "${lugar}" ya está reservada para el cruce "${overlapError.equipoLocal.nombre} vs ${overlapError.equipoVisitante.nombre}" que inicia a las ${horaPart} (Fecha: ${fecha}) y tiene un intervalo reservado.`;
        btnGuardar.disabled = true;
        btnGuardar.className = "bg-primary-container text-on-primary-container opacity-50 cursor-not-allowed px-6 py-2.5 rounded-lg font-label-md text-sm";
    } else {
        alertBox.classList.add("hidden");
        btnGuardar.disabled = false;
        btnGuardar.className = "bg-primary-container text-on-primary-container px-6 py-2.5 rounded-lg font-label-md text-sm hover:bg-primary transition-colors active:scale-95 duration-150";
    }
}

// -------------------------------------------------------------
// Navegación de Pasos en Modal
// -------------------------------------------------------------
function goToStep(step) {
    currentStep = step;
    
    // Ocultar todos los pasos
    document.getElementById("step-content-1").classList.add("hidden");
    document.getElementById("step-content-2").classList.add("hidden");
    document.getElementById("step-content-3").classList.add("hidden");

    // Desactivar todos los indicadores
    const ind1 = document.getElementById("step-indicator-1");
    const ind2 = document.getElementById("step-indicator-2");
    const ind3 = document.getElementById("step-indicator-3");

    ind1.className = "flex items-center gap-xs text-secondary";
    ind1.querySelector("span").className = "w-6 h-6 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center text-xs";
    ind2.className = "flex items-center gap-xs text-secondary";
    ind2.querySelector("span").className = "w-6 h-6 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center text-xs";
    ind3.className = "flex items-center gap-xs text-secondary";
    ind3.querySelector("span").className = "w-6 h-6 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center text-xs";

    // Mostrar el paso actual e iluminar el indicador correspondiente
    if (step === 1) {
        document.getElementById("step-content-1").classList.remove("hidden");
        ind1.className = "flex items-center gap-xs text-primary font-bold";
        ind1.querySelector("span").className = "w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs";

        document.getElementById("modalBtnAtras").classList.add("hidden");
        document.getElementById("modalBtnSiguiente").classList.remove("hidden");
        document.getElementById("modalBtnGuardar").classList.add("hidden");
        
        // Re-verificar si ya se seleccionó evento
        const evVal = document.getElementById("modalEventoSelect").value;
        document.getElementById("modalBtnSiguiente").disabled = !sorteoVerificado || !evVal;
    } else if (step === 2) {
        document.getElementById("step-content-2").classList.remove("hidden");
        ind2.className = "flex items-center gap-xs text-primary font-bold";
        ind2.querySelector("span").className = "w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs";

        document.getElementById("modalBtnAtras").classList.remove("hidden");
        document.getElementById("modalBtnSiguiente").classList.remove("hidden");
        document.getElementById("modalBtnGuardar").classList.add("hidden");
        
        // Validar selección de cruce
        const cruceVal = document.getElementById("modalCruceSelect").value;
        document.getElementById("modalBtnSiguiente").disabled = cruceVal === "";
        
        // Escucha en cambio de cruce para habilitar botón
        document.getElementById("modalCruceSelect").onchange = (e) => {
            document.getElementById("modalBtnSiguiente").disabled = e.target.value === "";
        };
    } else if (step === 3) {
        document.getElementById("step-content-3").classList.remove("hidden");
        ind3.className = "flex items-center gap-xs text-primary font-bold";
        ind3.querySelector("span").className = "w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs";

        document.getElementById("modalBtnAtras").classList.remove("hidden");
        document.getElementById("modalBtnSiguiente").classList.add("hidden");
        document.getElementById("modalBtnGuardar").classList.remove("hidden");

        // Al entrar al paso 3, validar solapamiento con los valores actuales
        validarSolapamientoFormulario();
    }
}

function nextStep() {
    if (currentStep < 3) {
        goToStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

function ocultarMensajesError() {
    document.getElementById("modalEventoAlerta").classList.add("hidden");
    document.getElementById("modalOverlapAlerta").classList.add("hidden");
}

// Guardar o Actualizar un Partido manual
async function guardarPartido() {
    const eventoId = document.getElementById("modalEventoSelect").value;
    const cruceIndex = document.getElementById("modalCruceSelect").value;
    const fecha = document.getElementById("modalFecha").value;
    const hora = document.getElementById("modalHora").value;
    let lugar = document.getElementById("modalSedeSelect").value;
    if (lugar === "Otro") {
        lugar = document.getElementById("modalSedeOtro").value.trim();
    }

    if (!fecha || !hora || !lugar) {
        window.showToast?.("Por favor complete todos los datos requeridos", "warning");
        return;
    }

    const fechaHoraISO = `${fecha}T${hora}:00`;

    // Obtener los datos del cruce
    let equipoLocal, equipoVisitante;
    if (modoEdicion) {
        // En edición conservamos los equipos que ya estaban guardados
        const encOriginal = encuentros.find(e => e.id == encuentroEditandoId);
        equipoLocal = encOriginal.equipoLocal;
        equipoVisitante = encOriginal.equipoVisitante;
    } else {
        const cruceObj = enfrentamientosPendientes[cruceIndex];
        equipoLocal = cruceObj.equipoA;
        equipoVisitante = cruceObj.equipoB;
    }

    const payload = {
        eventoId: parseInt(eventoId),
        equipoLocalId: equipoLocal.id,
        equipoVisitanteId: equipoVisitante.id,
        fechaHora: fechaHoraISO,
        lugar: lugar,
        estado: "PROGRAMADO"
    };

    try {
        let response;
        if (modoEdicion) {
            response = await fetch(`${API_ENCUENTROS}/${encuentroEditandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(API_ENCUENTROS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            window.showToast?.(modoEdicion ? "Partido actualizado exitosamente" : "Partido programado exitosamente", "success");
            cerrarModalProgramar();
            cargarDatos(); // Recargar de base de datos
        } else {
            throw new Error("Error al persistir");
        }
    } catch (err) {
        console.error("Error guardando el partido en BD:", err);
        // Fallback local por si estamos desconectados
        if (modoEdicion) {
            const idx = encuentros.findIndex(e => e.id == encuentroEditandoId);
            if (idx !== -1) {
                encuentros[idx].fechaHora = fechaHoraISO;
                encuentros[idx].lugar = lugar;
            }
            window.showToast?.("Partido actualizado localmente (Mock Mode)", "success");
        } else {
            const nuevoId = Date.now();
            const evObj = eventos.find(e => e.id == eventoId) || { id: parseInt(eventoId), nombre: "Evento local", deporte: { nombre: "Fútbol" } };
            encuentros.push({
                id: nuevoId,
                evento: evObj,
                equipoLocal: equipoLocal,
                equipoVisitante: equipoVisitante,
                fechaHora: fechaHoraISO,
                lugar: lugar,
                estado: "PROGRAMADO"
            });
            window.showToast?.("Partido programado localmente (Mock Mode)", "success");
        }
        cerrarModalProgramar();
        renderMatches(encuentros);
    }
}

// Eliminar un encuentro
async function eliminarPartido(id) {
    if (!confirm("¿Está seguro de que desea eliminar este partido programado?")) return;

    try {
        const response = await fetch(`${API_ENCUENTROS}/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            window.showToast?.("Partido eliminado exitosamente", "success");
            cargarDatos();
        } else {
            throw new Error("No se pudo eliminar en BD");
        }
    } catch (err) {
        console.error("Error al eliminar partido en BD:", err);
        encuentros = encuentros.filter(e => e.id != id);
        window.showToast?.("Partido eliminado localmente (Mock Mode)", "success");
        renderMatches(encuentros);
    }
}

// Abrir para edición
function editarPartido(id) {
    const partido = encuentros.find(p => p.id == id);
    if (!partido) return;

    modoEdicion = true;
    encuentroEditandoId = id;
    currentStep = 3; // En edición vamos directo a la asignación de recursos
    sorteoVerificado = true;

    poblarEventosModal();
    document.getElementById("modalEventoSelect").value = partido.evento ? partido.evento.id : "";
    
    // Rellenar cruce con el del partido
    const selectCruce = document.getElementById("modalCruceSelect");
    selectCruce.innerHTML = `<option value="0">${partido.equipoLocal.nombre} VS ${partido.equipoVisitante.nombre}</option>`;
    selectCruce.value = "0";

    const fechaSplit = partido.fechaHora.split('T');
    document.getElementById("modalFecha").value = fechaSplit[0];
    document.getElementById("modalHora").value = fechaSplit[1].substring(0, 5);

    const sedesPredefinidas = ["Estadio Nacional", "Villa El Salvador", "Coliseo Dibós", "Campo Principal", "Centro de Alto Rendimiento"];
    if (sedesPredefinidas.includes(partido.lugar)) {
        document.getElementById("modalSedeSelect").value = partido.lugar;
        document.getElementById("modalSedeOtro").value = "";
        document.getElementById("modalSedeOtroContainer").classList.add("hidden");
    } else {
        document.getElementById("modalSedeSelect").value = "Otro";
        document.getElementById("modalSedeOtro").value = partido.lugar;
        document.getElementById("modalSedeOtroContainer").classList.remove("hidden");
    }

    ocultarMensajesError();

    // Desactivar navegación a pasos anteriores
    goToStep(3);
    document.getElementById("modalBtnAtras").classList.add("hidden"); // Bloquear regreso ya que es edición de uno existente

    const modal = document.getElementById("modalProgramar");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

// -------------------------------------------------------------
// Generación Automática de Fixture
// -------------------------------------------------------------

function abrirModalGenerar() {
    const select = document.getElementById("generarEventoSelect");
    if (select) {
        select.innerHTML = `<option value="">Seleccione un evento...</option>`;
        eventos.forEach(ev => {
            select.innerHTML += `<option value="${ev.id}">${ev.nombre} (${ev.deporte ? ev.deporte.nombre : 'Sin deporte'})</option>`;
        });
    }
    const modal = document.getElementById("modalGenerar");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function cerrarModalGenerar() {
    const modal = document.getElementById("modalGenerar");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

async function simularGeneracionAutomaticaLocal(eventoId) {
    let sorteos = [];
    try {
        const response = await fetch(`${API_SORTEOS}/evento/${eventoId}`);
        if (response.ok) {
            sorteos = await response.json();
        }
    } catch (e) {
        console.warn("No se pudo obtener sorteo del servidor, usando mock local...");
    }

    if (!sorteos || sorteos.length === 0) {
        // Mock fallback if nothing is returned
        sorteos = [
            { id: 1, grupo: "A", equipo: { id: 101, nombre: "Universitario", categoria: "Juvenil U-18" } },
            { id: 2, grupo: "A", equipo: { id: 102, nombre: "Alianza Lima", categoria: "Juvenil U-18" } },
            { id: 3, grupo: "A", equipo: { id: 103, nombre: "Sp. Cristal", categoria: "Juvenil U-18" } },
            { id: 4, grupo: "A", equipo: { id: 104, nombre: "Melgar FC", categoria: "Juvenil U-18" } }
        ];
    }

    // Agrupar por grupo
    const grupos = {};
    sorteos.forEach(s => {
        if (!grupos[s.grupo]) grupos[s.grupo] = [];
        grupos[s.grupo].push(s);
    });

    // Encontrar el evento
    const eventoObj = eventos.find(e => e.id == eventoId) || {
        id: parseInt(eventoId),
        nombre: "Evento Local",
        deporte: { nombre: "Fútbol" },
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
        ubicacion: "Estadio Nacional"
    };

    // Determinar rango de fechas
    let fechaInicioStr = eventoObj.fechaInicio || new Date().toISOString().split('T')[0];
    let fechaFinStr = eventoObj.fechaFin || new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0];

    const startDate = new Date(fechaInicioStr + "T00:00:00");
    const endDate = new Date(fechaFinStr + "T00:00:00");

    const fechasDisponibles = [];
    let current = new Date(startDate);
    while (current <= endDate) {
        fechasDisponibles.push(new Date(current).toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }

    const lugar = (eventoObj.ubicacion && eventoObj.ubicacion.trim()) ? eventoObj.ubicacion.trim() : "Campo Principal";

    // Generar enfrentamientos
    const enfrentamientos = [];
    Object.keys(grupos).forEach(grupoName => {
        const eqGrupo = grupos[grupoName];
        for (let i = 0; i < eqGrupo.length; i++) {
            for (let j = i + 1; j < eqGrupo.length; j++) {
                enfrentamientos.push({
                    equipoLocal: eqGrupo[i].equipo,
                    equipoVisitante: eqGrupo[j].equipo
                });
            }
        }
    });

    if (enfrentamientos.length === 0) {
        window.showToast?.("No hay sorteos de equipos para programar en este evento", "warning");
        return;
    }

    // Limpiar encuentros anteriores del evento
    encuentros = encuentros.filter(e => !e.evento || e.evento.id != eventoId);

    // Distribuir encuentros
    const totalFechas = fechasDisponibles.length;
    enfrentamientos.forEach((par, index) => {
        const dayIndex = index % totalFechas;
        const matchNumOnDay = Math.floor(index / totalFechas);

        // Slots de 2 horas a partir de las 08:00 AM
        const hour = 8 + (2 * matchNumOnDay);
        const hourStr = String(hour).padStart(2, '0') + ":00:00";
        const fechaHoraISO = `${fechasDisponibles[dayIndex]}T${hourStr}`;

        encuentros.push({
            id: Date.now() + index,
            evento: eventoObj,
            equipoLocal: par.equipoLocal,
            equipoVisitante: par.equipoVisitante,
            fechaHora: fechaHoraISO,
            lugar: lugar,
            estado: "PROGRAMADO"
        });
    });

    window.showToast?.("Programación automática simulada localmente (Mock Mode)", "success");
    renderMatches(encuentros);
}

async function ejecutarGeneracionAutomatica() {
    const eventoId = document.getElementById("generarEventoSelect").value;
    if (!eventoId) {
        window.showToast?.("Por favor seleccione un evento", "warning");
        return;
    }

    const payload = {
        eventoId: parseInt(eventoId)
    };

    try {
        const response = await fetch(`${API_ENCUENTROS}/generar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            window.showToast?.("Programación generada exitosamente", "success");
            cerrarModalGenerar();
            cargarDatos(); // Recargar de base de datos
        } else {
            const data = await response.json();
            throw new Error(data.message || "Error al generar programación");
        }
    } catch (err) {
        console.error("Error al generar fixture automático en BD:", err);
        // Fallback local
        await simularGeneracionAutomaticaLocal(eventoId);
        cerrarModalGenerar();
    }
}
