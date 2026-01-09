from playwright.sync_api import sync_playwright

def verify_visuals():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport
        context = browser.new_context(viewport={'width': 375, 'height': 812})
        page = context.new_page()

        try:
            # Go to home page
            page.goto("http://localhost:8080")

            # Wait for content to load
            page.wait_for_selector(".min-h-screen", state="visible")

            # Wait a bit for animations (lights/particles)
            page.wait_for_timeout(2000)

            # Take screenshot of the whole page (top part mostly)
            page.screenshot(path="verification/slot_machine.png")

            print("Screenshot taken successfully")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_visuals()
