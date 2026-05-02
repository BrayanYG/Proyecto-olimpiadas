package com.olimpiadas.olimpiadas_backend.controller;

import com.olimpiadas.olimpiadas_backend.model.Participante;
import com.olimpiadas.olimpiadas_backend.service.ParticipanteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participantes")
@CrossOrigin(origins = "*")
public class ParticipanteController {

    private final ParticipanteService participanteService;

    public ParticipanteController(ParticipanteService participanteService) {
        this.participanteService = participanteService;
    }

    @GetMapping
    public List<Participante> listar() {
        return participanteService.listar();
    }

    @PostMapping
    public Participante guardar(@RequestBody Participante participante) {
        return participanteService.guardar(participante);
    }

    @GetMapping("/{id}")
    public Participante buscarPorId(@PathVariable Long id) {
        return participanteService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public Participante actualizar(@PathVariable Long id, @RequestBody Participante participante) {
        return participanteService.actualizar(id, participante);
    }

    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Long id) {
        boolean eliminado = participanteService.eliminar(id);

        if (eliminado) {
            return "Participante eliminado correctamente";
        }

        return "Participante no encontrado";
    }
}
