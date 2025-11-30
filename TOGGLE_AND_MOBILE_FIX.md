# Team Standings Toggle & Mobile Responsiveness Fix

## Issues Fixed

1. **Toggle Functionality**: Team Standings and Individual Rankings toggle buttons now work correctly - only one view shows at a time
2. **Placeholder Leaderboard Visibility**: The "Team Standings Preview" placeholder now only shows when "Team Standings" tab is selected
3. **Mobile Responsiveness**: The placeholder leaderboard table is now fully responsive on mobile devices

## Changes Made

### 1. Toggle Functionality (JavaScript)

**Updated the tab switching logic** (Lines 3309-3360):

- Created a centralized `showTabContent(tabType)` function that:
  - Hides all leaderboard content sections
  - Shows/hides the placeholder leaderboard based on selected tab
  - Shows only the selected leaderboard content

- **Placeholder visibility logic:**
  - When "Team Standings" is selected → Placeholder is shown
  - When "Individual Rankings" is selected → Placeholder is hidden

- **Initialization:**
  - Team tab is active by default
  - Team leaderboard content is shown by default
  - Placeholder is shown by default

### 2. HTML Structure Updates

**Added ID to placeholder** (Line 4516):
- Added `id="placeholder-leaderboard"` for easy JavaScript targeting

**Added table wrapper** (Line 4528):
- Wrapped the table in `<div class="table-wrapper">` for better mobile scrolling control

### 3. CSS Mobile Responsive Styles

**Base placeholder styles** (Lines 1469-1477):
- Added `width: 100%`, `max-width: 100%`, and `box-sizing: border-box`

**Table wrapper styles** (Lines 1478-1483):
- Added overflow-x scrolling for mobile
- Added `-webkit-overflow-scrolling: touch` for smooth iOS scrolling

**Mobile breakpoint styles** (Lines 2887-2926):
- Reduced padding on placeholder header (16px 20px)
- Smaller font sizes (16px for title, 13px for table)
- Added horizontal scrolling for table (min-width: 600px)
- Hide less important columns on mobile:
  - Hidden: "Overs" column (3rd column)
  - Hidden: "Avg/Player" column (5th column)
  - Visible: Rank, Team, Total Runs, Status

## How It Works

### Toggle Functionality:
1. User clicks "Team Standings" button:
   - ✅ Shows placeholder leaderboard (Day 0 preview)
   - ✅ Shows team leaderboard content (Days 2-5)
   - ✅ Hides individual rankings content

2. User clicks "Individual Rankings" button:
   - ✅ Hides placeholder leaderboard
   - ✅ Hides team leaderboard content
   - ✅ Shows individual rankings content

### Mobile Responsiveness:
1. **Desktop (>768px)**:
   - Full table with all columns visible
   - Standard padding and font sizes

2. **Mobile (≤768px)**:
   - Table scrolls horizontally
   - Reduced padding
   - Smaller fonts
   - Less important columns hidden
   - Touch-friendly scrolling

## Testing Checklist

- [x] Toggle between Team Standings and Individual Rankings works
- [x] Placeholder only shows when Team Standings is selected
- [x] Placeholder hides when Individual Rankings is selected
- [x] Table is responsive on mobile devices
- [x] Table scrolls horizontally on mobile
- [x] Columns are hidden appropriately on mobile
- [x] No horizontal overflow on mobile screens

## Result

✅ **Toggle functionality**: Only one view (Team or Individual) shows at a time
✅ **Placeholder visibility**: Correctly tied to Team Standings tab
✅ **Mobile responsive**: Table adapts perfectly to all screen sizes

