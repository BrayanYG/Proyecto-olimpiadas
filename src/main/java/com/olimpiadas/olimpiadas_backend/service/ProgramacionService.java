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
    public List<Encuentro> generarProgramacion(@NonNull Evento evento, LocalDateTime fechaInicio) {
        List<Sorteo> sorteos = sorteoRepository.findByEventoId(evento.getId());
        Map<String, List<Sorteo>> grupos = sorteos.stream()
                .collect(Collectors.groupingBy(Sorteo::getGrupo));

        List<Encuentro> encuentrosGenerados = new ArrayList<>();
        LocalDateTime fechaActual = fechaInicio;

        for (String grupo : grupos.keySet()) {
            List<Sorteo> equiposGrupo = grupos.get(grupo);
            
            // Generar todos contra todos dentro del grupo
            for (int i = 0; i < equiposGrupo.size(); i++) {
                for (int j = i + 1; j < equiposGrupo.size(); j++) {
                    Encuentro encuentro = new Encuentro();
                    encuentro.setEvento(evento);
                    encuentro.setEquipoLocal(equiposGrupo.get(i).getEquipo());
                    encuentro.setEquipoVisitante(equiposGrupo.get(j).getEquipo());
                    encuentro.setFechaHora(fechaActual);
                    encuentro.setEstado("PENDIENTE");
                    encuentro.setLugar("Campo Principal");
                    
                    encuentrosGenerados.add(encuentroRepository.save(encuentro));
                    
                    // Incrementar fecha para el siguiente encuentro (ej. cada 2 horas)
                    fechaActual = fechaActual.plusHours(2);
                }
            }
        }

        return encuentrosGenerados;
    }
}
