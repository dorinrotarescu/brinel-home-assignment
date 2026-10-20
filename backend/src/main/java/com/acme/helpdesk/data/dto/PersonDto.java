package com.acme.helpdesk.data.dto;

import com.acme.helpdesk.data.model.PersonRoleEnum;

public record PersonDto(Long id, String fullName, String email, PersonRoleEnum role) {
}
