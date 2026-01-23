## 2025-05-23 - Missing Authorization in Edge Functions
**Vulnerability:** The `reset-pin` action in `customer-auth` Edge Function lacked authorization checks, allowing any user (authenticated or not) to invoke it and reset any customer's PIN if they knew the endpoint.
**Learning:** Edge Functions are public by default. Passing a JWT in the header via `invoke` is not enough; the function MUST explicitly verify that JWT and check permissions using `supabase.auth.getUser()`.
**Prevention:** Always verify `Authorization` header and check roles for privileged actions in Edge Functions.

## 2025-05-23 - HTML Injection in Email Templates
**Vulnerability:** The `notify-admin-action` Edge Function directly injected `raffle_title` and `raffle_id` (user-controlled or potentially tainted data) into an HTML email template without escaping. This could allow malicious actors to inject arbitrary HTML content into admin emails.
**Learning:** Even internal notification emails should treat all data as untrusted. Edge Functions running in Deno/Node environments do not automatically escape variables in template literals like React does.
**Prevention:** Always use an HTML escaping helper function (or a library) when constructing HTML strings from variables in backend functions.

## 2025-05-23 - Exposed Development Tools in Production
**Vulnerability:** A `DevSimulationSection` component allowed users to simulate payment confirmation in the UI. While it didn't bypass backend checks, it could facilitate social engineering attacks (spoofing successful payments).
**Learning:** Developers often include test/demo UI components within feature components but fail to exclude them from production builds.
**Prevention:** Always wrap development-only UI components with `import.meta.env.DEV` (Vite) or equivalent build-time flags to ensure they are stripped from production bundles.
