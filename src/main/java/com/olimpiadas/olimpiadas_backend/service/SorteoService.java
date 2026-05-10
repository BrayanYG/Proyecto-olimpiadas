package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Equipo;
import com.olimpiadas.olimpiadas_backend.model.Evento;
import com.olimpiadas.olimpiadas_backend.model.Sorteo;
import com.olimpiadas.olimpiadas_backend.repository.EquipoRepository;
import com.olimpiadas.olimpiadas_backend.repository.SorteoRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SorteoService {

    private final SorteoRepository sorteoRepository;
    private final EquipoRepository equipoRepository;

    public SorteoService(SorteoRepository sorteoRepository, EquipoRepository equipoRepository) {
        this.sorteoRepository = sorteoRepository;
        this.equipoRepository = equipoRepository;
    }

    @NonNull
    public List<Sorteo> realizarSorteo(@NonNull Evento evento, int numGrupos) {
        // Obtener equipos inscritos al deporte del evento
        List<Equipo> equipos = equipoRepository.findAll().stream()
                .filter(e -> e.getDeporte().getId().equals(evento.getDeporte().getId()))
                .collect(Collectors.toList());

        Collections.shuffle(equipos);

        sorteoRepository.deleteAll(sorteoRepository.findByEventoId(evento.getId()));

        for (int i = 0; i < equipos.size(); i++) {
            char grupoChar = (char) ('A' + (i % numGrupos));
            Sorteo sorteo = new Sorteo();
            sorteo.setEvento(evento);
            sorteo.setEquipo(equipos.get(i));
            sorteo.setGrupo(String.valueOf(grupoChar));
            sorteoRepository.save(sorteo);
        }

        return sorteoRepository.findByEventoId(evento.getId());
    }

    public List<Sorteo> obtenerSorteoPorEvento(Long eventoId) {
        return sorteoRepository.findByEventoId(eventoId);
    }
}
