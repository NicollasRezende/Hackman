package br.gov.df.guiacidadao.model;

public record DetectedIntent(
        String category,
        String cep,
        String cnpj,
        String placa,
        String nis,
        String cidade
) {}
