# Module: Operations & Finance

**ViewTypes**: `SCHEDULE`, `FINANCE`, `LABS`, `INVENTORY`
**API Routes**: `/api/appointments`, `/api/finance`, `/api/lab`, `/api/inventory`

## 1. User Journey (Flowchart)

```mermaid
graph TD
    Dashboard -->|Agenda| ScheduleView
    Dashboard -->|Finance| FinanceView
    Dashboard -->|Labs| LabView
    
    subgraph "Appointment Flow"
        ScheduleView -->|Click Slot| CreateAppt[Create Appointment]
        CreateAppt -->|Save| ApptCreated[Status: Pending]
        ApptCreated -->|Confirm| ApptConfirmed[Status: Confirmed]
        ApptConfirmed -->|Execute| ApptCompleted[Status: Completed]
        
        ApptCompleted -->|Trigger| Deduction[Inventory Deduction]
        ApptCompleted -->|Trigger| Billing[Create Financial Record]
    end
    
    subgraph "Finance Flow"
        FinanceView --> Ledger[General Ledger]
        FinanceView --> Receivables[Accounts Receivable]
        Ledger -->|Add Entry| ManualTransaction
    end
    
    subgraph "Lab Flow"
        LabView -->|New Order| CreateLabOrder
        CreateLabOrder -->|Status: Planned| SentToLab
        SentToLab -->|Status: Received| LabReceived
    end
```

## 2. Technical Flow (Sequence Diagram)

**Appointment Completion & Impacts**

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as API (/api/appointments)
    participant DB as Database
    participant INV as Inventory Service
    
    FE->>API: POST /:id/complete
    API->>DB: Get Appointment & Procedure
    API->>DB: Update Status = 'completed'
    
    opt Has BOM (Bill of Materials)
        loop For each Item
            API->>DB: Update Inventory (qty - consumed)
            API->>DB: Log InventoryMovement
        end
    end
    
    API-->>FE: Success
```

## 3. State Machine (Appointment)

```mermaid
stateDiagram-v2
    [*] --> Scheduled
    
    state Scheduled {
        [*] --> Pending
        Pending --> Confirmed: User/WA Confirm
        Pending --> Cancelled: Cancel
    }
    
    Confirmed --> Attended: Patient Arrives
    Attended --> Completed: Procedure Done
    Confirmed --> NoShow: Patient Missed
    
    Completed --> [*]
    Cancelled --> [*]
```

## Gaps & Risks

*   **Concurrency**: Inventory deduction doesn't seem to use strict locking, potential for race conditions if high volume.
*   **Balance Calculation**: Finance module in `finance.ts` comments out running balance calculation ("Calculated on the fly"). This might be a performance bottleneck as the ledger grows.
*   **Permissions**: `scopedDb` implementation needs verification to ensure it rigidly enforces `organizationId` across all queries.
