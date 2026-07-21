# AI Financial Operating System (AI-FOS) — Developer & AI Guide

This document defines the project architecture, tech stack, feature prioritization, coding conventions, testing requirements, git workflow, and operational boundaries for AI-FOS.

---

# # Project Overview

**AI Financial Operating System (AI-FOS)** is a next-generation FinTech platform that consolidates fragmented personal finance management (budgeting, investments, loans, taxes, fraud monitoring, and financial goal tracking) into a unified, agentic AI platform.

- **Target Persona**: Salaried professionals managing multiple finance applications who require a single, intelligent dashboard with plain-language insights and actionable recommendations.
- **Core Value Proposition**: Rather than showing static historical tables, AI-FOS uses specialized AI agents coordinated by an **AI Orchestrator** to analyze spending behavior, predict expenses, optimize taxes, evaluate investments, and provide clear next steps.

### Tech Stack Matrix

| Category | Stack / Tools |
|---|---|
| **Frontend** | React.js • Next.js • TypeScript (Strict) • Tailwind CSS |
| **Backend** | Java Spring Boot • RESTful APIs • JWT Authentication |
| **AI & ML** | Python • Claude / OpenAI API • LangChain • Scikit-learn • TensorFlow / PyTorch • XGBoost |
| **Databases** | PostgreSQL (Relational) • MongoDB (Documents/Logs) • Redis (Caching/Sessions) |
| **External APIs** | Stock Market APIs • Mutual Fund APIs • Financial News APIs • Currency Exchange APIs |
| **DevOps & Cloud** | Docker • Kubernetes • GitHub Actions • Cloud Infrastructure (AWS / Azure / GCP) |

---

# # Feature Prioritization & MoSCoW Matrix

All development MUST strictly adhere to the feature hierarchy. Do not start work on lower-priority tiers until upper tiers are complete and verified.

### 🔴 MUST (v1 MVP Core Flow — Mandatory)
*The core flow without which the product cannot launch.*
1. **Unified Dashboard**: Single-pane overview of spending and overall financial health.
2. **Spending Agent**: Expense tracking, transaction categorization, and budget analysis.
3. **AI Orchestrator**: Synthesis of financial data into a plain-language summary with one clear actionable recommendation per session.

### 🔵 SHOULD (Week 1 Post-Launch Priority)
*Adds significant value once core MVP is operational.*
1. **Investment Agent**: Portfolio analysis, risk assessment, asset allocation, and tax-saving investment suggestions.
2. **Tax Agent**: Tax estimation, deduction analysis, and automated report generation.

### ⚫ COULD (Future Roadmap — Ideas, Not Immediate Features)
*Nice-to-have capabilities for later iterations.*
1. **Loan Agent**: EMI calculation, loan comparison, and refinancing analysis.
2. **Fraud Detection Agent**: Anomaly detection, suspicious transaction monitoring, and risk scoring.
3. **Goal Planning Agent**: Milestone roadmaps for major purchases (house, car, retirement).
4. **Economic Intelligence Agent**: RBI policy analysis, inflation tracking, and financial news impact.
5. **Voice Assistant & OCR**: Voice query interface and receipt image scanner.
6. **Integrations & Apps**: Direct UPI / Bank API sync and dedicated Mobile Application.

---

# # Multi-Agent System Architecture

```
                       Frontend (Next.js / React)
                                   │
                           API Gateway (REST / JWT)
                                   │
                            AI Orchestrator
                                   │
 ┌──────────────┬──────────────┬───┴──────────┬──────────────┬──────────────┬──────────────┐
 │              │              │              │              │              │              │
Spending    Investment       Tax            Loan          Fraud          Goals        Economic
 Agent        Agent         Agent          Agent          Agent          Agent         Agent
 │              │              │              │              │              │              │
 └──────────────┴──────────────┴───┬──────────┴──────────────┴──────────────┴──────────────┘
                                   │
                             Database Layer
                        (PostgreSQL / Mongo / Redis)
                                   │
                     External Financial & News APIs
```

### Agent Roles & Capabilities

1. 💳 **Spending Agent**: Expense tracking, auto-categorization, budget limits, spending behavior analysis, and expense forecasting.
2. 📈 **Investment Agent**: Portfolio analysis, asset allocation, risk profile scoring, and tax-efficient wealth recommendations.
3. 🧾 **Tax Agent**: Tax liability estimation, deduction tracking, tax-saving strategy generation, and summary report creation.
4. 🏦 **Loan Agent**: Debt management, EMI calculations, loan comparisons, refinancing feasibility, and credit score insights.
5. 🛡️ **Fraud Detection Agent**: Transaction security, anomaly detection rules, suspicious activity alerts, and risk scoring.
6. 🎯 **Goal Planning Agent**: Long-term financial planning (housing, education, retirement) with personalized financial roadmaps.
7. 🌍 **Economic Intelligence Agent**: Market intelligence, macroeconomic event analysis (e.g., RBI interest rate changes), and news summary.
### 🔗 LangChain Orchestration Layer
LangChain coordinates all AI agents, enables tool calling, manages conversation memory, performs Retrieval-Augmented Generation (RAG), and integrates Claude to generate accurate, context-aware financial recommendations.

---

# # Conventions & Standards

- **TypeScript**: Strict mode enabled across all frontend code. Usage of `any` is strictly prohibited.
- **Styling**: Use Tailwind CSS exclusively. Avoid ad-hoc inline styles. Ensure clean typography, dark/light mode compatibility, and micro-interactions.
- **Directory Layout**:
  - Frontend: UI components in `src/components/`, pages/routes in `src/app/`.
  - Backend: Standard Spring Boot structure (`controller`, `service`, `repository`, `model`, `config`).
  - AI Services: Modular Python packages with distinct prompt templates, tools, and agent definitions.
- **Security Protocols**:
  - All non-public REST endpoints require valid JWT authentication.
  - Enforce Role-Based Access Control (RBAC).
  - Sensitive financial parameters must be encrypted at rest and in transit.
  - Maintain detailed audit logging for security-sensitive operations.
- **User Experience Rule**: Never output raw, unformatted financial data or complex jargon directly to the user. Every insight must pass through the AI Orchestrator to generate plain-language explanations.

---

# # Testing & Verification

- **Execution Commands**:
  - **Frontend**: `npm test`
  - **Backend**: `./mvnw test` or `./gradlew test`
  - **AI / Python Services**: `pytest`
- **Test Directories**:
  - Frontend: Place unit and integration tests under `__tests__/`.
  - Backend: Place test classes under `src/test/java/`.
  - AI Services: Place test modules under `tests/`.
- **Integration Coverage Requirement**: Every new feature or agent logic modification must include at least one integration test that validates end-to-end data flow through the AI Orchestrator.

---

# # Git Workflow

- **Branch Naming**: Always create a feature branch off `main`:
  - `feat/<short-description>` (e.g., `feat/spending-tracker`)
  - `fix/<short-description>` (e.g., `fix/jwt-token-expiration`)
  - `refactor/<short-description>`
  - `docs/<short-description>`
- **Commit Message Format**: Follow Conventional Commits format (`feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`).
- **Main Branch Rule**: Never push code directly to `main`. All updates must be reviewed and merged via Pull Requests.

---

# # Boundaries & Strict Rules

- **Do not delete files** or drop/alter database schemas without explicit user approval.
- **Do not modify `.env`** files or hardcode API keys/secrets into source code.
- **Do not install new dependencies** (npm, Python packages, Maven/Gradle dependencies) without user confirmation.
- **Scope Enforcement**: Strictly enforce MoSCoW priorities. Do not work on SHOULD or COULD features until all MUST features (Dashboard, Spending Agent, AI Orchestrator) are complete and tested.
