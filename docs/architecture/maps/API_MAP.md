# Dentis OS - API Map

**Base URL**: `/api`

## 🔐 Auth & Onboarding

| Method | Endpoint | Description | Query/Body | RBAC |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/auth/me` | Current user info | - | Auth |
| **POST** | `/onboarding-v2/quick-setup` | Initial role setup | `{ role, name, cpf, clinicName? }` | Auth |

## 🏠 Dashboard & Session

| Method | Endpoint | Description | Query/Body | RBAC |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/session` | User session & contexts | - | Auth |
| **GET** | `/dashboard/stats` | KPI summary | `?organizationId` | Auth |
| **GET** | `/dashboard/operations` | Low stock / Overdue labs | `?organizationId` | Auth |

## 🧑‍⚕️ Patients & Clinical Records

| Method | Endpoint | Description | Query/Body | RBAC |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/patients` | List patients | `?query` | Auth |
| **POST** | `/patients` | Create patient | `{ name, cpf, phone... }` | Auth |
| **PUT** | `/patients/:id` | Update patient | `{ ... }` | Auth + Owner |
| **DELETE** | `/patients/:id` | Archive patient | `?force=true` (Hard) | Auth + Owner |
| **GET** | `/records/timeline/:id` | Unified timeline | - | Clinical View |
| **POST** | `/records/encounters` | Start encounter | `{ type, complaints... }` | Clinical Write |
| **PUT** | `/records/encounters/:id` | Update draft | `{ ... }` | Clinical Write |
| **POST** | `/records/encounters/:id/sign` | Finalize (Lock) | MFA Required | Clinical Write |
| **GET** | `/records/odontogram/:id` | Current tooth status | - | Clinical View |
| **POST** | `/records/odontogram` | Update tooth status | `{ tooth, condition... }` | Clinical Write |
| **GET** | `/treatment/progress/:id` | Journey phases | - | Clinical View |

## 📅 Schedule & Workflow

| Method | Endpoint | Description | Query/Body | RBAC |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/appointments` | List appointments | `?date, status` | Auth |
| **POST** | `/appointments` | Create appointment | `{ patientId, date, time... }` | Auth |
| **PUT** | `/appointments/:id` | Reschedule/Update | `{ ... }` | Auth |
| **POST** | `/appointments/:id/confirm` | Confirm via App | - | Auth |
| **POST** | `/appointments/:id/complete` | Complete & Deduct Stock | - | Auth |
| **GET** | `/appointments/availability` | Check slots | `?date` | Public/Auth |
| **GET** | `/appointments/settings/get` | Org schedule config | - | Admin |

## 💰 Finance & Operations

| Method | Endpoint | Description | Query/Body | RBAC |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/finance/ledger` | Transactions list | - | Admin/Finance |
| **POST** | `/finance/transaction` | manual entry | `{ amount, type, category... }` | Admin/Finance |
| **GET** | `/lab` | List lab orders | - | Auth |
| **POST** | `/lab` | Create lab order | `{ labName, type, dueDate... }` | Auth |
| **PUT** | `/lab/:id/status` | Update status | `{ status }` | Auth |

## 🤖 Communication & AI

| Method | Endpoint | Description | Query/Body | RBAC |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/ai/chat` | AI Assistant | `{ message, context }` | Role-Gated + Quota |
| **POST** | `/whatsapp/send` | Send Message | `{ to, text }` | Quota |
| **POST** | `/whatsapp/webhook` | Incoming Msg | Meta Payload | Public (Verify) |
| **GET** | `/settings/notifications` | User prefs | - | Auth |
| **PUT** | `/settings/notifications` | Update prefs | `{ email, push... }` | Auth |
