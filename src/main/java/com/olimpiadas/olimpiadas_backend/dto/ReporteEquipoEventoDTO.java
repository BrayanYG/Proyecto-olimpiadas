package com.olimpiadas.olimpiadas_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteEquipoEventoDTO {
    private String evento;
    private Integer cantidadEquipos;
}
