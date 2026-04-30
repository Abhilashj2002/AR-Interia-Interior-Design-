# Price Calculator Fix Process (2026-03-22)

## Scope Requested
- Fix context image loading in price calculator.
- Ensure recommended cards do not repeat same images.
- Ensure recommendations load from configuration and layout even when category is not selected.

## Files Updated
- `main.ts`

## Implementation Summary
1. Added effective category inference in calculator logic:
   - If selected category is valid, use it.
   - If not selected/invalid, infer category from configuration and layout:
     - `bhk >= 4` or `shape === Custom` => `Villa`
     - else => `Apartment`

2. Updated pricing multiplier usage:
   - Category multiplier now uses inferred/validated effective category.

3. Improved calculator context image resolution:
   - Kept valid direct image URLs.
   - Expanded apartment image pool to valid local assets.

4. Enforced non-repeating recommendation images:
   - Added dedupe logic for recommendation cards.
   - Dedupe checks item-specific category pools first, then global fallback pool.

5. Updated recommendation title rendering:
   - Modal shows `Recommended <effective category> Concepts`.

## Validation Performed
- Build validation:
  - `npm run -s build` passed.

- Browser smoke validation (Playwright):
  - Scenario A: no category click, configuration/layout only.
  - Scenario B: explicit category selection.
  - Final result:
    - headers correct,
    - images loaded,
    - no duplicate recommendation images in both scenarios.

## Notes
- Temporary test script was created and removed after verification.
- Workspace is not a git repository, so no commit operation was possible.
