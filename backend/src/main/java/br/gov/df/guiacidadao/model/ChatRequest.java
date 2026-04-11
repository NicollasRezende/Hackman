package br.gov.df.guiacidadao.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank @Size(max = 500) String message,
        String sessionId
) {}
