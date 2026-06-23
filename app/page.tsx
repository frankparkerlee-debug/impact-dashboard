import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "12vh auto", padding: 24 }}>
      <h1 style={{ marginBottom: 4 }}>Impact Client Portal</h1>
      <p style={{ color: "#666", marginTop: 0 }}>
        Secure access to your land, title, lease, and payment data.
      </p>
      <SignedOut>
        <SignInButton mode="modal">
          <button style={btn}>Sign in</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <p>
          <Link href="/dashboard" style={btn as object}>
            Go to your dashboard →
          </Link>
        </p>
        <UserButton />
      </SignedIn>
    </main>
  );
}

const btn = {
  display: "inline-block",
  background: "#0B5FFF",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  textDecoration: "none",
  cursor: "pointer",
  fontSize: 15,
};
