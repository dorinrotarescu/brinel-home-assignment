package com.acme.helpdesk.data.repository;

import com.acme.helpdesk.data.model.Ticket;
import com.acme.helpdesk.data.model.TicketPriorityEnum;
import com.acme.helpdesk.data.model.TicketStatusEnum;
import jakarta.persistence.QueryHint;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;

import static org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE;
import static org.hibernate.jpa.HibernateHints.HINT_READ_ONLY;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @EntityGraph(attributePaths = {"requester", "assignee"})
    @QueryHints({@QueryHint(name = HINT_READ_ONLY, value = "true"), @QueryHint(name = HINT_FETCH_SIZE, value = "50")})
    @Query("""
            SELECT t FROM Ticket t
            WHERE (:status IS NULL OR t.status = :status)
              AND (:priority IS NULL OR t.priority = :priority)
              AND (:text IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :text, '%')))
            """)
    Page<Ticket> search(TicketStatusEnum status, TicketPriorityEnum priority, String text, Pageable pageable);

    @EntityGraph(attributePaths = {"requester", "assignee"})
    Optional<Ticket> findWithPersonsById(Long id);
}
