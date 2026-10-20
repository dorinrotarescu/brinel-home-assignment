package com.acme.helpdesk.data.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "T_HD_TICKET")
public class Ticket {

    @Id
    @EqualsAndHashCode.Include
    @SequenceGenerator(name = "ticketIdGenerator", sequenceName = "SQ_HD_TICKET", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ticketIdGenerator")
    @Column(name = "PK_ID")
    private Long id;

    @Column(name = "TITLE")
    private String title;

    @Column(name = "DESCRIPTION")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private TicketStatusEnum status;

    @Enumerated(EnumType.STRING)
    @Column(name = "PRIORITY")
    private TicketPriorityEnum priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "CATEGORY")
    private TicketCategoryEnum category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FK_ID_REQUESTER")
    private Person requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FK_ID_ASSIGNEE")
    private Person assignee;

    @CreationTimestamp
    @Column(name = "DATE_CREATED")
    private LocalDateTime createdDate;

    @UpdateTimestamp
    @Column(name = "DATE_UPDATED")
    private LocalDateTime updatedDate;
}
