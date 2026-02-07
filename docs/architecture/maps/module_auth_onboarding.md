# Module: Auth & Onboarding

**ViewTypes**: `ONBOARDING`, `LOGIN`, `REGISTER`
**API Routes**: `/api/auth`, `/api/onboarding-v2`

## 1. User Journey (Flowchart)

```mermaid
graph LR
    User((User)) -->|Sign Up| Clerk[Clerk Auth]
    Clerk -->|Redirect| App[App.tsx]
    App -->|Check Metadata| OnboardingCheck{Onboarding Complete?}
    
    OnboardingCheck -->|No| OnboardingV2[Onboarding Component]
    OnboardingV2 -->|Step 1| RoleSelect[Select Role]
    
    RoleSelect -->|Dentist| DentistFlow[Dentist: Personal Workspace]
    RoleSelect -->|Clinic Owner| OwnerFlow[Owner: Create Clinic]
    RoleSelect -->|Patient| PatientFlow[Patient: Portal Access]
    
    DentistFlow -->|Input| PersonalData[CPF, Phone, CRO]
    OwnerFlow -->|Input| ClinicData[Clinic Name, CPF, Phone, CRO]
    PatientFlow -->|Input| PatientData[CPF, Phone]
    
    PersonalData -->|Submit| API_QuickSetup
    ClinicData -->|Submit| API_QuickSetup
    PatientData -->|Submit| API_QuickSetup
    
    API_QuickSetup -->|Success| InitSession[Init Session]
    InitSession -->|Redirect| Dashboard
```

## 2. Technical Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend (OnboardingV2)
    participant API as API (/api/onboarding-v2)
    participant DB as Database
    participant CL as Clerk (Metadata)
    
    U->>FE: Select Role & Submit Data
    FE->>FE: Validate Input (Zod)
    FE->>API: POST /quick-setup (role, name, cpf...)
    
    API->>API: Validate Body
    API->>DB: Transaction Start
    
    alt Role: Dentist
        API->>DB: Create ProfessionalProfile
        API->>DB: Update User (CPF, Phone)
    else Role: Clinic Owner
        API->>DB: Create Organization (Clinic)
        API->>DB: Add Member (Role: Admin)
        API->>DB: Create ProfessionalProfile
    else Role: Patient
        API->>DB: Create PatientProfile
    end
    
    API->>CL: Update publicMetadata { role, onboardingComplete }
    API->>DB: Transaction Commit
    
    API-->>FE: 200 OK
    FE->>FE: Reload Session
    FE->>U: Redirect to Dashboard
```

## 3. State Machine (UI)

```mermaid
stateDiagram-v2
    [*] --> RoleSelection
    
    state RoleSelection {
        [*] --> Idle
        Idle --> DentistSelected: Click 'Dentista'
        Idle --> OwnerSelected: Click 'Dono de Clínica'
        Idle --> PatientSelected: Click 'Paciente'
    }
    
    DentistSelected --> DataInput: Next
    OwnerSelected --> DataInput: Next (Includes Clinic Name)
    PatientSelected --> DataInput: Next
    
    state DataInput {
        [*] --> FormIdle
        FormIdle --> Validating: Typing
        Validating --> FormIdle
        FormIdle --> Submitting: Submit
    }
    
    Submitting --> Success: API 200
    Submitting --> Error: API 4xx/5xx
    
    Error --> FormIdle: Retry
    Success --> [*]: Redirect
```

## Gaps & Risks

- **Critical**: `quick-setup` endpoint must validate that the user doesn't already have an organization if trying to create one to prevent duplicates (though typical flow prevents this).
- **Critical**: Ensure `CPF` uniqueness constraint in DB is handled gracefully in UI.
- **Improvement**: Add progress steps indicator in UI for better UX.
