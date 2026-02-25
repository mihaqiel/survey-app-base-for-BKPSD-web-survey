"use client"

import type React from "react"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Logo BKPSD Survey
const LogoBKPSD = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
  </svg>
)

// Ícones minimalistas no estilo ClickUp
const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9.5L12 4L21 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M19 13V19.4C19 19.7314 18.7314 20 18.4 20H5.6C5.26863 20 5 19.7314 5 19.4V13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconSurveys = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const IconQuestions = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconRespondents = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M5 20C5 16.6863 8.13401 14 12 14C15.866 14 19 16.6863 19 20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const IconDistribution = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconAnalytics = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 17L7 13L11 17L21 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M15 7H21V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconReports = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21H3V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 16V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M11 16V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15 16V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19 16V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const IconNotifications = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 5C10 3.89543 10.8954 3 12 3C13.1046 3 14 3.89543 14 5C16.3402 5.86656 18 8.13425 18 10.8V14.5L19.5 17H4.5L6 14.5V10.8C6 8.13425 7.65979 5.86656 10 5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M9 17V18C9 19.6569 10.3431 21 12 21C13.6569 21 15 19.6569 15 18V17"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

const IconSupport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 9.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 13.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M18 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V4C20 2.89543 19.1046 2 18 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4793 19.5791 14.0988 20.1724 14.1 20.82V21C14.1 22.1046 13.2046 23 12.1 23C10.9954 23 10.1 22.1046 10.1 21V20.91C10.0903 20.2494 9.68573 19.6555 9.06 19.4C8.44291 19.1277 7.72222 19.2583 7.24 19.73L7.18 19.79C6.80493 20.1656 6.29584 20.3766 5.765 20.3766C5.23416 20.3766 4.72507 20.1656 4.35 19.79C3.97439 19.4149 3.76339 18.9058 3.76339 18.375C3.76339 17.8442 3.97439 17.3351 4.35 16.96L4.41 16.9C4.88168 16.4178 5.01227 15.6971 4.74 15.08C4.48093 14.4793 3.88758 14.0988 3.24 14.1H3C1.89543 14.1 1 13.2046 1 12.1C1 10.9954 1.89543 10.1 3 10.1H3.09C3.75063 10.0903 4.34446 9.68573 4.6 9.06C4.87227 8.44291 4.74168 7.72222 4.27 7.24L4.21 7.18C3.83439 6.80493 3.62339 6.29584 3.62339 5.765C3.62339 5.23416 3.83439 4.72507 4.21 4.35C4.58507 3.97439 5.09416 3.76339 5.625 3.76339C6.15584 3.76339 6.66493 3.97439 7.04 4.35L7.1 4.41C7.58222 4.88168 8.30291 5.01227 8.92 4.74H9C9.60071 4.48093 9.98118 3.88758 9.98 3.24V3C9.98 1.89543 10.8754 1 11.98 1C13.0846 1 13.98 1.89543 13.98 3V3.09C13.9788 3.73742 14.3593 4.33072 14.96 4.59C15.5771 4.86227 16.2978 4.73168 16.78 4.26L16.84 4.2C17.2151 3.82439 17.7242 3.61339 18.255 3.61339C18.7858 3.61339 19.2949 3.82439 19.67 4.2C20.0456 4.57507 20.2566 5.08416 20.2566 5.615C20.2566 6.14584 20.0456 6.65493 19.67 7.03L19.61 7.09C19.1383 7.57222 19.0077 8.29291 19.28 8.91V9C19.5391 9.60071 20.1324 9.98118 20.78 9.98H21C22.1046 9.98 23 10.8754 23 11.98C23 13.0846 22.1046 13.98 21 13.98H20.91C20.2626 13.9788 19.6693 14.3593 19.41 14.96L19.4 15Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <IconHome />,
  ClipboardList: <IconSurveys />,
  CheckCircle: <IconQuestions />,
  Users: <IconRespondents />,
  Send: <IconDistribution />,
  BarChart3: <IconAnalytics />,
  FileBarChart: <IconReports />,
  Bell: <IconNotifications />,
  HeadphonesIcon: <IconSupport />,
  Settings: <IconSettings />,
}

// Sidebar component with sortable menu items
const SortableMenuItem = ({ item }: { item: { id: string; label: string; icon: string } }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center p-2.5 rounded-md cursor-grab active:cursor-grabbing mb-1 group",
        isDragging ? "bg-gray-200 opacity-80" : "hover:bg-gray-200",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="mr-3 text-gray-600">{iconMap[item.icon]}</div>
      <span className="text-xs font-medium text-gray-700">{item.label}</span>
    </div>
  )
}

// Sidebar component with sticky positioning
export function Sidebar({
  items,
  activeUser,
}: {
  items: Array<{ id: string; label: string; icon: string }>
  activeUser: { name: string; role: string; avatar: string }
}) {
  return (
    <div className="w-60 bg-white border-r sticky top-0 h-screen flex flex-col font-['Inter',sans-serif]">
      {/* Logo */}
      <div className="p-4 border-b">
        <div className="flex items-center">
          <div className="text-indigo-600">
            <LogoBKPSD />
          </div>
          <span className="ml-2 font-semibold text-gray-800">BKPSD Survey</span>
        </div>
      </div>

      <div className="flex-1 py-4 px-3 overflow-y-auto">
        {items.map((item) => (
          <SortableMenuItem key={item.id} item={item} />
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center">
          <Avatar className="h-7 w-7 mr-2">
            <AvatarImage src={activeUser.avatar} alt={activeUser.name} />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-xs text-gray-700">{activeUser.name}</div>
            <div className="text-[10px] text-gray-500">{activeUser.role}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

