import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useUser } from "@clerk/clerk-react";
import { createContext, useContext, useMemo } from "react";

const AuthContext = createContext(null);
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ClerkAuthBridge({ children }) {
  const auth = useAuth();
  const clerk = useClerk();
  const { user } = useUser();

  const value = useMemo(
    () => ({
      isClerkEnabled: true,
      isLoaded: auth.isLoaded,
      isSignedIn: auth.isSignedIn,
      user,
      signOut: clerk.signOut,
      getToken: auth.getToken,
      SignInComponent: () => (
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/app/dashboard"
        />
      ),
      SignUpComponent: () => (
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/app/dashboard"
        />
      )
    }),
    [auth.getToken, auth.isLoaded, auth.isSignedIn, clerk.signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function DemoAuthProvider({ children }) {
  const value = useMemo(
    () => ({
      isClerkEnabled: false,
      isLoaded: true,
      isSignedIn: true,
      user: {
        firstName: "Demo",
        imageUrl: ""
      },
      signOut: async () => {},
      getToken: async () => null,
      SignInComponent: () => null,
      SignUpComponent: () => null
    }),
    []
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AppAuthProvider({ children }) {
  if (!publishableKey) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/app/dashboard"
      signUpFallbackRedirectUrl="/app/dashboard"
    >
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  );
}

export const useAppAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAppAuth must be used within AppAuthProvider");
  }
  return context;
};
