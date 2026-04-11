package br.gov.df.guiacidadao.repository;

import br.gov.df.guiacidadao.entity.ChatFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatFeedbackRepository extends JpaRepository<ChatFeedback, Long> {}
