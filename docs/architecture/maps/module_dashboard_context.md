# Module: Dashboard & Context

**ViewTypes**: `DASHBOARD`
**API Routes**: `/api/session`, `/api/dashboard/stats`, `/api/dashboard/operations`

## 1. User Journey (Flowchart)

```mermaid
graph TD
    Login --> AppLoad[Load App]
    AppLoad --> FetchSession[GET /api/session]
    
    FetchSession --> ContextCheck{Has Contexts?}
    ContextCheck -->|No| Onboarding
    ContextCheck -->|Yes| LoadActive[Load Active Context]
    
    LoadActive --> DashboardView[Render Dashboard]
    DashboardView --> FetchStats[GET /api/dashboard/stats]
    
    subgraph "Context Switcher"
        DashboardView --> ClickProfile[Click Profile]
        ClickProfile --> SelectContext[Select Clinic/Personal]
        SelectContext --> ReloadSession[Update Session State]
        ReloadSession --> DashboardView
    end
```

## 2. Technical Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    participant FE as Frontend (App.tsx)
    participant API as API (/api/session)
    participant DB as Database
    participant CL as Clerk
    
    FE->>API: GET /
    API->>CL: Get Organization Memberships
    API->>DB: Get ProfessionalProfile
    API->>DB: Get OrganizationMembers (DB)
    
    loop Construct Contexts
        API->>API: Add Personal Workspace (if profile exists)
        API->>API: Add Clinic Memberships
        API->>API: Add Patient Profile (if exists)
    end
    
    API-->>FE: Return { session, availableContexts, activeContext }
    
    FE->>FE: Set Global Context (useAppContext)
    FE->>API: GET /api/dashboard/stats (with organizationId)
    API->>DB: Aggregate Appointments/Labs/Stock
    API-->>FE: Return Stats
```

## 3. State Machine (Dashboard)

```mermaid
stateDiagram-v2
    [*] --> LoadingSession
    
    state LoadingSession {
        [*] --> Fetching
        Fetching --> Error: Failed
        Fetching --> Success: Loaded
    }
    
    Success --> DashboardRender
    
    state DashboardRender {
        [*] --> LoadingStats
        LoadingStats --> DisplayData: Stats 200 OK
        LoadingStats --> DisplayEmpty: Stats 404/Empty
    }
    
    DisplayData --> SwitchingContext: User changes context
    SwitchingContext --> LoadingSession
```

## Data Access Rules (RBAC)

*   **Personal Context**: `organizationId` is a prefixed string (e.g., `personal-user_123`).
*   **Clinic Context**: `organizationId` is the UUID of the organization.
*   **Endpoints**:
    *   `/api/dashboard/stats`: Requires `organizationId` header or query param.
    *   `/api/dashboard/operations`: Fetches overdue labs and low stock.

## Gaps & Risks

*   **Performance**: `GET /api/session` performs multiple heavy DB calls + Clerk API call. Could be slow.
*   **Consistency**: `organizationId` for personal context is generated on the fly in `session.ts`. Ensure it is consistent across all other endpoints.
