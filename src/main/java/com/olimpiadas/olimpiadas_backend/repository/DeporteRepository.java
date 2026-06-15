package com.olimpiadas.olimpiadas_backend.repository;

import com.olimpiadas.olimpiadas_backend.model.Deporte;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeporteRepository extends JpaRepository<Deporte, Long> {
}
