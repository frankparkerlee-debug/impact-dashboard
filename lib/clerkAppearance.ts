// Shared Clerk appearance so SignIn / SignInButton / UserButton match the tech-dashboard look.
export const clerkAppearance = {
  variables: {
    colorPrimary: "#2563eb",
    colorText: "#111827",
    colorTextSecondary: "#6b7280",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#111827",
    colorDanger: "#dc2626",
    borderRadius: "8px",
    fontFamily: "var(--font-sans), system-ui, -apple-system, sans-serif",
  },
  elements: {
    card: { boxShadow: "0 1px 3px rgba(16,24,40,0.08)", border: "1px solid #e5e7eb" },
    headerTitle: { fontWeight: "700", letterSpacing: "-0.3px" },
    formButtonPrimary: { backgroundColor: "#2563eb", fontSize: "14px", fontWeight: "600" },
    footerActionLink: { color: "#2563eb" },
    badge: { backgroundColor: "#eff6ff", color: "#2563eb" },
    avatarBox: { width: "32px", height: "32px" },
  },
};
