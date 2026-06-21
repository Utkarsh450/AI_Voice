import { Menu } from "lucide-react";

interface Props {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: Props) {
  return (
    <header className="border-b border-blue-900/30 bg-[#030712]/40 px-4 md:px-8 py-4 md:py-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden rounded-xl border border-slate-800 p-2 hover:bg-slate-900 text-slate-300 transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu size={20} />
          </button>

          <div>
            <h2 className="text-lg md:text-xl font-semibold">
              Admin Dashboard
            </h2>

            <p className="hidden sm:block text-xs md:text-sm text-slate-400">
              Manage AI Voice Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-blue-900/40 bg-blue-950/30 px-4.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 shadow-inner">
            Admin Panel
          </div>
        </div>
      </div>
    </header>
  );
}