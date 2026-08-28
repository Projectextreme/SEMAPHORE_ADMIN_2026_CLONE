# SEMAPHORE 2026 - Admin Control Suite ⚡

> **Official Administration & Operations Portal for SEMAPHORE 2026**  
> National Level MCA Technical Fest — Organizing Committee & Department Operations.

[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React%20Router-v7.18-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![License](https://img.shields.io/badge/Access-Restricted%20Admin-orange)](#)

---

## 📋 Overview

**SEMAPHORE 2026 Admin Control Suite** is a comprehensive, mission-critical operations dashboard engineered to manage all facets of the **Semaphore 2026 National Level IT Fest**. Built with modern React 19 and Vite, it delivers real-time participant tracking, payment verification pipelines, event and timetable scheduling, pointwise fest guidelines publication, automated export reporting, and multi-tier role-based access control (RBAC).

---

## ✨ Key Features & Modules

### 1. 📊 Executive Dashboard & Live Analytics
- **Live Metrics**: Real-time counters for registered teams, total revenue collected, verified payments, and pending approvals.
- **Velocity Charts**: Real-time contingent registration trends, event popularity distributions, and college participation graphs.
- **Quick Action Bar**: One-click shortcuts to approve payments, export reports, and broadcast rule revisions.

### 2. 🏛️ College Directory & Contingents
- Directory of all participating colleges, institutions, and universities across states.
- Aggregate contingent leader tracking and team strength calculations.
- Live tracking of college-wide clearance and payment statuses.

### 3. 🎯 Event Management Suite
- Comprehensive CRUD management for Technical, Cultural, Gaming, and Management categories.
- Configurable rules per event: team sizes, round structures, venues, fees, and reporting timings.
- Live active/inactive visibility toggles reflecting on the student-facing fest portal.

### 4. 📖 Team Rules & Guidelines Management
- **Pointwise Editor**: Intuitive inline editor for official fest rules, guidelines, and conduct policies.
- **Multi-Category Sets**: Manage tailored rules for Technical, Cultural, E-Sports, Management, and General contingents.
- **Live Participant Preview**: Instant student-portal simulation view with Markdown and `.txt` export options.
- **Resilient Auto-Save & Storage Sync**: Multi-layer persistent local caching (`localStorage`) combined with debounced backend synchronization to guarantee zero data loss on browser reloads.

### 5. 👥 Team & Participant Registrations
- Searchable and filterable registry of all participating student teams.
- Deep filtering by college name, event category, registration timestamp, and payment clearance.
- Detailed drill-down view of team members, college ID proofs, and contact details.

### 6. 💳 Payment Approvals & Verification Vault
- **Payment Approvals**: Side-by-side verification of student-submitted UPI transaction IDs and payment screenshot receipts.
- **One-Click Actions**: Instant Approve / Reject with automated status updates.
- **Backup Payments Vault**: Fallback registry preserving all manual and backup payment slips.

### 7. 👔 Coordinator Management
- Centralized directory of Student Coordinators and Faculty In-charges.
- Mapping coordinators to specific fest events with direct phone/email contact integrations.

### 8. ⏱️ Slots & Timetable Scheduling
- Dynamic fest timetable management across Day 1 and Day 2.
- Conflict detection for event timings, venues, and stage schedules.

### 9. 📈 Reports & Export Hub (XLSX / CSV)
- One-click downloads for comprehensive Excel and CSV datasets:
  - Contingent Attendance Sheets
  - Event-wise Participant Rosters
  - Payment & Revenue Audit Logs
  - College Directory Summaries

### 10. 🛡️ User & SuperAdmin Security Suite
- **Role-Based Access Control (RBAC)**: Distinct permissions for `SuperAdmin`, `Admin`, and `Coordinator`.
- **Admin Delegation**: SuperAdmin capability to promote/demote administrators and monitor activity.
- **Google OAuth & JWT Authentication**: Secure session handling with automatic token injection and unauthorized interception.

---

## 🎨 Design & Aesthetic Standards

- **Theme Engine**: Seamless switching between **Dark Mode** and **Light Mode** with customizable accent color presets.
- **Ambient Canvas**: High-performance particle and dynamic aurora background effects (`AmbientBackground.jsx`).
- **Glassmorphism**: Sleek frosted glass cards, glow effects, micro-animations, and subtle hover interactions.
- **Responsive Layout**: Built-in mobile drawer navigation and fluid desktop sidebar layout.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) (Functional Components, Hooks) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) (`HashRouter`) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animations** | CSS3 GPU-Accelerated Keyframes & [Lottie React](https://github.com/Gamote/lottie-react) |
| **Styling** | Pure Modular CSS with Design Tokens & Variables (No Tailwind dependency) |
| **Data Layer** | Universal `fetch` wrapper with JWT Bearer auth and hybrid `localStorage` fallback persistence |

---

## 📁 Repository Structure

```
SEMAPHORE_ADMIN_2026/
├── public/                     # Static assets and icons
├── src/
│   ├── components/
│   │   ├── admins/             # SuperAdmin privilege & delegation management
│   │   ├── analytics/          # Visual analytics, charts, and metrics hub
│   │   ├── auth/               # Google OAuth login and authentication views
│   │   ├── colleges/           # College directory and contingent tracking
│   │   ├── common/             # Modals, Toast notifications, Empty states, Ambient background
│   │   ├── coordinators/       # Event coordinators and faculty directory
│   │   ├── dashboard/          # Main overview dashboard cards and stats
│   │   ├── events/             # Fest event CRUD and category configuration
│   │   ├── layout/             # Header, Sidebar, and App navigation
│   │   ├── payments/           # Payment verification and Backup vault
│   │   ├── registrations/      # Participant and team registration lists
│   │   ├── reports/            # Data export hub (XLSX, CSV)
│   │   ├── rules/              # Team rules and pointwise guidelines editor
│   │   ├── slots/              # Fest timetable and venue schedule planner
│   │   └── users/              # Student directory and individual profiles
│   ├── context/
│   │   ├── AuthContext.jsx     # Authentication state, login/logout, RBAC
│   │   ├── ThemeContext.jsx    # Dark/Light theme and color presets
│   │   └── ToastContext.jsx    # Universal toast notification system
│   ├── services/
│   │   ├── apiConfig.js        # API Base URL and auth header helpers
│   │   └── apiService.js       # Universal REST API client with local fallback
│   ├── App.jsx                 # Route definitions and layout wrappers
│   ├── App.css                 # Global application layout styles
│   ├── index.css               # Design tokens, color system, and resets
│   └── main.jsx                # Application root entry point
├── .env                        # Environment variables (API Base URL, OAuth IDs)
├── package.json                # Project dependencies and npm scripts
├── vite.config.js              # Vite bundler configuration
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-org/SEMAPHORE_ADMIN_2026.git

# Navigate into the project folder
cd SEMAPHORE_ADMIN_2026

# Install packages
npm install
```

### 2. Environment Configuration
Create or verify your `.env` file in the project root:

```env
# Google OAuth Client ID for Admin Sign-In
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Live REST Engine Base URL
VITE_API_BASE_URL=https://api.semaphore2k26.in
```

### 3. Running Locally
Start the development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Building for Production
Compile optimized production bundle:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 🔒 Security & Role Matrix

| Module / View | Path | SuperAdmin | Admin | Coordinator |
|---|---|:---:|:---:|:---:|
| **Dashboard Overview** | `/#/dashboard` | ✅ Full | ✅ Full | ✅ View |
| **Event Management** | `/#/events` | ✅ Full | ✅ Full | 👁️ View Assigned |
| **Team Rules & Guidelines** | `/#/rules` | ✅ Full | ✅ Full | 👁️ View |
| **Payment Approvals** | `/#/payments` | ✅ Full | ✅ Full | ❌ |
| **Backup Payment Vault** | `/#/backup-payments` | ✅ Full | ✅ Full | ❌ |
| **Reports & Export Hub** | `/#/reports` | ✅ Full | ✅ Full | 👁️ Assigned Only |
| **Admin Management** | `/#/admins` | ✅ Full | ❌ | ❌ |

---

## 🤝 Support & Organizing Team

Developed for **SEMAPHORE 2026**  
MCA Department — Organizing Committee  
For questions or backend endpoint configurations, contact the Core Tech Team.