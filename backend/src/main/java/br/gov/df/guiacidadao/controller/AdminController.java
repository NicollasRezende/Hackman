package br.gov.df.guiacidadao.controller;

import br.gov.df.guiacidadao.model.dto.AdminMetricsDTO;
import br.gov.df.guiacidadao.service.AdminMetricsBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminMetricsBuilder adminMetricsBuilder;

    public AdminController(AdminMetricsBuilder adminMetricsBuilder) {
        this.adminMetricsBuilder = adminMetricsBuilder;
    }

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsDTO> metrics() {
        return ResponseEntity.ok(adminMetricsBuilder.build());
    }

    @GetMapping(value = "/metrics/export.csv", produces = "text/csv; charset=UTF-8")
    public ResponseEntity<byte[]> exportMetricsCsv() {
        AdminMetricsDTO dto = adminMetricsBuilder.build();
        byte[] body = adminMetricsBuilder.buildCsv(dto).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"guia-cidadao-metricas-agregadas.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(body);
    }
}
