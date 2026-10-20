package com.acme.helpdesk.data.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "T_HD_PERSON")
public class Person {

    @Id
    @EqualsAndHashCode.Include
    @SequenceGenerator(name = "personIdGenerator", sequenceName = "SQ_HD_PERSON", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "personIdGenerator")
    @Column(name = "PK_ID")
    private Long id;

    @Column(name = "FULL_NAME")
    private String fullName;

    @Column(name = "EMAIL")
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE")
    private PersonRoleEnum role;
}
