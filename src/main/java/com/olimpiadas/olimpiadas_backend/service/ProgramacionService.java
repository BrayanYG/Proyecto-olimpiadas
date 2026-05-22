package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Encuentro;
import com.olimpiadas.olimpiadas_backend.model.Evento;
import com.olimpiadas.olimpiadas_backend.model.Sorteo;
import com.olimpiadas.olimpiadas_backend.repository.EncuentroRepository;
import com.olimpiadas.olimpiadas_backend.repository.SorteoRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProgramacionService {

    private final EncuentroRepository encuentroRepository;
    private final SorteoRepository sorteoRepository;

    public ProgramacionService(EncuentroRepository encuentroRepository, SorteoRepository sorteoRepository) {
        this.encuentroRepository = encuentroRepository;
        this.sorteoRepository = sorteoRepository;
    }

    @NonNull
    public List<Encuentro> generarProgramacion(@NonNull Evento evento) {
        List<Sorteo> sorteos = sorteoRepository.findByEventoId(evento.getId());
        Map<String, List<Sorteo>> grupos = sorteos.stream()
                .collect(Collectors.groupingBy(Sorteo::getGrupo));

        List<Encuentro> encuentrosGenerados = new ArrayList<>();

        // Determinar rango de fechas del evento
        java.time.LocalDate startDate = evento.getFechaInicio();
        java.time.LocalDate endDate = evento.getFechaFin();

        if (startDate == null) {
            startDate = java.time.LocalDate.now();
        }
        if (endDate == null || endDate.isBefore(startDate)) {
            endDate = startDate.plusDays(3);
        }

        // Crear lista de fechas disponibles
        List<java.time.LocalDate> fechasDisponibles = new ArrayList<>();
        java.time.LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            fechasDisponibles.add(current);
            current = current.plusDays(1);
        }

        // Determinar la ubicación (lugar)
        String lugar = (evento.getUbicacion() != null && !evento.getUbicacion().trim().isEmpty()) 
                ? evento.getUbicacion().trim() 
                : "Campo Principal";

        // Obtener todos los enfrentamientos posibles por grupo
        List<Sorteo[]> enfrentamientos = new ArrayList<>();
        for (String grupo : grupos.keySet()) {
            List<Sorteo> equiposGrupo = grupos.get(grupo);
            for (int i = 0; i < equiposGrupo.size(); i++) {
                for (int j = i + 1; j < equiposGrupo.size(); j++) {
                    enfrentamientos.add(new Sorteo[]{equiposGrupo.get(i), equiposGrupo.get(j)});
                }
            }
        }

        // Programar los encuentros distribuyéndolos de forma balanceada en los días
        int totalFechas = fechasDisponibles.size();
        for (int index = 0; index < enfrentamientos.size(); index++) {
            Sorteo[] par = enfrentamientos.get(index);
            Sorteo localSorteo = par[0];
            Sorteo visitanteSorteo = par[1];

            // Distribuir equitativamente entre los días
            int dayIndex = index % totalFechas;
            int matchNumOnDay = index / totalFechas;

            // Slots de 2 horas a partir de las 08:00 AM
            java.time.LocalTime startTime = java.time.LocalTime.of(8, 0).plusHours(2 * matchNumOnDay);
            LocalDateTime fechaHora = LocalDateTime.of(fechasDisponibles.get(dayIndex), startTime);

            Encuentro encuentro = new Encuentro();
            encuentro.setEvento(evento);
            encuentro.setEquipoLocal(localSorteo.getEquipo());
            encuentro.setEquipoVisitante(visitanteSorteo.getEquipo());
            encuentro.setFechaHora(fechaHora);
            encuentro.setEstado("PENDIENTE");
            encuentro.setLugar(lugar);

            encuentrosGenerados.add(encuentroRepository.save(encuentro));
        }

        return encuentrosGenerados;
    }
}
