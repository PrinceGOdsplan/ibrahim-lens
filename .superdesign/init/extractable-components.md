# Extractable components

## StudioLayout
- Source: src/components/studio/StudioLayout.tsx
- Category: layout
- Description: Studio app shell — desktop rail hubs + operator foot, phone strip + bottom hub bar
- Extractable props: activeItem (string, default: "dashboard")
- Hardcoded: hub labels/routes/icons, product name, appearance/notices/profile chrome

## StudioHubHeader
- Source: src/components/studio/StudioHubHeader.tsx
- Category: layout
- Description: Hub title bar with optional actions
- Extractable props: title (string), showActions (boolean)
- Hardcoded: border, panel bg, Figtree title sizing

## StudioScrollPane
- Source: src/components/studio/StudioHubShell.tsx
- Category: layout
- Description: Scrollable hub content column max-w-6xl
- Extractable props: none
- Hardcoded: padding, max width
