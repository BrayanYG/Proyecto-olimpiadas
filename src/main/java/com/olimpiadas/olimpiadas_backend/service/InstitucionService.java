package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Institucion;
import com.olimpiadas.olimpiadas_backend.repository.InstitucionRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitucionService {

    private final InstitucionRepository institucionRepository;

    public InstitucionService(InstitucionRepository institucionRepository) {
        this.institucionRepository = institucionRepository;
    }

    public List<Institucion> listar() {
        return institucionRepository.findAll();
    }

    @NonNull
    public Institucion guardar(@NonNull Institucion institucion) {
        return institucionRepository.save(institucion);
    }

    public Institucion buscarPorId(Long id) {
        return institucionRepository.findById(id).orElse(null);
    }

    @NonNull
    public Institucion actualizar(Long id, @NonNull Institucion datos) {
        Institucion institucion = buscarPorId(id);

        if (institucion == null) {
            throw new RuntimeException("Institucion no encontrada");
        }

        institucion.setNombre(datos.getNombre());
        institucion.setDireccion(datos.getDireccion());
        institucion.setTelefono(datos.getTelefono());

        return institucionRepository.save(institucion);
    }

    public boolean eliminar(Long id) {
        Institucion institucion = buscarPorId(id);

        if (institucion == null) {
            return false;
        }

        institucionRepository.delete(institucion);
        return true;
    }
}
