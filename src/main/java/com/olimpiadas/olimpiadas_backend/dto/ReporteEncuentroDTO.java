package com.olimpiadas.olimpiadas_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteEncuentroDTO {
    private String fechaHora;
    private String equipoLocal;
    private String equipoVisitante;
    private String lugar;
    private String estado;
    
    // Solo para resultados
    private Integer puntosLocal;
    private Integer puntosVisitante;
}
