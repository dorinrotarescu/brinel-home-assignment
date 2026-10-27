# Acme Helpdesk

Acme Helpdesk is the internal IT support app of Acme Corp, a fictional company. Employees report IT problems as **tickets**. Support **agents** are assigned to tickets, discuss them in **comments** and solve them.

This repository contains a small but complete web application:

| Folder | What it is | Main technologies |
|---|---|---|
| `backend/` | REST API, database and business rules | Java 25, Spring Boot 4, Spring Data JPA, H2, Flyway, Lombok, MapStruct |
| `frontend/` | Web interface | Angular 22, Angular Material, Tailwind CSS |

**Your task is described in [ASSIGNMENT.md](ASSIGNMENT.md).** Start with this README to get the app running.

---

## Prerequisites

- **Git**
- **JDK 25**, for example [Eclipse Temurin 25](https://adoptium.net/). Check with `java -version`. `JAVA_HOME` must point to this JDK.
- **Node.js 24 LTS**, which includes npm. Check with `node -v`.
- An IDE. IntelliJ IDEA (the free Community edition is fine) or VS Code with the Java extensions.

You don't need Docker or a database server. The backend uses an in-memory database.

## Get the code

First create your own **private** copy of this repository. The steps are in [ASSIGNMENT.md → How to submit](ASSIGNMENT.md#how-to-submit). Then clone your copy:

```bash
git clone <your-private-repo-url>
cd <your-repo-folder>
```

## Run everything with one command

From the repository root:

```bash
npm start
```

This starts the backend, waits until it is ready, then starts the frontend. Both logs show in the same terminal, marked `[backend]` and `[frontend]`. On the first run it also installs the frontend dependencies, and the backend downloads Maven and its libraries, so the first start takes a few minutes. Press **Ctrl+C** to stop both.

When you see `Ready`, open http://localhost:4200.

If you prefer separate terminals, for example to restart only the backend, follow the next two sections instead.

## Run the backend

Windows (PowerShell):

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

macOS / Linux:

```bash
cd backend
./mvnw spring-boot:run
```

You don't need to install Maven. `mvnw` (the Maven wrapper) downloads the right version on the first run, so the first start is slower.

When the backend is running:

| What | Where |
|---|---|
| API | http://localhost:8080/api/helpdesk/v1 |
| Swagger UI (try the API in the browser) | http://localhost:8080/swagger-ui.html |
| H2 console (look at the database) | http://localhost:8080/h2-console. JDBC URL `jdbc:h2:mem:helpdesk`, user `sa`, empty password |

The database is created and filled with sample data every time the backend starts. **Restarting the backend resets all data.**

## Run the frontend

Open a second terminal. Start the backend first.

```bash
cd frontend
npm ci
npm start
```

Open http://localhost:4200. The development server forwards every `/api` call to the backend on port 8080.

## Run the tests

| Part | Windows | macOS / Linux |
|---|---|---|
| Backend | `.\mvnw.cmd test` | `./mvnw test` |
| Frontend | `npm test` | `npm test` |

## Project structure

```
backend/
├── http/helpdesk.http                    ready-made API requests (IntelliJ / VS Code REST Client)
└── src/
    ├── main/java/com/acme/helpdesk/
    │   ├── api/                          REST controllers
    │   ├── data/dto/                     response objects (and dto/request/ for request bodies)
    │   ├── data/mapper/                  MapStruct mappers (entity → DTO)
    │   ├── data/model/                   JPA entities and enums
    │   ├── data/repository/              Spring Data repositories
    │   ├── exception/                    exceptions and the global error handler
    │   └── service/                      business logic
    ├── main/resources/
    │   ├── application.properties
    │   └── db/migration/                 Flyway migrations (schema + sample data)
    └── test/java/com/acme/helpdesk/      unit tests

frontend/src/app/
├── core/                                 HTTP error handling, notifications
├── layout/                               page shell (toolbar)
├── shared/                               models, services, small reusable components
└── pages/tickets/                        ticket list, create and detail pages
```

## Sample data

**People.** There is no login. Forms have a field where you pick who is acting.

| Id | Name | Role |
|---|---|---|
| 1 | Sam Carter | Agent |
| 2 | Priya Nair | Agent |
| 3 | Tom Becker | Agent |
| 4 | Lena Fischer | Employee |
| 5 | Omar Haddad | Employee |
| 6 | Chloe Martin | Employee |
| 7 | Diego Alvarez | Employee |
| 8 | Yuki Tanaka | Employee |

**Tickets.** There are 20 tickets in all statuses. Some useful ones:

| Id | Status | Assignee |
|---|---|---|
| 1 | Open | none |
| 2 | Open | Sam Carter |
| 4 | In progress | Priya Nair |
| 6 | On hold | Sam Carter |
| 8 | Resolved | Tom Becker |
| 10 | Closed | Priya Nair |

## API at a glance

All paths start with `/api/helpdesk/v1`. Swagger UI shows the details.

| Method | Path | What it does |
|---|---|---|
| GET | `/persons?role=AGENT` | List people (the `role` filter is optional) |
| POST | `/tickets/search?page=0&size=10` | Search tickets (filters in the body) |
| GET | `/tickets/{ticketId}` | Get one ticket |
| POST | `/tickets` | Create a ticket |
| PUT | `/tickets/{ticketId}/assignee` | Assign a ticket to an agent |
| GET | `/tickets/{ticketId}/comments` | List the comments of a ticket |
| POST | `/tickets/{ticketId}/comments` | Add a comment |

Errors use the standard [Problem Details](https://www.rfc-editor.org/rfc/rfc9457) format:

```json
{
  "title": "Conflict",
  "status": 409,
  "detail": "Ticket 10 is closed and cannot be reassigned",
  "instance": "/api/helpdesk/v1/tickets/10/assignee"
}
```

---

## FAQ

**Can I use AI tools?**
Yes. What matters is that you understand everything you submit. In the review we will talk about your code and ask you to explain your choices. We appreciate a short note in your pull request about which tools you used and how.

**Do I need to change the frontend?**
No, and please don't. The frontend for your feature is already built. It starts working once your backend endpoints exist.

**Can I change existing backend code?**
Yes, if your feature needs it. Explain why in your pull request.

**Can I add libraries?**
You shouldn't need any. If you add one, explain why in your pull request.

**I edited an existing migration file and now something is wrong.**
Put database changes in a **new** migration file in `backend/src/main/resources/db/migration/`. Never edit the existing ones. The next file name continues the numbering: `V3__your_description.sql`.

**How do I see the SQL that runs?**
In `application.properties`, uncomment the `logging.level.org.hibernate.SQL` line and restart the backend.

**My endpoints work in Swagger, but the Status panel still says "not available yet".**
Check that your paths and JSON fields match ASSIGNMENT.md exactly, then reload the page.

**I can't finish everything.**
Submit what you have. In your pull request, list what is missing and how you would do it. A smaller solution that works and has tests is better than a bigger one that doesn't.

**Something is unclear in the assignment.**
Make a reasonable choice and write it down in your pull request. If you are blocked, contact us at dorin.rotarescu@brinel.com.

### Troubleshooting

| Problem | Fix |
|---|---|
| `./mvnw: Permission denied` (macOS / Linux) | Run `chmod +x mvnw` |
| `release version 25 not supported`, or a similar Java error | `JAVA_HOME` points to an older JDK. Point it to JDK 25 and open a new terminal |
| `npm ci` fails | Check `node -v`. You need Node 24 |
| Port 8080 or 4200 already in use | Stop the other application that uses it |
| The frontend shows "Cannot reach the server" | The backend is not running. Start it first |
