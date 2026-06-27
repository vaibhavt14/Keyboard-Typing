# Project map for Keyboard-Typing

This repo is a **minimalistic, customizable typing-test web app**. That app is the
product. Build features for it as described in each ticket.

There is **one exception** you must never confuse with the product:

## `scripts/` and `.github/workflows/robot.yml` — the robot's own machinery (NOT the product)

These are the plumbing for the autonomous "Jira ticket → code → PR" robot that builds
this project. They are internal tooling, **not** a feature of the typing-test app.

- Only touch `scripts/` when a ticket is explicitly about the robot/automation itself.
- A normal product or UI ticket must **never** add files to `scripts/`, and must not
  turn the app into a page that documents the robot.

## Everything else is the product

All other files are the typing-test app. Implement product and UI tickets as part of
that app (at the repo root / wherever the app's code lives). Keep your changes scoped
to the feature the ticket describes.

## Rule of thumb

Product/UI work → the typing-test app. Robot/automation work → `scripts/`.
When unsure, build the product and leave `scripts/` untouched.
