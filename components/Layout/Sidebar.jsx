"use client";

import {
  Home,
  Rocket,
  HeartPulse,
  Film,
  Factory,
  Briefcase,
  Cpu,
  Leaf,
  GraduationCap,
  Users,
  Landmark,
  Car,
  Zap,
  Bot,
  Trophy,
  Train,
  Wheat,
  Banknote,
  Shield,
  Satellite,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const Sidebar = ({
  selectedCategory,
  setSelectedCategory,
}) => {

  const { closeSidebar } = useSidebar();

  const MenuItem = ({ icon: Icon, label }) => (
    <div
      onClick={() => {
  setSelectedCategory(label);
  closeSidebar(); // auto close mobile drawer
}}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all
        ${
          selectedCategory === label
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  const SidebarContent = () => (
    <>
      {/* GENERAL */}
      <div className="mb-6">
        <h3 className="text-xs text-gray-500 uppercase mb-2">General</h3>
        <MenuItem icon={Home} label="GENERAL" />
      </div>

      <hr className="my-4" />

      {/* CORE DOMAINS */}
      <div className="mb-6">
        <h3 className="text-xs text-gray-500 uppercase mb-2">
          Core Domains
        </h3>

        <MenuItem icon={Rocket} label="STARTUPS" />
        <MenuItem icon={HeartPulse} label="MEDICAL" />
        <MenuItem icon={Film} label="MOVIES" />
        <MenuItem icon={Factory} label="INDUSTRIAL" />
        <MenuItem icon={Briefcase} label="BUSINESS" />
        <MenuItem icon={Cpu} label="IT" />
        <MenuItem icon={Bot} label="NEW TECHNOLOGIES" />
        <MenuItem icon={Leaf} label="ENVIRONMENT" />
        <MenuItem icon={GraduationCap} label="EDUCATION" />
        <MenuItem icon={Users} label="SOCIETAL" />
        <MenuItem icon={Landmark} label="POLITICAL" />
      </div>

      <hr className="my-4" />

      {/* SPECIALIZED */}
      <div>
        <h3 className="text-xs text-gray-500 uppercase mb-2">
          Specialized
        </h3>

        <MenuItem icon={Car} label="AUTOMOBILES" />
        <MenuItem icon={Zap} label="ELECTRICAL" />
        <MenuItem icon={Cpu} label="ELECTRONICS" />
        <MenuItem icon={Bot} label="AI" />
        <MenuItem icon={Trophy} label="SPORTS" />
        <MenuItem icon={Train} label="TRANSPORT" />
        <MenuItem icon={Wheat} label="AGRICULTURE" />
        <MenuItem icon={Banknote} label="FINANCE" />
        <MenuItem icon={Shield} label="DEFENSE" />
        <MenuItem icon={Satellite} label="SPACE" />
      </div>
    </>
  );

  return (
      <aside className="w-64 h-full overflow-y-auto border-r bg-white dark:bg-black p-4">
        <SidebarContent />
      </aside>
  );
};

export default Sidebar;