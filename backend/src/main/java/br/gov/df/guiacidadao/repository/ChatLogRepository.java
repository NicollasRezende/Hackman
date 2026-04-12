package br.gov.df.guiacidadao.repository;

import br.gov.df.guiacidadao.entity.ChatLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChatLogRepository extends JpaRepository<ChatLog, Long> {

    @Query("SELECT COALESCE(AVG(c.processingMs), 0) FROM ChatLog c WHERE c.processingMs IS NOT NULL")
    Double averageProcessingMs();

    @Query("SELECT c.category, COUNT(c) FROM ChatLog c GROUP BY c.category ORDER BY COUNT(c) DESC")
    List<Object[]> countByCategory();

    long countByCategory(String category);
}
