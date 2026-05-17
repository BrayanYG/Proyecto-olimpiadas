package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Participante;
import com.olimpiadas.olimpiadas_backend.repository.ParticipanteRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipanteService {

    private final ParticipanteRepository participanteRepository;

    public ParticipanteService(ParticipanteRepository participanteRepository) {
        this.participanteRepository = participanteRepository;
    }

    public List<Participante> listar() {
        return participanteRepository.findAll();
    }

    @NonNull
    public Participante guardar(@NonNull Participante participante) {
        return participanteRepository.save(participante);
    }

    public Participante buscarPorId(@NonNull Long id) {
        return participanteRepository.findById(id).orElse(null);
    }

    @NonNull
    public Participante actualizar(@NonNull Long id, @NonNull Participante datos) {
        Participante participante = buscarPorId(id);

        if (participante == null) {
            throw new RuntimeException("Participante no encontrado");
        }

        participante.setNombres(datos.getNombres());
        participante.setApellidos(datos.getApellidos());
        participante.setDni(datos.getDni());
        participante.setEdad(datos.getEdad());
        participante.setEquipo(datos.getEquipo());

        return participanteRepository.save(participante);
    }

    public boolean eliminar(@NonNull Long id) {
        Participante participante = buscarPorId(id);

        if (participante == null) {
            return false;
        }

        participanteRepository.delete(participante);
        return true;
    }
}
