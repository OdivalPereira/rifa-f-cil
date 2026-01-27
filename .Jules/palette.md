## 2024-05-23 - MyNumbers Engagement & Mobile UX
**Learning:** Users on mobile devices need context-specific keyboards (numeric for phone, email for email) to reduce friction during entry. Additionally, providing a prominent "Buy More" path on utility pages (like "Check My Numbers") aligns with business goals and keeps the user engaged in the core loop.
**Action:** Always verify `inputMode` and `type` attributes on form inputs, especially for phone/email fields. When designing "dead-end" utility pages, look for opportunities to add "Buy" or "Action" CTAs to keep the user journey active.

## 2024-05-24 - Mobile Form Autocomplete
**Learning:** Adding `autoComplete` attributes (e.g., `name`, `email`, `tel`) to form inputs significantly speeds up form completion on mobile devices by allowing one-tap filling from the OS keychain/browser.
**Action:** Ensure all standard user data inputs (name, email, phone, address) have the correct `autoComplete` attribute explicitly defined.

## 2024-05-25 - Accessible Form Validation
**Learning:** Simply displaying error messages is not enough for screen readers. Inputs must be programmatically linked to their error messages using `aria-describedby`, and the message itself needs `role="alert"` to ensure immediate feedback.
**Action:** Always add `aria-invalid` and `aria-describedby` to inputs when they have validation errors.

## 2024-05-26 - Interactive Card Accessibility
**Learning:** Interactive cards that trigger modals are frequently implemented as `div`s, excluding keyboard users. Converting them to `<button>` elements requires explicitly setting `text-left` and `w-full` to preserve the card layout while restoring native focus and activation behavior.
**Action:** When making cards interactive, use `<button type="button">` instead of `div`, and ensure CSS resets (width, text-align) are applied to match the original design.

## 2024-05-27 - Password Visibility Toggle
**Learning:** Password fields without visibility toggles increase error rates and user frustration. Implementing this pattern requires managing local state (`showPassword`) and swapping the input `type` between `password` and `text`, along with a dynamic `aria-label` on the toggle button for accessibility.
**Action:** Always include a show/hide toggle for password inputs, ensuring the toggle button is properly labeled and accessible via keyboard.
