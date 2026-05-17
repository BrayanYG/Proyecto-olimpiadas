package com.olimpiadas.olimpiadas_backend.repository;

import com.olimpiadas.olimpiadas_backend.model.Sorteo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.lang.NonNull;
import java.util.List;

@Repository
public interface SorteoRepository extends JpaRepository<Sorteo, Long> {
    @NonNull
    List<Sorteo> findByEventoId(Long eventoId);
}
