
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  ClipboardCheck,
  FileUp,
  Home,
  ListChecks,
  Menu,
  Settings,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  name: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, name }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li>
      <Link
        to={to}
        className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isActive
            ? "bg-gray-100 dark:bg-gray-800 font-medium"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <span className="h-5 w-5 mr-2">{icon}</span>
        {name}
      </Link>
    </li>
  );
};

const navigation = [
  { name: "Dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
  { name: "Rooms", href: "/rooms", icon: <Settings className="h-5 w-5" /> },
  { name: "Tasks", href: "/tasks", icon: <ListChecks className="h-5 w-5" /> },
  { name: "Staff", href: "/staff", icon: <User className="h-5 w-5" /> },
];

export const Sidebar = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar} 
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out dark:bg-gray-900 dark:border-gray-700 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <Link to="/" className="flex items-center space-x-2 overflow-hidden">
              <span className={`font-bold text-xl dark:text-white ${!isOpen && "md:hidden"}`}>
                Hotel Manager
              </span>
              {!isOpen && (
                <span className="hidden md:block font-bold text-xl dark:text-white">
                  HM
                </span>
              )}
            </Link>
            <button onClick={toggleSidebar} className="md:hidden">
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="px-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      location.pathname === item.href
                        ? "bg-gray-100 dark:bg-gray-800 font-medium"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="h-5 w-5 mr-2">{item.icon}</span>
                    <span className={!isOpen ? "md:hidden" : ""}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}

              <li className="pt-3 border-t border-gray-200 dark:border-gray-700 my-2"></li>

              <li>
                <Link
                  to="/supervisor"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    location.pathname === "/supervisor"
                      ? "bg-gray-100 dark:bg-gray-800 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <ClipboardCheck className="h-5 w-5 mr-2" />
                  <span className={!isOpen ? "md:hidden" : ""}>Supervisor View</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/assign"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    location.pathname === "/assign"
                      ? "bg-gray-100 dark:bg-gray-800 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <UserCheck className="h-5 w-5 mr-2" />
                  <span className={!isOpen ? "md:hidden" : ""}>Assign Tasks</span>
                </Link>
              </li>
              
              <li>
                <Link
                  to="/gantt"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    location.pathname === "/gantt"
                      ? "bg-gray-100 dark:bg-gray-800 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  <span className={!isOpen ? "md:hidden" : ""}>Gantt Chart</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/import"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    location.pathname === "/import"
                      ? "bg-gray-100 dark:bg-gray-800 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <FileUp className="h-5 w-5 mr-2" />
                  <span className={!isOpen ? "md:hidden" : ""}>Import Tasks</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t dark:border-gray-700">
            <p className={`text-sm text-gray-500 dark:text-gray-400 ${!isOpen ? "md:hidden" : ""}`}>
              Version 0.1.0
            </p>
            {!isOpen && (
              <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400">v0.1</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
