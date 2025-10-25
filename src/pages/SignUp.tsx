// src/pages/Signup.tsx
import { useEffect, useState } from "react";
import { useSignUp, useAuth, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { events } from "@/lib/analytics";

export default function Signup() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const { user } = useUser();
    const navigate = useNavigate();

    const [step, setStep] = useState<"form" | "verify">("form");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        events.signupStarted?.();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;
        setErr(null);
        setLoading(true);
        try {
            await signUp.create({ emailAddress: email, password, firstName, lastName });
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setStep("verify");
        } catch (error: any) {
            setErr(error?.errors?.[0]?.message ?? error?.message ?? "Sign up failed");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;
        setErr(null);
        setLoading(true);
        try {
            const result = await signUp.attemptEmailAddressVerification({ code });
            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });

                // minimal profile fields
                const fullName = [firstName, lastName].filter(Boolean).join(" ") || undefined;

                // Client-side can update only 'unsafeMetadata' with these typings
                // If you truly need 'publicMetadata', do it via a server endpoint using the Clerk secret key.
                if (user?.update) {
                    await user.update({
                        unsafeMetadata: {
                            fullName,
                            role: "user",
                            onboardedAt: new Date().toISOString(),
                        },
                    });
                }

                // your analytics definition requires email
                await events.signupCompleted?.(email);

                navigate("/");
            } else {
                setErr("Verification not complete. Double-check the code.");
            }
        } catch (error: any) {
            setErr(error?.errors?.[0]?.message ?? error?.message ?? "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link to="/" className="inline-flex mb-6">
                    <Button variant="ghost" size="sm" className="hover:bg-slate-800 text-slate-300">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 backdrop-blur">
                    <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
                    <p className="text-slate-400 mb-6">Join ProposalFast and start generating contracts</p>

                    {err && <div className="mb-4 text-red-400 text-sm">{err}</div>}

                    {step === "form" ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <input className="bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 rounded-md p-3"
                                    placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                <input className="bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 rounded-md p-3"
                                    placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                            <input type="email" className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 rounded-md p-3"
                                placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <input type="password" className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 rounded-md p-3"
                                placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                                {loading ? "Creating..." : "Create account"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <p className="text-slate-400 text-sm">We sent a 6-digit code to <span className="text-slate-200">{email}</span>.</p>
                            <input className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 rounded-md p-3 tracking-widest text-center"
                                placeholder="Enter code" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required />
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                                {loading ? "Verifying..." : "Verify & Continue"}
                            </Button>
                        </form>
                    )}
                </div>

                <p className="text-center text-slate-400 text-sm mt-6">
                    Already have an account? <Link className="text-blue-400 hover:text-blue-300" to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
