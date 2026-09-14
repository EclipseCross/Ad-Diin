# Software Testing Laboratory 6 Report

## Ad-Diin: Smart Mosque Management Platform

**Course:** Software Testing Laboratory  
**Lab:** 6  
**Prepared by:** ____________________  
**Student ID:** ____________________  
**Section:** ____________________  
**Instructor:** ____________________  
**Submission date:** ____________________

---

## Table of Contents

1. Introduction  
2. Objectives of Testing  
3. System/Application Overview  
4. Testing Scope and Environment  
5. Features, Modules, Roles, and Data Model  
6. Testing Methodology and Levels  
7. Executed Verification Results  
8. Detailed Test Cases  
9. Bugs, Errors, and Improvement Suggestions  
10. Test Coverage Summary  
11. Screenshot-Based Test Evidence Plan  
12. Screenshot Collection Checklist  
13. Information Still Required and Final Review Checklist  
14. Conclusion

---

## 1. Introduction

Ad-Diin is a web-based smart mosque management platform. It provides public religious and community information, account-based user facilities, administrative management functions, online donation initiation, and an AI-assisted Islamic-learning chat interface. This report is based on inspection of the actual React client, Laravel API, Python AI service, route definitions, controllers, models, configuration, SQL schema, and existing automated tests in the submitted project.

This report does **not** represent unexecuted browser, database, mail, payment-gateway, or AI-service interactions as successful. Results are identified as either executed evidence, manual test instructions, or code-derived expected behaviour.

## 2. Objectives of Testing

- Verify that implemented application modules meet their stated functional behaviour.
- Exercise normal, boundary, invalid, and exceptional conditions.
- Verify API integration, validation, role-based authorization, data persistence, and user-visible feedback.
- Identify defects or risks found through code inspection and distinguish them from reproduced defects.
- Produce repeatable manual test and screenshot instructions for evidence collection.

## 3. System/Application Overview

The application has a React 18/Vite single-page frontend and a Laravel 8 REST API. Authentication uses JSON Web Tokens (JWT). The SQL schema is MySQL-oriented. The client has public pages for home, about, activities, events, prayer times, donation, contact, Zakat calculation, Milad booking, messaging, and Diin AI. It also includes registration, login, email verification, profile, donation history, Milad history, and an administrator panel.

The API provides public retrieval routes for prayer times, activities, Islamic events, about content, and donation lookup; protected user routes for profile, password, Milad, donation history, and messaging; and administrator routes for prayer times, Milad status, users, events, donations, contacts, activities, and about content. Donations are initiated with SSLCommerz callbacks for success, failure, cancellation, and IPN. The separate Python service supplies AI responses from local Qur'an and Hadith knowledge files.

## 4. Testing Scope and Environment

### In scope

- Public information pages: home, about, activities/detail, events, prayer times.
- Authentication, email-code verification, profile update, password change, logout.
- Zakat calculator (client-side), Milad request lifecycle, contact, and messaging.
- Donation initiation, callback-state display, donation history, and donation administration.
- Diin AI request handling.
- Administrator CRUD/status operations and role restriction.
- Backend validation, error responses, database tables, and service integration points.

### Out of scope / not confirmed

- Actual SSLCommerz settlement or IPN delivery.
- Actual email inbox delivery and real Cloudinary upload, unless manually run with configured credentials.
- Performance, load, penetration/security testing, accessibility audit, and multi-browser compatibility testing.

### Environment observed

| Item | Observed configuration / result |
|---|---|
| Client | React 18, TypeScript, Vite, Axios, React Router, Bootstrap/Tailwind-related dependencies |
| Server | Laravel 8, PHP 7.3+/8, JWT Auth, Sanctum present, PHPUnit 9 |
| Database | MySQL schema in `addin.sql`: users, prayer_times, password_reset_tokens, verifications, milads, islamic_events, donations, conversations, messages, contacts, activities |
| External services | SSLCommerz, Cloudinary for activity images, mail service, Python AI service (default URL `http://127.0.0.1:8001`) |
| Test date | 13 September 2026 |
| Browser / live database | To be supplied by the student during manual execution |

## 5. Features, Modules, Roles, and Data Model

| Role | Implemented capabilities |
|---|---|
| Visitor | View public content, events, activities, prayer times; submit contact form; initiate donation; use AI chat; register/login; view Zakat calculator. |
| Authenticated user | Update profile; change password; create/view/edit/delete own Milad requests; view own donations; create/send/close messages. |
| Administrator | Admin dashboard and management of prayer times, Milad status, users, events, activities, donations, contacts/replies, and about content. |

Important data tables are `users`, `prayer_times`, `verifications`, `milads`, `islamic_events`, `donations`, `conversations`, `messages`, `contacts`, and `activities`. No booking table, OTP table, payment table, or separate notice/report table beyond these should be claimed in the report.

## 6. Testing Methodology and Levels

The report uses black-box functional testing, equivalence partitioning, boundary-value analysis, negative testing, error/exception testing, static code inspection, and limited automated verification.

| Level | Application in this report |
|---|---|
| Unit testing | Existing PHPUnit example test; TypeScript compilation; Python syntax parsing. No meaningful feature-specific unit tests were found. |
| Integration testing | Frontend/API behaviour, Laravel routes/controllers/models, mail, Cloudinary, AI service, database, and payment integration are planned/manual unless explicitly executed. |
| System testing | End-to-end browser workflows for user/admin features are specified for manual execution. |
| Acceptance testing | User-facing role workflows and expected business outcomes are supplied for stakeholder/student verification. |

## 7. Executed Verification Results

| EV ID | Level | Check | Actual result | Status |
|---|---|---|---|---|
| EV-01 | Unit | `php artisan test --testsuite=Unit --no-interaction` | Existing `Tests\\Unit\\ExampleTest` executed: 1 test passed in 0.02s. It is a framework example, not evidence of a business feature. | Pass |
| EV-02 | Unit | Client TypeScript compile using local `tsc -b --pretty false` | Command completed with no diagnostics. | Pass |
| EV-03 | Unit | Client ESLint | `npm run lint` completed with no lint diagnostics. | Pass |
| EV-04 | Integration/static | Client production build | `npm run build` completed outside the sandbox; new `client/dist` JavaScript and CSS assets were present. Browser runtime not tested. | Pass |
| EV-05 | Integration/static | `php artisan route:list --path=api` | Laravel resolved the implemented API routes and their middleware. | Pass |
| EV-06 | Unit/static | Python AST parsing of `ai-service/main.py` and `rag/retriever.py` | Both files parsed successfully. AI response generation was not run. | Pass |

## 8. Detailed Test Cases

**Status convention:** `Not Executed` means this report writer did not perform the live action. Execute the listed steps, replace Actual Result with observed facts, and change status only then. “To Be Verified” is used where external systems are required.

| ID / Level / Type | Module and objective | Preconditions and input | Steps | Expected result | Actual result / status / handling / evidence |
|---|---|---|---|---|---|
| TC-01 System Normal | Registration: create a user | App/API/database and usable email service running. Unique email, valid name, password of 6+ characters. | Open Registration; complete required fields; submit. | User record is created inactive; verification code is generated/sent; verification screen/message is shown. | Not Executed. Server validates name/email/password; creates a user with role `user`, `is_active=false`, then creates a 10-minute verification code. Capture SS-01. |
| TC-02 System Invalid | Registration required/invalid fields | Registration page. Empty name, malformed email, password under 6. | Submit each invalid set separately. | Submission is rejected and validation feedback is visible; no account is created. | Not Executed. API rules: name required/max 255; email required/email/unique; password min 6. Capture SS-02. |
| TC-03 Integration Boundary | Registration length and duplicate email | Existing email; then values at 255/256 name characters and passwords of 5/6 characters. | Submit one dataset at a time. | 255-char name and 6-char password accepted if all else valid; 256-char name, 5-char password, or duplicate email rejected. | Not Executed. API validation defines these boundaries. Verify both UI and HTTP/API result. |
| TC-04 System Normal | Email verification | Newly registered inactive user and received six-digit code. | Open verification page; enter matching email/code; submit. | Code is marked used; email verification time and active status are set; success feedback appears. | Not Executed. Code must be 6 characters and unexpired. Capture SS-03. |
| TC-05 System Invalid | Verification invalid/expired/reused code | Registered unverified account. Wrong, expired, or previously used six-digit code. | Submit code. | “Invalid or expired verification code” response; account remains unverified/inactive. | Not Executed. Backend searches only unused, unexpired matching records. Capture SS-04. |
| TC-06 System Normal | Login | Verified active user credentials. | Open Login; enter valid email/password; submit. | JWT/session data is stored by the client and user reaches authorized area. | Not Executed. Login controller rejects inactive/unverified users before issuing token. Capture SS-05. |
| TC-07 System Invalid | Invalid/inactive login | Wrong password; separately an inactive/unverified account. | Submit login form. | Authentication error; no authorized access. | Not Executed. Capture SS-06 for one meaningful error. |
| TC-08 System Normal | Profile update | Logged-in user. Valid changed name/phone/address/city/postal code/date/gender. | Open Profile; edit; save; reload or sign in again. | Valid values persist and refreshed profile shows them. | Not Executed. `PUT /api/v1/user/update` is JWT protected. Capture SS-07. |
| TC-09 System Invalid | Password change | Logged-in user; know current password. Incorrect current password or new password shorter than six characters. | Submit each invalid case. | Clear error; password remains unchanged. | Not Executed. Controller requires `current_password`, `new_password` min 6, and confirmation; it checks current hash. Capture SS-08. |
| TC-10 System Normal | Prayer-time display | Seeded/available prayer times. | Open Prayer Times. | Active Azan, Jamaat, and optional/Nafl times appear in configured order. | Not Executed. Public API supplies all, Azan, Jamaat, and Nafl views. Capture SS-09. |
| TC-11 Acceptance Normal | Admin prayer-time CRUD/toggle/order | Logged-in administrator; safe test record and permission to change data. | Add a valid time; edit it; toggle active; reorder; verify public page; delete test record. | Admin changes persist; inactive item disappears from public list; ordering changes are reflected; deletion removes record. | Not Executed. Use a clearly labelled temporary record and restore data. Capture SS-10 only after a successful, safe change. |
| TC-12 System Normal | Public activities and details | At least one active activity exists. | Open Activities; select an activity card. | Active activity list loads; selected detail page shows its title/description/image/category. | Not Executed. Detail page currently obtains the public list and finds the selected ID in the client. Capture SS-11. |
| TC-13 System Exceptional | Missing activity detail | Use `/activities/<nonexistent-id>`. | Paste a non-existent numeric ID in browser. | User-facing activity-not-found state and return button appear; app does not crash. | Not Executed. Client has an explicit not-found state. Capture SS-12. |
| TC-14 Integration Normal | Admin activity CRUD with image | Admin, valid title/description; optional valid image ≤5 MB. | Create; edit; confirm public visibility; delete temporary record. | Data persists; uploaded image URL is used if Cloudinary succeeds; deletion removes DB record. | Not Executed. API validates title max 255, image type/max 5120 KB, category max 100. Capture SS-13 after creation. |
| TC-15 Integration Exceptional | Cloudinary image failure | Admin and deliberately unavailable/incorrect Cloudinary configuration (test environment only). | Submit valid activity with image. | API returns “Image upload failed”; no partial activity should be claimed as created. | To Be Verified. Controller catches upload exceptions and returns HTTP 500. Do not alter production credentials. |
| TC-16 System Normal | Events public list and admin CRUD | Existing events; admin for management. | View Events; as admin create/update/delete a temporary event; refresh public list. | Public list displays active event information; administrative changes persist. | Not Executed. Event routes include upcoming/all/today/show and admin CRUD. Capture SS-14. |
| TC-17 System Invalid | Event required/invalid data | Administrator. Omit required event/date/Hijri fields or use invalid event type. | Submit form/API request. | 422 validation response; no invalid event saved. | Not Executed. Confirm exact UI fields and validation messages during execution. |
| TC-18 System Normal | Milad booking and user history | Logged-in user. Valid name, phone, description, future/allowed date as enforced by UI/API. | Submit booking; open My Milad Requests. | New request is linked to user and starts pending; history displays status. | Not Executed. API store is JWT protected and creates status `pending`. Capture SS-15. |
| TC-19 Acceptance Normal | Admin Milad approval/rejection | Existing pending request; logged-in admin. | Open Milad requests; set approved/rejected and remark; log in as requester and refresh history. | Status and admin remark are reflected to relevant parties. | Not Executed. Capture SS-16. |
| TC-20 System Invalid | Milad empty required fields / unauthorized edit | Logged-in user, then another user's request ID if test accounts available. | Submit empty form; try URL/API edit/delete of another user's ID. | Validation rejects incomplete fields; ownership check must prevent unauthorized modification. | Not Executed. Verify observed status/message; do not assume it passes. |
| TC-21 System Normal | Zakat calculator | Zakat page. Known valid numeric assets/liabilities values. | Enter values; calculate. | Displayed payable Zakat follows the calculator formula implemented in the client. | Not Executed. Record the exact inputs/result in caption; capture SS-17. |
| TC-22 Boundary/Invalid | Zakat numeric inputs | Zero, decimals, negative values, blank fields, and very large valid numbers. | Calculate each case. | UI handles non-positive/invalid entries safely and calculation remains understandable. | Not Executed. Exact acceptance rules must be observed from UI; this is a manual test. Capture one validation/boundary result if shown. |
| TC-23 Integration Normal | Donation initiation | Valid donor details, category, positive amount; SSLCommerz sandbox/configuration. | Open Donate; submit; complete or stop gateway flow. | Pending donation is created; browser is redirected to gateway URL; callback maps to success/fail/cancel state. | Not Executed. Payment must not be claimed successful without gateway evidence. Capture SS-18 (pre-gateway) and SS-19 (actual callback state). |
| TC-24 Integration Invalid | Donation validation | Donation page. Missing category/name/email/phone or amount ≤0. | Submit invalid values. | Client/API rejects data and no valid payment initiation occurs. | Not Executed. Backend validates required donor fields, category and amount `numeric|min:1`. Capture SS-20. |
| TC-25 Integration Exceptional | Payment cancellation/failure/IPN | SSLCommerz sandbox/test transaction. | Cancel at gateway; separately use documented fail sandbox path; inspect callback page and donation status. | Cancel/fail callback displays relevant state and backend updates the matching transaction. | To Be Verified. Never simulate gateway callbacks against production. |
| TC-26 System Normal | My Donations | Logged-in user with a completed/pending donation. | Open My Donations. | Only that user's donation records are returned/displayed. | Not Executed. Endpoint is protected; user ID is selected from JWT authentication. Capture SS-21. |
| TC-27 System Normal | Contact submission/admin reply | Valid public contact input; admin account. | Submit contact; as admin open contacts, mark read, reply. | Contact is stored with status workflow; email notification/reply is attempted; user-visible confirmation occurs. | Not Executed. Server validates name max 255, email, optional company max 255, message max 5000. Capture SS-22 and SS-23. |
| TC-28 System Invalid | Contact boundary | Empty values, malformed email, 5001-character message. | Submit one case at a time. | Validation error; invalid contact not stored. | Not Executed. Capture one representative error (SS-24). |
| TC-29 Acceptance Normal | Messaging conversation lifecycle | User and admin accounts. | User opens Messaging/create conversation and sends text; admin replies; user reads; close conversation. | Conversation, messages, unread/read status, participant restrictions, and close state work coherently. | Not Executed. API requires JWT and validates message text. Capture SS-25 from the user or admin view. |
| TC-30 System Invalid | Messaging empty/closed/unauthorized conversation | User account and known conversation. | Send blank message; attempt send after closing; try another account's conversation URL/API if safe. | Empty, closed, and unauthorized operations are rejected without data disclosure/modification. | Not Executed. Record real HTTP/UI result. |
| TC-31 Integration Normal | Diin AI valid question with history | Laravel API and Python AI service are running. Valid Islamic question ≤1000 chars. | Open Diin AI; ask question; ask follow-up. | API passes message/history to AI service; response and any sources appear. | Not Executed. Capture SS-26 only with an actual response. |
| TC-32 Boundary/Exceptional | AI length/service unavailable | Message of 1001 characters; separately stop only test AI service. | Submit each condition. | >1000 characters receives validation rejection; unavailable service produces graceful fallback/error rather than crash. | Not Executed. Controller validates max 1000 and has failure response path. Capture SS-27 for the observed safe error. |
| TC-33 Acceptance Normal | Admin user/donation/contact dashboard use | Administrator and representative data. | Open dashboard; inspect users, donations and contacts; use permitted filters/search. | Admin-only data is available to admin, filters return appropriate records, and user information is not exposed publicly. | Not Executed. Capture SS-28. |
| TC-34 Security/System Invalid | Role-based access restriction | Logged-out visitor and logged-in normal user. | Visit `/admin/panel`; attempt an `/api/v1/admin/...` operation. | Visitor redirects/denies; ordinary user receives 401/403; protected data/actions not available. | Not Executed. Route listing confirms `auth:api` plus `admin` middleware for admin API routes. Capture SS-29. |
| TC-35 System Exceptional | Unknown client route | Running application. | Navigate to a non-existent path. | Client displays 404 page and Go Home action. | Not Executed. Route exists in React router; capture SS-30. |
| TC-36 Unit Normal | Build/syntax quality checks | Source tree available. | Run EV-01 to EV-06 commands. | Commands finish as documented. | Executed: see Section 7. Pass. No screenshot needed. |

## 9. Bugs, Errors, and Improvement Suggestions

The first two findings below are confirmed by static inspection, not by a live exploit. They should be logged as code-review defects/risk findings until reproduced in a safe test environment.

| Bug ID | Finding and evidence | Severity | Status | Suggested fix |
|---|---|---|---|---|
| BUG-01 | `PUT /api/v1/about` is registered in the public `v1` group and invokes `AboutContentController@update`; a second protected admin route also updates it. Therefore an unauthenticated caller can potentially overwrite about-page content. | High | Open—static inspection | Remove the public PUT route. Keep only the `auth:api` + `admin` protected route. Add authorization/feature tests. |
| BUG-02 | `routes/api.php` registers `GET /api/v1/ai/status` as `AIController@status`, but the inspected `AIController` contains `chat` and `chatWithHistory` only; no `status` method was found. Calling this route is expected to fail at runtime. | Medium | Open—static inspection | Implement `status()` with a safe health response, or remove the route. Add a route-level test. |
| BUG-03 | Public activity details fetch the entire `/api/v1/activities` list and locate the ID client-side instead of requesting one detail record. This is inefficient and relies on the item remaining active/listed. | Low | Open—design issue | Add a public `GET /activities/{id}` endpoint and fetch it directly; preserve 404 behaviour. |
| BUG-04 | The repository has multiple SQL dumps (`addin.sql`, `addiin.sql`, and `database/migrations/addiin.sql`) and Docker Compose references `./database/migration/addiin.sql` (singular `migration`), while the observed folder is `database/migrations`. Docker initialization may therefore miss the SQL file. | Medium | Open—configuration inspection | Use one canonical schema/migration source; correct the Compose volume path; validate with clean-container startup. |
| BUG-05 | `AboutContentController@update` accepts all request data and writes JSON without field-level validation. | Medium | Open—static inspection | Use explicit validation rules and an allowlist; reject unexpected keys/oversized fields. |
| BUG-06 | The initial root-level `npm run build` failed because the root package has no `build` script. This is not a client code failure; the client build in `client/` passed. | Informational | Observed | Document `client` as the correct working directory or add root workspace scripts. |

## 10. Test Coverage Summary

| Module | Normal | Boundary | Invalid | Exceptional | Manual evidence needed |
|---|---:|---:|---:|---:|---|
| Registration/verification/login/profile | Yes | Yes | Yes | Yes | Yes |
| Prayer times | Yes | Limited | Admin validation | Limited | Yes |
| Activities/events | Yes | Validation limits | Yes | Missing item/upload failure | Yes |
| Milad | Yes | Date/field values | Yes | Unauthorized ownership | Yes |
| Zakat calculator | Yes | Yes | Yes | Limited | Yes |
| Donations | Yes | Amount min | Yes | Gateway fail/cancel/IPN | Yes |
| Contact/messaging | Yes | Message limit | Yes | Closed/unauthorized use | Yes |
| AI | Yes | 1000-char limit | Yes | service unavailable | Yes |
| Admin/authorization | Yes | Filters where applicable | Yes | forbidden access | Yes |
| Build/static quality | Executed | N/A | N/A | N/A | No |

## 11. Screenshot-Based Test Evidence Plan

Take screenshots only after performing the exact action. Do not use mock or placeholder images. Place each figure **after** its related test-case table/paragraph unless noted otherwise, with the supplied one-sentence explanation below it.

| Screenshot ID | Related TC | Exact capture steps and required visible state | What it proves / caption | Location / priority / filename |
|---|---|---|---|---|
| SS-01 | TC-01 | Register a new unique user with valid fields; submit. Capture confirmation/verification-next state, not password. | Proves valid registration workflow. **Figure SS-01: Successful User Registration and Verification Prompt.** | Section 8 after TC-01; Required; `SS-01_Successful_Registration.png` |
| SS-02 | TC-02 | Leave name empty, use bad email and short password; submit. Ensure validation messages are visible. | Proves invalid registration is rejected. **Figure SS-02: Registration Validation Messages.** | After TC-02; Required; `SS-02_Invalid_Registration.png` |
| SS-03 | TC-04 | Enter real email and valid received code; submit; capture success/redirect. | Proves email-code verification. **Figure SS-03: Successful Email Verification.** | After TC-04; Recommended; `SS-03_Email_Verification_Success.png` |
| SS-04 | TC-05 | Enter an incorrect/reused/expired code; capture error. | Proves invalid code handling. **Figure SS-04: Invalid or Expired Verification Code.** | After TC-05; Recommended; `SS-04_Invalid_Verification_Code.png` |
| SS-05 | TC-06 | Log in using a verified account; capture dashboard/header profile state. | Proves successful authentication. **Figure SS-05: Successful User Login.** | After TC-06; Required; `SS-05_Successful_Login.png` |
| SS-06 | TC-07 | Submit incorrect credentials; capture visible error. | Proves login rejection. **Figure SS-06: Invalid Login Attempt.** | After TC-07; Required; `SS-06_Invalid_Login.png` |
| SS-07 | TC-08 | Change one safe profile value, save, and show updated persisted value. | Proves profile update. **Figure SS-07: Updated User Profile.** | After TC-08; Recommended; `SS-07_Profile_Update.png` |
| SS-08 | TC-09 | Enter wrong current password or too-short new password; capture feedback. | Proves password validation. **Figure SS-08: Password Change Validation.** | After TC-09; Recommended; `SS-08_Password_Validation.png` |
| SS-09 | TC-10 | Open Prayer Times with all categories visible. | Proves public prayer-time retrieval/display. **Figure SS-09: Prayer Times Display.** | After TC-10; Required; `SS-09_Prayer_Times.png` |
| SS-10 | TC-11 | As admin, make and show one safe prayer-time update/toggle; capture admin result. | Proves admin management. **Figure SS-10: Admin Prayer-Time Management.** | After TC-11; Recommended; `SS-10_Admin_Prayer_Time.png` |
| SS-11 | TC-12 | Open Activities and select an active card; capture detail view. | Proves list-to-detail navigation. **Figure SS-11: Activity Detail Display.** | After TC-12; Required; `SS-11_Activity_Detail.png` |
| SS-12 | TC-13 | Navigate to a nonexistent activity ID; capture not-found state. | Proves graceful missing-item handling. **Figure SS-12: Activity Not Found Handling.** | After TC-13; Optional; `SS-12_Activity_Not_Found.png` |
| SS-13 | TC-14 | As admin create a temporary valid activity; capture saved item (avoid sensitive Cloudinary details). | Proves activity creation. **Figure SS-13: Admin Activity Creation.** | After TC-14; Recommended; `SS-13_Admin_Activity_Create.png` |
| SS-14 | TC-16 | Capture Events page with real event entries, or admin success after safe CRUD. | Proves event availability/management. **Figure SS-14: Islamic Events Module.** | After TC-16; Recommended; `SS-14_Events.png` |
| SS-15 | TC-18 | User submits valid Milad request; capture confirmation and pending record in My Milad Requests. | Proves booking and initial status. **Figure SS-15: Submitted Milad Request.** | After TC-18; Required; `SS-15_Milad_Submission.png` |
| SS-16 | TC-19 | Admin changes a pending request to approved/rejected; capture resulting status and safe remark. | Proves approval/rejection workflow. **Figure SS-16: Admin Milad Status Update.** | After TC-19; Required; `SS-16_Milad_Status_Update.png` |
| SS-17 | TC-21 | Enter documented asset/liability values; calculate; capture inputs and visible result. | Proves calculator operation. **Figure SS-17: Zakat Calculation Result.** | After TC-21; Required; `SS-17_Zakat_Calculation.png` |
| SS-18 | TC-23 | Complete valid donation form immediately before redirect; capture category/amount and initiate state. Do not expose sensitive payment information. | Proves donation initiation request. **Figure SS-18: Donation Initiation.** | After TC-23; Required; `SS-18_Donation_Initiation.png` |
| SS-19 | TC-23/25 | Capture real gateway callback page for success, fail, or cancel; label actual state exactly. | Proves actual callback outcome, not payment settlement unless confirmed. **Figure SS-19: Donation Callback Result.** | After TC-25; Recommended; `SS-19_Donation_Callback_[State].png` |
| SS-20 | TC-24 | Submit amount 0 or empty required donation field; capture validation. | Proves invalid donation rejection. **Figure SS-20: Donation Validation Error.** | After TC-24; Recommended; `SS-20_Invalid_Donation.png` |
| SS-21 | TC-26 | Log in as donor and open My Donations; capture only safe, non-sensitive rows. | Proves scoped donation history. **Figure SS-21: User Donation History.** | After TC-26; Recommended; `SS-21_My_Donations.png` |
| SS-22 | TC-27 | Submit valid Contact form and capture confirmation. | Proves public contact submission. **Figure SS-22: Contact Form Submission.** | After TC-27; Recommended; `SS-22_Contact_Submission.png` |
| SS-23 | TC-27 | Admin opens same message and marks read/replies; capture status/reply confirmation. | Proves contact administration. **Figure SS-23: Admin Contact Reply.** | After TC-27; Optional; `SS-23_Admin_Contact_Reply.png` |
| SS-24 | TC-28 | Submit malformed email/blank required contact input; capture error. | Proves contact validation. **Figure SS-24: Contact Form Validation.** | After TC-28; Optional; `SS-24_Invalid_Contact.png` |
| SS-25 | TC-29 | User sends message and admin replies (or show a legitimate conversation view); capture messages and status, masking private text if needed. | Proves messaging integration. **Figure SS-25: User–Admin Messaging Conversation.** | After TC-29; Required; `SS-25_Messaging.png` |
| SS-26 | TC-31 | With AI service running, ask a real question and capture response/source display. | Proves AI integration only if response is live. **Figure SS-26: Diin AI Response.** | After TC-31; Required if feature demo is expected; `SS-26_Diin_AI_Response.png` |
| SS-27 | TC-32 | In test environment, show AI error/validation (e.g., 1001-character input); capture graceful message. | Proves safe AI error handling. **Figure SS-27: Diin AI Validation or Service Error.** | After TC-32; Optional; `SS-27_Diin_AI_Error.png` |
| SS-28 | TC-33 | Log in as admin and show dashboard overview without exposing user data unnecessarily. | Proves administrator interface. **Figure SS-28: Administrator Dashboard.** | Section 8 after TC-33; Required; `SS-28_Admin_Dashboard.png` |
| SS-29 | TC-34 | As normal user or visitor attempt `/admin/panel`; capture redirect/access-denied state. | Proves role restriction. **Figure SS-29: Unauthorized Admin Access Denied.** | After TC-34; Required; `SS-29_Admin_Access_Denied.png` |
| SS-30 | TC-35 | Navigate to an invalid route; capture 404 and Go Home control. | Proves client error page. **Figure SS-30: Application 404 Page.** | After TC-35; Optional; `SS-30_404_Page.png` |

Below every figure, add: “The figure shows the observed result for [TC ID]. It provides visual evidence that [expected outcome] was [observed/not observed].” Replace bracketed text with the real outcome.

## 12. Screenshot Collection Checklist

| Order | ID | Action | Expected screen/result | Filename |
|---:|---|---|---|---|
| 1–4 | SS-01 to SS-04 | Register a disposable test account, verify it, then test invalid code. | Registration/verification states. | As listed above |
| 5–8 | SS-05 to SS-08 | Login; test invalid login; update profile; test password validation. | Auth/profile evidence. | As listed above |
| 9–14 | SS-09 to SS-14 | Capture prayer times, activities, missing activity, optional admin activity, events. | Public/admin content. | As listed above |
| 15–17 | SS-15 to SS-17 | Submit Milad, update status as admin, calculate Zakat. | Booking/status/calculation. | As listed above |
| 18–21 | SS-18 to SS-21 | Test donation initiation/real callback/invalid input/history. | Payment workflow evidence. | As listed above |
| 22–25 | SS-22 to SS-25 | Submit contact, admin reply, invalid contact, messaging. | Communication evidence. | As listed above |
| 26–30 | SS-26 to SS-30 | AI normal/error, admin dashboard, denied access, 404. | AI, roles, error pages. | As listed above |

## 13. Information Still Required and Final Review Checklist

### Results/information the student must provide manually

- Application URL, browser/version, PHP/MySQL versions, and whether local/Docker deployment is used.
- Actual result and Pass/Fail for TC-01 through TC-35 (except executed TC-36/EV entries).
- Actual HTTP status/error wording when validation or authorization tests are run.
- Real email verification delivery result.
- Real SSLCommerz sandbox transaction IDs and callback results, if permitted.
- Whether Cloudinary image upload and Python AI service are configured/running.
- Actual screenshots listed as Required, plus any Recommended screenshots requested by the instructor.
- Any additional defects discovered during manual execution.

### Final review checklist

- [ ] Title-page identity fields completed.
- [ ] Table of contents page numbers updated in Word.
- [ ] Every manual test has an observed Actual Result and honest Pass/Fail/Not Executed status.
- [ ] No test is marked Pass solely because it is expected to pass.
- [ ] Required screenshots inserted after their related test-case discussion with correct captions.
- [ ] Screenshot file names and figure numbering match the report.
- [ ] Payment and email claims use real evidence only.
- [ ] Static findings are labelled as code-review findings unless reproduced.
- [ ] Temporary test data was removed/restored safely, if authorized.
- [ ] Teacher-required formatting, page numbers, signatures, and references were applied.

## 14. Conclusion

Ad-Diin implements a broad mosque/community management scope: public religious information, user accounts and verification, Milad requests, donations, contacts, messaging, Zakat calculation, AI assistance, and administrative management. Static and build-level checks completed successfully within the available environment, but feature-level end-to-end evidence requires manual execution against the configured application, database, email, payment, Cloudinary, and AI services. The report therefore provides an evidence-led execution plan and records the discovered code-level risks without overstating test success.
