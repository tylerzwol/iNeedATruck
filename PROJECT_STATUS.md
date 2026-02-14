# Project status: tradeoffs, limitations & roadmap

> **⚠️ No testing.** This project has no unit tests, integration tests, or E2E tests. The codebase must be thoroughly reviewed and tested before considering any deployment.

## Tradeoffs made

To ship an MVP quickly, several simplifications were chosen:

| Area | Tradeoff | Rationale |
|------|----------|------------|
| **Auth** | No real accounts; users identified by email only | Avoids auth provider setup, OAuth flows, session management. Lets customers book without signup. |
| **Addresses** | Plain text fields, no geocoding or validation | No API keys or external services. Users type addresses; no distance/mileage calculation. |
| **Cost estimates** | Fixed formula: ~1.5 hrs labor + flat 10 miles for delivery | No Maps API calls. Estimates are rough; actual cost can differ. |
| **License & insurance** | Self-attestation + admin checkbox; no automated verification | Truck owners confirm validity; admins manually verify. No DMV or insurance API integration. |
| **Seasonal discounts** | Promo codes with flat % off; not tied to service types or truck owners | Simple platform-wide offers. No per-service or per-owner discount logic. |
| **Job flow** | Job request stored in sessionStorage, passed via URL params | Stateless; no server-side session. Works for single-session flows. |

---

## Known limitations

### Account & identity

- **No real authentication.** Anyone can claim any email when requesting a job. Truck owners and customers are not verified.
- **No password or login.** Users have no way to sign in, view past jobs, or manage a profile.
- **No email verification.** `emailVerified` exists in the schema but is not enforced.

### Addresses & cost estimation

- **Addresses are free text.** No autocomplete, validation, or geocoding. Typos and invalid addresses are possible.
- **Mileage is assumed.** Delivery estimates use a fixed 10 miles. Real distance is never calculated.
- **No service-area checks.** Truck owners have `serviceRadiusMiles` and `zipCodes`, but the system does not validate that pickup/dropoff fall within range.

### License & insurance verification

- **Self-attestation only.** Truck owners check a box confirming license and insurance. No automated checks.
- **Photos stored but not validated.** License/insurance images are uploaded and stored; no OCR or validity checks.
- **Admin verification is manual.** Admins toggle `driverLicenseVerified` and `insuranceConfirmed` by hand.

### Seasonal offers

- **Promo codes are display-only.** Codes like `PLOW25` are shown but not applied at checkout.
- **No discount enforcement.** Job creation does not apply seasonal offer discounts.
- **No service-type or truck-owner targeting.** Offers are global; no “snow plow only” or “premium members only” logic.

### Testing & deployment readiness

- **No tests.** No unit tests, integration tests, or E2E tests exist. All behavior is untested.
- **Not deployment-ready.** Requires thorough code review, security review, and a full test suite before any production deployment.

### Other

- **No payments.** Jobs are created with a `totalAmount` but no Stripe/PayPal integration.
- **No notifications.** No email or SMS for job status, reminders, or confirmations.
- **No reviews/ratings.** `ratingAvg` and `totalJobsCompleted` exist but are not populated from real job feedback.

---

## What we’d build next

### 1. Real account verification and creation (e.g. AWS)

- **Cognito or similar** for sign-up, sign-in, and email verification.
- **Protected routes** for truck owner dashboard, customer job history, and admin.
- **Role-based access** so truck owners and customers only see their own data.

### 2. Addresses + Google Maps API for better cost estimates

- **Places Autocomplete** for pickup/dropoff so addresses are validated and geocoded.
- **Distance Matrix API** (or similar) to get real driving distance and time.
- **Estimate formula** that uses actual miles × per-mile rate instead of a fixed 10 miles.
- **Service-area validation** so jobs are only bookable when pickup/dropoff fall within the truck owner’s radius or zip codes.

### 3. More thorough seasonal discount system

- **Apply promo codes at checkout** and persist the discount on the job.
- **Target offers** by service type (e.g. snow plow only), truck owner tier, or date range.
- **Stacking rules** (or explicit non-stacking) for multiple offers.
- **Admin UI** to create, edit, and retire seasonal offers with clear rules.

### 4. Actual license and registration verification

- **DMV/state API** (where available) to validate driver license status.
- **Insurance verification API** or third-party service to confirm coverage.
- **Document OCR** to extract license/registration details and flag mismatches.
- **Expiration checks** and alerts when license or insurance is about to expire.

### 5. Testing (required before deployment)

- **Unit tests** for API routes, validations, and business logic.
- **Integration tests** for critical flows (onboarding, job creation, admin).
- **E2E tests** for user journeys (find truck → request job, list truck flow).
- **Security review** before any production deployment.

### 6. Additional priorities

- **Payments** (Stripe) for deposits, full payment, or platform fees.
- **Notifications** (email/SMS) for job creation, status changes, and reminders.
- **Reviews and ratings** after job completion to populate `ratingAvg` and reputation.
- **Mobile-friendly** or native app for truck owners in the field.
