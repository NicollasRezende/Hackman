package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CnesEstabelecimento(
        @JsonProperty("nome_fantasia") String nomeFantasia,
        @JsonProperty("endereco_estabelecimento") String endereco,
        @JsonProperty("numero_telefone_estabelecimento") String telefone,
        @JsonProperty("descricao_turno_atendimento") String turno,
        @JsonProperty("codigo_tipo_unidade") String tipoUnidade
) {}
