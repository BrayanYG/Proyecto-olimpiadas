package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Equipo;
import com.olimpiadas.olimpiadas_backend.repository.EquipoRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final ParticipanteService participanteService;

    public EquipoService(EquipoRepository equipoRepository, ParticipanteService participanteService) {
        this.equipoRepository = equipoRepository;
        this.participanteService = participanteService;
    }

    public List<Equipo> listar() {
        return equipoRepository.findAll();
    }

    public List<Equipo> listarPorCreador(String username) {
        com.olimpiadas.olimpiadas_backend.model.Participante participante = participanteService
                .buscarPorUsername(username);

        if (participante == null || participante.getInstitucion() == null) {
            return List.of();
        }

        return equipoRepository.findByInstitucionId(
                participante.getInstitucion().getId());
    }

    @NonNull
    public Equipo guardar(@NonNull Equipo equipo) {
        return equipoRepository.save(equipo);
    }

    @NonNull
    public Equipo guardarPorParticipante(@NonNull Equipo nuevo, @NonNull String usernameCreador) {
        com.olimpiadas.olimpiadas_backend.model.Participante creador = participanteService
                .buscarPorUsername(usernameCreador);

        if (creador == null) {
            throw new RuntimeException("Participante logueado no encontrado");
        }

        if (creador.getInstitucion() == null) {
            throw new RuntimeException("El participante no tiene institución asignada");
        }

        nuevo.setCreador(creador);
        nuevo.setInstitucion(creador.getInstitucion());

        return equipoRepository.save(nuevo);
    }

    public Equipo buscarPorId(@NonNull Long id) {
        return equipoRepository.findById(id).orElse(null);
    }

    public Equipo actualizar(@NonNull Long id, Equipo datos) {
        Equipo equipo = buscarPorId(id);

        if (equipo == null) {
            return null;
        }

        equipo.setNombre(datos.getNombre());
        equipo.setCategoria(datos.getCategoria());
        equipo.setDeporte(datos.getDeporte());

        return equipoRepository.save(equipo);
    }

    public boolean eliminar(@NonNull Long id) {
        Equipo equipo = buscarPorId(id);

        if (equipo == null) {
            return false;
        }

        List<com.olimpiadas.olimpiadas_backend.model.Participante> miembros = participanteService.buscarPorEquipo(id);
        for (com.olimpiadas.olimpiadas_backend.model.Participante p : miembros) {
            p.setEquipo(null);
            participanteService.guardar(p);
        }

        equipoRepository.delete(equipo);
        return true;
    }
}
