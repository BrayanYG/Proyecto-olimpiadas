// sorteo.js - Lógica interactiva para el sorteo de grupos de las Olimpiadas Perú

const API_BASE = window.location.port === "8081" ? "" : "http://localhost:8081";
const API_EQUIPOS = `${API_BASE}/api/equipos`;
const API_DEPORTES = `${API_BASE}/api/deportes`;
const API_EVENTOS = `${API_BASE}/api/eventos`;
const API_SORTEOS = `${API_BASE}/api/sorteos`;

// Estado global de la aplicación
let equiposOriginales = [];
let deportesOriginales = [];
let eventosOriginales = [];
let sorteoActual = []; // Estructura: [{ nombre: "Grupo A", equipos: [ { id, nombre, ... } ] }]
let grupoSeleccionadoIndex = null; // Índice del grupo que se está editando en el modal

// Inicialización del DOM
document.addEventListener("DOMContentLoaded", () => {
    inicializarFiltros();
    configurarEventos();
    
    // Escuchar la tecla Enter en el input del modal de editar grupo
    const inputNombreGrupo = document.getElementById("inputNombreGrupo");
    if (inputNombreGrupo) {
        inputNombreGrupo.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                guardarNombreGrupo();
            }
        });
    }
});

// Cargar filtros dinámicamente desde el backend
async function inicializarFiltros() {
    try {
        // Cargar Deportes
        const resDeportes = await fetch(API_DEPORTES);
        deportesOriginales = await resDeportes.json();
        
        // Cargar Equipos
        const resEquipos = await fetch(API_EQUIPOS);
        equiposOriginales = await resEquipos.json();

        // Cargar Eventos
        const resEventos = await fetch(API_EVENTOS);
        eventosOriginales = await resEventos.json();

        // Poblar Deportes en select
        const selectDeporte = document.getElementById("filtroDeporte");
        selectDeporte.innerHTML = "";
        if (deportesOriginales.length === 0) {
            selectDeporte.innerHTML = `<option value="">Sin deportes registrados</option>`;
        } else {
            deportesOriginales.forEach(deporte => {
                selectDeporte.innerHTML += `<option value="${deporte.id}">${deporte.nombre}</option>`;
            });
        }

        // Poblar Eventos de forma dinámica
        poblarEventosFiltro();

        // Escuchar cambios de deporte para re-evaluar eventos correspondientes
        selectDeporte.addEventListener("change", () => {
            poblarEventosFiltro();
        });

        // Escuchar cambios de evento para cargar el sorteo existente si lo hay
        const selectEvento = document.getElementById("filtroEvento");
        selectEvento.addEventListener("change", () => {
            cargarSorteoExistente();
        });

    } catch (error) {
        console.error("Error al inicializar filtros:", error);
        window.showToast("Error al conectar con el servidor para cargar filtros", "error");
    }
}

// Poblar dinámicamente los eventos correspondientes al deporte seleccionado
function poblarEventosFiltro() {
    const deporteId = document.getElementById("filtroDeporte").value;
    const selectEvento = document.getElementById("filtroEvento");
    selectEvento.innerHTML = "";

    // Filtrar eventos correspondientes al deporte seleccionado
    const eventosFiltrados = eventosOriginales.filter(evento => 
        !deporteId || (evento.deporte && evento.deporte.id == deporteId)
    );

    if (eventosFiltrados.length === 0) {
        selectEvento.innerHTML = `<option value="">Sin eventos registrados para este deporte</option>`;
    } else {
        eventosFiltrados.forEach(evento => {
            selectEvento.innerHTML += `<option value="${evento.id}">${evento.nombre} (${evento.estado || 'PENDIENTE'})</option>`;
        });
    }

    // Cargar automáticamente el sorteo para el evento seleccionado por defecto
    cargarSorteoExistente();
}

// Cargar sorteo guardado previamente desde el servidor
async function cargarSorteoExistente() {
    const eventoId = document.getElementById("filtroEvento").value;
    if (!eventoId) {
        sorteoActual = [];
        renderizarGrupos();
        return;
    }

    try {
        const response = await fetch(`${API_SORTEOS}/evento/${eventoId}`);
        if (!response.ok) {
            throw new Error("No se pudo obtener el sorteo");
        }
        const sorteos = await response.json();

        if (sorteos && sorteos.length > 0) {
            // Agrupar por nombre de grupo
            const gruposMap = {};
            sorteos.forEach(s => {
                const nombreGrupo = s.grupo.toUpperCase().startsWith("GRUPO ") ? s.grupo : `Grupo ${s.grupo}`;
                if (!gruposMap[nombreGrupo]) {
                    gruposMap[nombreGrupo] = [];
                }
                gruposMap[nombreGrupo].push(s.equipo);
            });

            // Convertir a estructura de sorteoActual
            const nombresGrupos = Object.keys(gruposMap).sort();
            sorteoActual = nombresGrupos.map(nombre => ({
                nombre: nombre,
                equipos: gruposMap[nombre]
            }));

            // Actualizar select de número de grupos si es posible (2, 4 o 8)
            const numGrupos = sorteoActual.length;
            const selectGrupos = document.getElementById("filtroGrupos");
            if (selectGrupos && [2, 4, 8].includes(numGrupos)) {
                selectGrupos.value = numGrupos;
            }

            renderizarGrupos();
            window.showToast("Sorteo guardado recuperado correctamente", "success");
        } else {
            // Si no hay sorteo guardado, limpiar la vista
            sorteoActual = [];
            renderizarGrupos();
        }
    } catch (error) {
        console.error("Error al cargar sorteo existente:", error);
        window.showToast("Error al cargar sorteo guardado", "error");
        sorteoActual = [];
        renderizarGrupos();
    }
}

// Configurar los listeners para botones
function configurarEventos() {
    const btnSorteo = document.getElementById("btnSorteo");
    const btnConfirmar = document.getElementById("btnConfirmarGrupos");
    const btnExportarPdf = document.getElementById("btnExportarPdf");

    if (btnSorteo) {
        btnSorteo.addEventListener("click", realizarSorteoAleatorio);
    }
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", confirmarGrupos);
    }
    if (btnExportarPdf) {
        btnExportarPdf.addEventListener("click", exportarSorteoPdf);
    }
}

// Algoritmo de Sorteo Aleatorio (Fisher-Yates)
function realizarSorteoAleatorio() {
    const deporteId = document.getElementById("filtroDeporte").value;
    const eventoId = document.getElementById("filtroEvento").value;
    const numGrupos = parseInt(document.getElementById("filtroGrupos").value) || 4;

    if (!deporteId) {
        window.showToast("Por favor, seleccione un deporte válido", "warning");
        return;
    }

    if (!eventoId || eventoId === "") {
        window.showToast("Por favor, seleccione un evento válido", "warning");
        return;
    }

    // Filtrar equipos por el Deporte seleccionado
    let equiposFiltrados = equiposOriginales.filter(equipo => {
        return equipo.deporte && equipo.deporte.id == deporteId;
    });

    if (equiposFiltrados.length === 0) {
        window.showToast("No hay equipos registrados para este deporte.", "warning");
        return;
    }

    // Clonar lista de equipos para desordenar
    let equiposSorteo = [...equiposFiltrados];

    // Algoritmo Fisher-Yates
    for (let i = equiposSorteo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [equiposSorteo[i], equiposSorteo[j]] = [equiposSorteo[j], equiposSorteo[i]];
    }

    // Crear la estructura de grupos
    sorteoActual = [];
    for (let i = 0; i < numGrupos; i++) {
        const letraGrupo = String.fromCharCode(65 + i); // A, B, C, D, ...
        sorteoActual.push({
            nombre: `Grupo ${letraGrupo}`,
            equipos: []
        });
    }

    // Distribuir equitativamente.
    // Si sobran elementos (N%numGrupos != 0), se reparten 1 a 1 de forma balanceada
    for (let i = 0; i < equiposSorteo.length; i++) {
        const indexGrupo = i % numGrupos;
        sorteoActual[indexGrupo].equipos.push(equiposSorteo[i]);
    }

    // Renderizar los grupos
    renderizarGrupos();
    window.showToast("Sorteo aleatorio realizado correctamente", "success");
}

// Renderizado Dinámico de las tarjetas de los Grupos
function renderizarGrupos() {
    const grid = document.getElementById("gruposGrid");
    grid.innerHTML = "";

    if (sorteoActual.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-xl text-center">
                <span class="material-symbols-outlined text-outline text-6xl">sports_score</span>
                <p class="font-title-lg text-on-surface-variant mt-4">No se ha realizado ningún sorteo aún.</p>
                <p class="text-caption text-secondary">Configura los filtros de arriba y presiona "Realizar Sorteo Aleatorio".</p>
            </div>
        `;
        return;
    }

    sorteoActual.forEach((grupo, indexGrupo) => {
        // Crear Card de Grupo
        const card = document.createElement("div");
        card.className = "bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant red-tint-shadow flex flex-col group-card transition-all duration-200";
        card.setAttribute("data-group-index", indexGrupo);
        card.setAttribute("data-group-name", grupo.nombre);

        // Header del Grupo
        const header = document.createElement("div");
        header.className = "bg-surface-container-high px-md py-sm flex justify-between items-center border-b border-outline-variant";
        header.innerHTML = `
            <h3 class="font-headline-md text-title-lg text-primary uppercase tracking-wider font-bold">
                ${grupo.nombre}
            </h3>
            <button onclick="editarNombreGrupo(${indexGrupo})" class="p-1 hover:bg-surface-container-highest rounded transition-colors text-on-surface-variant" title="Editar nombre de grupo">
                <span class="material-symbols-outlined text-lg">edit</span>
            </button>
        `;
        card.appendChild(header);

        // Contenido del Grupo (Dropzone)
        const content = document.createElement("div");
        content.className = "p-md flex-1 flex flex-col";

        const ul = document.createElement("ul");
        ul.className = "space-y-sm flex-1 min-h-[120px] rounded-lg transition-all duration-200 p-1";
        ul.setAttribute("data-group-index", indexGrupo);

        // Configurar los eventos de Dropzone en el contenedor UL
        configurarDropzone(ul);

        if (grupo.equipos.length === 0) {
            ul.innerHTML = `
                <div class="h-full flex items-center justify-center border-2 border-dashed border-outline-variant/50 rounded-lg p-md text-center text-caption text-on-surface-variant/60 pointer-events-none">
                    Arrastra equipos aquí
                </div>
            `;
        } else {
            grupo.equipos.forEach((equipo, indexEquipo) => {
                const numOrden = String(indexEquipo + 1).padStart(2, '0');
                const li = document.createElement("li");
                li.className = "flex items-center justify-between p-sm bg-surface-container-low rounded border border-outline-variant hover:border-primary hover:shadow-sm transition-all cursor-move active:scale-95 duration-150";
                li.setAttribute("draggable", "true");
                li.setAttribute("data-team-id", equipo.id);
                li.setAttribute("data-group-index", indexGrupo);
                li.setAttribute("data-team-index", indexEquipo);

                // Configurar los eventos de Drag en cada Item
                configurarDraggable(li);

                li.innerHTML = `
                    <div class="flex items-center gap-sm pointer-events-none">
                        <span class="font-bold text-primary font-body-md">${numOrden}</span>
                        <span class="font-label-md text-sm text-on-surface">${equipo.nombre}</span>
                    </div>
                    <span class="material-symbols-outlined text-outline text-sm shrink-0 pointer-events-none">drag_indicator</span>
                `;
                ul.appendChild(li);
            });
        }

        content.appendChild(ul);
        card.appendChild(content);
        grid.appendChild(card);
    });
}

// Variables temporales para el Drag & Drop
let dragSourceElement = null;

function configurarDraggable(li) {
    li.addEventListener("dragstart", (e) => {
        dragSourceElement = li;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", JSON.stringify({
            teamId: li.getAttribute("data-team-id"),
            fromGroupIndex: parseInt(li.getAttribute("data-group-index")),
            fromTeamIndex: parseInt(li.getAttribute("data-team-index"))
        }));
        
        // Estilo de elemento en arrastre
        li.classList.add("opacity-40", "border-dashed", "border-primary");
    });

    li.addEventListener("dragend", () => {
        if (dragSourceElement) {
            dragSourceElement.classList.remove("opacity-40", "border-dashed", "border-primary");
            dragSourceElement = null;
        }
        // Limpiar estilos de dropzone activos en todo el DOM
        document.querySelectorAll("#gruposGrid ul").forEach(ul => {
            ul.classList.remove("bg-primary/5", "ring-2", "ring-primary/20", "border-primary");
        });
    });
}

function configurarDropzone(ul) {
    ul.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    });

    ul.addEventListener("dragenter", () => {
        ul.classList.add("bg-primary/5", "ring-2", "ring-primary/20", "border-primary");
    });

    ul.addEventListener("dragleave", () => {
        ul.classList.remove("bg-primary/5", "ring-2", "ring-primary/20", "border-primary");
    });

    ul.addEventListener("drop", (e) => {
        e.preventDefault();
        ul.classList.remove("bg-primary/5", "ring-2", "ring-primary/20", "border-primary");

        try {
            const data = JSON.parse(e.dataTransfer.getData("text/plain"));
            const toGroupIndex = parseInt(ul.getAttribute("data-group-index"));
            const fromGroupIndex = data.fromGroupIndex;
            const fromTeamIndex = data.fromTeamIndex;

            if (fromGroupIndex === toGroupIndex) return; // Mismo grupo, no hay cambio

            // Mover equipo en el estado global
            const equipoMover = sorteoActual[fromGroupIndex].equipos.splice(fromTeamIndex, 1)[0];
            sorteoActual[toGroupIndex].equipos.push(equipoMover);

            // Re-renderizar grupos
            renderizarGrupos();
            window.showToast(`Equipo movido a ${sorteoActual[toGroupIndex].nombre}`, "info");

        } catch (error) {
            console.error("Error al procesar drop:", error);
        }
    });
}

// Editar el nombre de un Grupo abriendo el modal premium
function editarNombreGrupo(indexGrupo) {
    grupoSeleccionadoIndex = indexGrupo;
    const grupo = sorteoActual[indexGrupo];
    
    const modal = document.getElementById("modal-editar-grupo");
    const content = document.getElementById("modal-grupo-content");
    const input = document.getElementById("inputNombreGrupo");
    
    if (modal && content && input) {
        input.value = grupo.nombre;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        
        setTimeout(() => {
            content.classList.remove("scale-95", "opacity-0");
            content.classList.add("scale-100", "opacity-100");
            input.focus();
        }, 10);
    }
}

// Cerrar el modal de edición de grupo con transición
function cerrarModalGrupo() {
    const modal = document.getElementById("modal-editar-grupo");
    const content = document.getElementById("modal-grupo-content");
    
    if (modal && content) {
        content.classList.add("scale-95", "opacity-0");
        content.classList.remove("scale-100", "opacity-100");
        
        setTimeout(() => {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
            grupoSeleccionadoIndex = null;
        }, 200);
    }
}

// Guardar los cambios del nombre del grupo desde el modal
function guardarNombreGrupo() {
    if (grupoSeleccionadoIndex === null) return;
    
    const input = document.getElementById("inputNombreGrupo");
    if (!input) return;
    
    const nuevoNombre = input.value.trim();
    if (!nuevoNombre) {
        window.showToast("El nombre del grupo no puede estar vacío", "warning");
        return;
    }
    
    sorteoActual[grupoSeleccionadoIndex].nombre = nuevoNombre;
    renderizarGrupos();
    cerrarModalGrupo();
    window.showToast("Nombre de grupo actualizado", "success");
}

// Guardar Configuración (Confirmar Grupos) en el Backend
async function confirmarGrupos() {
    if (sorteoActual.length === 0) {
        window.showToast("No hay un sorteo activo para guardar. Primero presione 'Realizar Sorteo Aleatorio'", "warning");
        return;
    }

    const eventoId = document.getElementById("filtroEvento").value;
    
    if (!eventoId || eventoId === "") {
        window.showToast("Por favor, seleccione un evento válido para guardar el sorteo.", "error");
        return;
    }

    // Armar el payload para el backend
    const payload = [];
    sorteoActual.forEach(grupo => {
        grupo.equipos.forEach(equipo => {
            payload.push({
                eventoId: eventoId,
                equipoId: equipo.id,
                grupo: grupo.nombre // Guardará la asignación final de grupos del DOM
            });
        });
    });

    try {
        window.showToast("Guardando sorteo...", "info");
        const response = await fetch(`${API_SORTEOS}/confirmar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            window.showToast("Sorteo de grupos confirmado y guardado correctamente", "success");
        } else {
            const errData = await response.json();
            window.showToast(errData.message || "Error al guardar el sorteo", "error");
        }
    } catch (error) {
        console.error("Error al confirmar grupos:", error);
        window.showToast("Ocurrió un error en la comunicación con el backend al guardar el sorteo", "error");
    }
}

// Exportar Sorteo a un archivo PDF estructurado de manera profesional
function exportarSorteoPdf() {
    if (sorteoActual.length === 0) {
        window.showToast("Realice un sorteo antes de exportar el PDF", "warning");
        return;
    }

    const deporteNombre = document.getElementById("filtroDeporte").options[document.getElementById("filtroDeporte").selectedIndex].text;
    const selectEvento = document.getElementById("filtroEvento");
    const eventoNombre = selectEvento.options[selectEvento.selectedIndex] ? selectEvento.options[selectEvento.selectedIndex].text : "Evento Sin Nombre";
    
    const fechaActual = new Date().toLocaleDateString("es-PE", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    // Crear contenedor temporal para el PDF con estilos premium
    const wrapper = document.createElement("div");
    wrapper.style.padding = "24px";
    wrapper.style.fontFamily = "'Lexend', sans-serif";
    wrapper.style.backgroundColor = "#ffffff";
    wrapper.style.color = "#1c1b1b";

    // Crear cabecera corporativa de la exportación
    wrapper.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #ad0017; padding-bottom: 12px; margin-bottom: 24px;">
            <div>
                <h1 style="font-size: 24px; font-weight: 800; color: #ad0017; margin: 0; text-transform: uppercase;">Olimpiadas Deportivas Perú</h1>
                <p style="font-size: 14px; color: #5d3f3c; margin: 4px 0 0 0; font-weight: 600;">Reporte Oficial de Sorteo de Grupos</p>
            </div>
            <div style="text-align: right;">
                <p style="font-size: 11px; color: #926e6b; margin: 0;">Fecha de Emisión</p>
                <p style="font-size: 12px; font-weight: bold; margin: 2px 0 0 0;">${fechaActual}</p>
            </div>
        </div>
        
        <div style="background-color: #f6f3f2; border: 1px solid #e7bdb9; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-cols: 1fr 1fr; gap: 12px;">
            <div>
                <span style="font-size: 11px; color: #5d3f3c; text-transform: uppercase; font-weight: bold; display: block;">Deporte Seleccionado</span>
                <span style="font-size: 16px; font-weight: bold; color: #ad0017;">${deporteNombre}</span>
            </div>
            <div>
                <span style="font-size: 11px; color: #5d3f3c; text-transform: uppercase; font-weight: bold; display: block;">Evento</span>
                <span style="font-size: 16px; font-weight: bold; color: #1c1b1b;">${eventoNombre}</span>
            </div>
        </div>
    `;

    // Clonar la grilla de grupos
    const cloneGrid = document.getElementById("gruposGrid").cloneNode(true);
    
    // Ajustar estilos del clon para visualización estática en PDF (remover botones de edición y centrar tablas)
    cloneGrid.querySelectorAll("button").forEach(btn => btn.remove());
    cloneGrid.querySelectorAll(".cursor-move").forEach(li => {
        li.style.cursor = "default";
        li.classList.remove("cursor-move", "hover:border-primary");
    });
    cloneGrid.classList.remove("grid-cols-1", "md:grid-cols-2", "xl:grid-cols-4");
    
    // Forzar visualización de grilla en el PDF
    cloneGrid.style.display = "grid";
    cloneGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
    cloneGrid.style.gap = "20px";

    wrapper.appendChild(cloneGrid);

    // Configuración de html2pdf
    const opt = {
        margin:       10,
        filename:     `Sorteo_Grupos_${deporteNombre.replace(/\s+/g, '_')}_${eventoNombre.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    window.showToast("Generando archivo PDF...", "info");
    
    // Ejecutar exportación
    html2pdf().set(opt).from(wrapper).save()
        .then(() => {
            window.showToast("Archivo PDF descargado correctamente", "success");
        })
        .catch(err => {
            console.error("Error al exportar PDF:", err);
            window.showToast("No se pudo exportar el PDF", "error");
        });
}
