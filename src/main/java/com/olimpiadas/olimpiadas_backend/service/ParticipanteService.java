package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Participante;
import com.olimpiadas.olimpiadas_backend.repository.ParticipanteRepository;
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

    public Participante guardar(Participante participante) {
        return participanteRepository.save(participante);
    }

    public Participante buscarPorId(Long id) {
        return participanteRepository.findById(id).orElse(null);
    }

    public Participante actualizar(Long id, Participante datos) {
        Participante participante = buscarPorId(id);

        if (participante == null) {
            return null;
        }

        participante.setNombres(datos.getNombres());
        participante.setApellidos(datos.getApellidos());
        participante.setDni(datos.getDni());
        participante.setEdad(datos.getEdad());
        participante.setEquipo(datos.getEquipo());

        return participanteRepository.save(participante);
    }

    public boolean eliminar(Long id) {
        Participante participante = buscarPorId(id);

        if (participante == null) {
            return false;
        }

        participanteRepository.delete(participante);
        return true;
    }
}
