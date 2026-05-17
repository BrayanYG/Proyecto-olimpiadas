package com.olimpiadas.olimpiadas_backend.controller;

import com.olimpiadas.olimpiadas_backend.model.Institucion;
import com.olimpiadas.olimpiadas_backend.service.InstitucionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instituciones")
@CrossOrigin(origins = "*")
public class InstitucionController {

    private final InstitucionService institucionService;

    public InstitucionController(InstitucionService institucionService) {
        this.institucionService = institucionService;
    }

    @GetMapping
    public List<Institucion> listar() {
        return institucionService.listar();
    }

    @PostMapping
    public Institucion guardar(@RequestBody @org.springframework.lang.NonNull Institucion institucion) {
        return institucionService.guardar(institucion);
    }

    @GetMapping("/{id}")
    public Institucion buscarPorId(@PathVariable @org.springframework.lang.NonNull Long id) {
        return institucionService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public Institucion actualizar(@PathVariable @org.springframework.lang.NonNull Long id, @RequestBody @org.springframework.lang.NonNull Institucion institucion) {
        return institucionService.actualizar(id, institucion);
    }

    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable @org.springframework.lang.NonNull Long id) {
        boolean eliminado = institucionService.eliminar(id);

        if (eliminado) {
            return "Institución eliminada correctamente";
        }

        return "Institución no encontrada";
    }
}
