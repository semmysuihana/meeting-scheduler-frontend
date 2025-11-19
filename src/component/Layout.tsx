import { useState } from "react";
import { Link, useLocation, Outlet, useParams } from "react-router-dom";

interface NavbarProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function Navbar({ setOpen }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 w-full h-14 bg-neutral-900 border-b border-neutral-700 z-50 px-4 flex items-center justify-between text-white">
      {/* Hamburger mobile */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="sm:hidden p-2 rounded hover:bg-neutral-700"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h1 className="text-lg font-semibold">Meeting Scheduler</h1>

      <div className="w-8 h-8 bg-neutral-600 rounded-full"></div>
    </nav>
  );
}

// --- SIDEBAR ---

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string | undefined;
}

function Sidebar({ open, setOpen, id }: SidebarProps) {
  const { pathname } = useLocation();

  const menus = [
    { name: "Dashboard", path: `/organizer/${id}/dashboard` },
    { name: "Settings", path: `/organizer/${id}/settings` },
    { name: "Booking", path: `/organizer/${id}/booking` },
  ];

  return (
    <>
      {/* Overlay Mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 sm:hidden z-30"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-neutral-900 text-white border-r border-neutral-700 z-40 transform transition-transform
          ${open ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
      >
        <div className="px-4 py-4 text-xl font-semibold border-b border-neutral-700">
          Menu
        </div>

        <ul className="mt-2">
          {menus.map((menu) => (
            <li key={menu.path}>
              <Link
                to={menu.path}
                className={`block px-4 py-2 rounded mx-2 mb-1
                  ${
                    pathname === menu.path
                      ? "bg-blue-600 text-white"
                      : "hover:bg-neutral-700"
                  }`}
                onClick={() => setOpen(false)}
              >
                {menu.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}

// --- LAYOUT ---

function Layout() {
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="dark flex h-screen bg-neutral-800 text-white">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} id={id} />

      {/* Main area */}
      <div className="flex-1 flex flex-col sm:ml-64">
        <Navbar setOpen={setOpen} />

        <main className="flex-1 pt-14 overflow-y-auto p-6 mt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
