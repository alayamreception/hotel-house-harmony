import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  ClipboardCheck,
  FileUp,
  Home,
  ListChecks,
  LucideIcon,
  Settings,
  User,
  UserCheck,
  X,
} from "lucide-react";

import { useSidebar } from "@/hooks/use-sidebar";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
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
        <icon className="h-5 w-5 mr-2" />
        {name}
      </Link>
    </li>
  );
};

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Rooms", href: "/rooms", icon: Settings },
  { name: "Tasks", href: "/tasks", icon: ListChecks },
  { name: "Staff", href: "/staff", icon: User },
];

export const Sidebar = () => {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out dark:bg-gray-900 dark:border-gray-700 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl dark:text-white">
              Hotel Manager
            </span>
          </Link>
          <button onClick={toggleSidebar} className="md:hidden">
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="px-2 space-y-1">
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                to={item.href}
                icon={item.icon}
                name={item.name}
              />
            ))}

            <li className="pt-3 border-t border-gray-200 dark:border-gray-700 my-2"></li>

            <NavItem
              to="/supervisor"
              icon={<ClipboardCheck className="h-5 w-5" />}
              name="Supervisor View"
            />

            <NavItem
              to="/assign"
              icon={<UserCheck className="h-5 w-5" />}
              name="Assign Tasks"
            />
            
            <NavItem
              to="/gantt"
              icon={<BarChart3 className="h-5 w-5" />}
              name="Gantt Chart"
            />

            <NavItem
              to="/import"
              icon={<FileUp className="h-5 w-5" />}
              name="Import Tasks"
            />

          </ul>
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Version 0.1.0
          </p>
        </div>
      </div>
    </aside>
  );
};
