# Shadcn Components Quick Reference

Run these commands from `packages/ui` directory.

## Common Components

| Component | Command | Usage |
|-----------|---------|-------|
| Button | `npm run add button` | `<Button variant="default">Click</Button>` |
| Input | `npm run add input` | `<Input type="email" placeholder="Email" />` |
| Label | `npm run add label` | `<Label htmlFor="email">Email</Label>` |
| Card | `npm run add card` | `<Card><CardHeader>...</CardHeader></Card>` |
| Dialog | `npm run add dialog` | `<Dialog><DialogTrigger>...</DialogTrigger></Dialog>` |
| Form | `npm run add form` | `<Form>...</Form>` with react-hook-form |
| Select | `npm run add select` | `<Select><SelectTrigger>...</SelectTrigger></Select>` |
| Checkbox | `npm run add checkbox` | `<Checkbox id="terms" />` |
| Switch | `npm run add switch` | `<Switch />` |
| Textarea | `npm run add textarea` | `<Textarea placeholder="Message" />` |

## Navigation

| Component | Command | Usage |
|-----------|---------|-------|
| Tabs | `npm run add tabs` | `<Tabs><TabsList>...</TabsList></Tabs>` |
| Breadcrumb | `npm run add breadcrumb` | `<Breadcrumb>...</Breadcrumb>` |
| Navigation Menu | `npm run add navigation-menu` | `<NavigationMenu>...</NavigationMenu>` |
| Menubar | `npm run add menubar` | `<Menubar>...</Menubar>` |
| Dropdown Menu | `npm run add dropdown-menu` | `<DropdownMenu>...</DropdownMenu>` |

## Feedback

| Component | Command | Usage |
|-----------|---------|-------|
| Alert | `npm run add alert` | `<Alert><AlertTitle>...</AlertTitle></Alert>` |
| Toast | `npm run add toast` | `toast({ title: "Success" })` |
| Sonner | `npm run add sonner` | `toast.success("Success!")` |
| Progress | `npm run add progress` | `<Progress value={50} />` |
| Skeleton | `npm run add skeleton` | `<Skeleton className="w-full h-12" />` |

## Overlays

| Component | Command | Usage |
|-----------|---------|-------|
| Dialog | `npm run add dialog` | Modal dialog |
| Alert Dialog | `npm run add alert-dialog` | Confirmation dialog |
| Sheet | `npm run add sheet` | Drawer/slide-out panel |
| Drawer | `npm run add drawer` | Bottom sheet drawer |
| Popover | `npm run add popover` | Floating content |
| Tooltip | `npm run add tooltip` | Hover tooltip |
| Hover Card | `npm run add hover-card` | Rich hover content |
| Context Menu | `npm run add context-menu` | Right-click menu |

## Data Display

| Component | Command | Usage |
|-----------|---------|-------|
| Table | `npm run add table` | `<Table>...</Table>` |
| Avatar | `npm run add avatar` | `<Avatar><AvatarImage />...</Avatar>` |
| Badge | `npm run add badge` | `<Badge>New</Badge>` |
| Calendar | `npm run add calendar` | `<Calendar mode="single" />` |
| Carousel | `npm run add carousel` | `<Carousel>...</Carousel>` |

## Layout

| Component | Command | Usage |
|-----------|---------|-------|
| Separator | `npm run add separator` | `<Separator />` |
| Aspect Ratio | `npm run add aspect-ratio` | `<AspectRatio ratio={16/9}>...</AspectRatio>` |
| Scroll Area | `npm run add scroll-area` | `<ScrollArea>...</ScrollArea>` |
| Resizable | `npm run add resizable` | `<ResizablePanelGroup>...</ResizablePanelGroup>` |
| Collapsible | `npm run add collapsible` | `<Collapsible>...</Collapsible>` |
| Accordion | `npm run add accordion` | `<Accordion type="single">...</Accordion>` |

## Forms

| Component | Command | Usage |
|-----------|---------|-------|
| Form | `npm run add form` | Complete form setup with validation |
| Input | `npm run add input` | Text input |
| Textarea | `npm run add textarea` | Multi-line text |
| Select | `npm run add select` | Dropdown select |
| Checkbox | `npm run add checkbox` | Checkbox |
| Radio Group | `npm run add radio-group` | Radio buttons |
| Switch | `npm run add switch` | Toggle switch |
| Slider | `npm run add slider` | Range slider |
| Date Picker | `npm run add date-picker` | Date selection |
| Combobox | `npm run add combobox` | Autocomplete input |
| Input OTP | `npm run add input-otp` | OTP input fields |

## Utility

| Component | Command | Usage |
|-----------|---------|-------|
| Command | `npm run add command` | `<Command>...</Command>` for command palette |
| Toggle | `npm run add toggle` | `<Toggle>B</Toggle>` for toolbar |
| Toggle Group | `npm run add toggle-group` | Group of toggle buttons |
| Pagination | `npm run add pagination` | Page navigation |

## Quick Setup Examples

### Install Multiple Components
```bash
cd packages/ui

# Basic form components
npm run add button input label form

# Card layout
npm run add card separator

# Full form setup
npm run add form input label select checkbox button
```

### After Adding a Component

1. **Check primitive** in `src/primitives/`
2. **Create custom version** in `src/components/`
3. **Export** from `src/components/index.ts`
4. **Use in app** via `import { Component } from "ui"`
