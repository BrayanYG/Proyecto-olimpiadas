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
    public Participante guardar(@RequestBody @org.springframework.lang.NonNull Participante participante) {
        return participanteService.guardar(participante);
    }

    @GetMapping("/{id}")
    public Participante buscarPorId(@PathVariable @org.springframework.lang.NonNull Long id) {
        return participanteService.buscarPorId(id);
    }

    @GetMapping("/mis-participantes")
    public List<Participante> listarMisParticipantes(@RequestParam @org.springframework.lang.NonNull String username) {
        return participanteService.listarPorCreadorOElMismo(username);
    }

    @PostMapping("/mis-participantes")
    public Participante guardarMisParticipantes(
            @RequestParam @org.springframework.lang.NonNull String username,
            @RequestBody @org.springframework.lang.NonNull Participante participante) {
        return participanteService.guardarPorParticipante(participante, username);
    }

    @PutMapping("/{id}")
    public Participante actualizar(@PathVariable @org.springframework.lang.NonNull Long id,
            @RequestBody @org.springframework.lang.NonNull Participante participante) {
        return participanteService.actualizar(id, participante);
    }

    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable @org.springframework.lang.NonNull Long id) {
        boolean eliminado = participanteService.eliminar(id);

        if (eliminado) {
            return "Participante eliminado correctamente";
        }

        return "Participante no encontrado";
    }

    @GetMapping("/perfil")
    public Participante obtenerPerfil(@RequestParam @org.springframework.lang.NonNull String username) {
        return participanteService.buscarPorUsername(username);
    }

    @PutMapping("/perfil/institucion")
    public Participante actualizarInstitucion(@RequestBody java.util.Map<String, Object> payload) {
        String username = (String) payload.get("username");
        Object institucionIdObj = payload.get("institucionId");
        Long institucionId = null;
        if (institucionIdObj != null) {
            institucionId = Long.valueOf(institucionIdObj.toString());
        }
        return participanteService.actualizarInstitucion(username, institucionId);
    }
}
