# Dentis OS — UX Flow Matrix

> Documentação viva dos fluxos de produto. Status atualizado conforme auditoria.

## Status Legend
- ✅ Validado e funcional
- ⚠️ Funciona com ressalvas
- ❌ Quebrado ou incompleto
- 🔄 Em progresso

---

## A. Pre-Auth (Público)

| Fluxo | Status | Objetivo | CTA Primário | Critério de Sucesso | Dependências | Notas |
|-------|--------|----------|--------------|---------------------|--------------|-------|
| Landing Page | 🔄 | Converter visitante em usuário | "Initialize System" / "Entrar" | Abre AuthModal | - | Remover "End-to-End Encryption" (7.4) |
| Pricing/Planos | ⚠️ | Mostrar valor antes de criar conta | - | - | - | Não existe página separada, inline no onboarding |
| Termos de Uso | ⚠️ | Transparência legal | - | Página acessível | - | Verificar se existe rota |
| Privacidade | ⚠️ | LGPD compliance | - | Página acessível | - | Verificar se existe rota |

---

## B. Auth (Clerk)

| Fluxo | Status | Objetivo | CTA | Critério | Dependências | Notas |
|-------|--------|----------|-----|----------|--------------|-------|
| Login (email/senha) | 🔄 | Autenticar usuário existente | "Entrar" | Redirect para dashboard/onboarding | Clerk | Via AuthModal |
| Registro | 🔄 | Criar conta nova | "Criar conta" | Cria user no Clerk | Clerk | Via AuthModal |
| SSO (Google/etc) | 🔄 | Login alternativo | - | Autenticação via provider | Clerk | Se habilitado |
| Reset de Senha | 🔄 | Recuperar acesso | - | Email enviado | Clerk | Via Clerk hosted |

---

## C. Onboarding

| Fluxo | Status | Objetivo | CTA | Critério | Dependências | Notas |
|-------|--------|----------|-----|----------|--------------|-------|
| Seleção de Tipo | 🔄 | Definir role | Selecionar card | Role salvo | - | 3 tipos: dentist, clinic_owner, patient |
| Dados Básicos | 🔄 | Coletar CPF/Telefone | "Continuar" | Dados salvos no DB | API quick-setup | CPF formatado |
| Escolha de Plano | 🔄 | Monetização | "Começar Grátis" / "Assinar PRO" | Redirect ou finalizar | Stripe | Diferentes para dentist vs clinic_owner |
| Finalização | 🔄 | Marcar onboardingComplete | - | Redirect para Dashboard | Clerk metadata | Reload user |

### Tipos de Conta (C.1)
- [x] Dentista - Implementado
- [x] Dono/Gestor de Clínica - Implementado
- [x] Paciente - Implementado
- [ ] Laboratório/Protético - Escondido
- [ ] Fornecedor - Escondido

---

## D. Billing/Stripe

| Fluxo | Status | Objetivo | CTA | Critério | Dependências | Notas |
|-------|--------|----------|-----|----------|--------------|-------|
| Ver Planos | 🔄 | Comparar opções | - | Planos visíveis | - | No onboarding step 2 |
| Assinar | 🔄 | Checkout | "Assinar PRO" | Stripe redirect | Stripe Checkout | Via /api/checkout/create-session |
| Portal Cliente | 🔄 | Gerenciar assinatura | - | Abre portal | Stripe Portal | Verificar implementação |
| Upgrade/Downgrade | 🔄 | Mudar plano | - | - | Stripe | Verificar |
| Cancelar | 🔄 | Encerrar assinatura | - | - | Stripe | Verificar |

---

## E. Dashboards

| Perfil | Status | Componente | Elementos |
|--------|--------|------------|-----------|
| Dentista | 🔄 | ClinicalDashboard | Agenda hoje, pacientes, quick actions |
| Dono/Gestor | 🔄 | ClinicalDashboard | + gestão equipe, financeiro |
| Paciente | 🔄 | PatientDashboard | Timeline, contexto familiar, CTAs |
| Lab | ❌ | - | Não implementado |
| Fornecedor | ❌ | - | Não implementado |

---

## F. Navegação (Menu Items)

| Item | Status | ViewType | Notas |
|------|--------|----------|-------|
| Dashboard | 🔄 | DASHBOARD | Hub central |
| Pacientes | 🔄 | PATIENTS | Lista + busca |
| Agenda | 🔄 | SCHEDULE | Calendário |
| Financeiro | 🔄 | FINANCE | Cobranças |
| Labs | 🔄 | LABS | Casos protéticos |
| Marketplace | 🔄 | MARKETPLACE | Shop |
| Configurações | 🔄 | SETTINGS | Preferências |
| Perfil | 🔄 | PROFILE | Dados do usuário |

---

## G. Fluxos Clínicos

| Fluxo | Status | Rota/Componente | Ações |
|-------|--------|-----------------|-------|
| Listar Pacientes | 🔄 | Patients.tsx | Busca, filtros |
| Criar Paciente | 🔄 | NewPatientModal | Nome, CPF, telefone |
| Editar Paciente | 🔄 | PatientForm | Todos os campos |
| Prontuário | 🔄 | PatientRecord | Tabs, timeline |
| Upload Docs | 🔄 | /api/uploads | S3 |
| Agenda | 🔄 | Schedule.tsx | CRUD consultas |
| Cobranças | 🔄 | Finance.tsx | Gerar, status |
| Consentimentos | 🔄 | ConsentManager | Coletar, logs |

---

## H. i18n Coverage

| Área | pt-BR | en | es | Status |
|------|-------|----|----|--------|
| Landing | ❌ | ❌ | ❌ | Hardcoded strings |
| Auth | ⚠️ | ⚠️ | ⚠️ | Parcial |
| Onboarding | ❌ | ❌ | ❌ | Hardcoded |
| Dashboard | ⚠️ | ⚠️ | ⚠️ | Parcial via t() |
| Patients | ✅ | ⚠️ | ⚠️ | Usa t() |
| Errors | ⚠️ | ⚠️ | ⚠️ | Parcial |

---

## Issues Encontrados

1. **Landing:** Claim "End-to-End Encryption" sem comprovação (remover per 7.4)
2. **Landing:** Strings 100% hardcoded em português
3. **Onboarding:** Strings hardcoded, sem i18n
4. **Onboarding:** Falta role "Administrador/Gestor" separado de "Dono de Clínica"
5. **Onboarding:** CRO marcado como obrigatório na UI mas comentado no código
6. **Termos/Privacidade:** Verificar se páginas existem e são acessíveis
7. **i18n:** Muitos componentes não usam t()
