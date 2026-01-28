## 2025-05-23 - Missing Authorization in Edge Functions
**Vulnerability:** The `reset-pin` action in `customer-auth` Edge Function lacked authorization checks, allowing any user (authenticated or not) to invoke it and reset any customer's PIN if they knew the endpoint.
**Learning:** Edge Functions are public by default. Passing a JWT in the header via `invoke` is not enough; the function MUST explicitly verify that JWT and check permissions using `supabase.auth.getUser()`.
**Prevention:** Always verify `Authorization` header and check roles for privileged actions in Edge Functions.

## 2025-05-23 - HTML Injection in Email Templates
**Vulnerability:** The `notify-admin-action` Edge Function directly injected `raffle_title` and `raffle_id` (user-controlled or potentially tainted data) into an HTML email template without escaping. This could allow malicious actors to inject arbitrary HTML content into admin emails.
**Learning:** Even internal notification emails should treat all data as untrusted. Edge Functions running in Deno/Node environments do not automatically escape variables in template literals like React does.
**Prevention:** Always use an HTML escaping helper function (or a library) when constructing HTML strings from variables in backend functions.

## 2026-01-24 - Data Leakage via Insecure RLS and Views
**Vulnerability:** The `purchases` table had an RLS policy `USING (true)`, allowing any user to dump the entire table including PII (phone, name, amount). Additionally, public ranking views were exposing full phone numbers.
**Learning:** `USING (true)` policies for "own data" checks are incorrect; they grant universal access. Also, public views aggregating private data must be `SECURITY DEFINER` (to bypass table RLS) BUT must explicitly mask sensitive fields to prevent PII leakage.
**Prevention:** Restrict table RLS to Admins/Service Role only. Use `SECURITY DEFINER` views for public aggregates and always mask PII (e.g., `overlay()` for phones) in the view definition.
