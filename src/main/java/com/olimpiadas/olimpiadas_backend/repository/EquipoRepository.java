package com.olimpiadas.olimpiadas_backend.repository;

import com.olimpiadas.olimpiadas_backend.model.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipoRepository extends JpaRepository<Equipo, Long> {
    long countByCreadorInstitucionId(Long institucionId);
    java.util.List<Equipo> findByCreadorId(Long creadorId);
}
