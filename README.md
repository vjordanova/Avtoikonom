# Avtoikonom E2E Test Suite

Cypress end-to-end tests for the Avtoikonom admin panel (`dev.admin.avtoikonom.com`).

## Prerequisites

- Node.js
- npm

## Installation

```bash
npm install
```

## Fixture Files

### `cypress/fixtures/init-data.json`

Intendet to contain templates and initialization data needed to set up entities in the system. Tests read from this file to populate forms when creating new entities. The `PARTNERS` object holds the template and some preset data used by `create-partner.cy.js`.

### `cypress/fixtures/expected-content.json`

Acts as a shared store of entities that have been created in the system. It is written  automatically during test execution and is to be used across different test scenarios for verification. The `PARTNERS` array holds partner records created in the system that can be referenced by subsequent tests.

## Tests

### `login.cy.js`

Standalone test that verifies a user can log in with valid credentials.

### `create-partner.cy.js`

Creates a new partner through the admin UI and verifies the result via API.

**How it works:**

1. Reads the partner template from `init-data.json` (`PARTNERS` object).
2. Opens the *New partner* popup and fills all fields (name, type, service types, subscription plan, address, phone, contact person, description, logo).
3. On save, intercepts the `POST /admin/partner` API call to capture the actual values sent to the server (type, phone, serviceTypes, subscriptionTier) and the `uuid` returned in the response.
4. Appends the complete partner record to `expected-content.json` under the `PARTNERS` array.
5. Fetches the partner from the API (`GET /admin/partner/:uuid`) and compares every field against the entry written to `expected-content.json`.

### `edit-partner.cy.js`

Edits an existing partner and verifies the change via API.

**How it works:**

1. Reads the first partner from `expected-content.json` (`PARTNERS[0]`).
2. Searches for the partner by name on the partners list page.
3. Opens the *Edit partner* popup and updates the description field.
4. On save, updates the `description` field for that partner in `expected-content.json`.
5. Fetches the partner from the API (`GET /admin/partner/:uuid`) and compares every field against the updated entry in `expected-content.json`.

## Execution Order

> **`create-partner.cy.js` must be run before `edit-partner.cy.js`.**
> The create test writes the partner record to `expected-content.json`, which the edit test depends on.

### Run all tests in order (headless)

```bash
npx cypress run --spec "cypress/e2e/create-partner.cy.js,cypress/e2e/edit-partner.cy.js"
```

### Run a single test

```bash
# Create partner
npx cypress run --spec "cypress/e2e/create-partner.cy.js"

# Edit partner (only after create has been run)
npx cypress run --spec "cypress/e2e/edit-partner.cy.js"
```

### Open Cypress UI

```bash
npx cypress open
```

When using the UI, run `create-partner.cy.js` first, then `edit-partner.cy.js`.

## Improvements to Be Made

- **Data-driven edit test** — `edit-partner.cy.js` should be extended to read different edit configurations from `init-data.json` rather than having field values hardcoded in the test. Each configuration would define which fields to update and their new values, allowing the same test to cover multiple edit scenarios without code changes.

- **Error handling and logging** — all tests and custom commands should include structured error handling with descriptive log messages at each step, making failures easier to diagnose without having to replay the full test.

- **Negative test scenarios** — the existing tests should be extended or parameterised to cover negative cases: submitting a form with required fields left empty, entering inconsistent or out-of-range data, and verifying that the system responds with the appropriate validation errors.

- **Credentials moved to a data file** — the login username and password are currently hardcoded in the test files. They should be moved to `init-data.json` (or a dedicated credentials fixture) so they can be updated in one place and kept out of the test logic.

- **Post-test cleanup** — every test should delete any entities it creates once it has finished, leaving the system in the same state it was in before the run. This prevents data accumulation across runs and makes tests independently repeatable.
