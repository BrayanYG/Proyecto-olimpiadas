package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Inscripcion;
import com.olimpiadas.olimpiadas_backend.repository.InscripcionRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InscripcionService {

    private final InscripcionRepository inscripcionRepository;

    public InscripcionService(InscripcionRepository inscripcionRepository) {
        this.inscripcionRepository = inscripcionRepository;
    }

    public List<Inscripcion> listar() {
        return inscripcionRepository.findAll();
    }

    @NonNull
    public Inscripcion guardar(@NonNull Inscripcion inscripcion) {
        return inscripcionRepository.save(inscripcion);
    }
}
