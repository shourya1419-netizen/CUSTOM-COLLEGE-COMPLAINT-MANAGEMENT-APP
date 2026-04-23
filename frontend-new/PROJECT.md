# College Complaint Management System — Frontend

## Tech Stack

- React 19
- Tailwind CSS
- Axios (API calls)
- React Router DOM v7
- Recharts (bar charts in admin)
- Lucide React (icons in admin)

---

## Project Structure

```
src/
├── pages/
│   ├── Login.js           # Login page
│   ├── Register.js        # Student registration
│   ├── Dashboard.js       # Student home screen
│   ├── CreateComplaint.js # Submit a complaint
│   ├── StatusPage.js      # Track complaint status
│   ├── ChangePassword.js  # Change password
│   ├── AdminDashboard.js  # Admin panel
│   └── NotFound.js        # 404 page
├── components/
│   └── Navbar.js          # Sidebar nav (used in admin + change password)
├── services/
│   └── api.js             # Axios instance with JWT interceptors
└── App.js                 # Routes and protected route logic
```

---

## Workflow

### 1. Authentication Flow

```
User opens app
    ↓
Login page (/)
    ↓
Enters username + password
    ↓
POST /api/login/
    ↓
Backend returns: { access, refresh, username, role }
    ↓
Stored in localStorage:
  - token (access JWT)
  - refresh (refresh JWT)
  - username
  - role (student / admin)
    ↓
Role check:
  - role === "admin"   → redirect to /admin
  - role === "student" → redirect to /dashboard
```

### 2. Token Auto-Refresh

Every API request attaches the access token via Axios interceptor.
If a request returns 401 (token expired):
- Axios interceptor catches it
- Sends POST /api/token/refresh/ with the refresh token
- Gets a new access token
- Retries the original request automatically
- If refresh also fails → clears localStorage → redirects to login

### 3. Protected Routes

All pages except Login and Register are wrapped in `PrivateRoute`.

```
PrivateRoute checks:
  - No token → redirect to /
  - Wrong role → redirect to correct dashboard
    (student trying /admin → goes to /dashboard)
    (admin trying /dashboard → goes to /admin)
```

### 4. Student Workflow

```
Register (/register)
  → Fill username, email, password
  → POST /api/register/
  → Redirect to login

Login (/)
  → Authenticate
  → Redirect to /dashboard

Dashboard (/dashboard)
  → GET /api/complaints/ (own complaints only)
  → Shows: stats cards, quick actions, recent activity
  → Bottom tab bar: Home | Submit | Status | Settings

Submit Complaint (/create)
  → Select category (emoji grid)
  → Select department
  → Fill title + description
  → Attach file (optional)
  → POST /api/complaints/ (multipart/form-data)
  → Redirect to /dashboard

Track Status (/status)
  → GET /api/complaints/
  → Filter tabs: All | Pending | In Progress | Resolved
  → Each complaint shows progress bar based on status:
      pending     → 20%
      in_progress → 60%
      resolved    → 100%
      closed      → 100%

Change Password (/change-password)
  → Enter current + new + confirm password
  → POST /api/change-password/
  → On success → logout → redirect to login

Logout
  → Clears localStorage
  → Redirect to /
```

### 5. Admin Workflow

```
Login (/)
  → role === "admin" → redirect to /admin

Admin Dashboard (/admin)
  → GET /api/complaints/ (ALL complaints from all students)
  → Stats overview: Pending / In Progress / Resolved / Closed
  → Bar chart
  → Table with: #, Student, Title, Category, Department, File, Status, Date, Update
  → Search by title or student name
  → Filter by status / category / department
  → Inline status dropdown → PUT /api/complaints/<id>/status/
      → triggers email notification to student
  → Dark mode toggle
  → Logout
```

---

## API Endpoints Used

| Method | Endpoint | Used By | Description |
|--------|----------|---------|-------------|
| POST | /api/register/ | Register.js | Create student account |
| POST | /api/login/ | Login.js | Get JWT tokens + role |
| POST | /api/token/refresh/ | api.js interceptor | Refresh access token |
| GET | /api/complaints/ | Dashboard, StatusPage, AdminDashboard | Fetch complaints |
| POST | /api/complaints/ | CreateComplaint.js | Submit new complaint |
| PUT | /api/complaints/:id/status/ | AdminDashboard.js | Update complaint status |
| DELETE | /api/complaints/:id/delete/ | Dashboard.js | Delete own complaint |
| POST | /api/change-password/ | ChangePassword.js | Change password |

---

## Pages Summary

| Page | Route | Role | Key Feature |
|------|-------|------|-------------|
| Login | / | All | JWT login, role-based redirect |
| Register | /register | Public | Student self-registration |
| Dashboard | /dashboard | Student | Stats, quick actions, recent activity, bottom tabs |
| Create Complaint | /create | Student | Category grid, file upload, gradient UI |
| Status Page | /status | Student | Filter tabs, progress bars per complaint |
| Change Password | /change-password | Student | Validates current password, auto-logout |
| Admin Dashboard | /admin | Admin | All complaints, search, filter, status update |
| Not Found | * | All | 404 with role-aware back button |

---

## Running the Frontend

```bash
cd frontend-new
npm install
npm start
```

App runs at: http://localhost:3001

> Backend must be running at http://localhost:8000 for API calls to work.
