package com.olimpiadas.olimpiadas_backend.controller;

import com.olimpiadas.olimpiadas_backend.model.Deporte;
import com.olimpiadas.olimpiadas_backend.repository.DeporteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/deportes")
@CrossOrigin(origins = "*")
public class DeporteController {

    private final DeporteRepository deporteRepository;

    public DeporteController(DeporteRepository deporteRepository) {
        this.deporteRepository = deporteRepository;
    }

    @GetMapping
    public List<Deporte> listar() {
        return deporteRepository.findAll();
    }

    @PostMapping
    public Deporte guardar(@RequestBody @org.springframework.lang.NonNull Deporte deporte) {
        return deporteRepository.save(deporte);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deporte> buscarPorId(@PathVariable @org.springframework.lang.NonNull Long id) {
        return deporteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Deporte> actualizar(@PathVariable @org.springframework.lang.NonNull Long id, @RequestBody Deporte datos) {
        return deporteRepository.findById(id)
                .map(deporte -> {
                    deporte.setNombre(datos.getNombre());
                    deporte.setReglas(datos.getReglas());
                    deporte.setMaxParticipantes(datos.getMaxParticipantes());
                    return ResponseEntity.ok(deporteRepository.save(deporte));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable @org.springframework.lang.NonNull Long id) {
        if (deporteRepository.existsById(id)) {
            deporteRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
