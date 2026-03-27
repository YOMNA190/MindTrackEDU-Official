# NSMPI - National Student Mental Performance Initiative

<p align="center">
  <img src="https://via.placeholder.com/150x150/0A4D4C/FFFFFF?text=N" alt="NSMPI Logo" width="150" />
</p>

<p align="center">
  <strong>A comprehensive platform for student mental health screening, subsidized therapy, and national data analytics.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#screenshots">Screenshots</a>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Demo Credentials](#demo-credentials)
- [Feature Flags](#feature-flags)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The National Student Mental Performance Initiative (NSMPI) is a government-backed platform designed to:

- **Screen** students for mental health concerns using validated assessment tools (PHQ-9, GAD-7)
- **Connect** students with qualified therapists through a subsidized therapy program
- **Analyze** anonymized aggregate data to inform national mental health policy
- **Support** educational institutions in promoting student well-being

### Key Objectives

1. Early identification of mental health concerns among students
2. Reducing barriers to accessing mental health services
3. Data-driven policy making for educational mental health
4. Cost-effective allocation of mental health resources

---

## ✨ Features

### Module 1: Student Screening & Dashboard

- **Multi-step Screening Form**: PHQ-9 (Depression), GAD-7 (Anxiety), and Focus assessments
- **Risk Classification**: Automatic LOW/MODERATE/HIGH/SEVERE risk level determination
- **Academic Impact Score**: Quantifies impact on academic performance
- **Personalized Dashboard**: View results, track progress, access resources
- **Subsidy Eligibility**: Automatic calculation based on risk + socioeconomic factors

### Module 2: Therapist Booking

- **Therapist Directory**: Search by location, specialization, availability
- **Online Booking**: Schedule sessions with preferred therapists
- **Session Management**: View upcoming/past sessions, receive reminders
- **Feedback System**: Rate sessions and provide feedback

### Module 3: National Dashboard

- **Aggregate Analytics**: Risk distribution, issue prevalence, geographic heatmaps
- **KPIs**: Student improvement rates, therapist utilization, cost savings
- **Data Filtering**: By governorate, education level, age group, gender
- **Export Capabilities**: Download reports for policy makers

### Module 4: Administrative Portals

- **Super Admin**: User management, system settings, audit logs
- **Health Admin**: Therapist verification, therapy request approval
- **Educational Admin**: School-level data, participation tracking

### Module 5: Consent & Privacy

- **Explicit Consent**: At registration and before screening
- **Data Withdrawal**: Option to anonymize personal data
- **Encryption**: Personal data encrypted at rest
- **Audit Logging**: All data access tracked

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React 19  │  │  Vite Build │  │  PWA (Workbox)          │  │
│  │  TypeScript │  │  Tailwind   │  │  i18n (AR/EN)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Express   │  │    JWT      │  │  Rate Limiting          │  │
│  │  TypeScript │  │    Auth     │  │  Helmet/CORS            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Screening  │  │   Therapy   │  │   Dashboard             │  │
│  │   Service   │  │   Service   │  │   Service               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Subsidy    │  │ Notification│  │   Admin                 │  │
│  │   Engine    │  │   Service   │  │   Service               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  PostgreSQL │  │    Redis    │  │   Prisma ORM            │  │
│  │   (Prisma)  │  │   (BullMQ)  │  │   Migrations            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui | Component Library |
| Framer Motion | Animations |
| Recharts | Charts |
| React Query | Data Fetching |
| Zustand | State Management |
| i18next | Internationalization |
| Socket.io-client | Real-time |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | Web Framework |
| TypeScript | Type Safety |
| Prisma | ORM |
| PostgreSQL | Database |
| Redis | Cache/Queue |
| Socket.io | Real-time |
| JWT | Authentication |
| Winston | Logging |
| Swagger | API Docs |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local Dev |
| GitHub Actions | CI/CD |
| Nginx | Reverse Proxy |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- Git

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/nsmpi/platform.git
   cd nsmpi
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Docs: http://localhost:5000/api/docs
   - Database: localhost:5432

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database**
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://nsmpi:password@localhost:5432/nsmpi_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret

# Encryption
ENCRYPTION_KEY=your-32-char-encryption-key

# Feature Flags
FEATURE_SCREENING=true
FEATURE_THERAPIST_BOOKING=true
FEATURE_NATIONAL_DASHBOARD=true
FEATURE_SUBSIDY_ENGINE=true
FEATURE_AI_ML=false

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ENABLE_PWA=true
```

---

## 🗄️ Database Setup

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Deploy migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

### Seeding

```bash
# Seed with demo data
npx prisma db seed

# The seed creates:
# - 1 Super Admin
# - 2 Educational Admins
# - 2 Health Admins
# - 6 Therapists
# - 50 Students with screenings
# - Therapy requests and sessions
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@nsmpi.gov | Demo@123 |
| Educational Admin | eduadmin@moedu.gov | Demo@123 |
| Health Admin | healthadmin@moh.gov | Demo@123 |
| Therapist | therapist1@nsmpi.gov | Demo@123 |
| Student | student1@demo.edu | Demo@123 |

---

## 🎛️ Feature Flags

Feature flags allow incremental deployment of modules:

| Flag | Description | Default |
|------|-------------|---------|
| `FEATURE_SCREENING` | Enable screening module | true |
| `FEATURE_THERAPIST_BOOKING` | Enable therapy booking | true |
| `FEATURE_NATIONAL_DASHBOARD` | Enable national dashboard | true |
| `FEATURE_SUBSIDY_ENGINE` | Enable subsidy calculation | true |
| `FEATURE_AI_ML` | Enable ML-based subsidy (Phase 5) | false |
| `FEATURE_MOBILE_APP` | Enable mobile app features | false |

---

## 📚 API Documentation

Interactive API documentation is available at:

```
http://localhost:5000/api/docs
```

### Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <access_token>
```

### Main Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | User registration |
| `GET /api/auth/me` | Get current user |
| `POST /api/screenings` | Submit screening |
| `GET /api/screenings` | Get screening history |
| `POST /api/therapy-requests` | Create therapy request |
| `GET /api/therapists` | List therapists |
| `POST /api/sessions` | Book session |
| `GET /api/dashboard/national` | National dashboard data |
| `GET /api/admin/users` | User management |

---

## 📸 Screenshots

> **Note:** Placeholder images are provided below. Actual screenshots will be added after deployment.

| Screen | Description |
|--------|-------------|
| ![Screening Form](screenshots/screening-form.png) | **Student Screening Form** - Multi-step questionnaire with PHQ-9 and GAD-7 questions |
| ![Student Dashboard](screenshots/student-dashboard.png) | **Student Dashboard** - View results, track progress, access resources |
| ![Therapist Booking](screenshots/therapist-booking.png) | **Therapist Booking** - Search and book appointments with qualified therapists |
| ![Therapist Portal](screenshots/therapist-portal.png) | **Therapist Portal** - Manage sessions, view assigned students |
| ![National Dashboard](screenshots/national-dashboard.png) | **National Dashboard** - Aggregate data with heatmaps and KPIs |
| ![Admin Panel](screenshots/admin-panel.png) | **Admin Panel** - User management, system settings, audit logs |

---

## 🚀 Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Railway/Render (Backend)

1. Connect your GitHub repository
2. Set start command: `npm start`
3. Add PostgreSQL and Redis addons
4. Configure environment variables

### Docker Production

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Run production stack
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🤝 Contributing

We welcome contributions! Please see [ROADMAP.md](ROADMAP.md) for planned features and:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Ministry of Education for their support
- Ministry of Health for therapist verification
- All contributors and testers

---

## 📞 Support

- Email: support@nsmpi.gov
- Phone: +20 2 1234 5678
- Documentation: http://localhost:5000/api/docs

---

<p align="center">
  Built with ❤️ for student mental health
</p>
# دليل الرفع (Deployment Guide)

بناءً على التحليل الهندسي، فإن أفضل وأقوى حل لرفع مشروع `MindTrackEDU-Official`، مع الحفاظ على وظائف الدردشة المشفرة والمهام الخلفية، هو **التقسيم الذكي**:

*   **الواجهة الأمامية (Frontend):** تُرفع على [Vercel](https://vercel.com/)، لسرعته وكفاءته في توزيع المحتوى عالميًا.
*   **الواجهة الخلفية (Backend) وقاعدة البيانات (Database) و Redis:** تُرفع على [Railway.app](https://railway.app/)، لدعمه لـ Docker و WebSockets والمهام الخلفية.

--- 

## 🛠️ الخطوات العملية

### الخطوة الأولى: رفع الواجهة الخلفية (Backend) على Railway

1.  **تسجيل الدخول:** ادخلي على [Railway.app](https://railway.app/) وسجلي الدخول باستخدام حساب GitHub الخاص بك.
2.  **إنشاء مشروع جديد:** اضغطي على **New Project** ثم اختاري **Deploy from GitHub repo**.
3.  **اختيار الريبو:** اختاري الريبو `YOMNA190/MindTrackEDU-Official`.
4.  **تحديد مسار الجذر (Root Directory):** عندما يُطلب منك تحديد مسار الجذر، اختاري `/nsmpi/backend`.
5.  **إعداد المتغيرات البيئية (Environment Variables):** هذه خطوة **بالغة الأهمية**. في إعدادات المتغيرات على Railway، أضيفي جميع المتغيرات الموجودة في ملف `.env.example` الرئيسي (الموجود في `nsmpi/.env.example`). تأكدي بشكل خاص من إضافة وتعيين القيم الصحيحة للمتغيرات التالية:
    *   `DATABASE_URL`: رابط اتصال قاعدة البيانات (PostgreSQL) الذي توفره Railway. ستقوم Railway تلقائيًا بإنشاء قاعدة بيانات PostgreSQL لك وتوفير هذا الرابط.
    *   `REDIS_URL`: رابط اتصال Redis الذي توفره Railway. ستقوم Railway تلقائيًا بإنشاء خدمة Redis لك وتوفير هذا الرابط.
    *   `JWT_SECRET`: مفتاح سري قوي وطويل (32 حرفًا على الأقل) لتوقيع رموز JWT.
    *   `ENCRYPTION_KEY`: مفتاح تشفير قوي وطويل (32 حرفًا) لتشفير البيانات الحساسة.
    *   `FRONTEND_URL`: رابط الواجهة الأمامية بعد رفعها على Vercel (مثلاً: `https://your-frontend-app.vercel.app`). هذا ضروري لـ CORS و Socket.io.
    *   `VITE_API_URL`: رابط الواجهة الخلفية الخاص بك على Railway متبوعًا بـ `/api` (مثلاً: `https://backend-production.up.railway.app/api`).
    *   `VITE_SOCKET_URL`: رابط الواجهة الخلفية الخاص بك على Railway (مثلاً: `https://backend-production.up.railway.app`).
    
    *ملاحظة:* ستقوم Railway باستخدام نظام `Nixpacks` (عبر ملف `railway.toml`) لبناء ونشر الواجهة الخلفية. هذا النظام أكثر استقراراً في التعامل مع المشاريع التي تحتوي على مجلدات فرعية.
6.  **نسخ رابط الواجهة الخلفية:** بعد نجاح النشر، سيوفر لك Railway رابطًا للواجهة الخلفية (مثلاً: `https://backend-production.up.railway.app`). **انسخي هذا الرابط**، ستحتاجينه في الخطوة التالية.

### الخطوة الثانية: رفع الواجهة الأمامية (Frontend) على Vercel

1.  **تسجيل الدخول:** ادخلي على [Vercel](https://vercel.com/) واربطي حساب GitHub الخاص بك.
2.  **إضافة مشروع جديد:** اضغطي على **Add New Project** واختاري نفس الريبو `YOMNA190/MindTrackEDU-Official`.
3.  **إعدادات المشروع:** في إعدادات المشروع:
    *   **Framework Preset:** اختاري `Vite`.
    *   **Root Directory:** اختاري `/nsmpi/frontend`.
4.  **إعداد المتغيرات البيئية (Environment Variables):** أضيفي المتغيرات التالية:
    *   **الاسم:** `VITE_API_URL`
    *   **القيمة:** الرابط الذي نسخته من Railway (مع إضافة `/api` في آخره). على سبيل المثال: `https://backend-production.up.railway.app/api`.
    *   **الاسم:** `VITE_SOCKET_URL`
    *   **القيمة:** الرابط الذي نسخته من Railway (بدون إضافة `/api` في آخره). على سبيل المثال: `https://backend-production.up.railway.app`.
5.  **النشر (Deploy):** اضغطي على **Deploy**.

--- 

## 🚀 لماذا هذا هو الحل الأفضل؟

*   **الاستقرار (Stability):** سيظل `Socket.io` يعمل بسلاسة، مما يضمن استمرارية الدردشة بين الطلاب والمعالجين دون انقطاع في الخدمة.
*   **الأمان (Security):** ستكون قاعدة البيانات و Redis في بيئة معزولة ومحمية، مما يعزز أمان البيانات.
*   **قابلية التوسع (Scalability):** إذا نما المشروع، يمكنك زيادة موارد الخادم بسهولة بضغطة زر واحدة دون الحاجة لتعديل أي سطر من التعليمات البرمجية.
*   **تحسين البناء (Optimized Build):** تم تحويل نظام البناء إلى `Nixpacks` عبر ملف `railway.toml` في مجلد `nsmpi/backend`. هذا يحل مشكلة "Error creating build plan with Railpack" التي تحدث أحياناً عند استخدام Dockerfiles في مجلدات فرعية عميقة. كما تم إضافة ملف `Procfile` لضمان تشغيل السيرفر بشكل صحيح.

--- 

## ملاحظات هامة

*   **مسار الـ API:** لاحظي أن مسار الـ API المستخدم في الواجهة الخلفية هو `/api` وليس `/api/v1` كما قد يُفهم من بعض السياقات. تأكدي من استخدام `/api` عند إعداد `VITE_API_URL`.
*   **ملف `railway.toml`:** هذا الملف يضمن أن Railway يستخدم `Dockerfile` الخاص بك بشكل صحيح، مما يمنع الأخطاء المتعلقة بـ Railpack.
