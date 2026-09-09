# Minute Flash Clock

Chrome Manifest V3 extension that flashes the current digital time at the exact start of every minute.

Version 1.1 adds a five-level minute hierarchy so more important clock marks are progressively more prominent.

## Minute hierarchy

The strongest matching tier always wins:

- **Normal minute:** every minute not listed below
- **5-minute:** `:05, :10, :20, :25, :35, :40, :50, :55`
- **Quarter hour:** `:15, :45`
- **Half hour:** `:30`
- **Top of hour:** `:00`

Each higher tier increases visual prominence and display duration. Individual tiers can be disabled from the extension popup.

## Install

1. Open Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select the `minute-flash-clock` folder.
5. Open or refresh a normal webpage.

If upgrading from an earlier unpacked version, replace the old folder with this one and click **Reload** on the extension card in `chrome://extensions`.

## Settings

Click the extension icon to configure:

- Enabled/disabled
- 12-hour or 24-hour time
- Base flash duration (automatically scaled by tier)
- Zoom, slide, flip, or pulse animation
- Page dimming
- Seconds display
- Optional tiered chime
- Enable/disable each minute tier independently
- Test any tier immediately

## Notes

- Chrome does not allow content scripts on internal pages such as `chrome://extensions`, the Chrome Web Store, and some protected browser pages.
- Timing is recalculated each minute rather than using a fixed interval, which minimizes drift.
- Background tabs may be timer-throttled by Chrome. When a tab becomes visible/focused again, the extension resynchronizes to the next minute boundary.
