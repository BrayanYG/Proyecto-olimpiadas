package com.olimpiadas.olimpiadas_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "participantes")
@Data
@NoArgsConstructor
public class Participante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombres;
    private String apellidos;
    private String dni;
    private Integer edad;

    @ManyToOne
    @JoinColumn(name = "equipo_id")
    private Equipo equipo;
}
