"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthTestPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h2>Auth Test Page</h2>
      {session ? (
        <>
          <p>
            Signed in as <b>{session.user?.email}</b>
          </p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <>
          <button onClick={() => signIn("google")}>Sign in with Google</button>
          <button onClick={() => signIn("facebook")}>
            Sign in with Facebook
          </button>
          <button onClick={() => signIn("instagram")}>
            Sign in with Instagram
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (
                form.elements.namedItem("email") as HTMLInputElement
              ).value;
              const password = (
                form.elements.namedItem("password") as HTMLInputElement
              ).value;
              signIn("credentials", { email, password });
            }}
            style={{ marginTop: 16 }}
          >
            <div>
              <input name="email" type="email" placeholder="Email" required />
            </div>
            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
              />
            </div>
            <button type="submit">Sign in with Email</button>
          </form>
        </>
      )}
    </div>
  );
}
