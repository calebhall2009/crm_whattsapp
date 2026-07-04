import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-charcoal-800">
      <div className="motion-safe:animate-fade-in">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-terminal rounded-card",
            },
          }}
        />
      </div>
    </main>
  );
}
