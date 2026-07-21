# Project

AI Financial Operating System (AI-FOS) is an AI-powered personal finance platform combining specialized AI agents coordinated by an AI Orchestrator to deliver plain-language financial summaries, expense tracking, and actionable recommendations.

- **Frontend**: React.js, Next.js, TypeScript, Tailwind CSS
- **Backend**: Spring Boot (Java), REST APIs, JWT Authentication
- **AI & ML**: Python, Claude/OpenAI API, LangChain, Scikit-learn
- **Database**: PostgreSQL, MongoDB, Redis
- **v1 Focus**: Unified Dashboard, Spending Agent, and AI Orchestrator

# Conventions

- **TypeScript**: Strict mode enabled. Do not use `any`.
- **Styling**: Tailwind CSS for all styling.
- **Frontend Architecture**: Components in `src/components/`, pages in `src/app/`.
- **AI Orchestration**: Multi-agent design (Spending, Investment, Tax, Loan, Fraud, Goal Planning) coordinated via AI Orchestrator.
- **Security**: Mandatory JWT auth & Role-Based Access Control (RBAC) on REST endpoints.
- **Prioritization**: Strict adherence to Feature Clustering (Must-haves first: Dashboard, Spending Agent, Orchestrator Summary).

# Testing

- **Run**: `npm test` (Frontend) / `./mvnw test` or `./gradlew test` (Backend) / `pytest` (AI Services).
- **Location**: Write frontend unit/integration tests in `__tests__/`.
- **Coverage**: Every new feature or agent integration gets at least one integration test verifying orchestrator data flow.

# Git workflow

- **Branching**: Branch per feature (e.g., `feat/spending-agent`, `fix/dashboard-layout`).
- **Commit Messages**: Follow standard conventional commits: `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`.
- **Main Branch**: Never push directly to `main`. All changes must go through a pull request.

# Boundaries

- Do not delete files or drop database schemas without asking.
- Do not change `.env` or commit API keys/credentials.
- Do not install new npm, Python, or Java packages without user confirmation.
- Do not work on Should/Could features (Loan, Fraud, Voice Assistant) until v1 Must-haves are completed.
