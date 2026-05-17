package com.olimpiadas.olimpiadas_backend.controller;

import com.olimpiadas.olimpiadas_backend.model.Evento;
import com.olimpiadas.olimpiadas_backend.repository.EventoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "*")
public class EventoController {

    private final EventoRepository eventoRepository;

    public EventoController(EventoRepository eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    @GetMapping
    public List<Evento> listar() {
        return eventoRepository.findAll();
    }

    @PostMapping
    public Evento guardar(@RequestBody @org.springframework.lang.NonNull Evento evento) {
        return eventoRepository.save(evento);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evento> buscarPorId(@PathVariable @org.springframework.lang.NonNull Long id) {
        return eventoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evento> actualizar(@PathVariable @org.springframework.lang.NonNull Long id, @RequestBody Evento datos) {
        return eventoRepository.findById(id)
                .map(evento -> {
                    evento.setNombre(datos.getNombre());
                    evento.setFechaInicio(datos.getFechaInicio());
                    evento.setFechaFin(datos.getFechaFin());
                    evento.setDeporte(datos.getDeporte());
                    evento.setEstado(datos.getEstado());
                    return ResponseEntity.ok(eventoRepository.save(evento));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable @org.springframework.lang.NonNull Long id) {
        if (eventoRepository.existsById(id)) {
            eventoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
