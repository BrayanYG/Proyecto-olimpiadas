package com.olimpiadas.olimpiadas_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteEventoDTO {
    private String nombreEvento;
    private String deporte;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String ubicacion;
}
