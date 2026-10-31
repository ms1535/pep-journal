# Pep Journal

A personal, private journey tracker. One HTML file, no account, no subscription, no server.
All data stays in your phone's browser storage.

## What it does

- **Log** doses (compound, amount, unit, date/time, notes), including past ones you missed
- **Sites** body map (front and back) with rest colours: green 7+ days or unused, yellow 3-6, red under 3
- **Vials** inventory with remaining amount (auto-deducted when you log from a vial) and expiry warnings
- **Progress** weight trend (lb or kg) and side-effect notes linked to a dose
- **Doctor report** printable summary (30 days, 90 days, or everything), save as PDF from the print dialog
- **Backup** export and restore as a JSON file

It does not give medical advice or dosing guidance. It only records what you and your prescriber decide.

## Using it on your phone

Installing it as an app needs the file served over https. Easiest route:

1. Repo Settings > Pages > deploy from the `main` branch, root folder.
2. Open the Pages address in Chrome on your phone, menu > **Add to Home screen** (or **Install app**).
3. After the first load it opens with no signal.

Note on privacy: your data is never in this repo. It lives only in the phone's browser storage, so the page can
be public without exposing anything. **Export a backup regularly**: clearing browser data or losing the phone
deletes it.

You can also just open `index.html` directly from the phone's files; it works, but without the install icon.

## Tests

```bash
node tests/smoke.js
```

Drives the real page in a real browser: logging, vial deduction, site colours, unit switch, script-injection
check, backup round trip, report, and a check that the page makes zero network requests.

## Build marker

`Build 2026-10-31.1` appears in `index.html` (About card) and in the `CACHE` name in `sw.js`. Bump both when
`index.html` changes, or an installed copy will keep serving the old version.
