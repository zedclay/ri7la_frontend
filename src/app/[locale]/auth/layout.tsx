export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface antialiased">
      {children}
    </div>
  );
}
