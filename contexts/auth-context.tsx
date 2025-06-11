"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useUser as useClerkUser, useAuth as useClerkAuthHook, SignOutButton } from "@clerk/nextjs"; // Renamed to avoid conflict
import type { UserResource } from "@clerk/types";

interface AuthContextType {
  user: UserResource | null | undefined // Clerk's user type
  isLoading: boolean // Derived from Clerk's auth state
  isAuthenticated: boolean // Derived from Clerk's auth state
  signOut: () => Promise<void> // Uses Clerk's signOut
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// This AuthProvider is now a lightweight wrapper around Clerk's hooks.
// It might not be strictly necessary if components can directly use Clerk's hooks,
// but it's kept to minimize changes in consuming components like `app/profile/page.tsx`.
function AuthProviderInner({ children }: { children: ReactNode }) {
  const { user } = useClerkUser();
  const { isLoaded, isSignedIn, signOut: clerkSignOut } = useClerkAuthHook();

  const handleSignOut = async () => {
    try {
      await clerkSignOut();
      // router.push('/'); // Clerk's <UserButton> handles this, or you can redirect here if needed
    } catch (error) {
      console.error('Error signing out with Clerk:', error)
    }
  }

  const value = {
    user,
    isLoading: !isLoaded, // isLoading is true if Clerk is not loaded yet
    isAuthenticated: !!isSignedIn, // isAuthenticated is true if user is signed in
    signOut: handleSignOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// The AuthProvider should be wrapped by <ClerkProvider> higher up in the tree (e.g., in layout.tsx).
// So, this AuthProvider doesn't need to handle Suspense for auth loading itself if ClerkProvider does.
export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthProviderInner>{children}</AuthProviderInner>
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // This error signifies that useAuth is being called outside of an AuthProvider.
    // Ensure that the component calling useAuth is a child of AuthProvider.
    // Also, AuthProvider itself should be a child of <ClerkProvider>.
    throw new Error('useAuth must be used within an AuthProvider, which in turn must be within a ClerkProvider.')
  }
  return context
}

// Note: The AuthLoadingFallback component is removed as Clerk's <ClerkLoading> or <ClerkLoaded>
// components can be used directly in the UI where needed, or ClerkProvider handles initial load state.
// If a global loading screen for auth is still desired, it should be implemented using Clerk's state.
