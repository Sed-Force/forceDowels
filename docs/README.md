# Force Dowels Documentation

Welcome to the Force Dowels application documentation. This guide will help you get started, understand the system, and contribute to the project.

## 📚 Documentation Structure

### 🚀 Getting Started
Perfect for new developers or setting up the project for the first time.

- **[📖 Project Overview](PROJECT_OVERVIEW.md)** - Complete application overview and architecture
- **[⚡ Getting Started Guide](getting-started/quick-start.md)** - Get up and running quickly with setup instructions
- **[📦 Installation Guide](getting-started/installation.md)** - Detailed setup instructions
- **[⚙️ Environment Setup](getting-started/environment-setup.md)** - Configure all services and API keys

### 🌟 Features & Systems
Detailed documentation for each major system in the application.

- **[🏪 Distribution System](DISTRIBUTION_SYSTEM.md)** - Complete distributor workflow documentation
- **[🔐 Authentication System](features/authentication.md)** - Clerk integration, custom pages, and security
- **[💳 Payment Integration](features/payments.md)** - Stripe checkout, webhooks, and security
- **[📦 Shipping System](features/shipping.md)** - USPS and TQL freight shipping integration
- **[📋 Distributor System](features/distributor-system.md)** - Distributor application system

### 👨‍💻 Development
Guides for developers working on the codebase.

- **[🏗️ Development Guidelines](DEVELOPMENT_GUIDELINES.md)** - Complete development workflow and best practices
- **[🔧 Development Guide](development/development-guide.md)** - Codebase structure and workflows
- **[🧪 Testing Guide](development/testing.md)** - Unit, integration, and E2E testing strategies
- **[🚨 Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)** - Comprehensive issue resolution guide

### 📡 API Documentation
Complete API reference and integration guides.

- **[API Overview](api/api-overview.md)** - Base URLs, authentication, and response formats

### 🚀 Deployment
Production deployment and maintenance guides.

- **[Production Deployment](deployment/production-deployment.md)** - Vercel deployment, environment setup, and monitoring

### 🤝 Contributing
Guidelines for contributing to the project.

- **[Contributing Guide](contributing/contributing-guide.md)** - Development workflow, code standards, and PR process

## 🔍 Quick Navigation

### I want to...

**🚀 Get started quickly**
→ [Getting Started Guide](getting-started/quick-start.md)

**📖 Understand the application**
→ [Project Overview](PROJECT_OVERVIEW.md)

**🏪 Learn about the distribution system**
→ [Distribution System Documentation](DISTRIBUTION_SYSTEM.md)

**🔧 Set up development environment**
→ [Environment Setup](getting-started/environment-setup.md)

**🏗️ Follow development best practices**
→ [Development Guidelines](DEVELOPMENT_GUIDELINES.md)

**🚨 Troubleshoot an issue**
→ [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)

**🔐 Understand authentication**
→ [Authentication System](features/authentication.md)

**💳 Learn about payment processing**
→ [Payment Integration](features/payments.md)

**📦 Learn about shipping system**
→ [Shipping System](features/shipping.md)

**🚀 Deploy to production**
→ [Production Deployment](deployment/production-deployment.md)

**📡 Use the API**
→ [API Overview](api/api-overview.md)

**🧪 Write tests**
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
- **PostgreSQL** - Database (Neon recommended)

### Shipping & Logistics
- **USPS API** - Small package shipping (< 20K dowels)
- **TQL Freight** - Large order shipping (≥ 20K dowels)

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Vercel** - Deployment platform

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

# Initialize database
npm run db:init

# Start development
npm run dev
```

### Database Management
```bash
# Initialize database tables
npm run db:init

# Check database status
npm run db:status

# Clean distributor data
npm run db:clean-distributors
```

### Environment Management
```bash
# Check environment variables
npm run env:check

# Verify all services are configured
npm run dev
```

## 🆘 Getting Help

### Documentation Issues
If you find issues with the documentation:
1. Check if the information exists elsewhere in the docs
2. Search existing GitHub issues
3. Create a new issue with the "documentation" label

### Technical Support
For technical issues:
1. Check the [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)
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
- Examples are tested and verified
- Regular cleanup of outdated content

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

## 📝 Recent Documentation Updates

### Latest Changes
- **Documentation Cleanup**: Removed redundant files and fixed broken links
- **EasyPost Removal**: Updated all documentation to reflect USPS + TQL shipping architecture
- **Consolidated Guides**: Merged getting started documentation into comprehensive guide
- **Updated Tech Stack**: Reflected current technology choices and integrations

### Current Focus
- Maintaining accurate, up-to-date documentation
- Improving developer onboarding experience
- Comprehensive troubleshooting resources

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
