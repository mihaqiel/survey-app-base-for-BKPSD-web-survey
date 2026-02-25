"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { SurveysCard } from "./cards/surveys-card"
import { ResponsesCard } from "./cards/responses-card"
import { CompletionCard } from "./cards/completion-card"
import { AnalyticsCard } from "./cards/analytics-card"
import { ActivitiesCard } from "./cards/activities-card"
import { cn } from "@/lib/utils"

// Componente para cada card arrastável
const SortableCard = ({ id, type }: { id: string; type: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  // Render card content based on type
  const renderCardContent = () => {
    switch (type) {
      case "surveys":
        return <SurveysCard />
      case "responses":
        return <ResponsesCard />
      case "completion":
        return <CompletionCard />
      case "analytics":
        return <AnalyticsCard />
      case "activities":
        return <ActivitiesCard />
      default:
        return <div>Unknown card type</div>
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn("transition-all", isDragging ? "opacity-70 scale-105" : "")}
    >
      <Card className="relative group">
        <div className="absolute top-0 left-0 right-0 h-12 cursor-grab active:cursor-grabbing" {...listeners}></div>
        {renderCardContent()}
      </Card>
    </div>
  )
}

// Componente que renderiza os cards arrastáveis
export function DraggableCards({ cards }: { cards: Array<{ id: string; type: string }> }) {
  // Função para determinar a largura do card com base no tipo
  const getCardWidth = (type: string) => {
    return type === "surveys" ? "col-span-12" : "col-span-12 md:col-span-6"
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {cards.map((card) => (
        <div key={card.id} className={getCardWidth(card.type)}>
          <SortableCard id={card.id} type={card.type} />
        </div>
      ))}
    </div>
  )
}

