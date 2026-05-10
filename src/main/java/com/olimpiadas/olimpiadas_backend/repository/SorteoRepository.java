package com.olimpiadas.olimpiadas_backend.repository;

import com.olimpiadas.olimpiadas_backend.model.Sorteo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SorteoRepository extends JpaRepository<Sorteo, Long> {
    List<Sorteo> findByEventoId(Long eventoId);
}
