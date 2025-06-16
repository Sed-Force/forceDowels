# Troubleshooting Guide

This guide covers common issues you might encounter while developing or running the Force Dowels application, along with their solutions.

## Common Development Issues

### Environment Setup Issues

#### Node.js Version Error
```
Error: Node.js version 16.x is not supported
```
**Solution**: Upgrade to Node.js 18 or higher
```bash
# Check current version
node --version

# Install Node.js 18+ from nodejs.org
# Or use nvm (Node Version Manager)
nvm install 18
nvm use 18
```

#### Missing Environment Variables
```
Error: Missing required environment variable: CLERK_SECRET_KEY
```
**Solution**: Ensure all required variables are set in `.env.local`
```bash
# Copy example file
cp .env.example .env.local

# Edit with your actual values
# Check the environment setup guide for all required variables
```

#### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**: Use a different port or kill the process
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Authentication Issues (Clerk)

#### Clerk Keys Not Working
```
Error: Invalid publishable key
```
**Solutions**:
1. Verify keys are correct in Clerk dashboard
2. Ensure you're using the right environment (test vs production)
3. Check for extra spaces or characters in `.env.local`
4. Restart development server after changing environment variables

#### Authentication Redirects Not Working
```
Error: Redirect URL not allowed
```
**Solution**: Configure allowed URLs in Clerk dashboard
1. Go to Clerk Dashboard → Configure → Paths
2. Add your development URL: `http://localhost:3000`
3. Add your production URL: `https://yourdomain.com`

#### Middleware Issues
```
Error: clerkMiddleware is not a function
```
**Solution**: Check Clerk version and import
```typescript
// Correct import for Clerk v5+
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Update if using older version
npm install @clerk/nextjs@latest
```

### Payment Issues (Stripe)

#### Stripe Keys Invalid
```
Error: Invalid API key provided
```
**Solutions**:
1. Verify keys in Stripe Dashboard → Developers → API Keys
2. Ensure you're in the correct mode (test vs live)
3. Check for typos in environment variables
4. Restart server after updating keys

#### Webhook Verification Failed
```
Error: Webhook signature verification failed
```
**Solutions**:
1. Check webhook secret in Stripe Dashboard
2. Verify endpoint URL is correct
3. Ensure webhook secret matches `.env.local`
4. Test with Stripe CLI for local development

#### Payment Not Completing
```
Error: Payment session not found
```
**Solutions**:
1. Check Stripe Dashboard for session details
2. Verify webhook is receiving events
3. Check browser console for JavaScript errors
4. Ensure success/cancel URLs are correct

### Email Issues (Resend)

#### Email Not Sending
```
Error: Resend API key invalid
```
**Solutions**:
1. Verify API key in Resend dashboard
2. Check API key permissions
3. Verify sender email is authorized
4. Check rate limits

#### Email Templates Not Rendering
```
Error: Failed to render email template
```
**Solutions**:
1. Check React Email component syntax
2. Verify all props are passed correctly
3. Test template in isolation
4. Check for missing dependencies

### Build and Deployment Issues

#### Build Failures
```
Error: Type error in component
```
**Solutions**:
1. Fix TypeScript errors
2. Check for missing imports
3. Verify component props match interfaces
4. Run `npm run lint` to identify issues

#### Static Generation Errors
```
Error: Page failed to generate
```
**Solutions**:
1. Check for client-side only code in server components
2. Use `"use client"` directive where needed
3. Verify API calls are properly handled
4. Check for missing environment variables

#### Vercel Deployment Issues
```
Error: Build failed on Vercel
```
**Solutions**:
1. Check build logs for specific errors
2. Verify environment variables are set in Vercel
3. Ensure all dependencies are in `package.json`
4. Check for Node.js version compatibility

## Performance Issues

### Slow Page Loading
**Symptoms**: Pages take long to load
**Solutions**:
1. Optimize images with Next.js Image component
2. Use dynamic imports for heavy components
3. Implement proper caching strategies
4. Check for unnecessary re-renders

### Memory Leaks
**Symptoms**: Application becomes slow over time
**Solutions**:
1. Clean up event listeners in useEffect
2. Cancel pending requests on component unmount
3. Use React DevTools Profiler to identify issues
4. Check for circular references

### Large Bundle Size
**Symptoms**: Slow initial page load
**Solutions**:
1. Use dynamic imports for code splitting
2. Remove unused dependencies
3. Optimize images and assets
4. Use Next.js bundle analyzer

## Database and API Issues

### API Route Errors
```
Error: Internal Server Error
```
**Solutions**:
1. Check server logs for detailed error messages
2. Verify API route syntax and exports
3. Check for proper error handling
4. Validate request data

### CORS Issues
```
Error: CORS policy blocked request
```
**Solutions**:
1. Configure CORS headers in API routes
2. Check request origins
3. Verify API endpoint URLs
4. Use proper HTTP methods

## UI and Styling Issues

### Tailwind CSS Not Working
**Symptoms**: Styles not applying
**Solutions**:
1. Check Tailwind configuration
2. Verify CSS imports in `globals.css`
3. Restart development server
4. Check for conflicting CSS

### Component Styling Issues
**Symptoms**: Components look broken
**Solutions**:
1. Check shadcn/ui component imports
2. Verify Tailwind classes are correct
3. Check for CSS specificity issues
4. Test on different screen sizes

### Responsive Design Problems
**Symptoms**: Layout breaks on mobile
**Solutions**:
1. Use mobile-first approach
2. Test with browser dev tools
3. Check breakpoint usage
4. Verify container classes

## Browser-Specific Issues

### Safari Issues
**Common Problems**:
- Date input formatting
- CSS Grid/Flexbox differences
- JavaScript compatibility

**Solutions**:
1. Use polyfills for unsupported features
2. Test thoroughly on Safari
3. Use vendor prefixes for CSS
4. Check console for specific errors

### Internet Explorer (Legacy Support)
**Note**: Application is built for modern browsers
**Solutions**:
1. Use Babel for JavaScript compatibility
2. Add CSS polyfills
3. Test with BrowserStack
4. Consider dropping IE support

## Debugging Tools and Techniques

### Browser Developer Tools
1. **Console**: Check for JavaScript errors
2. **Network**: Monitor API requests
3. **Application**: Check localStorage/cookies
4. **Performance**: Identify bottlenecks

### React Developer Tools
1. Install React DevTools extension
2. Use Profiler to identify performance issues
3. Check component state and props
4. Monitor re-renders

### Next.js Debugging
```bash
# Enable debug mode
DEBUG=* npm run dev

# Check build analysis
npm run build -- --analyze
```

### Stripe CLI for Webhook Testing
```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Test specific events
stripe trigger payment_intent.succeeded
```

## Getting Help

### Before Asking for Help
1. Check this troubleshooting guide
2. Search existing issues on GitHub
3. Check service status pages (Clerk, Stripe, Resend)
4. Review error messages carefully
5. Try reproducing the issue

### Where to Get Help
1. **Documentation**: Check feature-specific docs
2. **GitHub Issues**: Search existing issues
3. **Service Documentation**: Clerk, Stripe, Resend docs
4. **Community**: Stack Overflow, Discord
5. **Support**: Contact development team

### Creating Bug Reports
Include the following information:
1. **Environment**: OS, Node.js version, browser
2. **Steps to reproduce**: Detailed steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Error messages**: Full error text
6. **Screenshots**: If applicable
7. **Code samples**: Minimal reproduction case

### Performance Issues
When reporting performance issues:
1. Use browser performance tools
2. Provide timing measurements
3. Include system specifications
4. Test on different devices/browsers
5. Check network conditions

## Prevention Tips

### Development Best Practices
1. Use TypeScript for type safety
2. Write tests for critical functionality
3. Use ESLint and Prettier
4. Keep dependencies updated
5. Monitor application performance

### Environment Management
1. Use different environments for dev/staging/prod
2. Keep environment variables secure
3. Document all required variables
4. Use environment validation

### Code Quality
1. Follow consistent coding standards
2. Write meaningful commit messages
3. Use proper error handling
4. Document complex logic
5. Regular code reviews

### Monitoring
1. Set up error tracking (Sentry, etc.)
2. Monitor application performance
3. Track user behavior
4. Set up alerts for critical issues
5. Regular health checks

Remember: Most issues have been encountered before. Take time to read error messages carefully and search for solutions before asking for help.
