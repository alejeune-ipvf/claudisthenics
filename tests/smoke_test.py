"""Claudisthenics app v0.1 headless smoke test: full workout click-through + reset flow."""
import os
from playwright.sync_api import sync_playwright

_HERE = os.path.dirname(os.path.abspath(__file__))
URL = "file:///" + os.path.join(_HERE, "..", "app", "index.html").replace("\\", "/")
SHOT = os.path.join(_HERE, "shots")
os.makedirs(SHOT, exist_ok=True)
errors = []

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 390, "height": 844})  # iPhone-ish
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.on("console", lambda m: m.type == "error" and errors.append(f"console.error: {m.text}"))

    pg.goto(URL)
    pg.wait_for_timeout(600)
    pg.screenshot(path=f"{SHOT}/01_today.png")
    assert pg.locator("#startBtn").count(), "Start button missing on Today tab"

    pg.click("#startBtn")
    pg.wait_for_timeout(200)
    pg.screenshot(path=f"{SHOT}/02_warmup.png")
    pg.click("#nextBtn")  # warmed up
    pg.wait_for_timeout(300)
    pg.screenshot(path=f"{SHOT}/03_first_exercise.png")

    # first exercise is the dead hang (hold type): exercise the stopwatch
    if pg.locator("#holdBtn").count():
        pg.click("#holdBtn")
        pg.wait_for_timeout(1300)
        pg.click("#holdBtn")
        held = pg.locator("#val").inner_text()
        print(f"hold stopwatch recorded: {held}s")

    # click through the entire session
    reached_done = False
    for i in range(250):
        if pg.locator("#saveBtn").count():
            reached_done = True
            break
        if pg.locator("#nextBtn").count():
            pg.click("#nextBtn")
        elif pg.locator("#skipBtn").count():
            pg.click("#skipBtn")
        pg.wait_for_timeout(60)
    assert reached_done, "never reached the done screen"
    pg.screenshot(path=f"{SHOT}/04_done.png")

    pg.click("#saveBtn")
    pg.wait_for_timeout(400)
    pg.screenshot(path=f"{SHOT}/05_progress.png")
    body = pg.locator("body").inner_text()
    assert "1 session" in body, f"session count not shown after save"

    pg.click('button[data-tab="today"]')
    pg.wait_for_timeout(200)
    pg.screenshot(path=f"{SHOT}/06_today_after.png")
    assert "1/3 sessions" in pg.locator("body").inner_text(), "week dot count wrong"

    # reset flow: prompt must receive the typed RESET
    pg.click('button[data-tab="settings"]')
    pg.wait_for_timeout(200)
    pg.on("dialog", lambda d: d.accept("RESET"))
    pg.click("#resetBtn")
    pg.wait_for_timeout(400)
    pg.screenshot(path=f"{SHOT}/07_after_reset.png")
    pg.click('button[data-tab="progress"]')
    pg.wait_for_timeout(200)
    assert "no data" in pg.locator("body").inner_text(), "reset did not wipe sessions"

    b.close()

print("ERRORS:" if errors else "NO CONSOLE/PAGE ERRORS")
for e in errors:
    print("  ", e)
print("SMOKE TEST PASSED")
