# OLP_AQI-31F

## Hosting model

This repo is configured for static hosting on GitHub Pages.
External AQI is fetched directly from CPCB/data.gov.in in the browser.

## Required browser setup (8 controlled devices)

Because CPCB endpoint CORS is restricted, install a Chrome CORS extension on each device.

1. Install a CORS extension (example: "CORS Unblock").
2. Whitelist only your GitHub Pages domain.
3. Keep the extension enabled only during dashboard display.
4. Disable it for normal browsing.

## Hardening checklist before sharing URL

1. Confirm the extension is limited to your GitHub Pages domain only.
2. Keep repository access restricted if possible (private repo for internal use).
3. Rotate CPCB API key if a previously public key was exposed.
