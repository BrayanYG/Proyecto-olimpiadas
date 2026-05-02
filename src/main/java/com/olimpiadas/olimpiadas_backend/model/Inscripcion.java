package com.olimpiadas.olimpiadas_backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "inscripciones")
public class Inscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String institucion;
    private String equipo;
    private String deporte;
    private String estado;
    private LocalDate fecha;

    public Inscripcion() {}

    public Long getId() { return id; }

    public String getInstitucion() { return institucion; }

    public String getEquipo() { return equipo; }

    public String getDeporte() { return deporte; }

    public String getEstado() { return estado; }

    public LocalDate getFecha() { return fecha; }

    public void setId(Long id) { this.id = id; }

    public void setInstitucion(String institucion) { this.institucion = institucion; }

    public void setEquipo(String equipo) { this.equipo = equipo; }

    public void setDeporte(String deporte) { this.deporte = deporte; }

    public void setEstado(String estado) { this.estado = estado; }

    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
}
