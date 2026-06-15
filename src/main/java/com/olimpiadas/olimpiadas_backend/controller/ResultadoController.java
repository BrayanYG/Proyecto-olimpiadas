package com.olimpiadas.olimpiadas_backend.controller;

import com.olimpiadas.olimpiadas_backend.model.Encuentro;
import com.olimpiadas.olimpiadas_backend.model.Resultado;
import com.olimpiadas.olimpiadas_backend.repository.EncuentroRepository;
import com.olimpiadas.olimpiadas_backend.repository.ResultadoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/resultados")
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class ResultadoController {

    private final ResultadoRepository resultadoRepository;
    private final EncuentroRepository encuentroRepository;

    public ResultadoController(ResultadoRepository resultadoRepository, EncuentroRepository encuentroRepository) {
        this.resultadoRepository = resultadoRepository;
        this.encuentroRepository = encuentroRepository;
    }

    @GetMapping
    public List<Resultado> listar() {
        return resultadoRepository.findAll();
    }

    @GetMapping("/encuentro/{encuentroId}")
    public ResponseEntity<?> obtenerPorEncuentro(@PathVariable @NonNull Long encuentroId) {
        // Encontrar resultado que tenga ese encuentroId
        Optional<Resultado> resultado = resultadoRepository.findAll().stream()
                .filter(r -> r.getEncuentro() != null && r.getEncuentro().getId().equals(encuentroId))
                .findFirst();

        if (resultado.isPresent()) {
            return ResponseEntity.ok(resultado.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody ResultadoRequest req) {
        if (req.getIdPartido() == null || req.getScoreLocal() == null || req.getScoreVisitante() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Faltan campos obligatorios (idPartido, scoreLocal, scoreVisitante)"));
        }

        Optional<Encuentro> encuentroOpt = encuentroRepository.findById(req.getIdPartido());
        if (encuentroOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Partido no encontrado"));
        }

        Encuentro encuentro = encuentroOpt.get();
        encuentro.setEstado("FINALIZADO");

        // Buscar si ya existe un resultado para este encuentro para actualizarlo
        Resultado resultado = resultadoRepository.findAll().stream()
                .filter(r -> r.getEncuentro() != null && r.getEncuentro().getId().equals(req.getIdPartido()))
                .findFirst()
                .orElse(new Resultado());

        resultado.setEncuentro(encuentro);
        resultado.setPuntosLocal(req.getScoreLocal());
        resultado.setPuntosVisitante(req.getScoreVisitante());
        if (req.getObservaciones() != null) {
            resultado.setObservaciones(req.getObservaciones());
        }

        // Sincronizar relación bidireccional en memoria
        encuentro.setResultado(resultado);

        // Guardar ambos
        Resultado guardado = resultadoRepository.save(resultado);
        encuentroRepository.save(encuentro);

        return ResponseEntity.ok(guardado);
    }

    public static class ResultadoRequest {
        private Long idPartido;
        private Integer scoreLocal;
        private Integer scoreVisitante;
        private String observaciones;

        public Long getIdPartido() {
            return idPartido;
        }

        public void setIdPartido(Long idPartido) {
            this.idPartido = idPartido;
        }

        public Integer getScoreLocal() {
            return scoreLocal;
        }

        public void setScoreLocal(Integer scoreLocal) {
            this.scoreLocal = scoreLocal;
        }

        public Integer getScoreVisitante() {
            return scoreVisitante;
        }

        public void setScoreVisitante(Integer scoreVisitante) {
            this.scoreVisitante = scoreVisitante;
        }

        public String getObservaciones() {
            return observaciones;
        }

        public void setObservaciones(String observaciones) {
            this.observaciones = observaciones;
        }
    }
}
