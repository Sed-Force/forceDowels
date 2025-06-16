# Development Guide

This guide covers the development workflow, codebase structure, and best practices for contributing to the Force Dowels application.

## Project Structure

```
force-dowel/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── (pages)/                  # Page components
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   └── [feature-components]      # Feature-specific components
├── lib/                          # Utility functions
├── hooks/                        # Custom React hooks
├── contexts/                     # React contexts
├── emails/                       # Email templates
├── public/                       # Static assets
├── docs/                         # Documentation
└── [config files]               # Configuration files
```

## Technology Stack

### Core Technologies
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React 18** - UI library with concurrent features

### UI & Styling
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Backend & Services
- **Clerk** - Authentication and user management
- **Stripe** - Payment processing
- **Resend** - Email delivery service
- **React Email** - Email template system

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## Development Workflow

### Getting Started
1. **Clone and Setup**
   ```bash
   git clone https://github.com/cartermccann/forceDowels.git
   cd force-dowel
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Configure your API keys
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Code Organization

### Component Structure
```typescript
// components/example-component.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ExampleComponentProps {
  title: string
  onAction?: () => void
}

export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Button onClick={onAction} disabled={isLoading}>
        {isLoading ? "Loading..." : "Action"}
      </Button>
    </div>
  )
}
```

### API Route Structure
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Your logic here
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### Page Component Structure
```typescript
// app/example/page.tsx
import { Metadata } from "next"
import { ExampleComponent } from "@/components/example-component"

export const metadata: Metadata = {
  title: "Example Page | Force Dowels",
  description: "Example page description",
}

export default function ExamplePage() {
  return (
    <div className="container mx-auto py-8">
      <ExampleComponent title="Example" />
    </div>
  )
}
```

## Styling Guidelines

### Tailwind CSS Usage
- Use utility classes for styling
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use semantic color names

### Brand Colors
```css
/* Primary Colors */
--amber-600: #d97706
--amber-700: #b45309
--amber-50: #fffbeb

/* Usage Examples */
.primary-button {
  @apply bg-amber-600 hover:bg-amber-700 text-white;
}

.brand-text {
  @apply text-amber-600;
}
```

### Component Styling
- Use shadcn/ui components as base
- Extend with custom Tailwind classes
- Maintain consistent spacing (4, 6, 8, 12, 16, 24)
- Follow accessibility guidelines

## State Management

### React Context Pattern
```typescript
// contexts/example-context.tsx
"use client"

import { createContext, useContext, useState } from "react"

interface ExampleContextType {
  data: any[]
  loading: boolean
  updateData: (data: any[]) => void
}

const ExampleContext = createContext<ExampleContextType | undefined>(undefined)

export function ExampleProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const updateData = (newData: any[]) => {
    setData(newData)
  }

  return (
    <ExampleContext.Provider value={{ data, loading, updateData }}>
      {children}
    </ExampleContext.Provider>
  )
}

export function useExample() {
  const context = useContext(ExampleContext)
  if (context === undefined) {
    throw new Error("useExample must be used within an ExampleProvider")
  }
  return context
}
```

### Custom Hooks
```typescript
// hooks/use-example.ts
import { useState, useEffect } from "react"

export function useExample() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch("/api/example")
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
```

## Error Handling

### API Error Handling
```typescript
// lib/api-client.ts
export async function apiCall(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API call failed:", error)
    throw error
  }
}
```

### Component Error Boundaries
```typescript
// components/error-boundary.tsx
"use client"

import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>
    }

    return this.props.children
  }
}
```

## Performance Optimization

### Image Optimization
```typescript
import Image from "next/image"

// Optimized image usage
<Image
  src="/images/example.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // For above-the-fold images
  placeholder="blur" // For better UX
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Code Splitting
```typescript
// Dynamic imports for code splitting
import dynamic from "next/dynamic"

const HeavyComponent = dynamic(() => import("./heavy-component"), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable SSR if needed
})
```

### Memoization
```typescript
import { memo, useMemo, useCallback } from "react"

// Component memoization
export const OptimizedComponent = memo(function OptimizedComponent({ data }) {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }))
  }, [data])

  const handleClick = useCallback(() => {
    // Handle click
  }, [])

  return <div>{/* Component content */}</div>
})
```

## Testing Guidelines

### Component Testing
```typescript
// __tests__/example-component.test.tsx
import { render, screen } from "@testing-library/react"
import { ExampleComponent } from "@/components/example-component"

describe("ExampleComponent", () => {
  it("renders correctly", () => {
    render(<ExampleComponent title="Test" />)
    expect(screen.getByText("Test")).toBeInTheDocument()
  })

  it("handles user interaction", () => {
    const mockAction = jest.fn()
    render(<ExampleComponent title="Test" onAction={mockAction} />)
    
    const button = screen.getByRole("button")
    button.click()
    
    expect(mockAction).toHaveBeenCalled()
  })
})
```

### API Testing
```typescript
// __tests__/api/example.test.ts
import { GET } from "@/app/api/example/route"
import { NextRequest } from "next/server"

describe("/api/example", () => {
  it("returns success response", async () => {
    const request = new NextRequest("http://localhost:3000/api/example")
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

## Deployment

### Build Process
```bash
# Production build
npm run build

# Test production build locally
npm run start
```

### Environment Variables
Ensure all required environment variables are set:
- Authentication keys (Clerk)
- Payment keys (Stripe)
- Email service keys (Resend)
- Application URLs

### Vercel Deployment
The application is optimized for Vercel deployment:
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

## Best Practices

### Code Quality
- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Keep components small and focused

### Performance
- Optimize images and assets
- Use dynamic imports for large components
- Implement proper caching strategies
- Monitor Core Web Vitals

### Security
- Validate all user inputs
- Use environment variables for secrets
- Implement proper authentication checks
- Follow OWASP guidelines

### Accessibility
- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation
- Test with screen readers
- Maintain proper color contrast

## Contributing

### Pull Request Process
1. Create feature branch from main
2. Make your changes
3. Add tests if applicable
4. Update documentation
5. Submit pull request
6. Address review feedback

### Code Review Guidelines
- Check for functionality
- Review code quality
- Verify tests pass
- Ensure documentation is updated
- Test accessibility features

For more detailed information, see the [Contributing Guide](../contributing/contributing-guide.md).
