package com.olimpiadas.olimpiadas_backend.controller;

import com.olimpiadas.olimpiadas_backend.model.Sorteo;
import com.olimpiadas.olimpiadas_backend.model.Equipo;
import com.olimpiadas.olimpiadas_backend.model.Evento;
import com.olimpiadas.olimpiadas_backend.repository.SorteoRepository;
import com.olimpiadas.olimpiadas_backend.repository.EventoRepository;
import com.olimpiadas.olimpiadas_backend.repository.EquipoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sorteos")
@CrossOrigin(origins = "*")
public class SorteoController {

    private final SorteoRepository sorteoRepository;
    private final EventoRepository eventoRepository;
    private final EquipoRepository equipoRepository;

    public SorteoController(SorteoRepository sorteoRepository, EventoRepository eventoRepository, EquipoRepository equipoRepository) {
        this.sorteoRepository = sorteoRepository;
        this.eventoRepository = eventoRepository;
        this.equipoRepository = equipoRepository;
    }

    @GetMapping("/evento/{eventoId}")
    public List<Sorteo> obtenerPorEvento(@PathVariable @NonNull Long eventoId) {
        return sorteoRepository.findByEventoId(eventoId);
    }

    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarSorteo(@RequestBody List<SorteoRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "La lista de asignaciones está vacía"));
        }

        // Limpiar sorteos anteriores para los eventos referenciados en la petición para evitar duplicados
        Long eventoId = requests.get(0).getEventoId();
        List<Sorteo> existentes = sorteoRepository.findByEventoId(eventoId);
        sorteoRepository.deleteAll(existentes);

        // Guardar las nuevas asignaciones
        for (SorteoRequest req : requests) {
            Evento evento = eventoRepository.findById(req.getEventoId())
                    .orElseThrow(() -> new IllegalArgumentException("Evento no encontrado: " + req.getEventoId()));
            Equipo equipo = equipoRepository.findById(req.getEquipoId())
                    .orElseThrow(() -> new IllegalArgumentException("Equipo no encontrado: " + req.getEquipoId()));

            Sorteo sorteo = new Sorteo();
            sorteo.setEvento(evento);
            sorteo.setEquipo(equipo);
            
            // Si viene como "Grupo A", extraer solo "A", o guardar completo.
            String grupoLimpio = req.getGrupo();
            if (grupoLimpio != null && grupoLimpio.toUpperCase().startsWith("GRUPO ")) {
                grupoLimpio = grupoLimpio.substring(6).trim();
            }
            sorteo.setGrupo(grupoLimpio);

            sorteoRepository.save(sorteo);
        }

        return ResponseEntity.ok(Map.of("message", "Sorteo guardado correctamente"));
    }

    public static class SorteoRequest {
        private Long eventoId;
        private Long equipoId;
        private String grupo;

        public Long getEventoId() { return eventoId; }
        public void setEventoId(Long eventoId) { this.eventoId = eventoId; }
        public Long getEquipoId() { return equipoId; }
        public void setEquipoId(Long equipoId) { this.equipoId = equipoId; }
        public String getGrupo() { return grupo; }
        public void setGrupo(String grupo) { this.grupo = grupo; }
    }
}
