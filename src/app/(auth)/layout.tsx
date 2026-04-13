// ============================================================
// AttendX — Auth Layout
// ============================================================

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-5 bg-background relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-ios-blue/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#5856d6]/8 blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-sm relative z-10">
        {children}
      </div>
    </main>
  );
}
