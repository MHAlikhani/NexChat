# ADR 003: MUI over Tailwind CSS

## Status

Accepted

## Context

NexChat needed a design system to ensure consistent, accessible UI components. We evaluated two main approaches:

1. **Component Library** (MUI, Chakra UI, Ant Design)
2. **Utility-first CSS** (Tailwind CSS, UnoCSS)

Key requirements:

- Rich set of accessible components
- Consistent design language
- Good TypeScript support
- Minimal custom CSS needed
- Fast development speed

## Decision

We chose **MUI (Material-UI)** as our component library.

## Consequences

### Positive

- ✅ **Rich component set**: Buttons, dialogs, tables, forms, navigation — all out of the box
- ✅ **Accessibility**: WCAG-compliant components with keyboard navigation
- ✅ **Design system**: Consistent typography, spacing, colors via theme configuration
- ✅ **Customization**: Theme provider allows complete design system control
- ✅ **TypeScript**: First-class TypeScript support with typed props
- ✅ **Less CSS**: No need to write custom CSS for common UI patterns
- ✅ **Responsive**: Built-in responsive utilities and breakpoints

### Negative

- ⚠️ **Bundle size**: Larger than utility-first CSS (~100KB vs ~10KB for Tailwind)
- ⚠️ **Material Design aesthetic**: Default look may not fit all brands (we customize theme)
- ⚠️ **Learning curve**: MUI-specific APIs and conventions
- ⚠️ **Override complexity**: Deep customization can require `sx` prop or `styled()`

## Alternatives Considered

### Tailwind CSS

- **Rejected**: Requires building components from scratch, more CSS to write
- **When it makes sense**: Highly custom designs, teams that prefer utility-first approach, smaller projects

### Chakra UI

- **Rejected**: Less component variety, smaller community
- **When it makes sense**: Projects wanting accessible components without Material Design look

### Ant Design

- **Rejected**: Chinese-centric documentation, less Western design sensibility
- **When it makes sense**: Enterprise applications targeting Asian markets

### Shadcn/UI

- **Rejected**: Requires Next.js, adds complexity with copy-paste components
- **When it makes sense**: Next.js projects wanting maximum flexibility

## Theme Customization

We heavily customized MUI's theme to create an Apple-inspired dark mode:

```tsx
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#0A84FF' },
    background: {
      default: '#000000',
      paper: 'rgba(28, 28, 30, 0.8)',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(30px)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});
```

## Bundle Size Optimization

To mitigate MUI's bundle size, we:

- Use `@mui/icons-material` separately and tree-shake unused icons
- Manual chunking in Vite config splits MUI into `vendor-mui-core` and `vendor-mui-icons`
- Use `@emotion/react` and `@emotion/styled` (MUI's CSS-in-JS) efficiently
