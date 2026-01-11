from playwright.sync_api import sync_playwright
import sys

def verify_autocomplete():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        # Navigate to Customer Account page
        print("Navigating to http://localhost:8080/conta")
        page.goto("http://localhost:8080/conta")

        # Wait for any text to appear to debug loading
        print("Waiting for content...")
        try:
            page.wait_for_selector("input", timeout=10000)
        except Exception as e:
            print(f"Error waiting for input: {e}")
            page.screenshot(path="verification/error_load.png")
            sys.exit(1)

        # Check login phone input
        login_phone = page.locator("#login-phone")
        print(f"Login Phone ID: {login_phone.get_attribute('id')}")
        print(f"Login Phone AutoComplete: {login_phone.get_attribute('autocomplete')}")

        # Check label association
        login_label = page.locator("label[for='login-phone']")
        print(f"Login Label Text: {login_label.text_content()}")

        # Switch to Register tab
        page.get_by_role("tab", name="Criar Conta").click()

        # Check register phone input
        register_phone = page.locator("#register-phone")
        print(f"Register Phone ID: {register_phone.get_attribute('id')}")
        print(f"Register Phone AutoComplete: {register_phone.get_attribute('autocomplete')}")

        # Check label association
        register_label = page.locator("label[for='register-phone']")
        print(f"Register Label Text: {register_label.text_content()}")

        # Take screenshot
        page.screenshot(path="verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_autocomplete()
