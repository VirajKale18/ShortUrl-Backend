# URL Shortener Backend (Express + Prisma + SQLite)

This backend provides the full API and redirect logic for a URL shortener service.  
It includes URL validation, short code generation, analytics tracking, deletion, and health checks.

---

## 🚀 Features

### ✔ Create short URLs
- Auto-generate short codes (6–8 alphanumeric chars)
- Accept custom short codes
- Prevent collisions
- Validate URL format
- Reject invalid or duplicate codes

### ✔ Redirect service
- `GET /:code` performs:
  - Short code lookup
  - Click count increment
  - Last-click timestamp update
  - 302 redirect
  - Returns 404 if not found

### ✔ Statistics
- Total clicks
- Last clicked timestamp
- Full link metadata

### ✔ CRUD API
- Create links
- List all links
- Fetch single link
- Delete links

### ✔ Health Check
- `/healthz` returns uptime, version, and status

---

## 🛠 Tech Stack

- Node.js + Express
- Prisma ORM
- SQLite
- CORS
- REST API

---

## 📁 Folder Structure

