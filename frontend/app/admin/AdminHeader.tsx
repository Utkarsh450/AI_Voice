export default function AdminHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/70 px-8 py-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Admin Dashboard
          </h2>

          <p className="text-sm text-slate-400">
            Manage AI Voice Platform
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-full bg-slate-800 px-4 py-2 text-sm">
            Admin
          </div>
        </div>
      </div>
    </header>
  );
}