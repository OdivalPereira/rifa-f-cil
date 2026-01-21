## 2025-05-23 - Missing Authorization in Edge Functions
**Vulnerability:** The `reset-pin` action in `customer-auth` Edge Function lacked authorization checks, allowing any user (authenticated or not) to invoke it and reset any customer's PIN if they knew the endpoint.
**Learning:** Edge Functions are public by default. Passing a JWT in the header via `invoke` is not enough; the function MUST explicitly verify that JWT and check permissions using `supabase.auth.getUser()`.
**Prevention:** Always verify `Authorization` header and check roles for privileged actions in Edge Functions.

## 2025-05-23 - HTML Injection in Email Templates
**Vulnerability:** The `notify-admin-action` Edge Function directly injected `raffle_title` and `raffle_id` (user-controlled or potentially tainted data) into an HTML email template without escaping. This could allow malicious actors to inject arbitrary HTML content into admin emails.
**Learning:** Even internal notification emails should treat all data as untrusted. Edge Functions running in Deno/Node environments do not automatically escape variables in template literals like React does.
**Prevention:** Always use an HTML escaping helper function (or a library) when constructing HTML strings from variables in backend functions.

## 2025-05-24 - IDOR in Purchases Table
**Vulnerability:** The `purchases` table had an RLS policy `USING (true)` for `SELECT`, allowing any user (anonymous or authenticated) to download the entire purchase history (names, emails, phones) of the application.
**Learning:** `USING (true)` effectively disables RLS for that operation. It should practically never be used for tables containing PII, even if the intent is "users can see their own data" (which requires a filter condition like `uid() = user_id`).
**Prevention:** Always verify RLS policies. Default to `USING (false)` (deny all) and add specific policies. For custom auth systems that don't use Supabase Auth sessions, use Edge Functions to proxy and authorize data access instead of exposing the table directly.
