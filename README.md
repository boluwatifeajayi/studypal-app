# StudyPal – Exam Prep & Study Reminder Tool

StudyPal helps students prepare for exams by automatically generating a personalized study plan and sending daily email reminders. You add your exams and subjects, and StudyPal distributes study sessions across the available days — allocating more time to harder subjects.

---

## Features

- **Register & log in** with secure JWT authentication
- **Create exams** with a name and date
- **Add subjects** to each exam with a difficulty level (easy, medium, hard)
- **Auto-generated study plan** – distributed from today until the exam date, max 3 sessions/day, weighted by difficulty
- **Today's dashboard** – see exactly what to study today with a completion tracker
- **Upcoming view** – see your full schedule for the next 30 days
- **Mark sessions as complete** – track your progress with a single click
- **Daily email reminders** – sent at 8:00 AM every day showing that day's sessions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express (ESM) |
| Database | PostgreSQL + Sequelize ORM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Email | Nodemailer (SMTP) |
| Background Jobs | node-cron |
| Frontend | React 18 + Vite |

---

## Project Structure

```
studypal/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize connection
│   ├── controllers/
│   │   ├── authController.js    # Register, login, /me
│   │   ├── examController.js    # CRUD for exams & subjects
│   │   └── sessionController.js # View & toggle sessions
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Exam.js
│   │   ├── Subject.js
│   │   ├── StudySession.js
│   │   └── index.js             # Associations
│   ├── routes/
│   │   ├── auth.js
│   │   ├── exams.js
│   │   └── sessions.js
│   ├── services/
│   │   ├── authService.js       # Registration & login logic
│   │   ├── studyPlanService.js  # Plan generation algorithm
│   │   ├── emailService.js      # Nodemailer email sending
│   │   └── cronService.js       # Daily reminder cron job
│   ├── app.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   ├── AuthProvider.jsx
│   │   ├── hooks/useAuth.jsx    # Auth context & provider
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx     # Login / Register
│   │   │   ├── DashboardPage.jsx # Today's sessions
│   │   │   ├── ExamsPage.jsx    # Manage exams & subjects
│   │   │   └── UpcomingPage.jsx # Next 30 days
│   │   ├── utils/api.js         # Fetch wrapper
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a hosted instance)

### Local PostgreSQL (macOS with Homebrew)

If you use Homebrew PostgreSQL, the default role is your **macOS username**, not `postgres`.

1. **Install and start PostgreSQL** (if needed):
   ```bash
   brew install postgresql@17
   brew services start postgresql@17
   ```

2. **Create the database**:
   ```bash
   createdb studybuddy
   ```

3. In `backend/.env`, leave `DATABASE_URL` commented out (or unset) and set:
   - `DB_USER=` your macOS username (e.g. `boluwatifeajayi`)
   - `DB_PASSWORD=` (empty)
   - `DB_NAME=studybuddy`

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd studypal
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3001
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=studypal
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=some_long_random_secret_string

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=your_gmail_app_password 
EMAIL_FROM=StudyPal <you@gmail.com>

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Create the database

```bash
# Using psql
createdb studypal

# Or in psql:
# CREATE DATABASE studypal;
```

### 4. Install dependencies and start the backend

```bash
cd backend
npm install
npm run dev
```

The backend starts on `http://localhost:3001`. Sequelize will auto-create all tables on first run.

### 5. Install and start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app is now live at `http://localhost:3000`.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `studypal` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `secret` |
| `JWT_SECRET` | Secret for signing JWTs | `long_random_string` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use TLS | `false` |
| `SMTP_USER` | SMTP username/email | `you@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | `apppassword` |
| `EMAIL_FROM` | Sender display | `StudyPal <you@gmail.com>` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL  |

---

## How the Study Plan Works

When you create an exam with subjects:

1. **Available days** = number of days from today until the exam date
2. **Weights**: easy = 1, medium = 2, hard = 3
3. **Total slots** = available days × 3 (max sessions/day)
4. **Per-subject sessions** = proportional to weight (harder subjects get more)
5. Sessions are shuffled and distributed across days — never more than 3/day
6. When you add or remove a subject, the plan is regenerated automatically

---

## How Email Reminders Work

- A **cron job runs every day at 8:00 AM** (server time)
- For each user with `reminderEnabled = true`, it fetches that day's incomplete sessions
- If there are sessions, it sends a formatted HTML email listing each session (exam, subject, difficulty)
- You can test reminders manually via `POST /api/sessions/send-reminders` (requires auth)

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Exams
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/exams` | List all exams |
| POST | `/api/exams` | Create exam (with optional subjects) |
| GET | `/api/exams/:id` | Get exam details |
| DELETE | `/api/exams/:id` | Delete exam |
| POST | `/api/exams/:id/subjects` | Add subject to exam |
| DELETE | `/api/exams/:examId/subjects/:subjectId` | Remove subject |

### Sessions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sessions/today` | Today's sessions |
| GET | `/api/sessions/upcoming` | Next 30 days |
| GET | `/api/sessions/stats` | Completion stats |
| GET | `/api/sessions/date/:date` | Sessions for specific date |
| PATCH | `/api/sessions/:id/toggle` | Toggle completion |
| POST | `/api/sessions/send-reminders` | Manually trigger reminders |

---

## Deployment

- Frontend is deployed on `Vercel`
- Backend is deployed on `Render`


## How to Use the App

1. **Register** with your name, email, and password
2. Click **"My Exams"** → **"New Exam"**
3. Enter the exam name, date, and add subjects with difficulty levels
4. Go to **"Today"** to see your study sessions for today
5. Click the circle next to a session to mark it complete 
6. Check **"Upcoming"** to see your full schedule
7. Receive a **daily email at 8 AM** with that day's sessions (once SMTP is configured)

---

## 10-step guide: test the app from start to finish

Use this flow to test StudyPal from first launch to last feature.

| Step | What to do | What you’re testing |
|------|------------|---------------------|
| **1** | **Start backend and frontend** — In one terminal: `cd backend && npm run dev`. In another: `cd frontend && npm run dev`. Open **http://localhost:3000** in your browser. | Servers run; app loads. |
| **2** | **Create an account** — On the auth screen, click “Sign up”, enter your name, email, and a password (min 6 characters). Click **Create Account**. | Registration; you’re logged in and see the main app. |
| **3** | **Open My Exams** — Click the **My Exams** tab. You should see “No exams yet” and a **+ New Exam** button. | Navigation; empty exams list. |
| **4** | **Add your first exam** — Click **+ New Exam**. Enter an exam name (e.g. “Math Final”) and pick a **future date** (e.g. 2 weeks from today). Add at least 2–3 subjects with different difficulties (e.g. Algebra – Easy, Calculus – Hard). Click **Create Exam**. | Exam + subjects creation; study plan is generated. |
| **5** | **Check Today’s plan** — Click the **Today** tab. You should see today’s date, stats (Today’s Sessions, Completed Today, etc.), and a list of sessions (exam + subject + difficulty). If the exam is far away, you might see 0 sessions today; then pick an exam date closer (e.g. 5–7 days away) and create another exam to get sessions today. | Today’s dashboard; stats; session list. |
| **6** | **Mark sessions complete** — On **Today**, click the **circle** next to a session. It should turn into a checkmark, the session text should strike through, and you should see a “Session completed!” toast. Do this for one or two sessions. | Toggle completion; UI and stats update. |
| **7** | **View Upcoming** — Click the **Upcoming** tab. You should see sessions for the next 30 days, grouped by date. Confirm today’s sessions appear and completed ones are shown as done. | Upcoming schedule; date grouping. |
| **8** | **Add a subject to an exam** — Go to **My Exams**, find an exam, click **+ Subject**. Add a name and difficulty, then **Add Subject**. The study plan should regenerate (you may see more sessions on Today/Upcoming). | Add subject; plan regeneration. |
| **9** | **Delete a subject or exam** — On **My Exams**, use the **✕** next to a subject to remove it (confirm when asked). Optionally delete an entire exam with the 🗑️ button (confirm). List and plan should update. | Delete subject/exam; data and plan consistency. |
| **10** | **Sign out and sign back in** — Click **Sign out** (top right). You should see the login screen. Sign in with the same email and password. You should see your exams and sessions again. (Optional: trigger daily reminders via `POST /api/cron/trigger-reminders` with your auth token if you’ve set up SMTP.) | Logout; login; session persistence. |

**Quick tip:** To see sessions **today**, use an exam date that’s soon (e.g. 5–10 days from now). The app spreads sessions from today until the exam date (max 3 per day), so a near-future exam gives you sessions on the current day.