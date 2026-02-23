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

import { useSidebar } from "@/components/Layout/SidebarContext";

export default function SidebarContent({
  selectedCategory,
  setSelectedCategory,
  isMobile = false,
}) {
  const { closeSidebar } = useSidebar();

  const handleClick = (label) => {
    setSelectedCategory(label);

    // Auto close only in mobile mode
    if (isMobile) {
      closeSidebar();
    }
  };

  const MenuItem = ({ Icon, label }) => (
    <div
      onClick={() => handleClick(label)}
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

  return (
    <>
      {/* GENERAL */}
      <div className="mb-6">
        <h3 className="text-xs text-gray-500 uppercase mb-2">General</h3>
        <MenuItem Icon={Home} label="GENERAL" />
      </div>

      <hr className="my-4" />

      {/* CORE DOMAINS */}
      <div className="mb-6">
        <h3 className="text-xs text-gray-500 uppercase mb-2">
          Core Domains
        </h3>

        <MenuItem Icon={Rocket} label="STARTUPS" />
        <MenuItem Icon={HeartPulse} label="MEDICAL" />
        <MenuItem Icon={Film} label="MOVIES" />
        <MenuItem Icon={Factory} label="INDUSTRIAL" />
        <MenuItem Icon={Briefcase} label="BUSINESS" />
        <MenuItem Icon={Cpu} label="IT" />
        <MenuItem Icon={Bot} label="NEW TECHNOLOGIES" />
        <MenuItem Icon={Leaf} label="ENVIRONMENT" />
        <MenuItem Icon={GraduationCap} label="EDUCATION" />
        <MenuItem Icon={Users} label="SOCIETAL" />
        <MenuItem Icon={Landmark} label="POLITICAL" />
      </div>

      <hr className="my-4" />

      {/* SPECIALIZED */}
      <div>
        <h3 className="text-xs text-gray-500 uppercase mb-2">
          Specialized
        </h3>

        <MenuItem Icon={Car} label="AUTOMOBILES" />
        <MenuItem Icon={Zap} label="ELECTRICAL" />
        <MenuItem Icon={Cpu} label="ELECTRONICS" />
        <MenuItem Icon={Bot} label="AI" />
        <MenuItem Icon={Trophy} label="SPORTS" />
        <MenuItem Icon={Train} label="TRANSPORT" />
        <MenuItem Icon={Wheat} label="AGRICULTURE" />
        <MenuItem Icon={Banknote} label="FINANCE" />
        <MenuItem Icon={Shield} label="DEFENSE" />
        <MenuItem Icon={Satellite} label="SPACE" />
      </div>
    </>
  );
}