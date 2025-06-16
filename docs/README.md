# Force Dowels Documentation

Welcome to the comprehensive documentation for the Force Dowels application. This documentation is organized to help you quickly find the information you need, whether you're getting started, developing features, or deploying to production.

## 📚 Documentation Structure

### 🚀 Getting Started
Perfect for new developers or setting up the project for the first time.

- **[Quick Start Guide](getting-started/quick-start.md)** - Get up and running in under 5 minutes
- **[Installation Guide](getting-started/installation.md)** - Detailed setup instructions
- **[Environment Setup](getting-started/environment-setup.md)** - Configure all services and API keys

### 🌟 Features
Detailed documentation for each major system in the application.

- **[Authentication System](features/authentication.md)** - Clerk integration, custom pages, and security
- **[Payment Integration](features/payments.md)** - Stripe checkout, webhooks, and security
- **[Distributor System](features/distributor-system.md)** - Application forms, validation, and email workflows
- **[Order Management](features/order-management.md)** - Order lifecycle, tracking, and notifications

### 👨‍💻 Development
Guides for developers working on the codebase.

- **[Development Guide](development/development-guide.md)** - Codebase structure, workflows, and best practices
- **[Testing Guide](development/testing.md)** - Unit, integration, and E2E testing strategies
- **[Troubleshooting](development/troubleshooting.md)** - Common issues and solutions

### 📡 API Documentation
Complete API reference and integration guides.

- **[API Overview](api/api-overview.md)** - Base URLs, authentication, and response formats
- **[Authentication API](api/authentication-api.md)** - Clerk integration endpoints
- **[Payment API](api/payment-api.md)** - Stripe integration endpoints
- **[Distributor API](api/distributor-api.md)** - Distributor application endpoints

### 🚀 Deployment
Production deployment and maintenance guides.

- **[Production Deployment](deployment/production-deployment.md)** - Vercel deployment, environment setup, and monitoring
- **[Environment Configuration](deployment/environment-config.md)** - Production environment variables and security

### 🤝 Contributing
Guidelines for contributing to the project.

- **[Contributing Guide](contributing/contributing-guide.md)** - Development workflow, code standards, and PR process

## 🔍 Quick Navigation

### I want to...

**Get started quickly**
→ [Quick Start Guide](getting-started/quick-start.md)

**Set up the development environment**
→ [Installation Guide](getting-started/installation.md) → [Environment Setup](getting-started/environment-setup.md)

**Understand how authentication works**
→ [Authentication System](features/authentication.md)

**Learn about payment processing**
→ [Payment Integration](features/payments.md)

**Understand the distributor application system**
→ [Distributor System](features/distributor-system.md)

**Deploy to production**
→ [Production Deployment](deployment/production-deployment.md)

**Contribute to the project**
→ [Contributing Guide](contributing/contributing-guide.md)

**Troubleshoot an issue**
→ [Troubleshooting Guide](development/troubleshooting.md)

**Use the API**
→ [API Overview](api/api-overview.md)

**Write tests**
→ [Testing Guide](development/testing.md)

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Framer Motion** - Animation library

### Backend & Services
- **Clerk** - Authentication and user management
- **Stripe** - Payment processing
- **Resend** - Email delivery service
- **React Email** - Email template system

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Playwright** - End-to-end testing

## 📋 Common Tasks

### Development Setup
```bash
# Clone and install
git clone https://github.com/cartermccann/forceDowels.git
cd force-dowel
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development
npm run dev
```

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Building for Production
```bash
# Build application
npm run build

# Start production server
npm run start
```

## 🆘 Getting Help

### Documentation Issues
If you find issues with the documentation:
1. Check if the information exists elsewhere in the docs
2. Search existing GitHub issues
3. Create a new issue with the "documentation" label

### Technical Support
For technical issues:
1. Check the [Troubleshooting Guide](development/troubleshooting.md)
2. Search existing GitHub issues
3. Create a new issue with detailed information

### Feature Requests
For new features or improvements:
1. Check existing feature requests
2. Create a new issue with the "enhancement" label
3. Provide detailed use cases and requirements

## 📈 Documentation Maintenance

### Keeping Documentation Updated
- Documentation is updated with each feature release
- Breaking changes are clearly marked
- Deprecated features include migration guides
- Examples are tested and verified

### Contributing to Documentation
- Documentation improvements are welcome
- Follow the same PR process as code changes
- Use clear, concise language
- Include examples where helpful

## 🔗 External Resources

### Service Documentation
- **[Clerk Documentation](https://clerk.com/docs)** - Authentication service
- **[Stripe Documentation](https://stripe.com/docs)** - Payment processing
- **[Resend Documentation](https://resend.com/docs)** - Email delivery
- **[Next.js Documentation](https://nextjs.org/docs)** - React framework

### Community Resources
- **[GitHub Repository](https://github.com/cartermccann/forceDowels)** - Source code and issues
- **[Next.js Community](https://nextjs.org/community)** - Framework support
- **[React Community](https://react.dev/community)** - React ecosystem

## 📝 Documentation Changelog

### Recent Updates
- **2024-01-15**: Complete documentation restructure and organization
- **2024-01-10**: Added comprehensive API documentation
- **2024-01-05**: Updated deployment guides for production
- **2024-01-01**: Initial documentation structure

### Upcoming Changes
- Enhanced API examples and use cases
- Video tutorials for common workflows
- Interactive documentation features
- Multi-language support

---

## 📞 Contact

For questions about the documentation or the Force Dowels project:
- **Email**: cjmccann00@gmail.com
- **GitHub**: [Force Dowels Repository](https://github.com/cartermccann/forceDowels)

---

<div align="center">
  <strong>Force Dowels™ - Patent Pending Technology</strong><br>
  <em>Revolutionizing Cabinet Assembly</em>
</div>
