**Smart Meeting Todo Manager — with Auto Todo Extraction, Assignment, and Auth”**

### 💡 Objective

Build a full-stack app where authenticated users can upload **meeting transcripts** and automatically generate **actionable todos**.

If someone’s name is mentioned in the transcript, the system should **auto-assign** that todo to them.

Each user can manage their **own todos, transcripts, and team workspace**.

🧱 Tech Stack
Frontend: Next.js (App Router) + TypeScript + TailwindCSS
Backend: NestJS + TypeORM + PostgreSQL (or Supabase)
Auth: JWT (email/password) or OAuth (NextAuth.js + NestJS Passport)
Optional AI Layer: Gemini/OpenAI API for NLP-based extraction

🗂️ Core Modules
### 1. 🧑‍💼 Authentication & Authorization

### Features:
User signup & login (email/password)
JWT-based session handling (NestJS)
NextAuth or custom JWT handling in Next.js frontend
Protected routes (todos, transcripts)
Role-based access (Admin / Member)
Admin: Manage all team users and transcripts
Member: View/modify their assigned todos

Method	Endpoint	Description
POST	/auth/signup	Register new user
POST	/auth/login	Authenticate user and issue JWT
GET	/auth/profile	Get current user (protected)


### 2. 📄 Transcript Management (CRUD)

Users can:
Upload a transcript (text or .txt file)
View uploaded transcripts
Delete old transcripts
Reprocess a transcript to regenerate todos

### Endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/transcripts` | Upload transcript |
| `GET` | `/transcripts` | Get all transcripts for the logged-in user |
| `GET` | `/transcripts/:id` | View transcript details |
| `DELETE` | `/transcripts/:id` | Delete transcript |

### ✅ Todo Management (CRUD + AI Extraction)

When a transcript is uploaded:
Backend extracts todos from transcript
Detects assignees (based on names mentioned)
Assigns them automatically if user exists

### Example:

**Transcript Input:**
James will send the client proposal tomorrow.
John should review the technical doc by Monday.


AI Output:
[
  {"title": "Send the client proposal", "assignee": "James", "deadline": "Tomorrow"},
  {"title": "Review the technical doc", "assignee": "John", "deadline": "Monday"}
]


### Endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/todos/generate` | Extract todos from transcript (AI/regex) |
| `GET` | `/todos` | Fetch all todos (filtered by user role) |
| `POST` | `/todos` | Create manual todo |
| `PUT` | `/todos/:id` | Update todo |
| `DELETE` | `/todos/:id` | Delete todo |

4. 👥 User Management

Each authenticated user belongs to a workspace/team.
Features:
View all users (Admin only)
Add/remove team members
Auto-assign todos when assignee name matches a team member

### Endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/users` | Get team members |
| `POST` | `/users` | Add team member (Admin only) |
| `DELETE` | `/users/:id` | Remove team member (Admin only) |


i need to build this here can you help me with the structure and everything of this project