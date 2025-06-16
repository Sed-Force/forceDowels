# Contributing Guide

Thank you for your interest in contributing to Force Dowels! This guide will help you get started with contributing to the project.

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Git
- GitHub account
- Basic knowledge of React, Next.js, and TypeScript

### Development Setup
1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/forceDowels.git
   cd force-dowel
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/cartermccann/forceDowels.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Configure your API keys
   ```
6. **Start development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy
- **main** - Production-ready code
- **develop** - Integration branch for features
- **feature/*** - Feature development branches
- **bugfix/*** - Bug fix branches
- **hotfix/*** - Critical production fixes

### Creating a Feature Branch
```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Push branch to your fork
git push -u origin feature/your-feature-name
```

### Making Changes
1. **Write code** following our coding standards
2. **Add tests** for new functionality
3. **Update documentation** if needed
4. **Test your changes** thoroughly
5. **Commit your changes** with clear messages

### Commit Message Format
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat(auth): add social login support"
git commit -m "fix(payments): resolve stripe webhook validation"
git commit -m "docs(api): update authentication documentation"
```

## Code Standards

### TypeScript Guidelines
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type when possible
- Use strict mode settings

```typescript
// Good
interface UserProps {
  id: string
  name: string
  email: string
}

function UserCard({ id, name, email }: UserProps) {
  return <div>{name}</div>
}

// Avoid
function UserCard(props: any) {
  return <div>{props.name}</div>
}
```

### React Component Guidelines
- Use functional components with hooks
- Follow naming conventions (PascalCase for components)
- Keep components small and focused
- Use proper prop types

```typescript
// Good component structure
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ComponentProps {
  title: string
  onAction?: () => void
}

export function ExampleComponent({ title, onAction }: ComponentProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onAction?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Loading..." : "Action"}
      </Button>
    </div>
  )
}
```

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use semantic class names for custom CSS

```typescript
// Good
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
</div>

// Avoid inline styles
<div style={{ padding: '24px', backgroundColor: 'white' }}>
```

### API Route Guidelines
- Use proper HTTP methods and status codes
- Implement proper error handling
- Validate input data
- Follow RESTful conventions

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

const requestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = requestSchema.parse(body)

    // Process the request
    const result = await processData(validatedData)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write tests for new features
- Test both happy path and error cases
- Use descriptive test names
- Mock external dependencies

```typescript
// __tests__/components/example-component.test.tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { ExampleComponent } from "@/components/example-component"

describe("ExampleComponent", () => {
  it("renders with correct title", () => {
    render(<ExampleComponent title="Test Title" />)
    expect(screen.getByText("Test Title")).toBeInTheDocument()
  })

  it("calls onAction when button is clicked", () => {
    const mockAction = jest.fn()
    render(<ExampleComponent title="Test" onAction={mockAction} />)
    
    fireEvent.click(screen.getByRole("button"))
    expect(mockAction).toHaveBeenCalled()
  })

  it("shows loading state during action", async () => {
    const slowAction = () => new Promise(resolve => setTimeout(resolve, 100))
    render(<ExampleComponent title="Test" onAction={slowAction} />)
    
    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })
})
```

## Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated if needed
- [ ] No console errors or warnings
- [ ] Feature works as expected

### Creating Pull Request
1. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**:
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template

### PR Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Edge cases considered

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Address feedback** if requested
4. **Approval** from maintainers
5. **Merge** to main branch

## Documentation

### Updating Documentation
- Update relevant documentation for changes
- Add new documentation for new features
- Keep examples up to date
- Use clear, concise language

### Documentation Structure
- **README.md** - Project overview
- **docs/getting-started/** - Setup guides
- **docs/features/** - Feature documentation
- **docs/api/** - API documentation
- **docs/development/** - Development guides

## Issue Reporting

### Bug Reports
Use the bug report template:
```markdown
**Bug Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome]
- Version: [e.g. 22]
```

### Feature Requests
Use the feature request template:
```markdown
**Feature Description**
Clear description of the feature.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this work?

**Alternatives Considered**
Other solutions you've considered.
```

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

### Communication
- Use clear, professional language
- Be patient with questions
- Provide helpful feedback
- Celebrate contributions

## Getting Help

### Resources
- **Documentation** - Check existing docs first
- **Issues** - Search existing issues
- **Discussions** - GitHub Discussions for questions
- **Discord** - Real-time chat (if available)

### Asking Questions
- Search existing issues/discussions first
- Provide context and details
- Include relevant code snippets
- Be specific about the problem

## Recognition

Contributors are recognized in:
- **Contributors list** in README
- **Release notes** for significant contributions
- **Special mentions** for outstanding work

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Force Dowels! Your contributions help make this project better for everyone.
