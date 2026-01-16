from playwright.sync_api import sync_playwright

def verify_decoration_rendering():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport as per project requirements
        page = browser.new_page(viewport={'width': 375, 'height': 812})

        try:
            # Navigate to local dev server (port updated to 8081 based on logs)
            page.goto("http://localhost:8081/")

            # Wait for any content to load
            page.wait_for_load_state("networkidle")

            # Check if lights are rendered - finding by class
            lights = page.locator(".animate-bulb-flash")
            count = lights.count()
            print(f"Number of lights found: {count}")

            # Take screenshot
            page.screenshot(path="/home/jules/verification/slot_machine_decorations.png")
            print("Screenshot saved to /home/jules/verification/slot_machine_decorations.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_decoration_rendering()
