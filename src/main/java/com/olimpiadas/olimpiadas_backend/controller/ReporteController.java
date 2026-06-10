package com.olimpiadas.olimpiadas_backend.controller;

import com.olimpiadas.olimpiadas_backend.dto.ReporteEncuentroDTO;
import com.olimpiadas.olimpiadas_backend.dto.ReporteEquipoEventoDTO;
import com.olimpiadas.olimpiadas_backend.dto.ReporteEventoDTO;
import com.olimpiadas.olimpiadas_backend.service.ReporteService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/eventos-realizados")
    public List<ReporteEventoDTO> obtenerEventosRealizados() {
        return reporteService.obtenerEventosRealizados();
    }

    @GetMapping("/equipos-evento")
    public List<ReporteEquipoEventoDTO> obtenerEquiposPorEvento() {
        return reporteService.obtenerEquiposPorEvento();
    }

    @GetMapping("/calendario/{eventoId}")
    public List<ReporteEncuentroDTO> obtenerCalendario(@PathVariable Long eventoId) {
        return reporteService.obtenerCalendario(eventoId);
    }

    @GetMapping("/resultados/{eventoId}")
    public List<ReporteEncuentroDTO> obtenerResultados(@PathVariable Long eventoId) {
        return reporteService.obtenerResultados(eventoId);
    }

    @GetMapping("/exportar/excel")
    public ResponseEntity<byte[]> exportarExcel(@RequestParam String tipo, @RequestParam(required = false) Long eventoId) {
        byte[] excelBytes = reporteService.exportarExcel(tipo, eventoId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Reporte_" + tipo + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }

    @GetMapping("/exportar/pdf")
    public ResponseEntity<byte[]> exportarPDF(@RequestParam String tipo, @RequestParam(required = false) Long eventoId) {
        byte[] pdfBytes = reporteService.exportarPDF(tipo, eventoId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Reporte_" + tipo + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
