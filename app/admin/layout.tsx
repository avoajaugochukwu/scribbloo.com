import QueryProvider from './QueryProvider'; // Import the provider

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Wrap the children with the QueryProvider
    <QueryProvider>
      {/* You can add admin-specific layout elements here if needed */}
      {/* e.g., a header, sidebar */}
      <main>
        {children}
      </main>
    </QueryProvider>
  );
} 