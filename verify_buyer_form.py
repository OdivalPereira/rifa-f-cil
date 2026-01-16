import time
from playwright.sync_api import sync_playwright, expect

def verify_buyer_form():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport to match memory priority
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()

        # Listen for console errors to catch potential issues
        page.on("console", lambda msg: print(f"Console log: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page error: {err}"))

        # Mock Supabase response for active raffle
        def handle_route(route):
            if "raffles?select=*" in route.request.url and "status=eq.active" in route.request.url:
                print("Mocking active raffle response...")
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body='[{"id": "mock-raffle-id", "title": "Rifa Mock", "price_per_number": 1.0, "total_numbers": 1000, "status": "active", "created_at": "2024-01-01T00:00:00Z"}]'
                )
            else:
                route.continue_()

        # We can try to use a broader wildcard if the specific query params match fails
        page.route("**/rest/v1/raffles*", handle_route)

        try:
            print("Navigating to http://localhost:8080/ ...")
            page.goto("http://localhost:8080/")

            # Wait for the form to be visible.
            print("Looking for 'Comprar Números Agora' button...")
            try:
                # Mocking might result in the button being visible or the form directly.
                # If there's a button "Comprar Números Agora", click it.
                # Use a short timeout because it might already be open or not exist depending on state.
                buy_button = page.get_by_role("button", name="Comprar Números Agora")
                if buy_button.is_visible(timeout=5000):
                     buy_button.click()
                     print("Clicked 'Comprar Números Agora'")
            except Exception as e:
                print(f"Button check skipped/failed: {e}")

            # Wait for BuyerForm title
            print("Waiting for 'Garantir Sorte'...")
            try:
                 expect(page.get_by_text("Garantir Sorte")).to_be_visible(timeout=10000)
                 print("✅ Form is visible")
            except AssertionError:
                 print("Could not find 'Garantir Sorte'.")
                 page.screenshot(path="/home/jules/verification/failed_to_find_form.png")
                 return

            # Verify Asterisk on Labels
            print("Checking for required indicators...")
            # We look for the asterisk text inside the labels
            labels = page.locator("label")
            found_asterisk = False

            # Helper to check if any label has the asterisk
            for i in range(labels.count()):
                text = labels.nth(i).inner_text()
                if "*" in text:
                    found_asterisk = True
                    print(f"✅ Found asterisk in label: {text}")

            if not found_asterisk:
                 print("❌ No asterisks found in labels.")

            # Verify Slider aria-label
            print("Checking slider aria-label...")
            slider_with_label = page.locator("span[aria-label='Selecionar quantidade de cotas']")

            if slider_with_label.count() > 0:
                 print("✅ Slider with correct aria-label found.")
            else:
                 print("❌ Slider with correct aria-label NOT found.")

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="/home/jules/verification/buyer_form_verification.png", full_page=True)

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_buyer_form()
