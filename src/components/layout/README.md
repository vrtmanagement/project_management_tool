# Dashboard Layout Components

## Quick Start

To use the dashboard layout in any page:

```jsx
'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function YourPage() {
  return (
    <DashboardLayout>
      {/* Your page content here */}
      <h1>Your Page Title</h1>
    </DashboardLayout>
  );
}
```

## Components Overview

### 1. DashboardLayout
**Main wrapper component that provides:**
- Authentication protection
- Sidebar integration
- Header integration
- Responsive container

**Props:**
- `children` - Your page content

**Usage:**
```jsx
<DashboardLayout>
  <YourContent />
</DashboardLayout>
```

### 2. DashboardSidebar
**Features:**
- Collapsible sidebar (click chevron to toggle)
- Navigation menu with icons
- Active route highlighting
- User profile at bottom
- My Tasks section with badge counter

**Navigation Items:**
- Dashboard → `/dashboard`
- Projects → `/dashboard/projects`
- Team → `/dashboard/team`
- Settings → `/dashboard/settings`

**Bottom Section:**
- My Tasks → `/dashboard/my-tasks` (with task count badge)
- User Profile → Shows logged-in user info

### 3. DashboardHeader
**Features:**
- Global search bar
- Notifications dropdown
- User menu
- Mobile hamburger menu
- Help button

**Actions:**
- Search functionality (ready for implementation)
- View notifications
- Access profile
- Logout

## Layout Structure

```
┌─────────────────────────────────────────────┐
│              DashboardHeader                 │
│  [Menu] [Search........] [Help] [🔔] [👤]  │
├──────────┬──────────────────────────────────┤
│          │                                   │
│ Sidebar  │      Main Content Area           │
│          │                                   │
│ Dashboard│      <Your Page Content>         │
│ Projects │                                   │
│ Team     │                                   │
│ Settings │                                   │
│          │                                   │
│ ─────────│                                   │
│ My Tasks │                                   │
│          │                                   │
│ [User]   │                                   │
└──────────┴──────────────────────────────────┘
```

## Responsive Behavior

### Desktop (≥768px)
- Sidebar always visible
- Full width content area
- Collapsible sidebar on button click

### Mobile (<768px)
- Sidebar hidden by default
- Hamburger menu in header
- Sheet overlay when opened
- Full-width content

## Authentication

All dashboard pages are protected:
- Checks user authentication on mount
- Redirects to `/login` if not authenticated
- Shows loading spinner during check

## Customization

### Change Sidebar Width
In `DashboardSidebar.jsx`:
```jsx
isCollapsed ? 'w-16' : 'w-64'  // Change w-64 to desired width
```

### Add New Navigation Item
In `DashboardSidebar.jsx`:
```jsx
const navigation = [
  // ... existing items
  {
    name: 'Your New Page',
    href: '/dashboard/your-page',
    icon: YourIcon,
  },
];
```

### Update Task Count Badge
In `DashboardSidebar.jsx` (line ~115):
```jsx
<Badge variant="secondary">12</Badge>  // Change 12 to dynamic count
```

### Update Notification Count
In `DashboardHeader.jsx`:
```jsx
<Badge className="...">3</Badge>  // Change 3 to dynamic count
```

## State Management

### Current User
Access via `useAuth()` hook:
```jsx
const { user, logout } = useAuth();

// user object contains:
// - name
// - email
// - id
// - avatar (optional)
```

### Active Route
Automatically detected via `usePathname()` from Next.js

## Theme Support

All components support light/dark mode via:
- shadcn/ui theming
- CSS variables
- `next-themes` package

## Icons

Using `lucide-react` icons:
- LayoutDashboard
- FolderKanban
- Users
- Settings
- CheckSquare
- Bell
- Search
- Menu
- LogOut
- etc.

## Performance

- Server-side protected routes
- Efficient re-renders
- Lazy loading ready
- Optimized animations

