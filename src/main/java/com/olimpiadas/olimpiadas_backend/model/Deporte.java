package com.olimpiadas.olimpiadas_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "deportes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Deporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    private String tipo;

    private String reglas;

    @Column(name = "max_participantes")
    private Integer maxParticipantes;
}
