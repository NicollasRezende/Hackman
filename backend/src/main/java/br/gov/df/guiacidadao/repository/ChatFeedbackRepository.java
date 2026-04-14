package br.gov.df.guiacidadao.repository;

import br.gov.df.guiacidadao.entity.ChatFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChatFeedbackRepository extends JpaRepository<ChatFeedback, Long> {

    long countByVote(String vote);

    @Query("select c.category, f.vote, count(f) from ChatFeedback f "
            + "join ChatLog c on f.responseId = c.responseId "
            + "where c.category is not null group by c.category, f.vote")
    List<Object[]> countFeedbackVotesByCategory();
}
