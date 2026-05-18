package com.olimpiadas.olimpiadas_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "resultados")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resultado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "encuentro_id")
    private Encuentro encuentro;

    private Integer puntosLocal;
    private Integer puntosVisitante;

    private String observaciones;
}
