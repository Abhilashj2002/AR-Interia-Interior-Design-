# TODO: Fix Design Utilization

## Task: Make 3D design selection smarter based on room type and style

### Problem:
- The current implementation assigns design3DIndex = 0-5 regardless of room type or style
- This means the 3D preview doesn't reflect the style of each generated variant
- User wants "generate 3d image related to that image"

### Solution:
- Create a style-to-index mapping for each room type in designer3d.ts
- Update generateImageVariants in main.ts to use this mapping

### Steps:
1. [x] Add style-based design mapping to designer3d.ts
2. [x] Export a function to get design index based on room type and style
3. [x] Update generateImageVariants in main.ts to use the new mapping
4. [x] Test the implementation

## Process Tracking

- [x] Saved runtime verification log for frontend/backend/database startup in PROCESS_SAVE_2026-04-04.md
