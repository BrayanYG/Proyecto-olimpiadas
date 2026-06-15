package com.olimpiadas.olimpiadas_backend.repository;

import com.olimpiadas.olimpiadas_backend.model.Resultado;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResultadoRepository extends JpaRepository<Resultado, Long> {
}
