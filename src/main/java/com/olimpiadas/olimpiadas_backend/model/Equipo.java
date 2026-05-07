package com.olimpiadas.olimpiadas_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "equipos")
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String categoria;
    private String deporte;

    @ManyToOne
    @JoinColumn(name = "institucion_id")
    private Institucion institucion;

    public Equipo() {
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getCategoria() {
        return categoria;
    }

    public String getDeporte() {
        return deporte;
    }

    public Institucion getInstitucion() {
        return institucion;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public void setDeporte(String deporte) {
        this.deporte = deporte;
    }

    public void setInstitucion(Institucion institucion) {
        this.institucion = institucion;
    }
}
