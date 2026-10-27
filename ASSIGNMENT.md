# Assignment: ticket status workflow

## The story

Acme's support agents use Helpdesk every day. They can create tickets, assign them and add comments, but they **cannot change a ticket's status**. A ticket that starts as Open stays Open forever, and nobody can see how a ticket moved along over time.

The frontend team has already built a **Status** panel on the ticket page. The panel has a *Change status* button and a *History* list. For now it says "Status changes are not available yet" because the backend part is missing.

**Your job is to build that backend part.** When you're done, the Status panel works without any change to the frontend.

## What to build

1. An endpoint that **changes the status** of a ticket, following the workflow rules below.
2. A **status history**. Every successful status change is saved, and an endpoint returns the history of a ticket.

## Workflow rules

### Allowed status changes

| Current status | Can move to |
|---|---|
| Open | In progress, Closed |
| In progress | On hold, Resolved |
| On hold | In progress |
| Resolved | In progress (reopen), Closed |
| Closed | nothing: a closed ticket is final |

Every other change is refused, including a "change" to the status the ticket already has.

### More rules

- A **comment is required** when the new status is **On hold** or **Resolved**. The agent explains what they are waiting for, or how the problem was solved. A comment that is empty or contains only spaces counts as missing.
- A ticket can move to **In progress** only if it **has an assignee**.
- The person making the change (`changedById`) must exist.
- When a change is refused, **nothing is saved**. The ticket keeps its status and no history entry is created.
- If several rules fail at the same time, it is fine to return any one of the matching errors.

## API contract

The frontend is already written against these two endpoints, so paths, field names and JSON shapes must match **exactly**. Status values are the same as in the rest of the API: `OPEN`, `IN_PROGRESS`, `ON_HOLD`, `RESOLVED`, `CLOSED`.

### 1. Change the status of a ticket

`PUT /api/helpdesk/v1/tickets/{ticketId}/status`

Request body:

```json
{
  "status": "RESOLVED",
  "changedById": 2,
  "comment": "Replaced the network cable."
}
```

| Field | Required | Rules |
|---|---|---|
| `status` | yes | One of the five statuses |
| `changedById` | yes | Id of an existing person |
| `comment` | depends | At most 1000 characters. Required when `status` is `ON_HOLD` or `RESOLVED` |

**Success:** `200 OK`. The body is the updated ticket, with the same JSON as `GET /api/helpdesk/v1/tickets/{ticketId}`.

**Errors.** Use the same error format as the existing endpoints:

| Situation | HTTP status |
|---|---|
| The ticket does not exist | 404 |
| A required field is missing, the status value is unknown, the person does not exist, the comment is missing when required, or the comment is too long | 400 |
| The status change is not allowed, or the ticket has no assignee when moving to In progress | 409 |

Error messages should tell the user what went wrong, for example "Cannot change status from OPEN to RESOLVED". You choose the exact wording.

### 2. Get the status history of a ticket

`GET /api/helpdesk/v1/tickets/{ticketId}/history`

**Success:** `200 OK` with a JSON array, **newest change first**. The array is empty if the status never changed.

```json
[
  {
    "id": 7,
    "fromStatus": "IN_PROGRESS",
    "toStatus": "RESOLVED",
    "comment": "Replaced the network cable.",
    "changedBy": {
      "id": 2,
      "fullName": "Priya Nair",
      "email": "priya.nair@acme.example",
      "role": "AGENT"
    },
    "changedDate": "2026-10-05T14:32:10"
  }
]
```

- `comment` is `null` when no comment was given.
- `fromStatus` is `null` only for an entry that records the creation of a ticket (see Bonus).
- `changedBy` has the same shape as the people returned by `GET /persons`.

**Errors:** `404` if the ticket does not exist.

## Acceptance criteria

- [ ] **AC1** Moving a ticket along an allowed path returns `200` and the updated ticket. For example, an Open ticket that has an assignee moves to In progress. The new status shows in `GET /tickets/{ticketId}` and in the ticket list.
- [ ] **AC2** Each successful change adds exactly one history entry. The entry holds the old status, the new status, the comment (or `null`), the person who made the change and the date and time.
- [ ] **AC3** `GET /tickets/{ticketId}/history` returns the entries newest first, and an empty array for a ticket whose status never changed.
- [ ] **AC4** A change that is not in the table above returns `409`. This includes a change to the same status and any change from Closed.
- [ ] **AC5** Moving a ticket without an assignee to In progress returns `409`.
- [ ] **AC6** Moving to On hold or Resolved without a comment (missing, empty or only spaces) returns `400`.
- [ ] **AC7** These return `400`: a missing `status` or `changedById`, an unknown status value, an unknown person, or a comment longer than 1000 characters.
- [ ] **AC8** Both endpoints return `404` for a ticket that doesn't exist.
- [ ] **AC9** A refused change saves nothing. The ticket's status and its history stay the same.
- [ ] **AC10** Errors use the same JSON error format as the existing endpoints, with a message that explains the problem.
- [ ] **AC11** In the UI, the Status panel on the ticket page can change the status and shows the history, without any change to the frontend code.

## Where to start

- Run the app (see the README), open ticket #2 and look at the Status panel.
- Read how **assigning a ticket** works, from `TicketController` to `TicketService`. It is an action on a ticket with rules and error cases, very close to what you need.
- Read how **comments** work. Comments are a table linked to tickets, with a migration, an entity, a repository, DTOs, a mapper, a service and a controller.
- To see exactly what the frontend sends, read (but don't change) `frontend/src/app/shared/_services/ticket-status.service.ts`.

## Bonus (optional)

Only once everything above is done:

- Record the creation of a ticket as its first history entry (`fromStatus: null`, `toStatus: "OPEN"`). The UI already shows such an entry as "Created as Open".

## If it takes too long

The assignment should take around 2-4 hours of work.

If the assignment is taking much longer than expected, you don't have to finish everything. Submit what you have and, in the pull request section *What I would do with more time*, list what is missing and estimate how long the remaining work would take you.

## How to submit

> Don't use the **Fork** button. On GitHub, a fork of a public repository is always public and can't be made private.

1. On this repository's GitHub page, click **Use this template → Create a new repository**.
2. Choose your account as the owner, pick any name and select **Private**. Create the repository.
3. Clone your new repository and work on a branch. Push your branch.
4. Open a **pull request** from your branch into `main` of **your own** repository. Fill in the pull request template.
5. In your repository, go to **Settings → Collaborators → Add people** and invite **`dorinrotarescu`**.
6. Once the invitation is accepted, add `dorinrotarescu` as a **reviewer** on your pull request.
7. Don't merge the pull request. We will review it and discuss it with you there.
