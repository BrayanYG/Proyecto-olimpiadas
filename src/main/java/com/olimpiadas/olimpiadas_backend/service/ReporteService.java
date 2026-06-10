package com.olimpiadas.olimpiadas_backend.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.olimpiadas.olimpiadas_backend.dto.ReporteEncuentroDTO;
import com.olimpiadas.olimpiadas_backend.dto.ReporteEquipoEventoDTO;
import com.olimpiadas.olimpiadas_backend.dto.ReporteEventoDTO;
import com.olimpiadas.olimpiadas_backend.model.Encuentro;
import com.olimpiadas.olimpiadas_backend.model.Inscripcion;
import com.olimpiadas.olimpiadas_backend.repository.EncuentroRepository;
import com.olimpiadas.olimpiadas_backend.repository.EventoRepository;
import com.olimpiadas.olimpiadas_backend.repository.InscripcionRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.awt.Color;

@Service
public class ReporteService {

    private final EventoRepository eventoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final EncuentroRepository encuentroRepository;

    public ReporteService(EventoRepository eventoRepository, InscripcionRepository inscripcionRepository, EncuentroRepository encuentroRepository) {
        this.eventoRepository = eventoRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.encuentroRepository = encuentroRepository;
    }

    public List<ReporteEventoDTO> obtenerEventosRealizados() {
        return eventoRepository.findAll().stream()
                .filter(e -> "FINALIZADO".equals(e.getEstado()))
                .map(e -> new ReporteEventoDTO(
                        e.getNombre(),
                        e.getDeporte() != null ? e.getDeporte().getNombre() : "N/A",
                        e.getFechaInicio(),
                        e.getFechaFin(),
                        e.getUbicacion()
                )).collect(Collectors.toList());
    }

    public List<ReporteEquipoEventoDTO> obtenerEquiposPorEvento() {
        List<Inscripcion> inscripciones = inscripcionRepository.findAll();
        Map<String, Set<Long>> conteo = new HashMap<>();

        for (Inscripcion ins : inscripciones) {
            if (ins.getEvento() != null && ins.getEquipo() != null) {
                conteo.computeIfAbsent(ins.getEvento().getNombre(), k -> new HashSet<>()).add(ins.getEquipo().getId());
            }
        }

        return conteo.entrySet().stream()
                .map(e -> new ReporteEquipoEventoDTO(e.getKey(), e.getValue().size()))
                .collect(Collectors.toList());
    }

    public List<ReporteEncuentroDTO> obtenerCalendario(Long eventoId) {
        return encuentroRepository.findAll().stream()
                .filter(e -> e.getEvento() != null && e.getEvento().getId().equals(eventoId))
                .map(this::mapToEncuentroDTO)
                .collect(Collectors.toList());
    }

    public List<ReporteEncuentroDTO> obtenerResultados(Long eventoId) {
        return encuentroRepository.findAll().stream()
                .filter(e -> e.getEvento() != null && e.getEvento().getId().equals(eventoId))
                .filter(e -> e.getResultado() != null || "FINALIZADO".equals(e.getEstado()))
                .map(this::mapToEncuentroDTO)
                .collect(Collectors.toList());
    }

    private ReporteEncuentroDTO mapToEncuentroDTO(Encuentro e) {
        ReporteEncuentroDTO dto = new ReporteEncuentroDTO();
        dto.setFechaHora(e.getFechaHora() != null ? e.getFechaHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "N/A");
        dto.setEquipoLocal(e.getEquipoLocal() != null ? e.getEquipoLocal().getNombre() : "Local");
        dto.setEquipoVisitante(e.getEquipoVisitante() != null ? e.getEquipoVisitante().getNombre() : "Visitante");
        dto.setLugar(e.getLugar());
        dto.setEstado(e.getEstado());
        if (e.getResultado() != null) {
            dto.setPuntosLocal(e.getResultado().getPuntosLocal());
            dto.setPuntosVisitante(e.getResultado().getPuntosVisitante());
        }
        return dto;
    }

    // EXPORTACIÓN A EXCEL
    public byte[] exportarExcel(String tipo, Long eventoId) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Reporte");

            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            if ("eventos-realizados".equals(tipo)) {
                String[] headers = {"Nombre", "Deporte", "Fecha Inicio", "Fecha Fin", "Ubicación"};
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }
                int rowIdx = 1;
                for (ReporteEventoDTO ev : obtenerEventosRealizados()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(ev.getNombreEvento());
                    row.createCell(1).setCellValue(ev.getDeporte());
                    row.createCell(2).setCellValue(ev.getFechaInicio() != null ? ev.getFechaInicio().toString() : "");
                    row.createCell(3).setCellValue(ev.getFechaFin() != null ? ev.getFechaFin().toString() : "");
                    row.createCell(4).setCellValue(ev.getUbicacion());
                }
            } else if ("equipos-evento".equals(tipo)) {
                String[] headers = {"Evento", "Cantidad Equipos"};
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }
                int rowIdx = 1;
                for (ReporteEquipoEventoDTO eq : obtenerEquiposPorEvento()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(eq.getEvento());
                    row.createCell(1).setCellValue(eq.getCantidadEquipos());
                }
            } else if ("calendario".equals(tipo) || "resultados".equals(tipo)) {
                String[] headers = {"Fecha y Hora", "Equipo Local", "Equipo Visitante", "Lugar", "Estado", "Puntos Local", "Puntos Vis."};
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }
                int rowIdx = 1;
                List<ReporteEncuentroDTO> data = "calendario".equals(tipo) ? obtenerCalendario(eventoId) : obtenerResultados(eventoId);
                for (ReporteEncuentroDTO enc : data) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(enc.getFechaHora());
                    row.createCell(1).setCellValue(enc.getEquipoLocal());
                    row.createCell(2).setCellValue(enc.getEquipoVisitante());
                    row.createCell(3).setCellValue(enc.getLugar());
                    row.createCell(4).setCellValue(enc.getEstado());
                    if (enc.getPuntosLocal() != null) row.createCell(5).setCellValue(enc.getPuntosLocal());
                    if (enc.getPuntosVisitante() != null) row.createCell(6).setCellValue(enc.getPuntosVisitante());
                }
            }

            for (int i = 0; i < 7; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error exportando a Excel", e);
        }
    }

    // EXPORTACIÓN A PDF
    public byte[] exportarPDF(String tipo, Long eventoId) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Reporte del Sistema", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = null;

            if ("eventos-realizados".equals(tipo)) {
                table = new PdfPTable(5);
                table.setWidthPercentage(100);
                addTableHeader(table, "Nombre", "Deporte", "Fecha Inicio", "Fecha Fin", "Ubicación");
                for (ReporteEventoDTO ev : obtenerEventosRealizados()) {
                    table.addCell(ev.getNombreEvento());
                    table.addCell(ev.getDeporte());
                    table.addCell(ev.getFechaInicio() != null ? ev.getFechaInicio().toString() : "");
                    table.addCell(ev.getFechaFin() != null ? ev.getFechaFin().toString() : "");
                    table.addCell(ev.getUbicacion());
                }
            } else if ("equipos-evento".equals(tipo)) {
                table = new PdfPTable(2);
                table.setWidthPercentage(100);
                addTableHeader(table, "Evento", "Cantidad Equipos");
                for (ReporteEquipoEventoDTO eq : obtenerEquiposPorEvento()) {
                    table.addCell(eq.getEvento());
                    table.addCell(String.valueOf(eq.getCantidadEquipos()));
                }
            } else if ("calendario".equals(tipo) || "resultados".equals(tipo)) {
                table = new PdfPTable(7);
                table.setWidthPercentage(100);
                addTableHeader(table, "Fecha", "Local", "Visitante", "Lugar", "Estado", "Pts L", "Pts V");
                List<ReporteEncuentroDTO> data = "calendario".equals(tipo) ? obtenerCalendario(eventoId) : obtenerResultados(eventoId);
                for (ReporteEncuentroDTO enc : data) {
                    table.addCell(enc.getFechaHora());
                    table.addCell(enc.getEquipoLocal());
                    table.addCell(enc.getEquipoVisitante());
                    table.addCell(enc.getLugar());
                    table.addCell(enc.getEstado());
                    table.addCell(enc.getPuntosLocal() != null ? String.valueOf(enc.getPuntosLocal()) : "-");
                    table.addCell(enc.getPuntosVisitante() != null ? String.valueOf(enc.getPuntosVisitante()) : "-");
                }
            }

            if (table != null) {
                document.add(table);
            }
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error exportando a PDF", e);
        }
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell();
            cell.setBackgroundColor(new Color(173, 0, 23)); // Color Primary
            cell.setPadding(5);
            cell.setPhrase(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE)));
            table.addCell(cell);
        }
    }
}
