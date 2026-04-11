package br.gov.df.guiacidadao.repository;

import br.gov.df.guiacidadao.entity.ChatLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatLogRepository extends JpaRepository<ChatLog, Long> {}
