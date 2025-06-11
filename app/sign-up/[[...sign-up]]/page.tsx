import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Patent Pending Notice */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Force Dowels</h1>
          <p className="text-sm text-amber-600 font-medium">Patent Pending Technology</p>
        </div>
        
        {/* Clerk Sign Up Component */}
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-amber-600 hover:bg-amber-700 text-sm normal-case",
              card: "shadow-lg border border-gray-200",
              headerTitle: "text-gray-900",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton: 
                "border border-gray-300 hover:bg-gray-50",
              formFieldInput: 
                "border border-gray-300 focus:border-amber-500 focus:ring-amber-500",
              footerActionLink: "text-amber-600 hover:text-amber-700",
            },
          }}
        />
        
        {/* Additional Patent Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Experience the next generation of cabinet assembly: faster, stronger, and with a flawless finish
          </p>
        </div>
      </div>
    </div>
  )
}
