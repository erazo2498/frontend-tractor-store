# 🚜 The Tractor Store — Frontend Workspace (Angular 19 + Nx + pnpm)

Welcome to the frontend workspace for **The Tractor Store**, a state-of-the-art e-commerce architectural blueprint designed around **Micro-Frontends** using **Angular 19**, **Nx monorepo**, **pnpm workspaces**, and **TailwindCSS**.

---

## 🗺️ Workspace Structure

```
├── apps/
│   └── shell/              # Shell host/orchestrator (Port 4200)
├── packages/
│   ├── mfe-checkout/       # MFE: Checkout and cart (Port 4201)
│   ├── mfe-decide/         # MFE: Product decision page (Port 4202)
│   ├── mfe-explore/        # MFE: Search & Catalog (Port 4203)
│   ├── shared-catalog/     # Shared Angular models & utilities library
│   └── ts-design-system/   # Shared Angular UI design system components
├── playground/
│   └── elements-lab/       # Experimental laboratory for Angular Elements (Port 4204)
└── docs/                   # Architectural documentation & guides
```

---

## 📚 Architectural & Learning Documentation Hub

We have compiled a comprehensive, premium-grade documentation system inside the `docs/` folder to guide you through the learning process and explain every design decision in detail:

### 📖 [Main Documentation Hub (docs/README.md)](file:///home/quind/Proyects/quind/tractor-store/frontend-tractor-store/docs/README.md)
*   **Vertical Domains:** Scope and responsibilities of Team Explore, Team Decide, and Team Checkout.
*   **Web Components Deep Dive:** Pure JS concepts: DOM vs Shadow DOM, CustomEvents, and the `composed: true` event propagation passport.

### 📦 Modular Learning Guides (Fase 3):
1.  [**pnpm Workspaces & Dependency Management Guide** (docs/pnpm-workspaces-guide.md)](file:///home/quind/Proyects/quind/tractor-store/frontend-tractor-store/docs/pnpm-workspaces-guide.md)
    *   *Highlights:* Automatic local linking via symlinks, secure `.npmrc` configuration for private registries, and the absolute importance of `--frozen-lockfile` in production CI/CD.
2.  [**Nx Tooling & Caching Optimization Guide** (docs/nx-tooling-guide.md)](file:///home/quind/Proyects/quind/tractor-store/frontend-tractor-store/docs/nx-tooling-guide.md)
    *   *Highlights:* Nx executors, generators, `namedInputs` & `targetDefaults` cache optimizations, local vs. distributed caching, and parallel executing with `nx affected`.
3.  [**Tractor Store Physical Architecture Blueprint** (docs/hito-tractor-store-architecture.md)](file:///home/quind/Proyects/quind/tractor-store/frontend-tractor-store/docs/hito-tractor-store-architecture.md)
    *   *Highlights:* Complete ports allocation mapping, ESLint strict architectural tags matrices (`type:shell`, `type:mfe`, `type:shared`), interactive graph representation, and Hito checklists.

---

## ⚡ Quick Start

### 1. Load Node & Setup
Make sure you have [NVM](https://github.com/nvm-sh/nvm) installed and active on your console:
```bash
# Load NVM and switch to Node 24 (recommended for Angular 19 inside this workspace)
nvm use 24
```

### 2. Install Dependencies
```bash
# Approve background builds (safe security step required by pnpm)
pnpm approve-builds

# Install all workspace packages
pnpm install
```

### 3. Run Development Server
Serve all applications (Shell + all 3 remotes + playground) simultaneously:
```bash
pnpm exec nx run-many --target=serve --all
```

*   **Shell (Host):** `http://localhost:4200`
*   **MFE Checkout:** `http://localhost:4201`
*   **MFE Decide:** `http://localhost:4202`
*   **MFE Explore:** `http://localhost:4203`
*   **Elements Lab (Playground):** `http://localhost:4204`

---

## 🛠️ Verification & Linting

Verify that all tags-based architectural boundaries are perfectly respected and there are no lint issues:
```bash
pnpm exec nx run-many --target=lint
```

Generate the dependency graph of your workspace to audit imports visually:
```bash
pnpm exec nx graph
```
