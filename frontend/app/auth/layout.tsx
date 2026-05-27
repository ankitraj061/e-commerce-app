/**
 * Auth layout — hides the global navbar for login/register pages.
 * The auth pages have their own internal navigation.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
