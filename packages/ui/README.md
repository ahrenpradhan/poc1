# UI Package

Shared UI components built with shadcn/ui and Tailwind CSS.

## Structure

```
packages/ui/
├── src/
│   ├── primitives/       # Raw shadcn components (DO NOT modify)
│   ├── components/       # Customized components (export from here)
│   ├── lib/              # Utility functions
│   └── styles/           # Global CSS
├── components.json       # Shadcn configuration
└── package.json
```

## Component Workflow

### 1. Import Shadcn Primitive
```bash
cd packages/ui
npm run add button
```

This adds the component to `src/primitives/button.tsx`

### 2. Create Custom Component

Create `src/components/button.tsx`:
```tsx
// Import from primitives
import { Button as PrimitiveButton } from "@/primitives/button";
import type { ButtonProps } from "@/primitives/button";

// Customize as needed
export function Button({ variant = "default", ...props }: ButtonProps) {
  return <PrimitiveButton variant={variant} {...props} />;
}

export type { ButtonProps };
```

### 3. Use in Apps

```tsx
import { Button } from "ui/components/button";

function App() {
  return <Button>Click me</Button>;
}
```

## Available Shadcn Components

| Component | Command | Description |
|-----------|---------|-------------|
| **Accordion** | `npm run add accordion` | Vertically stacked set of interactive headings |
| **Alert** | `npm run add alert` | Displays a callout for user attention |
| **Alert Dialog** | `npm run add alert-dialog` | Modal dialog that interrupts the user |
| **Aspect Ratio** | `npm run add aspect-ratio` | Displays content within a desired ratio |
| **Avatar** | `npm run add avatar` | Image element with a fallback |
| **Badge** | `npm run add badge` | Small label to highlight information |
| **Breadcrumb** | `npm run add breadcrumb` | Navigation aid showing hierarchy |
| **Button** | `npm run add button` | Clickable button element |
| **Calendar** | `npm run add calendar` | Date picker calendar |
| **Card** | `npm run add card` | Container for related content |
| **Carousel** | `npm run add carousel` | Slideshow component |
| **Checkbox** | `npm run add checkbox` | Checkbox input with label |
| **Collapsible** | `npm run add collapsible` | Expandable/collapsible content |
| **Combobox** | `npm run add combobox` | Autocomplete input with list |
| **Command** | `npm run add command` | Fast command menu |
| **Context Menu** | `npm run add context-menu` | Right-click context menu |
| **Data Table** | `npm run add table` | Table component for data display |
| **Date Picker** | `npm run add date-picker` | Input for selecting dates |
| **Dialog** | `npm run add dialog` | Modal dialog overlay |
| **Drawer** | `npm run add drawer` | Slide-out panel |
| **Dropdown Menu** | `npm run add dropdown-menu` | Menu triggered by button |
| **Form** | `npm run add form` | Form with validation |
| **Hover Card** | `npm run add hover-card` | Card shown on hover |
| **Input** | `npm run add input` | Text input field |
| **Input OTP** | `npm run add input-otp` | One-time password input |
| **Label** | `npm run add label` | Label for form inputs |
| **Menubar** | `npm run add menubar` | Horizontal menu bar |
| **Navigation Menu** | `npm run add navigation-menu` | Collection of links for navigation |
| **Pagination** | `npm run add pagination` | Navigate through pages |
| **Popover** | `npm run add popover` | Floating content container |
| **Progress** | `npm run add progress` | Progress indicator |
| **Radio Group** | `npm run add radio-group` | Set of checkable buttons |
| **Resizable** | `npm run add resizable` | Resizable panel container |
| **Scroll Area** | `npm run add scroll-area` | Custom scrollbar container |
| **Select** | `npm run add select` | Dropdown select input |
| **Separator** | `npm run add separator` | Visually divides content |
| **Sheet** | `npm run add sheet` | Extends Dialog as drawer |
| **Skeleton** | `npm run add skeleton` | Loading placeholder |
| **Slider** | `npm run add slider` | Range input slider |
| **Sonner** | `npm run add sonner` | Toast notifications |
| **Switch** | `npm run add switch` | Toggle switch |
| **Table** | `npm run add table` | Table for data display |
| **Tabs** | `npm run add tabs` | Layered sections of content |
| **Textarea** | `npm run add textarea` | Multi-line text input |
| **Toast** | `npm run add toast` | Brief notification message |
| **Toggle** | `npm run add toggle` | Two-state button |
| **Toggle Group** | `npm run add toggle-group` | Group of toggle buttons |
| **Tooltip** | `npm run add tooltip` | Popup on hover/focus |

## Quick Start

### Add Multiple Components
```bash
cd packages/ui

# Add commonly used components
npm run add button input label card
```

### Example: Custom Button

1. **Add primitive:**
```bash
npm run add button
```

2. **Create custom component** (`src/components/custom-button.tsx`):
```tsx
import { Button } from "@/primitives/button";
import { Loader2 } from "lucide-react";

interface CustomButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
}

export function CustomButton({ loading, children, ...props }: CustomButtonProps) {
  return (
    <Button disabled={loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
```

3. **Use in app:**
```tsx
import { CustomButton } from "ui/components/custom-button";

<CustomButton loading={isSubmitting}>Submit</CustomButton>
```

## Configuration for Apps

### Tailwind Config

Apps should extend the base Tailwind config from this package:

```ts
// apps/web/tailwind.config.ts
import type { Config } from "tailwindcss";
import baseConfig from "@repo/ui/tailwind.config";

const config: Config = {
  ...baseConfig,
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
```

### PostCSS Config

```js
// apps/web/postcss.config.mjs
import baseConfig from "@repo/ui/postcss.config";

export default baseConfig;
```

### Layout Imports

```tsx
// apps/web/app/layout.tsx
import "@repo/ui/styles/globals.css";
import "./globals.css";
```

## Benefits of This Structure

✅ **Separation of Concerns**: Raw shadcn primitives separated from customizations  
✅ **Easy Updates**: Update shadcn components without losing customizations  
✅ **Reusability**: Share customized components across all apps  
✅ **Centralized Config**: Single source of truth for Tailwind/PostCSS  
✅ **Type Safety**: Full TypeScript support  
✅ **Maintainability**: Clear structure for component management  

## Updating Shadcn Components

When shadcn releases updates:

```bash
cd packages/ui

# Re-run add command to update primitive
npm run add button

# Your customizations in src/components/ remain untouched!
```
