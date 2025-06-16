# Testing Guide

This guide covers testing strategies, tools, and best practices for the Force Dowels application.

## Testing Philosophy

Our testing approach follows the testing pyramid:
- **Unit Tests** - Test individual functions and components
- **Integration Tests** - Test component interactions and API endpoints
- **End-to-End Tests** - Test complete user workflows

## Testing Stack

### Core Testing Tools
- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing
- **MSW (Mock Service Worker)** - API mocking
- **Playwright** - End-to-end testing

### Additional Tools
- **@testing-library/jest-dom** - Custom Jest matchers
- **@testing-library/user-event** - User interaction simulation
- **jest-environment-jsdom** - DOM environment for tests

## Setup

### Installation
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### Configuration

#### Jest Configuration (`jest.config.js`)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

#### Jest Setup (`jest.setup.js`)
```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    userId: 'test-user-id',
    isLoaded: true,
    isSignedIn: true,
  }),
  SignIn: () => <div data-testid="sign-in">Sign In Component</div>,
  SignUp: () => <div data-testid="sign-up">Sign Up Component</div>,
  UserButton: () => <div data-testid="user-button">User Button</div>,
}))

// Mock environment variables
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
```

## Unit Testing

### Component Testing

#### Basic Component Test
```typescript
// __tests__/components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })
})
```

#### Complex Component Test
```typescript
// __tests__/components/contact-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/contact-form'

// Mock the API call
jest.mock('@/lib/api-client', () => ({
  sendContactEmail: jest.fn(),
}))

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<ContactForm />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/message is required/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockSendEmail = require('@/lib/api-client').sendContactEmail
    mockSendEmail.mockResolvedValue({ success: true })
    
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    await waitFor(() => {
      expect(mockSendEmail).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      })
    })
    
    expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
  })
})
```

### Hook Testing
```typescript
// __tests__/hooks/use-cart.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCart } from '@/hooks/use-cart'

describe('useCart Hook', () => {
  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart())
    
    expect(result.current.items).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.itemCount).toBe(0)
  })

  it('adds items to cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Force Dowels Kit',
        price: 2999,
        quantity: 1,
      })
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.total).toBe(2999)
    expect(result.current.itemCount).toBe(1)
  })

  it('updates item quantities', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Force Dowels Kit',
        price: 2999,
        quantity: 1,
      })
    })
    
    act(() => {
      result.current.updateQuantity('1', 3)
    })
    
    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.total).toBe(8997)
  })
})
```

## Integration Testing

### API Route Testing
```typescript
// __tests__/api/contact.test.ts
import { POST } from '@/app/api/send-email/route'
import { NextRequest } from 'next/server'

// Mock external dependencies
jest.mock('@/lib/email', () => ({
  sendContactEmail: jest.fn(),
}))

describe('/api/send-email', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sends email with valid data', async () => {
    const mockSendEmail = require('@/lib/email').sendContactEmail
    mockSendEmail.mockResolvedValue({ success: true })

    const request = new NextRequest('http://localhost:3000/api/send-email', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockSendEmail).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
    })
  })

  it('validates required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/send-email', {
      method: 'POST',
      body: JSON.stringify({
        name: '',
        email: 'invalid-email',
        message: '',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })
})
```

### Database Integration Testing
```typescript
// __tests__/lib/orders.test.ts
import { createOrder, getOrderById } from '@/lib/orders'
import { setupTestDatabase, cleanupTestDatabase } from '@/test-utils/database'

describe('Order Database Operations', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  it('creates and retrieves order', async () => {
    const orderData = {
      userId: 'test-user-id',
      items: [
        {
          id: '1',
          name: 'Force Dowels Kit',
          quantity: 2,
          price: 2999,
        },
      ],
      total: 5998,
    }

    const createdOrder = await createOrder(orderData)
    expect(createdOrder.id).toBeDefined()
    expect(createdOrder.status).toBe('pending')

    const retrievedOrder = await getOrderById(createdOrder.id)
    expect(retrievedOrder).toEqual(createdOrder)
  })
})
```

## End-to-End Testing

### Playwright Setup
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples
```typescript
// e2e/checkout-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('completes full checkout process', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Add item to cart
    await page.click('[data-testid="add-to-cart"]')
    
    // Go to checkout
    await page.click('[data-testid="checkout-button"]')
    
    // Sign in (if required)
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="sign-in-button"]')
    
    // Fill shipping information
    await page.fill('[data-testid="shipping-name"]', 'John Doe')
    await page.fill('[data-testid="shipping-address"]', '123 Main St')
    await page.fill('[data-testid="shipping-city"]', 'Anytown')
    await page.selectOption('[data-testid="shipping-state"]', 'CA')
    await page.fill('[data-testid="shipping-zip"]', '12345')
    
    // Proceed to payment
    await page.click('[data-testid="proceed-to-payment"]')
    
    // Verify Stripe checkout page loads
    await expect(page).toHaveURL(/checkout\.stripe\.com/)
    
    // Fill payment information (test mode)
    await page.fill('[data-testid="cardNumber"]', '4242424242424242')
    await page.fill('[data-testid="cardExpiry"]', '12/25')
    await page.fill('[data-testid="cardCvc"]', '123')
    
    // Complete payment
    await page.click('[data-testid="submit-payment"]')
    
    // Verify success page
    await expect(page).toHaveURL(/\/checkout\/success/)
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })
})
```

## Test Utilities

### Custom Render Function
```typescript
// test-utils/render.tsx
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { CartProvider } from '@/contexts/cart-context'
import { ThemeProvider } from '@/components/theme-provider'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <CartProvider>
        {children}
      </CartProvider>
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### Mock Data Factories
```typescript
// test-utils/factories.ts
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  ...overrides,
})

export const createMockOrder = (overrides = {}) => ({
  id: 'test-order-id',
  userId: 'test-user-id',
  status: 'pending',
  items: [
    {
      id: '1',
      name: 'Force Dowels Kit',
      quantity: 1,
      price: 2999,
    },
  ],
  total: 2999,
  createdAt: new Date(),
  ...overrides,
})
```

## Running Tests

### Test Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Running Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_BASE_URL: http://localhost:3000
```

## Best Practices

### Testing Guidelines
1. **Write tests first** (TDD approach when possible)
2. **Test behavior, not implementation**
3. **Use descriptive test names**
4. **Keep tests simple and focused**
5. **Mock external dependencies**
6. **Test edge cases and error conditions**

### Coverage Goals
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### Performance Testing
- Monitor test execution time
- Optimize slow tests
- Use parallel test execution
- Profile test performance regularly

Testing is crucial for maintaining code quality and ensuring the Force Dowels application works reliably for all users.
