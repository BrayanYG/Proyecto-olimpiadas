package com.olimpiadas.olimpiadas_backend.controller;

import com.olimpiadas.olimpiadas_backend.model.Equipo;
import com.olimpiadas.olimpiadas_backend.service.EquipoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipos")
@CrossOrigin(origins = "*")
public class EquipoController {

    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @GetMapping
    public List<Equipo> listar() {
        return equipoService.listar();
    }

    @PostMapping
    public Equipo guardar(@RequestBody @org.springframework.lang.NonNull Equipo equipo) {
        return equipoService.guardar(equipo);
    }

    @GetMapping("/mis-equipos")
    public List<Equipo> listarMisEquipos(@RequestParam @org.springframework.lang.NonNull String username) {
        return equipoService.listarPorCreador(username);
    }

    @PostMapping("/mis-equipos")
    public Equipo guardarMisEquipos(
            @RequestParam @org.springframework.lang.NonNull String username,
            @RequestBody @org.springframework.lang.NonNull Equipo equipo) {
        return equipoService.guardarPorParticipante(equipo, username);
    }

    @GetMapping("/{id}")
    public Equipo buscarPorId(@PathVariable @org.springframework.lang.NonNull Long id) {
        return equipoService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public Equipo actualizar(@PathVariable @org.springframework.lang.NonNull Long id, @RequestBody Equipo equipo) {
        return equipoService.actualizar(id, equipo);
    }

    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable @org.springframework.lang.NonNull Long id) {
        boolean eliminado = equipoService.eliminar(id);

        if (eliminado) {
            return "Equipo eliminado correctamente";
        }

        return "Equipo no encontrado";
    }
}
