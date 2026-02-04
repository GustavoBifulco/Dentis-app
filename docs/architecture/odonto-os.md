# Odonto OS - Architecture Design Document

**Status**: Draft
**Authors**: Principal Engineer
**Date**: 2026-02-04

## A. Visão do Produto
Transformar o SaaS atual em um "Sistema Operacional da Odontologia" completo, cobrindo não apenas o prontuário (EMR), mas toda a cadeia operacional: Agenda, Laboratório, Logística, Estoque, Financeiro e CRM.
O foco é oferecer uma "arquitetura blindada": auditável, segura (RBAC+LGPD), consistente (financeiro/estoque) e escalável (multi-tenant/multi-unit).

---

## B. Domínios e Limites (Bounded Contexts)

### 1. Identity & Access (IAM)
*   **Responsabilidade**: Autenticação (Clerk), RBAC granular, gestão de usuários e hierarquia de unidades (Headquarters vs Branches).
*   **Contratos**: Emite `UserAuthenticated`, `RoleChanged`.

### 2. Clinical Care (Core)
*   **Responsabilidade**: Prontuário, Odontograma, Perio, Exames, Procedimentos e Consentimentos.
*   **Contratos**: Emite `EncounterSigned`, `ProcedureCompleted`.

### 3. Lab & Operations
*   **Responsabilidade**: Gestão de casos protéticos (OS), Kanbans de etapas, SLA e Portal do Laboratório.
*   **Contratos**: Emite `LabCaseCreated`, `LabCaseShipped`.

### 4. Logistics
*   **Responsabilidade**: Rastreio de remessas (Motoboy/Correios), Prova de Entrega (POD).
*   **Contratos**: Emite `ShipmentDelivered`.

### 5. Inventory & Supply Chain
*   **Responsabilidade**: Catálogo, Estoque por lote/validade, Compras e Consumo (BOM).
*   **Contratos**: Emite `StockLow`, `ItemConsumed`.

### 6. Finance & Profitability
*   **Responsabilidade**: Ledger imutável, Contas a Receber/Pagar, Caixa e DRE.
*   **Contratos**: Emite `PaymentReceived`, `InvoiceDue`.

---

## C. Modelo de Dados (Transversal)

### Padrão para Entidades Críticas
Todas as tabelas de negócio (exceto auxiliares) devem ter:
```sql
id SERIAL PK
tenant_id TEXT NOT NULL (Index)
unit_id TEXT (Index, Nullable for Global)
status TEXT (DRAFT, SIGNED, LOCKED, VOID)
created_at TIMESTAMP
updated_at TIMESTAMP
version INTEGER (Optimistic Concurrency)
```

### Locking & Versioning
*   Entidades clínicas (Encounters) são `append-only` lógica.
*   Edições após `SIGNED` geram um registro na tabela `addendums` ou uma nova versão com ponteiro `previous_version_id`.

---

## D. Padrões Transversais (P1-P7)

### P1. Status & Imutabilidade
*   Máquina de estados rígida.
*   `SIGNED`: Imutável. Qualquer alteração exige `Addendum`.

### P2. Unified Timeline
*   Tabela desnormalizada `timeline_events` para consultas rápidas de histórico cruzado.
*   Indexada por `patient_id` e `timestamp`.

### P3. Attachments & Audit
*   Centralização de arquivos em `documents`.
*   Tabela `access_logs` registra todo `view` e `download` para compliance LGPD.

### P4. RBAC Granular
*   `permissions`: Ações atômicas (`clinical.view`, `financial.edit`).
*   `roles`: Agrupadores de permissões.
*   `user_unit_scopes`: Define em quais unidades o usuário exerce o papel.

---

## E. Estratégia de Integrações (Adapters)
O Core não depende de providers externos. Usamos o padrão **Hexagonal/Ports & Adapters**.
*   `IPaymentProvider` -> StripeAdapter, PagarmeAdapter.
*   `ILogisticsProvider` -> LoggiAdapter, LalamoveAdapter.

---

## F. Jobs & Idempotência
*   Uso de filas (BullMQ/Redis) para tarefas assíncronas: envios de e-mail, geração de PDF, webhooks.
*   `idempotency_key` em endpoints críticos (pagamentos, estoque).

---

## G. Riscos & Mitigação
1.  **Privacidade**: Vazamento de dados de pacientes.
    *   *Mitigação*: Logging agressivo de acesso (P4) e RLS (Row Level Security) lógico via `tenant_id` em toda query.
2.  **Consistência de Estoque**: Race conditions.
    *   *Mitigação*: Transactions DB e Versionamento otimista.
3.  **Complexidade**: Curva de aprendizado alta.
    *   *Mitigação*: Documentação viva e Design System consistente.
