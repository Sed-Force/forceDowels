# Authentication System

The Force Dowels application uses Clerk for authentication, providing secure user management with custom-styled sign-in and sign-up pages.

## Overview

The authentication system provides:
- Custom sign-in and sign-up pages
- Route protection middleware
- User session management
- Seamless integration with the application design
- Mobile-responsive authentication flows

## Implementation Details

### Authentication Flow
1. **Sign-In**: Users can sign in or sign up from the same page (`/sign-in`)
2. **Sign-Up**: Dedicated sign-up page available at (`/sign-up`)
3. **Redirects**: Proper fallback redirects configured
4. **Protection**: Sensitive routes are protected by middleware

### Custom Pages

#### Sign-In Page (`/sign-in`)
- **Location**: `app/sign-in/[[...sign-in]]/page.tsx`
- **Features**:
  - Combined sign-in/sign-up flow using Clerk's `<SignIn />` component
  - Custom styling with amber theme to match Force Dowels branding
  - Patent Pending notices for brand consistency
  - Responsive design

#### Sign-Up Page (`/sign-up`)
- **Location**: `app/sign-up/[[...sign-up]]/page.tsx`
- **Features**:
  - Dedicated sign-up page using Clerk's `<SignUp />` component
  - Consistent styling with sign-in page
  - Patent Pending branding elements
  - Responsive design

### Route Protection

#### Middleware Configuration
- **File**: `middleware.ts`
- **Implementation**: Uses `createRouteMatcher` for route protection
- **Public Routes**:
  - `/` (homepage)
  - `/sign-in` and `/sign-up` (authentication)
  - `/contact` (contact form)
  - `/find-a-distributor` (distributor finder)
  - `/distributor-application` (distributor applications)
  - `/privacy-policy` and `/terms-of-service` (legal pages)
  - `/videos` (product videos)
  - API routes for public functionality

#### Protected Routes
- `/order` - Product ordering
- `/profile` - User profile management
- `/checkout` - Payment processing

### Header Integration

#### Navigation Updates
- **File**: `components/header.tsx`
- **Changes**:
  - Replaced modal-based auth buttons with navigation links
  - Updated both desktop and mobile navigation
  - Maintained existing UserButton for authenticated users
  - Preserved all existing functionality

## Environment Configuration

### Required Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### Clerk Dashboard Configuration
1. **Create Application**: Set up new application in Clerk dashboard
2. **Configure URLs**:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`
3. **Allowed Origins**: Add your domain(s)
4. **API Keys**: Copy publishable and secret keys

## Styling & Branding

### Design Consistency
- **Amber Theme**: Consistent with Force Dowels brand colors (#d97706, #f59e0b)
- **Patent Pending**: Notices included on auth pages
- **Responsive**: Works on all device sizes
- **Typography**: Matches existing site design

### Custom Styling
The authentication components use Clerk's appearance customization:
```typescript
appearance={{
  elements: {
    formButtonPrimary: 'bg-amber-600 hover:bg-amber-700',
    card: 'shadow-lg border-amber-100',
    headerTitle: 'text-amber-900',
    // Additional custom styles...
  }
}}
```

## User Experience Features

### Seamless Navigation
- Auth buttons in header navigate to custom pages
- Fast loading with Next.js App Router optimization
- Error handling managed by Clerk
- Fully accessible components

### Mobile Optimization
- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized for mobile browsers
- Consistent experience across devices

## Testing

### Verification Checklist
- ✅ Sign-in page loads correctly at `/sign-in`
- ✅ Sign-up page loads correctly at `/sign-up`
- ✅ Header navigation buttons work properly
- ✅ Middleware protects routes correctly
- ✅ No console errors
- ✅ Responsive design works on all screen sizes

### Test Scenarios
1. **Sign-up Flow**: Create new account and verify email
2. **Sign-in Flow**: Log in with existing credentials
3. **Route Protection**: Try accessing protected routes without auth
4. **Session Management**: Verify session persistence
5. **Sign-out**: Test sign-out functionality

## Advanced Configuration

### Social Login Providers
Configure in Clerk dashboard:
- Google OAuth
- GitHub OAuth
- Facebook OAuth
- Apple OAuth

### Email Templates
Customize Clerk's email templates:
- Welcome emails
- Password reset emails
- Email verification
- Magic link emails

### Webhooks
Set up webhooks for:
- User creation events
- User updates
- Session events
- Organization events

## Troubleshooting

### Common Issues

**Authentication Not Working**
- Verify API keys are correct
- Check environment variables are loaded
- Ensure Clerk dashboard configuration matches

**Redirect Issues**
- Verify redirect URLs in Clerk dashboard
- Check middleware configuration
- Ensure environment variables are set

**Styling Problems**
- Check Tailwind CSS classes are loading
- Verify custom appearance configuration
- Test on different screen sizes

### Debug Steps
1. Check browser console for errors
2. Verify network requests in developer tools
3. Check Clerk dashboard logs
4. Test with different browsers
5. Verify environment variables

## Next Steps

### Recommended Enhancements
1. **Test Authentication**: Try signing up and signing in with real credentials
2. **Customize Further**: Add additional branding or custom fields if needed
3. **Configure OAuth**: Set up social login providers in Clerk dashboard
4. **Email Templates**: Customize Clerk's email templates to match branding

### Clerk Dashboard Features
Access your Clerk dashboard to:
- Configure additional authentication methods
- Customize email templates
- Set up webhooks
- Monitor user activity
- Configure organization features

The authentication implementation is complete and ready for production use!
