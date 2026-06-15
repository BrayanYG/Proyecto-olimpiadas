package com.olimpiadas.olimpiadas_backend.repository;

import com.olimpiadas.olimpiadas_backend.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoRepository extends JpaRepository<Evento, Long> {
}
