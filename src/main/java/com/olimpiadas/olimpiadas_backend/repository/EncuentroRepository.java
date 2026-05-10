package com.olimpiadas.olimpiadas_backend.repository;

import com.olimpiadas.olimpiadas_backend.model.Encuentro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EncuentroRepository extends JpaRepository<Encuentro, Long> {
    List<Encuentro> findByEventoId(Long eventoId);
}
