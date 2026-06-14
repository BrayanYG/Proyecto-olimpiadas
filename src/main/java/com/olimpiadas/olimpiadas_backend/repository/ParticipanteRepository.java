package com.olimpiadas.olimpiadas_backend.repository;

import com.olimpiadas.olimpiadas_backend.model.Participante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface ParticipanteRepository extends JpaRepository<Participante, Long> {
    Optional<Participante> findByUsuarioUsername(String username);
    long countByInstitucionId(Long institucionId);

    @Query("SELECT p FROM Participante p WHERE p.id = :creadorId OR p.creador.id = :creadorId")
    List<Participante> findByCreadorIdOrId(@Param("creadorId") Long creadorId);
}
