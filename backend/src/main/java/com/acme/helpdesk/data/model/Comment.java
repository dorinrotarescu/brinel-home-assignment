package com.acme.helpdesk.data.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "T_HD_COMMENT")
public class Comment {

    @Id
    @EqualsAndHashCode.Include
    @SequenceGenerator(name = "commentIdGenerator", sequenceName = "SQ_HD_COMMENT", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "commentIdGenerator")
    @Column(name = "PK_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FK_ID_TICKET")
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FK_ID_AUTHOR")
    private Person author;

    @Column(name = "CONTENT")
    private String content;

    @CreationTimestamp
    @Column(name = "DATE_CREATED")
    private LocalDateTime createdDate;
}
