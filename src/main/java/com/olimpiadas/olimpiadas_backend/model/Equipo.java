package com.olimpiadas.olimpiadas_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "equipos")
@Data
@NoArgsConstructor
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String categoria;

    @ManyToOne
    @JoinColumn(name = "deporte_id")
    private Deporte deporte;

    @ManyToOne
    @JoinColumn(name = "institucion_id")
    private Institucion institucion;
}
