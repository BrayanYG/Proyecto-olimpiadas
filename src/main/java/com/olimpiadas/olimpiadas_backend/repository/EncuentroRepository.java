package com.olimpiadas.olimpiadas_backend.repository;

import com.olimpiadas.olimpiadas_backend.model.Encuentro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EncuentroRepository extends JpaRepository<Encuentro, Long> {
    List<Encuentro> findByEventoId(Long eventoId);
}
