# 🚀 MindTrackEDU: Technical MVP Roadmap

This roadmap provides a structured path to transform the current **MindTrackEDU-Official** codebase into a functional Minimum Viable Product (MVP).

---

## 1. Summary of Current Implementation

The project currently has a solid foundation in its data models and specialized utilities.

| File / Module | Purpose | Status |
|---------------|---------|--------|
| **`schema.prisma`** | Comprehensive data models for Users, Profiles, Screenings, Sessions, and Audit Logs. | ✅ **Robust** |
| **`encryption.ts`** | AES-256-CBC for data at rest and RSA-4096 for End-to-End Encryption (E2EE). | ✅ **Advanced** |
| **`screeningCalculator.ts`** | Weighted PHQ-9 and GAD-7 scoring with clinical risk assessment. | ✅ **Advanced** |
| **`chat.ts` (Types)** | Data structures for E2EE messaging and session management. | ✅ **Defined** |
| **`Login.tsx`** | Basic UI for multi-role authentication. | 🚧 **UI Only** |

---

## 2. Missing Pieces (The Gaps)

To reach a functional MVP, the following core components must be built:

- **Authentication Flow**: Implementation of JWT-based login, registration, and Role-Based Access Control (RBAC) middleware.
- **API Routes**: Express routes for handling screenings, therapy requests, and profile management.
- **Frontend Pages**:
  - **Student Dashboard**: To view history and request therapy.
  - **Screening Form**: Interactive multi-step form for PHQ-9/GAD-7.
  - **Therapist Portal**: To view assigned students and manage sessions.
- **Real-time Integration**: Socket.io setup for the secure chat system.
- **Database Migration**: Running the Prisma schema against a live PostgreSQL instance.

---

## 3. Prioritized Task List (4 Phases)

### Phase 1: Authentication & User Management
*Goal: Allow users to sign up and log in securely.*

1.  **Auth Backend** (`authController.ts`, `authRoutes.ts`): Implement `register` and `login` using `bcrypt` for passwords and `jsonwebtoken` for sessions. (Complexity: **Medium**)
2.  **Auth Middleware** (`auth.ts`): Protect routes based on `UserRole`. (Complexity: **Small**)
3.  **Frontend Auth**: Connect `Login.tsx` to the backend and store tokens in `localStorage` or HttpOnly cookies. (Complexity: **Medium**)

### Phase 2: Screening & Risk Assessment
*Goal: Allow students to take the mental health test and get results.*

1.  **Screening API** (`screeningController.ts`): Create an endpoint that receives answers, uses `processScreening` from `utils`, and saves to the DB. (Complexity: **Medium**)
2.  **Screening UI**: Build a multi-step form in React for the PHQ-9/GAD-7 questions. (Complexity: **Medium**)
3.  **Results View**: Display the risk level and explanation (English/Arabic) to the student. (Complexity: **Small**)

### Phase 3: Therapy Requests & Matching
*Goal: Connect at-risk students with therapists.*

1.  **Request Logic** (`therapyRequestController.ts`): Logic to auto-generate a `TherapyRequest` if risk is HIGH/SEVERE. (Complexity: **Small**)
2.  **Admin/Therapist View**: A dashboard to view pending requests and assign therapists. (Complexity: **Large**)

### Phase 4: Secure Chat & E2EE
*Goal: Enable private communication.*

1.  **Socket.io Setup**: Initialize real-time connection in `server.ts`. (Complexity: **Medium**)
2.  **E2EE Implementation**: Use the RSA keys from `encryption.ts` to encrypt/decrypt messages on the client side before sending. (Complexity: **Large**)

---

## 4. Architectural Recommendations

1.  **Client-Side Encryption**: For true E2EE, the RSA private key should **never** leave the student's/therapist's device. Store it in a secure way (e.g., encrypted with the user's password hash) on the client side.
2.  **Interoperability**: When saving screenings, also generate a JSON object following the **HL7 FHIR** "Observation" resource standard to ensure future compatibility.
3.  **Audit Logging**: Use the existing `auditLogger.ts` middleware on **all** sensitive routes (Screening, Chat, Profile Update) to maintain a compliance trail.

---

## 5. Estimated Complexity Summary

| Task Group | Total Complexity | Priority |
|------------|------------------|----------|
| Auth & RBAC | Medium | Critical |
| Screening System | Medium | High |
| Therapist Matching | Large | Medium |
| E2EE Chat | Large | Medium |

---
*Last Updated: March 2026*  
*MindTrackEDU Technical Roadmap*
