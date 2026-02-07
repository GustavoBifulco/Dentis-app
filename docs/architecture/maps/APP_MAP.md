# Dentis OS - Application Map

This document serves as the index for the visual documentation of the Dentis OS platform.

## 🗺️ Master Maps

- [**Master User Flow**](./MASTER_FLOW.mmd) (Mermaid) - The high-level navigation map ("Subway Map").
- [**API Map**](./API_MAP.md) - List of all backend endpoints by module.
- [**Database Relationships**](./DB_RELATIONS.mmd) (Mermaid) - Entity Relationship Diagram.

## 📦 Domain Modules

| Module | Description | ViewType (UI) | API Routes |
| :--- | :--- | :--- | :--- |
| **Auth & Onboarding** | Authentication, Role Selection, Profile Setup | `ONBOARDING`, `LOGIN` | `/api/auth`, `/api/onboarding-v2` |
| **Dashboard** | Main landing, KPIS, Context Switching | `DASHBOARD` | `/api/dashboard`, `/api/session` |
| **Patients** | Patient CRUD, Anamnesis, Portal | `PATIENTS`, `PATIENT_RECORD` | `/api/patients`, `/api/patient`, `/api/patient-invite` |
| **Schedule** | Calendar, Appointments, Availability | `SCHEDULE` | `/api/appointments`, `/api/appointment-requests` |
| **Clinical** | Medical Records, Odontogram, Prescriptions | `CLINICAL_EXECUTION`, `DOCUMENTS` | `/api/clinical`, `/api/records`, `/api/procedures` |
| **Finance** | Income/Expense, Invoices, Split | `FINANCE`, `FINANCIAL_SPLIT` | `/api/finance`, `/api/fiscal` |
| **Inventory** | Stock Management, Tracking | `INVENTORY` | `/api/inventory` |
| **Labs/Logistics** | Lab Orders, Courier Requests | `LABS`, `COURIER` | `/api/lab`, `/api/orders`, `/api/courier` |
| **Marketplace** | Shopping, Supplies | `MARKETPLACE` | `/api/marketplace` (Planned) |
| **Communication** | WhatsApp, Campaigns, Notifications | `COMMUNICATION` | `/api/communication`, `/api/whatsapp`, `/api/marketing` |
| **Settings** | Clinic Config, Integrations, Team | `SETTINGS`, `TEAM_SETTINGS`, `MANAGE_CLINIC` | `/api/settings`, `/api/admin` |
| **AI Assistant** | Chatbot, Smart Insights | `AI_ASSISTANT` | `/api/ai`, `/api/chat` |

## 🏗️ Technical Architecture

```mermaid
graph TD
    User((User)) -->|Browser/App| Client[Client (React/Vite)]
    Client -->|REST API| Server[Server (Hono/Node.js)]
    
    subgraph "Backend Infrastructure"
        Server -->|Auth| Clerk[Clerk Auth]
        Server -->|ORM| DB[(Postgres DB)]
        Server -->|Payments| Stripe[Stripe Connect]
        Server -->|Storage| S3[R2/S3 Storage]
        Server -->|Messaging| WPP[WhatsApp API]
    end
    
    subgraph "Frontend Contexts"
        Client -->|Role: Dentist| ContextA[Personal Workspace]
        Client -->|Role: Clinic Owner| ContextB[Clinic Workspace]
        Client -->|Role: Patient| ContextC[Patient Portal]
    end
```

## 🚨 Critical Points & Risks (Gaps)

*   **Role Consistency**: Ensure `orgRole` vs `UserRole` is checked on every restricted endpoint.
*   **Tenant Isolation**: `organizationId` MUST be mandatory in all queries (except system admin).
*   **Mobile Support**: Check responsive behavior for complex tables (Finance/Patients).
