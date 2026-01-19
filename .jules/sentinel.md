## 2025-05-23 - Hardcoded Edge Function URL in SQL Trigger
**Vulnerability:** The `notify_raffle_soft_delete` SQL trigger (via `pg_net` extension) hardcodes the Supabase Edge Function URL (`https://iohfdtczqxzofqxngsag.supabase.co...`).
**Learning:** SQL migrations attempting to call Edge Functions via `pg_net` cannot easily use environment variables, leading to hardcoded project-specific URLs that break portability and leak Project IDs.
**Prevention:** Avoid `pg_net` in migrations for dynamic environments; prefer database webhooks (native Supabase feature) or soft-coding the URL in a configuration table that is updated post-deployment.

## 2025-05-23 - PIN Hashing Salt Weakness
**Vulnerability:** User PINs are hashed using the phone number as a salt (`hashPin(pin, cleanPhone)`).
**Learning:** Using a predictable salt (phone number) for low-entropy secrets (4-digit PINs) allows trivial brute-forcing if the database is compromised.
**Prevention:** Always use a random salt stored alongside the hash and/or a server-side pepper for low-entropy user secrets. (Fix rejected to avoid breaking changes).

## 2025-05-23 - User Enumeration in Auth
**Vulnerability:** Authentication endpoints return specific errors ("Phone already registered", "Account locked until...") that allow user enumeration.
**Learning:** Detailed error messages in public auth endpoints compromise privacy by revealing which users exist in the system.
**Prevention:** Use generic error messages (e.g., "Invalid credentials" or "If an account exists, instructions were sent") to prevent enumeration, though this trades off some UX.
