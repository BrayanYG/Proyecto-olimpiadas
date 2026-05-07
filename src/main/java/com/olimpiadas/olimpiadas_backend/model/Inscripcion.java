package com.olimpiadas.olimpiadas_backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "inscripciones")
public class Inscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "institucion_id")
    private Institucion institucion;

    @ManyToOne
    @JoinColumn(name = "equipo_id")
    private Equipo equipo;

    private String deporte;
    private String estado;
    private LocalDate fecha;

    public Inscripcion() {
    }

    public Long getId() {
        return id;
    }

    public Institucion getInstitucion() {
        return institucion;
    }

    public Equipo getEquipo() {
        return equipo;
    }

    public String getDeporte() {
        return deporte;
    }

    public String getEstado() {
        return estado;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setInstitucion(Institucion institucion) {
        this.institucion = institucion;
    }

    public void setEquipo(Equipo equipo) {
        this.equipo = equipo;
    }

    public void setDeporte(String deporte) {
        this.deporte = deporte;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }
}
