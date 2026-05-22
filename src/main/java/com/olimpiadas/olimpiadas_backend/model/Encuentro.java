package com.olimpiadas.olimpiadas_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "encuentros")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Encuentro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "evento_id")
    private Evento evento;

    @ManyToOne
    @JoinColumn(name = "equipo_local_id")
    private Equipo equipoLocal;

    @ManyToOne
    @JoinColumn(name = "equipo_visitante_id")
    private Equipo equipoVisitante;

    private LocalDateTime fechaHora;
    private String lugar;
    private String estado; // PENDIENTE, EN_CURSO, FINALIZADO, CANCELADO

    @OneToOne(mappedBy = "encuentro", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Resultado resultado;
}
