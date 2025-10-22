import { useEffect } from "react";
import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { events } from "@/lib/analytics";

export default function Login() {
  useEffect(() => {
    events.signupStarted();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link to="/" className="inline-flex mb-6">
          <Button variant="ghost" size="sm" className="hover:bg-slate-800 text-slate-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Sign In Component */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 backdrop-blur">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 mb-6">Sign in to ProposalFast to generate contracts</p>

          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                socialButtonsBlockButton:
                  "bg-slate-700 hover:bg-slate-600 text-white border-slate-600 w-full",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white w-full",
                footerActionLink: "text-blue-400 hover:text-blue-300",
                formFieldInput:
                  "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500",
                formFieldLabel: "text-slate-300",
                dividerLine: "bg-slate-700",
                dividerText: "text-slate-400",
              },
            }}
            signUpUrl="/login"
            routing="hash"
          />
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Ready to generate your first contract?
        </p>
      </div>
    </div>
  );
}