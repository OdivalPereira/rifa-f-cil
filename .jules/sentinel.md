## 2025-05-23 - Missing Authorization in Edge Functions
**Vulnerability:** The `reset-pin` action in `customer-auth` Edge Function lacked authorization checks, allowing any user (authenticated or not) to invoke it and reset any customer's PIN if they knew the endpoint.
**Learning:** Edge Functions are public by default. Passing a JWT in the header via `invoke` is not enough; the function MUST explicitly verify that JWT and check permissions using `supabase.auth.getUser()`.
**Prevention:** Always verify `Authorization` header and check roles for privileged actions in Edge Functions.
