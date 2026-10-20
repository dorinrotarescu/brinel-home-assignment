package com.acme.helpdesk.api;

import com.acme.helpdesk.data.dto.PersonDto;
import com.acme.helpdesk.data.model.PersonRoleEnum;
import com.acme.helpdesk.service.PersonService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("${helpdesk.api.base-path}/persons")
public class PersonController {

    private final PersonService personService;

    @GetMapping
    public ResponseEntity<List<PersonDto>> getPersons(@RequestParam(required = false) PersonRoleEnum role) {
        return ResponseEntity.ok(personService.getPersons(role));
    }
}
