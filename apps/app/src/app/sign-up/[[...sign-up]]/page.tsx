import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-charcoal-800">
      <div className="motion-safe:animate-fade-in">
        <SignUp
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
