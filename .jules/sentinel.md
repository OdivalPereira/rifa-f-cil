## 2025-05-23 - Missing Authorization in Edge Functions
**Vulnerability:** The `reset-pin` action in `customer-auth` Edge Function lacked authorization checks, allowing any user (authenticated or not) to invoke it and reset any customer's PIN if they knew the endpoint.
**Learning:** Edge Functions are public by default. Passing a JWT in the header via `invoke` is not enough; the function MUST explicitly verify that JWT and check permissions using `supabase.auth.getUser()`.
**Prevention:** Always verify `Authorization` header and check roles for privileged actions in Edge Functions.

## 2025-05-23 - HTML Injection in Email Templates
**Vulnerability:** The `notify-admin-action` Edge Function directly injected `raffle_title` and `raffle_id` (user-controlled or potentially tainted data) into an HTML email template without escaping. This could allow malicious actors to inject arbitrary HTML content into admin emails.
**Learning:** Even internal notification emails should treat all data as untrusted. Edge Functions running in Deno/Node environments do not automatically escape variables in template literals like React does.
**Prevention:** Always use an HTML escaping helper function (or a library) when constructing HTML strings from variables in backend functions.

## 2026-01-20 - Insecure RLS on Purchases Table
**Vulnerability:** The `purchases` table had an RLS policy `USING (true)` for SELECT, allowing anonymous users to list all purchases (IDOR/Leak) via client-side queries.
**Learning:** Convenience RLS policies (allowing public read) coupled with client-side filtering (`.eq('phone', ...)`) are catastrophic for sensitive data.
**Prevention:** Always use `USING (auth.uid() = ...)` or restrict access to Service Role (Edge Functions) for sensitive user data.
