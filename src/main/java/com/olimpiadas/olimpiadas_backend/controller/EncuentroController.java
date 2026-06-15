package com.olimpiadas.olimpiadas_backend.controller;

import com.olimpiadas.olimpiadas_backend.model.Encuentro;
import com.olimpiadas.olimpiadas_backend.model.Evento;
import com.olimpiadas.olimpiadas_backend.model.Equipo;
import com.olimpiadas.olimpiadas_backend.repository.EncuentroRepository;
import com.olimpiadas.olimpiadas_backend.repository.EventoRepository;
import com.olimpiadas.olimpiadas_backend.repository.EquipoRepository;
import com.olimpiadas.olimpiadas_backend.service.ProgramacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/encuentros")
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class EncuentroController {

    private final EncuentroRepository encuentroRepository;
    private final EventoRepository eventoRepository;
    private final EquipoRepository equipoRepository;
    private final ProgramacionService programacionService;

    public EncuentroController(EncuentroRepository encuentroRepository, EventoRepository eventoRepository,
            EquipoRepository equipoRepository, ProgramacionService programacionService) {
        this.encuentroRepository = encuentroRepository;
        this.eventoRepository = eventoRepository;
        this.equipoRepository = equipoRepository;
        this.programacionService = programacionService;
    }

    @GetMapping
    public List<Encuentro> listar() {
        return encuentroRepository.findAll();
    }

    @GetMapping("/evento/{eventoId}")
    public List<Encuentro> listarPorEvento(@PathVariable @NonNull Long eventoId) {
        return encuentroRepository.findByEventoId(eventoId);
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody EncuentroRequest req) {
        if (req.getEventoId() == null || req.getEquipoLocalId() == null || req.getEquipoVisitanteId() == null
                || req.getFechaHora() == null || req.getLugar() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Faltan campos obligatorios"));
        }

        Evento evento = eventoRepository.findById(req.getEventoId())
                .orElse(null);
        if (evento == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Evento no encontrado"));
        }

        Equipo equipoLocal = equipoRepository.findById(req.getEquipoLocalId())
                .orElse(null);
        if (equipoLocal == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Equipo local no encontrado"));
        }

        Equipo equipoVisitante = equipoRepository.findById(req.getEquipoVisitanteId())
                .orElse(null);
        if (equipoVisitante == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Equipo visitante no encontrado"));
        }

        Encuentro encuentro = new Encuentro();
        encuentro.setEvento(evento);
        encuentro.setEquipoLocal(equipoLocal);
        encuentro.setEquipoVisitante(equipoVisitante);
        encuentro.setFechaHora(req.getFechaHora());
        encuentro.setLugar(req.getLugar());
        encuentro.setEstado(req.getEstado() != null ? req.getEstado() : "PENDIENTE");

        Encuentro guardado = encuentroRepository.save(encuentro);
        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable @NonNull Long id, @RequestBody EncuentroRequest req) {
        return encuentroRepository.findById(id)
                .map(encuentro -> {
                    if (req.getFechaHora() != null)
                        encuentro.setFechaHora(req.getFechaHora());
                    if (req.getLugar() != null)
                        encuentro.setLugar(req.getLugar());
                    if (req.getEstado() != null)
                        encuentro.setEstado(req.getEstado());

                    if (req.getEquipoLocalId() != null) {
                        Equipo local = equipoRepository.findById(req.getEquipoLocalId()).orElse(null);
                        if (local != null)
                            encuentro.setEquipoLocal(local);
                    }
                    if (req.getEquipoVisitanteId() != null) {
                        Equipo visitante = equipoRepository.findById(req.getEquipoVisitanteId()).orElse(null);
                        if (visitante != null)
                            encuentro.setEquipoVisitante(visitante);
                    }
                    if (req.getEventoId() != null) {
                        Evento ev = eventoRepository.findById(req.getEventoId()).orElse(null);
                        if (ev != null)
                            encuentro.setEvento(ev);
                    }

                    return ResponseEntity.ok(encuentroRepository.save(encuentro));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable @NonNull Long id) {
        if (encuentroRepository.existsById(id)) {
            encuentroRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Encuentro eliminado correctamente"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/generar")
    public ResponseEntity<?> generar(@RequestBody GenerarRequest req) {
        if (req.getEventoId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Falta el campo obligatorio (eventoId)"));
        }

        Evento evento = eventoRepository.findById(req.getEventoId()).orElse(null);
        if (evento == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Evento no encontrado"));
        }

        // Limpiar encuentros anteriores para este evento antes de generar nuevos
        List<Encuentro> anteriores = encuentroRepository.findByEventoId(req.getEventoId());
        encuentroRepository.deleteAll(anteriores);

        try {
            List<Encuentro> generados = programacionService.generarProgramacion(evento);
            return ResponseEntity.ok(generados);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Error al generar la programación: " + e.getMessage()));
        }
    }

    public static class EncuentroRequest {
        private Long eventoId;
        private Long equipoLocalId;
        private Long equipoVisitanteId;
        private LocalDateTime fechaHora;
        private String lugar;
        private String estado;

        public Long getEventoId() {
            return eventoId;
        }

        public void setEventoId(Long eventoId) {
            this.eventoId = eventoId;
        }

        public Long getEquipoLocalId() {
            return equipoLocalId;
        }

        public void setEquipoLocalId(Long equipoLocalId) {
            this.equipoLocalId = equipoLocalId;
        }

        public Long getEquipoVisitanteId() {
            return equipoVisitanteId;
        }

        public void setEquipoVisitanteId(Long equipoVisitanteId) {
            this.equipoVisitanteId = equipoVisitanteId;
        }

        public LocalDateTime getFechaHora() {
            return fechaHora;
        }

        public void setFechaHora(LocalDateTime fechaHora) {
            this.fechaHora = fechaHora;
        }

        public String getLugar() {
            return lugar;
        }

        public void setLugar(String lugar) {
            this.lugar = lugar;
        }

        public String getEstado() {
            return estado;
        }

        public void setEstado(String estado) {
            this.estado = estado;
        }
    }

    public static class GenerarRequest {
        private Long eventoId;
        private LocalDateTime fechaInicio;

        public Long getEventoId() {
            return eventoId;
        }

        public void setEventoId(Long eventoId) {
            this.eventoId = eventoId;
        }

        public LocalDateTime getFechaInicio() {
            return fechaInicio;
        }

        public void setFechaInicio(LocalDateTime fechaInicio) {
            this.fechaInicio = fechaInicio;
        }
    }
}
