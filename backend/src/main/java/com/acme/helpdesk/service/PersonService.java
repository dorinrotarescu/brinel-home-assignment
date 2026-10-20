package com.acme.helpdesk.service;

import com.acme.helpdesk.data.dto.PersonDto;
import com.acme.helpdesk.data.mapper.PersonMapper;
import com.acme.helpdesk.data.model.Person;
import com.acme.helpdesk.data.model.PersonRoleEnum;
import com.acme.helpdesk.data.repository.PersonRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PersonService {

    private final PersonRepository personRepository;
    private final PersonMapper personMapper;

    @Transactional(readOnly = true)
    public List<PersonDto> getPersons(PersonRoleEnum role) {
        List<Person> persons = role == null
                ? personRepository.findAllByOrderByFullNameAsc()
                : personRepository.findAllByRoleOrderByFullNameAsc(role);
        return personMapper.toDtos(persons);
    }
}
