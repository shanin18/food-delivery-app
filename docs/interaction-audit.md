# Interaction polish

The shared `InteractivePressable` supplies brief press-in and release animations without changing layout dimensions. It forwards existing handlers, accessibility props, disabled states and refs. Reduced Motion disables scaling and animation duration. Existing screen styles remain authoritative for colors and geometry.

- Customer and restaurant buttons, cards, tabs, icon controls and confirmation actions use the shared feedback.
- Restaurant food rows, popular-item rows, notification rows and both profile menus also highlight their background when pressed.
- Restaurant navigation highlights the selected destination.
- Customer, authentication and restaurant stacks use consistent slide transitions; Reduced Motion disables them.
- Photo swipe gestures, tracking sheet gestures and map interactions retain their own gesture handling.

Validation: lint and TypeScript checks. Physical-device visual checks remain needed for interrupted taps during scrolling, keyboard transitions, screen reader navigation and platform-specific modal transitions.
