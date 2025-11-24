# URL Shortener — Frontend (React + Tailwind)

This is the frontend for the Full-Stack URL Shortener application.  
It provides a responsive dashboard, link creation form, stats page, and integration with the backend API.

---

## 🚀 Features

### **Dashboard (/)**  
- Table of all short links  
- Columns:
  - Short code
  - Target URL (truncated)
  - Total clicks
  - Last clicked time
- Actions:
  - Create new short link
  - Delete link
  - Copy short link
  - Search/filter by code or URL
- Supports empty, loading, success, and error states  
- Responsive on mobile & desktop  
- Sorting optional implementation supported

---

## 📄 **Stats Page (/code/:code)**

Displays detailed information:
- `shortCode`
- `longUrl`
- `clickCount`
- `lastClicked`

Includes:
- Copy button  
- Open link button  

---

## 🧭 Routing

| Page | Path | Public |
|------|------|--------|
| Dashboard | `/` | Yes |
| Link Stats | `/code/:code` | Yes |
| Redirect | Handled by backend | Yes |
| Health Check | `/healthz` (from backend) | Yes |

---

## 🛠️ Tech Stack

- **React (Vite or CRA)**
- **TailwindCSS**
- **React Router**
- **Axios / Fetch API**

---

## 📦 Installation

```bash
npm install
