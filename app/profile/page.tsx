"use client";

import React from 'react';
import Image from 'next/image'; // Import Image
import { useAuth } from '@/contexts/auth-context'; // Corrected path
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Corrected path
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Corrected path

const ProfilePage = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-red-500">Please sign in to view your profile.</p>
        {/* Optionally, add a link to the sign-in page here */}
      </div>
    );
  }

  // Function to get user initials for AvatarFallback
  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U'; // Default to 'U' for User
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.displayName || user?.name || "Name not available";
  const displayEmail = user?.email || "Email not available";

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
      {user && (
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src="/placeholder-user.jpg" alt={displayName} />
              <AvatarFallback>{getInitials(user.displayName || user.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{displayName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg">{displayEmail}</p>
              </div>
              {/* You can add more profile information here as needed */}
              {/* For example:
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-lg">{user.role || 'User'}</p>
              </div>
              */}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
