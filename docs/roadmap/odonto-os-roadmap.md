# Odonto OS - Roadmap de Implementação

**Estratégia**: Implementação incremental em ondas. A "Onda 0" é bloqueante para as demais.

## ONDA 0: Fundação (The Shield)
**Foco**: Segurança, Auditoria e Consistência. Sem features novas funcionais, apenas infraestrutura.

- [ ] **P1. Locking & Status**: Implementar máquina de estados e tabela `addendums`.
- [ ] **P4. Audit & Access**: Criar `access_logs` e middleware de logging de leitura.
- [ ] **P5. RBAC Granular**: Criar tabelas `permissions`, `roles` e seed inicial.
- [ ] **P2. Unified Timeline**: Criar tabela `timeline_events` e trigger/service para popular.
- [ ] **P3. Attachments**: Atualizar schema de `documents` com log de acesso.

---

## ONDA 1: Operação Clínica (Core)
**Foco**: Fechar o ciclo do atendimento com a nova arquitetura segura.

- [ ] **Migração Prontuário**: Adaptar `encounters` e `prescriptions` para usar o novo padrão P1 (Lock) e P5 (RBAC).
- [ ] **Odontograma Integration**: Conectar Odontograma com `procedures` e `financials` (orçamento).
- [ ] **Timeline Integration**: Alimentar timeline com eventos clínicos.
- [ ] **Consentimentos**: Validar fluxo de assinatura com locking.

---

## ONDA 2: Ciclo Operacional (Backoffice)
**Foco**: Laboratório (Protético) e Logística.

- [ ] **Lab Cases (OS)**: CRUD de OS, etapas e anexos.
- [ ] **Portal Lab**: Acesso restrito para parceiros externos.
- [ ] **Logística Manual**: Registro de remessas e tracking.
- [ ] **Estoque Base**: Lotes, validade e movimentações auditáveis.

---

## ONDA 3: Financeiro & Inteligência
**Foco**: Money & Data.

- [ ] **Financeiro Core**: Ledger, AR/AP, Caixa.
- [ ] **Rentabilidade**: Cálculo de custo por procedimento (BOM).
- [ ] **Dashboard**: Relatórios gerenciais.
- [ ] **CRM**: Funil de vendas e automações.
