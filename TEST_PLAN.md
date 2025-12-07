# End-to-End Test Plan: Airtable Dynamic Form Builder
**Role**: Senior QA Engineer
**Objective**: Validation of system integrity, data consistency, and user flows.

---

## 1. Environment Verification
**Goal**: Ensure the infrastructure is correctly configured before strictly testing functionality.

### Action Items
- [ ] **Check `.env` Configuration**: Ensure all required keys exist (`MONGO_URI`, `AIRTABLE_CLIENT_ID`, `AIRTABLE_CLIENT_SECRET`, `JWT_SECRET`, `WEBHOOK_URL`).
- [ ] **Backend Boot**: Run `npm start`. Look for "MongoDB connected successfully" and "Server is running on port 3000".
- [ ] **Frontend Boot**: Run `npm run dev`. Verify landing page loads without console errors.

### Potential Failure Points
- `ECONNREFUSED` for MongoDB (Localhost vs 127.0.0.1 issue).
- Missing `WEBHOOK_URL` causes webhook registration failure later.
- `AIRTABLE_REDIRECT_URI` mismatch in `.env` vs Airtable Dashboard.

### Debugging & Validation
- **Check**: `curl http://localhost:3000/api/health` (if exists) or a simple 404 check on `http://localhost:3000/` to prove server is up.
- **Log Improvement**: Ensure `src/index.ts` logs the active `NODE_ENV` and masked config status on startup.

---

## 2. OAuth Flow Testing
**Goal**: Verify secure authentication and user persistence.

### Action Items
- [ ] **Initiate Flow**: Click "Login with Airtable". Verify redirect to `airtable.com`.
- [ ] **Grant Access**: Accept permissions. Verify redirect back to `/login?token=...`.
- [ ] **Session Check**: Refresh page. Ensure user remains logged in (`localStorage`).
- [ ] **Token Refresh**: (Advanced) Manually set `tokenExpiresAt` in DB to past and trigger an API call.

### Potential Failure Points
- **State Mismatch**: If `state` param is validated strictly and lost/mismatched.
- **Scope Error**: Airtable rejects if requested scopes change without re-auth.
- **Callback Loop**: Frontend fails to parse token -> redirects to login -> loops.

### Debugging & Validation
- **DB Check**: Open MongoDB Compass/Shell.
    ```javascript
    db.users.findOne({ email: "..." })
    ```
    Confirm `accessToken` and `refreshToken` are populated.
- **Logs**: Backend should log "OAuth callback successful for user [ID]".

---

## 3. Base/Table/Field Fetching
**Goal**: Confirm integration with Airtable Metadata API.

### Action Items
- [ ] **Fetch Bases**: Open Form Builder. Dropdown should populate.
- [ ] **Fetch Tables**: Select Base. Tables dropdown should populate.
- [ ] **Field Analysis**: Select Table. Verify only supported types (Text, Select, etc.) appear.

### Potential Failure Points
- **Rate Limiting**: Rapid clicks might trigger Airtable 429.
- **Unsupported Types**: Complex fields (Lookups, Rollups) might crash the UI if not filtered backend-side.
- **Empty Base**: Base with no tables.

### Debugging & Validation
- **Network Tab**: Check `GET /api/airtable/bases`. Response time < 500ms ideal.
- **Validation**: Ensure backend `AirtableService.getFields` explicitly filters by `allowedTypes` array.

---

## 4. Form Builder Tests
**Goal**: Verify that the schema is constructed, validated, and stored correctly.

### Action Items
- [ ] **Field Config**: Rename a field label. Toggle "Required" ON.
- [ ] **Persistence**: Click "Save". Refresh page. Form should reload with changes.
- [ ] **Schema Check**: Verify JSON structure in `forms` collection.

### Potential Failure Points
- **Question Key Drift**: If `questionKey` changes, old answers map to nothing.
- **Validation Strip**: Backend might strip unknown properties if strict mode is on.

### Debugging & Validation
- **DB Check**:
    ```javascript
    db.forms.findOne({ title: "..." })
    ```
    Confirm `questions` array contains `airtableFieldId` and correct `type`.

---

## 5. Conditional Logic Engine
**Goal**: Verify the "Brain" of the form (shouldShowQuestion).

### Action Items
- [ ] **Unit Tests**: Run `npm test` (Verified in Step 780).
- [ ] **Manual Edge Cases**:
    - **Rule**: "Status" equals "Done".
    - **Input**: "DONE" (Case sensitivity check - usually exact match).
    - **Input**: "Done " (Trailing space).
- [ ] **Complex Logic**: (A AND B) OR C.

### Potential Failure Points
- **Type Coercion**: Comparing number `5` (from numeric field) vs string `"5"` (from rule).
- **Missing Parent**: A depends on B. B is hidden. A should also be hidden.

### Debugging & Validation
- **Console Logs**: FormViewer should log `Evaluation result for [Field]: true/false`.

---

## 6. Form Viewer Tests
**Goal**: User Experience and Dynamic behavior.

### Action Items
- [ ] **Public Access**: Open `/forms/:id` in Incognito (No Auth).
- [ ] **Interactivity**: Change Answer X -> Field Y appears immediately.
- [ ] **Validation Guard**: Try submitting without a required field. Error should appear inline.

### Potential Failure Points
- **Hydration Mismatch**: React server/client mismatch (if SSR used).
- **Zombie Fields**: Hidden fields sending data on submit (Should be filtered out).

### Debugging & Validation
- **UI Inspector**: Verify hidden fields are removed from DOM, not just CSS hidden (`display: none` vs `null`).

---

## 7. Response Submission
**Goal**: Data Integrity across DB and Airtable.

### Action Items
- [ ] **Happy Path**: Fill all fields -> Submit. Success screen.
- [ ] **Partial Path**: Fill only required fields -> Submit. Success.
- [ ] **Constraint Check**: Enter text in Number field (Frontend should block).

### Potential Failure Points
- **Airtable Type Error**: Sending string to Number field results in Airtable 422.
- **Select Option Mismatch**: Sending "Blue" to Single Select where only "Red/Green" exists (Airtable rejects unless "Typecast" is enabled).

### Debugging & Validation
- **Airtable View**: Open target Base. Record should appear instantly.
- **DB Check**: `db.submissions.count()` should increment.

---

## 8. Response Listing View
**Goal**: Admin visibility.

### Action Items
- [ ] **Load Dashboard**: Go to "Responses" tab.
- [ ] **Data Verification**: Compare Timestamp in UI vs DB.
- [ ] **JSON Preview**: ensure `answers` column is readable/formatted.

### Potential Failure Points
- **Large Data**: 1000+ responses might slow down page (No pagination implemented yet).

---

## 9. Webhook Sync Testing
**Goal**: Keep local DB in sync with external changes.

### Action Items
- [ ] **Simulate Delete**: Delete a record in Airtable UI.
    - **Expectation**: Local `Submission` marked `deletedInAirtable: true`.
- [ ] **Simulate Update**: Edit a cell in Airtable.
    - **Expectation**: Backend logs "Received update payload".
- [ ] **Cursor Management**: Verify backend advances cursor to avoid re-processing.

### Potential Failure Points
- **Concurrency**: Webhook fires before local DB insert completes (Race condition).
- **Public URL**: `WEBHOOK_URL` pointing to localhost is unreachable by Airtable.

### Debugging & Validation
- **Ngrok Inspector**: Check `GET /api/webhooks...` requests coming in.
- **Logs**: `[INFO] Processed webhook payload: record deleted`.

---

## 10. Integration Testing (The "Golden Path")
**Scenario**:
1. User Logs in.
2. Creates "Event Registration" Form.
3. Adds "Dietary Restrictions" (Multi-select) dependent on "Attending Dinner" (Yes/No).
4. Saves Form.
5. User B submits form (Attending: Yes, Diet: Vegan).
6. User C submits form (Attending: No).
7. Admin views Responses. User B has "Vegan", User C has nothing for Diet.
8. Admin deletes User C in Airtable.
9. System marks User C as deleted locally.

---

## 11. Performance & Stability
**Goal**: Non-functional requirements.

### Action Items
- [ ] **Stress Test**: Click "Submit" rapidly. (Should disable button).
- [ ] **Large Form**: Create form with 50 fields. Check render lag.

### Validation
- **Browser Performance**: Chrome DevTools "Performance" tab.

---

## 12. Deployment Verification
**Goal**: Production readiness.

### Action Items
- [ ] **CORS Check**: Frontend (Vercel) -> Backend (Railway). Allowed?
- [ ] **HTTPS**: OAuth requires HTTPS callback in Production.
- [ ] **Env Var Check**: Ensure `NODE_ENV=production` is set.

---
**Sign-off**: Ready for Manual Execution.
