package com.olimpiadas.olimpiadas_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstitucionRankingDTO {
    private Long id;
    private String nombre;
    private Integer puntos;
    private Boolean oro;
    private Boolean plata;
    private Boolean bronce;
    private String detalles;
}
