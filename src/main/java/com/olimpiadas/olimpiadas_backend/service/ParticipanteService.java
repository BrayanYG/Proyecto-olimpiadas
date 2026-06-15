package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Participante;
import com.olimpiadas.olimpiadas_backend.model.Institucion;
import com.olimpiadas.olimpiadas_backend.repository.ParticipanteRepository;
import com.olimpiadas.olimpiadas_backend.repository.InstitucionRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipanteService {

    private final ParticipanteRepository participanteRepository;
    private final InstitucionRepository institucionRepository;

    public ParticipanteService(ParticipanteRepository participanteRepository,
            InstitucionRepository institucionRepository) {
        this.participanteRepository = participanteRepository;
        this.institucionRepository = institucionRepository;
    }

    public List<Participante> buscarPorEquipo(Long equipoId) {
        return participanteRepository.findByEquipoId(equipoId);
    }

    public List<Participante> listar() {
        return participanteRepository.findAll();
    }

    public List<Participante> listarPorCreadorOElMismo(@NonNull String username) {
        Participante p = buscarPorUsername(username);

        if (p == null || p.getInstitucion() == null) {
            return List.of();
        }

        return participanteRepository.findByInstitucionDirectaOEquipo(
                p.getInstitucion().getId());
    }

    @NonNull
    public Participante guardar(@NonNull Participante participante) {
        if (participanteRepository.existsByDni(participante.getDni())) {
            throw new RuntimeException("Ya existe un participante con ese DNI");
        }

        return participanteRepository.save(participante);
    }

    @NonNull
    public Participante guardarPorParticipante(@NonNull Participante nuevo, @NonNull String usernameCreador) {
        Participante creador = buscarPorUsername(usernameCreador);

        if (creador == null) {
            throw new RuntimeException("Participante logueado no encontrado");
        }

        if (participanteRepository.existsByDni(nuevo.getDni())) {
            throw new RuntimeException("Ya existe un participante con ese DNI");
        }

        nuevo.setCreador(creador);
        nuevo.setInstitucion(creador.getInstitucion());

        return participanteRepository.save(nuevo);
    }

    public Participante buscarPorId(@NonNull Long id) {
        return participanteRepository.findById(id).orElse(null);
    }

    public Participante buscarPorUsername(@NonNull String username) {
        return participanteRepository.findByUsuarioUsername(username).orElse(null);
    }

    @NonNull
    public Participante actualizar(@NonNull Long id, @NonNull Participante datos) {
        Participante participante = buscarPorId(id);

        if (participante == null) {
            throw new RuntimeException("Participante no encontrado");
        }

        if (participanteRepository.existsByDniAndIdNot(datos.getDni(), id)) {
            throw new RuntimeException("Ya existe un participante con ese DNI");
        }

        participante.setNombres(datos.getNombres());
        participante.setApellidos(datos.getApellidos());
        participante.setDni(datos.getDni());
        participante.setEdad(datos.getEdad());
        participante.setCorreo(datos.getCorreo());
        participante.setTelefono(datos.getTelefono());
        participante.setEquipo(datos.getEquipo());

        if (datos.getInstitucion() != null) {
            participante.setInstitucion(datos.getInstitucion());
        }

        return participanteRepository.save(participante);
    }

    @NonNull
    public Participante actualizarInstitucion(@NonNull String username, Long institucionId) {
        Participante participante = buscarPorUsername(username);

        if (participante == null) {
            throw new RuntimeException("Participante no encontrado para el usuario: " + username);
        }

        if (institucionId == null) {
            participante.setInstitucion(null);
        } else {
            Institucion institucion = institucionRepository.findById(institucionId)
                    .orElseThrow(() -> new RuntimeException("Institución no encontrada"));
            participante.setInstitucion(institucion);
        }

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
