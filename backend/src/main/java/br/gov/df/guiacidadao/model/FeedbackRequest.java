package br.gov.df.guiacidadao.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record FeedbackRequest(
        @NotBlank String responseId,
        String sessionId,
        @NotBlank @Pattern(regexp = "positive|negative") String vote
) {}
