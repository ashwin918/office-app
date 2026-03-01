# 🏢 Office Task Manager

A full-stack office task management app with Admin and Employee roles.

---

## ✅ STEP 1 — Setup PostgreSQL Database

1. Open **pgAdmin**
2. Right-click **Databases** → **Create** → **Database**
3. Name it: `office_app` → Save
4. Click on `office_app` → **Query Tool**
5. Open the file `database.sql` from this folder
6. Paste the SQL content into the Query Tool
7. Click **▶ Execute** (or press F5)

You should see: `Database setup complete!`

---

## ✅ STEP 2 — Configure Database Password

Open `backend/server.js` and find this section near the top:

```javascript
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'office_app',
  user: 'postgres',          // ← Your PostgreSQL username
  password: 'your_password', // ← Change this to your PostgreSQL password
});
```

Change `your_password` to your actual PostgreSQL password.

---

## ✅ STEP 3 — Install & Run Backend

Open a terminal in VS Code:

```bash
cd backend
npm install
npm start
```

You should see:
- ✅ Connected to PostgreSQL database
- 🚀 Server running on http://localhost:5000

---

## ✅ STEP 4 — Install & Run Frontend

Open a **second** terminal in VS Code:

```bash
cd frontend
npm install
npm start
```

The app will open at **http://localhost:3000**

---

## 🔐 Login Credentials

| Role  | Username | Password |
|-------|----------|----------|
| Admin | admin    | admin    |

Employees are created by the Admin from the dashboard.

---

## 🎯 Features

### Admin Can:
- View dashboard with task statistics
- Add employees (set their username & password)
- Remove employees
- Assign tasks to employees with priority and due date
- View all tasks and their completion status
- Delete tasks

### Employee Can:
- Login with credentials set by admin
- View all their assigned tasks
- Update task completion percentage (0–100%)
- Add notes/comments to tasks
- Filter tasks by status (Pending / In Progress / Completed)

---

## 📁 Project Structure

```
office-app/
├── database.sql          ← Run this in pgAdmin first!
├── README.md
├── backend/
│   ├── package.json
│   └── server.js         ← Update DB password here
└── frontend/
    ├── package.json
    └── src/
        ├── App.js
        ├── index.js
        ├── context/
        │   └── AuthContext.js
        └── pages/
            ├── Login.js
            ├── AdminDashboard.js
            └── EmployeeDashboard.js
```
