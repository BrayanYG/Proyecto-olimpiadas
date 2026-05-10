package com.olimpiadas.olimpiadas_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sorteos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sorteo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "evento_id")
    private Evento evento;

    @ManyToOne
    @JoinColumn(name = "equipo_id")
    private Equipo equipo;

    private String grupo; // A, B, C, etc.
}
