# Reusable Models and Keys UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the legacy and Focus versions of Virtual Keys and Models and Endpoints one shared functional implementation with complete capability parity.

**Architecture:** Shared controllers, capability registries, field definitions and form payload builders own behavior. Legacy and Focus renderers consume those contracts and keep independent layouts. Existing upstream panels are reused directly until their state is extracted; no second implementation of an upstream feature is allowed.

**Tech Stack:** Next.js, React, TypeScript, TanStack Query/Table, react-hook-form, i18next, Vitest, npm dashboard build.

## Global Constraints

- Work only on Virtual Keys and Models and Endpoints plus directly required shared infrastructure.
- Preserve the Focus layout, RU/EN switching and Nexoplane visible branding.
- Keep technical names and identifiers unchanged; key IDs remain available but hidden by default in Focus cards.
- Do not create Git worktrees.
- Do not create new test files or add new tests, per user instruction. Run and update existing checks only when existing assertions must follow the shared contract.
- Do not hand-merge generated `litellm/proxy/_experimental/out`; rebuild it after source acceptance.
- Use one writer per stage, then an independent Sol review. Final acceptance is a separate Astra review.

---

### Task 1: Stabilize the merged dashboard baseline

**Files:**
- Modify only files reported by the current dashboard build as merge regressions
- Verify: `ui/litellm-dashboard/package.json`
- Verify: `ui/litellm-dashboard/package-lock.json`

**Interfaces:**
- Consumes: merge commit `1341a69cea3d5b70d150c3a20ca1ada5e33cf14d`
- Produces: a clean dashboard source baseline that compiles before parity refactoring

- [ ] Confirm branch, clean status, merge ancestry and Node/npm engine compatibility.
- [ ] Install dependencies from the committed lockfile with the compatible project runtime.
- [ ] Run the production dashboard build and capture every compile/import error.
- [ ] Repair only concrete merge regressions while preserving upstream contracts and local localization/branding.
- [ ] Run i18n parity/audit, lint, typecheck and production build on the repaired baseline.
- [ ] Commit the stabilized baseline.

### Task 2: Introduce the shared models capability registry

**Files:**
- Create: `ui/litellm-dashboard/src/features/models-and-endpoints/modelSections.tsx`
- Modify: `ui/litellm-dashboard/src/app/(dashboard)/models-and-endpoints/page.tsx`
- Modify: `ui/litellm-dashboard/src/components/NewUI/FocusModelsAndEndpointsPage.tsx`

**Interfaces:**
- Produces: `MODEL_SECTIONS`, `ModelSectionId`, `getVisibleModelSections(context)` and a shared panel factory
- Consumes: existing upstream panels under `app/(dashboard)/models-and-endpoints/panels`

- [ ] Define one registry for all ten sections, their permission predicates and shared panel components.
- [ ] Replace the legacy page's local slug/label/render switch with the registry.
- [ ] Replace Focus's local `TABS`/`INNER_TABS` capability list with grouped registry entries.
- [ ] Render every currently empty Focus tab with its existing upstream functional panel.
- [ ] Keep Focus grouping and appearance independent from the shared feature panel.
- [ ] Run existing models page/panel tests, typecheck and lint.
- [ ] Commit the shared registry stage.

### Task 3: Share models list behavior while retaining two renderers

**Files:**
- Create: `ui/litellm-dashboard/src/features/models-and-endpoints/useModelsWorkspace.ts`
- Create: `ui/litellm-dashboard/src/features/models-and-endpoints/modelFields.ts`
- Modify: `ui/litellm-dashboard/src/app/(dashboard)/models-and-endpoints/components/AllModelsTab.tsx`
- Modify: `ui/litellm-dashboard/src/app/(dashboard)/models-and-endpoints/components/AllModelsTable.tsx`
- Modify: `ui/litellm-dashboard/src/components/NewUI/FocusModelsList.tsx`
- Modify: `ui/litellm-dashboard/src/components/NewUI/FocusModelCard.tsx`
- Modify: `ui/litellm-dashboard/src/components/NewUI/FocusModelDetailsPanel.tsx`

**Interfaces:**
- Produces: one controller for URL state, filters, sorting, pagination, permissions, selection and actions
- Produces: one field registry consumed by the table and Focus visibility menu/cards

- [ ] Move query-state normalization, query parameters, mutations and permission decisions into `useModelsWorkspace`.
- [ ] Move field identifiers, labels and default visibility into `modelFields.ts`.
- [ ] Adapt the legacy table to the shared controller without changing its layout.
- [ ] Adapt Focus cards/right panel to the same controller and preserve the Focus design.
- [ ] Verify team/public-name/access-group filtering, empty filters, sorting, page size, refresh, settings, delete, pause/resume, team drill-in and URL-selected model parity.
- [ ] Run existing model list tests, lint, typecheck and production build.
- [ ] Commit the shared models workspace stage.

### Task 4: Share add/edit model and credential functionality

**Files:**
- Create: `ui/litellm-dashboard/src/features/models-and-endpoints/modelFormContract.ts`
- Create: `ui/litellm-dashboard/src/features/models-and-endpoints/useCredentialsWorkspace.ts`
- Modify: `ui/litellm-dashboard/src/app/(dashboard)/models-and-endpoints/panels/AddModelPanel.tsx`
- Modify: `ui/litellm-dashboard/src/components/NewUI/FocusAddModelPanel.tsx`
- Modify: `ui/litellm-dashboard/src/components/NewUI/FocusAddModelAdvancedSettings.tsx`
- Modify: `ui/litellm-dashboard/src/components/NewUI/FocusModelEditForm.tsx`
- Modify: `ui/litellm-dashboard/src/app/(dashboard)/models-and-endpoints/panels/LlmCredentialsPanel.tsx`
- Modify: `ui/litellm-dashboard/src/components/NewUI/FocusLlmCredentialsPanel.tsx`
- Modify: `ui/litellm-dashboard/src/components/NewUI/FocusCredentialModal.tsx`

**Interfaces:**
- Produces: common defaults, validation, provider metadata handling and create/update payload builders
- Produces: common credentials query, masking, create/update/delete actions and permissions

- [ ] Make the upstream model form contract the single source for base fields, Team BYOK, access groups and advanced settings.
- [ ] Keep legacy and Focus field layouts, but consume identical field metadata and payload builders.
- [ ] Remove duplicate Focus payload/permission/network logic.
- [ ] Move credential list state and mutations into the shared credentials workspace.
- [ ] Keep Focus credential cards and legacy panel layout as separate renderers.
- [ ] Run existing add/edit model and credentials tests, lint, typecheck and production build.
- [ ] Commit the shared model forms stage.

### Task 5: Share the Virtual Keys workspace and complete Focus fields

**Files:**
- Create: `ui/litellm-dashboard/src/features/virtual-keys/useVirtualKeysWorkspace.ts`
- Create: `ui/litellm-dashboard/src/features/virtual-keys/keyFields.tsx`
- Create: `ui/litellm-dashboard/src/features/virtual-keys/keyPresentation.ts`
- Modify: `ui/litellm-dashboard/src/components/VirtualKeysPage/VirtualKeysTable.tsx`
- Modify: `ui/litellm-dashboard/src/components/VirtualKeysPage/keyTableColumns.tsx`
- Modify: `ui/litellm-dashboard/src/components/NewUI/FocusVirtualKeysPage.tsx`
- Modify: `ui/litellm-dashboard/src/components/NewUI/FocusVisibilityMenu.tsx`

**Interfaces:**
- Produces: shared URL/query state, filters, sorting, pagination, refresh and selected-key contract
- Produces: shared key field registry and status/budget presentation helpers

- [ ] Extract list state and server query construction from both pages into one workspace hook.
- [ ] Define all legacy key fields once, including organization, creator, updated, expiration, TPM/RPM and technical ID.
- [ ] Preserve the Focus default visibility with technical ID hidden.
- [ ] Share exact active/expired/blocked/SCIM-blocked/deleted status logic and tooltips.
- [ ] Share inherited budget calculation, related-entity links and model/route presentation.
- [ ] Keep common `CreateKey` and `KeyInfoView`, including end-user budget, regenerate, edit and delete actions.
- [ ] Preserve full-width Focus list with no selection and 40/60 list/details layout after selection.
- [ ] Run existing virtual-key tests, lint, typecheck and production build.
- [ ] Commit the shared keys stage.

### Task 6: Localization, generated UI and browser acceptance

**Files:**
- Modify: `ui/litellm-dashboard/src/i18n/locales/en/gateway.ts`
- Modify: `ui/litellm-dashboard/src/i18n/locales/ru/gateway.ts`
- Modify: `ui/litellm-dashboard/scripts/audit-localization.mjs` only if the two pages remain outside its coverage
- Regenerate: `litellm/proxy/_experimental/out`

**Interfaces:**
- Consumes: final shared contracts and both renderers
- Produces: release-ready source and generated dashboard artifacts

- [ ] Audit all visible strings in both legacy and Focus routes, including expressions, validation and toast messages.
- [ ] Restore EN/RU key parity and remove visible LiteLLM branding from the two pages.
- [ ] Run existing localization checks and all existing tests touched by the two pages.
- [ ] Run fresh lint, typecheck and real production build with compatible Node/npm.
- [ ] Rebuild `litellm/proxy/_experimental/out` from final sources and verify no stale mixture remains.
- [ ] Perform browser acceptance for both legacy and Focus routes using a feature matrix covering every section, field and action.
- [ ] Run `git diff --check`, unmerged-path and conflict-marker checks.
- [ ] Commit generated artifacts only after all source gates pass.

### Task 7: Independent acceptance and delivery

**Files:**
- Update: local task report under `.git/` only

**Interfaces:**
- Consumes: completed stages and verification evidence
- Produces: reviewed branch ready for ordinary push and deployment handoff

- [ ] Assign Sol/high independent review after each bounded stage; resolve P0/P1 only and record P2-P4 dispositions.
- [ ] Assign separate Astra/high final whole-plan requirements review.
- [ ] Repeat only gates affected by accepted findings.
- [ ] Verify final ancestry, clean worktree, commit list and branch tip.
- [ ] Push `litellm_russian_sidebar` normally to origin.
- [ ] Hand the exact commit SHA to the separate `ai-gateway-deploy` workflow; do not deploy from this repository.
