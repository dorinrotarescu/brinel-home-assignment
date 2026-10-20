package com.acme.helpdesk.data.repository;

import com.acme.helpdesk.data.model.Person;
import com.acme.helpdesk.data.model.PersonRoleEnum;
import jakarta.persistence.QueryHint;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.QueryHints;

import static org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE;
import static org.hibernate.jpa.HibernateHints.HINT_READ_ONLY;

public interface PersonRepository extends JpaRepository<Person, Long> {

    @QueryHints({@QueryHint(name = HINT_READ_ONLY, value = "true"), @QueryHint(name = HINT_FETCH_SIZE, value = "50")})
    List<Person> findAllByOrderByFullNameAsc();

    @QueryHints({@QueryHint(name = HINT_READ_ONLY, value = "true"), @QueryHint(name = HINT_FETCH_SIZE, value = "50")})
    List<Person> findAllByRoleOrderByFullNameAsc(PersonRoleEnum role);
}
