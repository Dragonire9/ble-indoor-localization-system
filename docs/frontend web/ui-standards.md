---
trigger: always_on
---

# UI Standards & Refactoring Rules

## ♻️ DRY Concept (Don't Repeat Yourself)

- **Iteration over Config**: When multiple elements share the same structure (e.g., tab triggers, sidebars, navigation), define a configuration object/array and iterate over it.
- **Atomic Components**: Extract repetitive patterns in views into smaller, focused components.

## 🎨 Styling and Colors

- **Zero Hardcoded Colors**: Never use a Tailwind color class that specifies a specific shade (e.g., `text-red-500`, `bg-blue-600`).
- **Semantic Classes**: Use standard semantic utility classes provided by the design system:
  - `text-primary`, `text-destructive`, `text-muted-foreground`.
  - `bg-primary`, `bg-secondary`, `bg-muted`, `bg-destructive`.
  - `border-border`, `border-input`.
- **Theme Variables**: If a custom color is absolutely needed, use a CSS variable defined in `globals.css`.

## 🏗️ Refactoring Pattern (Example)

Instead of repeating JSX for multiple items:

```tsx
const TAB_ITEMS = [
  { id: "info", label: "بيانات المستخدم", icon: UserIcon },
  { id: "roles", label: "إدارة الأدوار", icon: Briefcase },
];

{
  TAB_ITEMS.map(item => (
    <TabsTrigger key={item.id} value={item.id}>
      <item.icon className="h-4 w-4" />
      {item.label}
    </TabsTrigger>
  ));
}
```
