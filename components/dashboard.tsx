"use client"

import { useState, useEffect } from "react"
import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"

import { Sidebar } from "./sidebar"
import { DraggableCards } from "./draggable-cards"

// Menu items for the sidebar
const initialMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "surveys", label: "Surveys", icon: "ClipboardList" },
  { id: "questions", label: "Questions", icon: "CheckCircle" },
  { id: "respondents", label: "Respondents", icon: "Users" },
  { id: "distribution", label: "Distribution", icon: "Send" },
  { id: "analytics", label: "Analytics", icon: "BarChart3" },
  { id: "reports", label: "Reports", icon: "FileBarChart" },
  { id: "notifications", label: "Notifications", icon: "Bell" },
  { id: "support", label: "Support", icon: "HeadphonesIcon" },
  { id: "settings", label: "Settings", icon: "Settings" },
]

// Initial dashboard cards
const initialCards = [
  { id: "surveys", type: "surveys" },
  { id: "responses", type: "responses" },
  { id: "completion", type: "completion" },
  { id: "analytics", type: "analytics" },
  { id: "activities", type: "activities" },
]

// Get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Good morning"
  if (hour >= 12 && hour < 18) return "Good afternoon"
  return "Good evening"
}

export default function Dashboard() {
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [cards, setCards] = useState(initialCards)
  const [activeUser, setActiveUser] = useState({
    name: "John Doe",
    role: "Admin",
    avatar: "/images/avatar2.png",
  })
  const [greeting, setGreeting] = useState("")

  // Update greeting on mount
  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  // Handle menu drag end
  const handleMenuDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setMenuItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Handle cards drag end
  const handleCardsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-['Inter',sans-serif]">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleMenuDragEnd}>
        <SortableContext items={menuItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <Sidebar items={menuItems} activeUser={activeUser} />
        </SortableContext>
      </DndContext>

      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            {`Hello ${activeUser.name.split(" ")[0]}, ${greeting}!`}
          </h1>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleCardsDragEnd}>
          <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
            <DraggableCards cards={cards} />
          </SortableContext>
        </DndContext>
      </main>
    </div>
  )
}

