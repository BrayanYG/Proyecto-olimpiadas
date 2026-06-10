const API_BASE = window.location.port === "8081" ? "" : "http://localhost:8081";
const API_REPORTES = `${API_BASE}/api/reportes`;
const API_EVENTOS = `${API_BASE}/api/eventos`;

let currentTab = "eventos-realizados";

document.addEventListener("DOMContentLoaded", () => {
    cargarTodosLosEventos();
});

function cargarTodosLosEventos() {
    fetch(API_EVENTOS)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("select-evento");
            select.innerHTML = '<option value="">Seleccionar evento...</option>';
            data.forEach(ev => {
                select.innerHTML += `<option value="${ev.id}">${ev.nombre}</option>`;
            });
            cambiarTab('eventos-realizados');
        })
        .catch(err => console.error("Error al cargar eventos:", err));
}

function cambiarTab(tabId) {
    const tabs = ['eventos-realizados', 'equipos-evento', 'calendario', 'resultados'];
    
    tabs.forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if(t === tabId) {
            el.classList.remove('tab-inactive');
            el.classList.add('tab-active');
        } else {
            el.classList.remove('tab-active');
            el.classList.add('tab-inactive');
        }
    });

    currentTab = tabId;
    const filtros = document.getElementById("filtros-container");

    if (tabId === 'calendario' || tabId === 'resultados') {
        filtros.classList.remove('hidden');
    } else {
        filtros.classList.add('hidden');
    }

    cargarDatosReporteActual();
}

function mostrarMensajeVacio(mensaje = "No hay datos para mostrar") {
    document.getElementById("tabla-cabecera").innerHTML = "";
    document.getElementById("tabla-cuerpo").innerHTML = "";
    document.getElementById("mensaje-vacio").classList.remove("hidden");
    document.getElementById("texto-vacio").innerText = mensaje;
}

function ocultarMensajeVacio() {
    document.getElementById("mensaje-vacio").classList.add("hidden");
}

function cargarDatosReporteActual() {
    ocultarMensajeVacio();
    const eventoId = document.getElementById("select-evento").value;

    if (currentTab === 'eventos-realizados') {
        fetch(`${API_REPORTES}/eventos-realizados`)
            .then(res => res.json())
            .then(renderEventosRealizados)
            .catch(err => console.error(err));
    } else if (currentTab === 'equipos-evento') {
        fetch(`${API_REPORTES}/equipos-evento`)
            .then(res => res.json())
            .then(renderEquiposPorEvento)
            .catch(err => console.error(err));
    } else if (currentTab === 'calendario') {
        if (!eventoId) return mostrarMensajeVacio("Seleccione un evento para ver su calendario");
        fetch(`${API_REPORTES}/calendario/${eventoId}`)
            .then(res => res.json())
            .then(renderCalendario)
            .catch(err => console.error(err));
    } else if (currentTab === 'resultados') {
        if (!eventoId) return mostrarMensajeVacio("Seleccione un evento para ver los resultados");
        fetch(`${API_REPORTES}/resultados/${eventoId}`)
            .then(res => res.json())
            .then(renderResultados)
            .catch(err => console.error(err));
    }
}

// RENDERIZADO (Solo Pinta HTML, no hay lógica de negocio)

function renderEventosRealizados(data) {
    if (data.length === 0) return mostrarMensajeVacio("No hay eventos finalizados");
    
    document.getElementById("tabla-cabecera").innerHTML = `
        <tr>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Nombre del Evento</th>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Deporte</th>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Fechas</th>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Ubicación</th>
        </tr>
    `;

    let tbody = "";
    data.forEach(ev => {
        tbody += `
            <tr class="hover:bg-surface-container-low transition-colors group">
                <td class="px-md py-lg font-bold text-on-surface">${ev.nombreEvento}</td>
                <td class="px-md py-lg text-secondary font-body-md">${ev.deporte}</td>
                <td class="px-md py-lg text-secondary font-body-md">${ev.fechaInicio} - ${ev.fechaFin}</td>
                <td class="px-md py-lg text-secondary font-body-md">${ev.ubicacion}</td>
            </tr>
        `;
    });
    document.getElementById("tabla-cuerpo").innerHTML = tbody;
}

function renderEquiposPorEvento(data) {
    if (data.length === 0) return mostrarMensajeVacio("No hay inscripciones registradas");

    document.getElementById("tabla-cabecera").innerHTML = `
        <tr>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Evento</th>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider text-right">Equipos Registrados</th>
        </tr>
    `;

    let tbody = "";
    data.forEach(r => {
        tbody += `
            <tr class="hover:bg-surface-container-low transition-colors group">
                <td class="px-md py-lg font-bold text-on-surface">${r.evento}</td>
                <td class="px-md py-lg text-primary font-bold text-right">${r.cantidadEquipos} equipos</td>
            </tr>
        `;
    });
    document.getElementById("tabla-cuerpo").innerHTML = tbody;
}

function renderCalendario(data) {
    if (data.length === 0) return mostrarMensajeVacio("No hay partidos programados para este evento");

    document.getElementById("tabla-cabecera").innerHTML = `
        <tr>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Fecha y Hora</th>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Local</th>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Visitante</th>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Lugar</th>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Estado</th>
        </tr>
    `;

    let tbody = "";
    data.forEach(enc => {
        tbody += `
            <tr class="hover:bg-surface-container-low transition-colors group">
                <td class="px-md py-lg font-body-md text-secondary">${enc.fechaHora}</td>
                <td class="px-md py-lg font-bold text-on-surface">${enc.equipoLocal}</td>
                <td class="px-md py-lg font-bold text-on-surface">${enc.equipoVisitante}</td>
                <td class="px-md py-lg text-secondary font-body-md">${enc.lugar}</td>
                <td class="px-md py-lg font-bold text-caption">
                    <span class="px-2 py-1 bg-surface-container-high rounded-full">${enc.estado}</span>
                </td>
            </tr>
        `;
    });
    document.getElementById("tabla-cuerpo").innerHTML = tbody;
}

function renderResultados(data) {
    if (data.length === 0) return mostrarMensajeVacio("No hay resultados registrados para este evento");

    document.getElementById("tabla-cabecera").innerHTML = `
        <tr>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Partido</th>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider text-center">Marcador</th>
            <th class="px-md py-lg font-label-md text-label-md text-on-surface uppercase tracking-wider">Estado</th>
        </tr>
    `;

    let tbody = "";
    data.forEach(enc => {
        const ptsLocal = enc.puntosLocal !== null ? enc.puntosLocal : '-';
        const ptsVis = enc.puntosVisitante !== null ? enc.puntosVisitante : '-';

        tbody += `
            <tr class="hover:bg-surface-container-low transition-colors group">
                <td class="px-md py-lg text-secondary font-body-md">
                    ${enc.equipoLocal} vs ${enc.equipoVisitante}
                </td>
                <td class="px-md py-lg font-headline-md text-center text-primary">
                    ${ptsLocal} - ${ptsVis}
                </td>
                <td class="px-md py-lg text-secondary font-body-md">
                    ${enc.estado}
                </td>
            </tr>
        `;
    });
    document.getElementById("tabla-cuerpo").innerHTML = tbody;
}

// EXPORTACIÓN DESDE EL BACKEND
function exportarExcel() {
    const eventoId = document.getElementById("select-evento").value;
    if ((currentTab === 'calendario' || currentTab === 'resultados') && !eventoId) {
        alert("Seleccione un evento primero.");
        return;
    }
    const url = `${API_REPORTES}/exportar/excel?tipo=${currentTab}${eventoId ? '&eventoId=' + eventoId : ''}`;
    window.open(url, '_blank');
}

function exportarPDF() {
    const eventoId = document.getElementById("select-evento").value;
    if ((currentTab === 'calendario' || currentTab === 'resultados') && !eventoId) {
        alert("Seleccione un evento primero.");
        return;
    }
    const url = `${API_REPORTES}/exportar/pdf?tipo=${currentTab}${eventoId ? '&eventoId=' + eventoId : ''}`;
    window.open(url, '_blank');
}
