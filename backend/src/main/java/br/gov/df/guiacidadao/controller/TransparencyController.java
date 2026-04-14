package br.gov.df.guiacidadao.controller;

import br.gov.df.guiacidadao.model.MetricsSummary;
import br.gov.df.guiacidadao.service.MetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transparency")
public class TransparencyController {

    private final MetricsService metricsService;

    public TransparencyController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<MetricsSummary> summary() {
        return ResponseEntity.ok(metricsService.summary());
    }
}
