package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Encuentro;
import com.olimpiadas.olimpiadas_backend.model.Equipo;
import com.olimpiadas.olimpiadas_backend.model.Institucion;
import com.olimpiadas.olimpiadas_backend.model.InstitucionRankingDTO;
import com.olimpiadas.olimpiadas_backend.repository.EncuentroRepository;
import com.olimpiadas.olimpiadas_backend.repository.InstitucionRepository;
import com.olimpiadas.olimpiadas_backend.repository.EquipoRepository;
import com.olimpiadas.olimpiadas_backend.repository.ParticipanteRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InstitucionService {

    private final InstitucionRepository institucionRepository;
    private final EncuentroRepository encuentroRepository;
    private final EquipoRepository equipoRepository;
    private final ParticipanteRepository participanteRepository;

    public InstitucionService(InstitucionRepository institucionRepository, EncuentroRepository encuentroRepository, EquipoRepository equipoRepository, ParticipanteRepository participanteRepository) {
        this.institucionRepository = institucionRepository;
        this.encuentroRepository = encuentroRepository;
        this.equipoRepository = equipoRepository;
        this.participanteRepository = participanteRepository;
    }

    public Map<String, Long> obtenerEstadisticas(Long id) {
        long equipos = equipoRepository.countByInstitucionId(id);
        long participantes = participanteRepository.countByInstitucionId(id);
        Map<String, Long> stats = new HashMap<>();
        stats.put("equipos", equipos);
        stats.put("participantes", participantes);
        return stats;
    }

    public List<InstitucionRankingDTO> obtenerRanking() {
        List<Institucion> instituciones = institucionRepository.findAll();
        List<Encuentro> encuentros = encuentroRepository.findAll();

        Map<Long, Integer> pointsMap = new HashMap<>();
        for (Institucion inst : instituciones) {
            pointsMap.put(inst.getId(), 0);
        }

        for (Encuentro encuentro : encuentros) {
            if ("FINALIZADO".equalsIgnoreCase(encuentro.getEstado()) && encuentro.getResultado() != null) {
                Integer pLocal = encuentro.getResultado().getPuntosLocal();
                Integer pVisitante = encuentro.getResultado().getPuntosVisitante();
                if (pLocal == null) pLocal = 0;
                if (pVisitante == null) pVisitante = 0;

                Equipo winnerEquipo = null;
                if (pLocal > pVisitante) {
                    winnerEquipo = encuentro.getEquipoLocal();
                } else if (pVisitante > pLocal) {
                    winnerEquipo = encuentro.getEquipoVisitante();
                }

                if (winnerEquipo != null && winnerEquipo.getInstitucion() != null) {
                    Long instId = winnerEquipo.getInstitucion().getId();
                    if (instId != null) {
                        pointsMap.put(instId, pointsMap.getOrDefault(instId, 0) + 1);
                    }
                }
            }
        }

        List<InstitucionRankingDTO> rankingList = new ArrayList<>();
        for (Institucion inst : instituciones) {
            int puntos = pointsMap.getOrDefault(inst.getId(), 0);
            InstitucionRankingDTO dto = new InstitucionRankingDTO(
                inst.getId(),
                inst.getNombre(),
                puntos,
                puntos >= 2,
                puntos == 1,
                false,
                inst.getDireccion() != null && !inst.getDireccion().trim().isEmpty() ? inst.getDireccion() : "Sede Olímpica"
            );
            rankingList.add(dto);
        }

        // Ordenar descendente por puntos, y alfabéticamente si empatan
        rankingList.sort((a, b) -> {
            if (!a.getPuntos().equals(b.getPuntos())) {
                return b.getPuntos().compareTo(a.getPuntos());
            }
            return a.getNombre().compareToIgnoreCase(b.getNombre());
        });

        return rankingList;
    }

    public List<Institucion> listar() {
        return institucionRepository.findAll();
    }

    @NonNull
    public Institucion guardar(@NonNull Institucion institucion) {
        return institucionRepository.save(institucion);
    }

    public Institucion buscarPorId(@NonNull Long id) {
        return institucionRepository.findById(id).orElse(null);
    }

    @NonNull
    public Institucion actualizar(@NonNull Long id, @NonNull Institucion datos) {
        Institucion institucion = buscarPorId(id);

        if (institucion == null) {
            throw new RuntimeException("Institucion no encontrada");
        }

        institucion.setNombre(datos.getNombre());
        institucion.setDireccion(datos.getDireccion());
        institucion.setTelefono(datos.getTelefono());
        institucion.setSiglas(datos.getSiglas());

        return institucionRepository.save(institucion);
    }

    public boolean eliminar(@NonNull Long id) {
        Institucion institucion = buscarPorId(id);

        if (institucion == null) {
            return false;
        }

        institucionRepository.delete(institucion);
        return true;
    }
}
