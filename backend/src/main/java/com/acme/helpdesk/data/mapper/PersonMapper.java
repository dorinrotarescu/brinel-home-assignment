package com.acme.helpdesk.data.mapper;

import com.acme.helpdesk.data.dto.PersonDto;
import com.acme.helpdesk.data.model.Person;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PersonMapper {

    PersonDto toDto(Person person);

    List<PersonDto> toDtos(List<Person> persons);
}
