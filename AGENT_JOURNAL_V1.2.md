## AI Agent Upgrade Log - v1.2

This document details the significant upgrades made to the AI Dispatcher agent, focusing on enhanced analytical capabilities, UI robustness, and error handling.

### Key Enhancements:

#### 1.  **Enhanced Intelligence & Transparency**
    *   **Detailed Distance Calculation:** The analysis logic was upgraded to fetch and process route legs from the Google Routes API. This provides a clear breakdown of the total journey into "Vehicle to Pickup" and "Cargo Leg" distances. The UI was subsequently updated to display this detailed breakdown, offering much greater transparency into the agent's calculations.
    *   **Vignette Cost Awareness:** The prompt sent to the Anthropic (Claude) AI was significantly improved. It now includes contextual information about the route's origin and destination and a specific instruction to add a "note of caution" regarding potential uncalculated vignette costs if the route passes through known vignette-required countries (e.g., Austria, Hungary). This makes the AI's final text proposal more practical and realistic.

#### 2.  **Critical Bug Fixes & UI Robustness**
    *   **Resolved `500 Internal Server Error`:** Fixed a server crash caused by unsafe access to the `route.legs` array returned by Google. The code now robustly handles scenarios where a route might have only one or zero legs, preventing crashes and ensuring the analysis can proceed.
    *   **Fixed "Analyze & Propose" UI Bug:** Addressed a major UI flaw where the analysis panel would not appear after calculation. The component's state management was completely refactored from a single global state to a per-alert state (`alertStates`). This ensures that each alert's analysis is managed independently and the UI updates reliably.
    *   **Resolved "Cargo offer not found" Error:** Traced and fixed a backend error caused by passing the wrong ID for analysis. The UI now correctly sends the `alert.relatedId` (the actual `cargoOfferId`) to the backend, ensuring the correct entity is looked up in the database.

#### 3.  **General Debugging & Maintenance**
    *   **Cleared Next.js Cache:** Resolved a persistent `Uncaught SyntaxError` and associated page slowdowns by clearing the corrupted Next.js build cache (`.next` directory) and forcing a clean rebuild.
    *   **Handled Language/UI Reversions:** Addressed user requests to revert UI text from Romanian back to English, demonstrating flexibility in UI management.
    *   **Corrected Notification System:** Fixed linter errors related to the `sonner` toast notification library by correcting the import and usage, ensuring notifications work as expected. 