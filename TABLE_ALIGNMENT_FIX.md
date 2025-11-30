# Table Row Alignment Fix

## Issue
Rows 10 and 11 (and other rows) in the Individual Rankings table were not properly aligned/inlined.

## Root Cause
1. Table cells lacked consistent `vertical-align: middle`
2. Player rows tables (for rows 11+) had different alignment than the main table
3. Table headers and cells had inconsistent vertical alignment

## Fixes Applied

### 1. Base Table Cell Alignment (Lines 1823-1827)
- Added `vertical-align: middle` to all `.leaderboard-table td` elements
- Added `vertical-align: middle` to all `.leaderboard-table th` elements

### 2. Individual Rankings Specific Alignment (Lines 1687-1757)
- Added `vertical-align: middle !important` to all table cells in individual rankings
- Set consistent `min-height: 60px` for all table rows
- Added specific alignment rules for each column:
  - Rank column: centered, middle aligned
  - Player column: middle aligned
  - Team column: centered, middle aligned
  - Runs/Steps columns: centered, middle aligned

### 3. Player Cell Container Alignment (Lines 1221-1225, 1700-1704)
- Enhanced `.player-cell` with `height: 100%` and `min-height: 40px`
- Ensured flex alignment with `align-items: center`

### 4. Player Rows Tables Alignment (Lines 1730-1757)
- Added specific CSS for `.player-rows` tables to match main table alignment
- Ensured consistent padding, vertical alignment, and row heights
- Matched column-specific alignment rules

## Result

✅ All table rows now have consistent vertical alignment
✅ All cells within a row are aligned to the middle
✅ Player avatars, names, and team badges are properly aligned
✅ Rows 10 and 11 (and all subsequent rows) are now perfectly aligned

