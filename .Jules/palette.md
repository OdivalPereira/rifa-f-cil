## 2024-05-23 - MyNumbers Engagement & Mobile UX
**Learning:** Users on mobile devices need context-specific keyboards (numeric for phone, email for email) to reduce friction during entry. Additionally, providing a prominent "Buy More" path on utility pages (like "Check My Numbers") aligns with business goals and keeps the user engaged in the core loop.
**Action:** Always verify `inputMode` and `type` attributes on form inputs, especially for phone/email fields. When designing "dead-end" utility pages, look for opportunities to add "Buy" or "Action" CTAs to keep the user journey active.

## 2024-05-24 - Mobile Form Autocomplete
**Learning:** Adding `autoComplete` attributes (e.g., `name`, `email`, `tel`) to form inputs significantly speeds up form completion on mobile devices by allowing one-tap filling from the OS keychain/browser.
**Action:** Ensure all standard user data inputs (name, email, phone, address) have the correct `autoComplete` attribute explicitly defined.
