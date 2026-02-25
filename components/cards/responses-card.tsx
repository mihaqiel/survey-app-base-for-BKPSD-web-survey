import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Check, GripVertical, Clock, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const responses = [
  {
    id: 1,
    respondent: "Customer Satisfaction Survey",
    completed: true,
    assignee: {
      avatar: "/images/avatar1.png",
      initials: "JD",
      color: "bg-indigo-500",
    },
    metrics: {
      answered: 45,
      completion: 100,
    },
  },
  {
    id: 2,
    respondent: "Employee Engagement Survey",
    completed: false,
    assignee: {
      avatar: "/images/avatar2.png",
      initials: "AB",
      color: "bg-pink-500",
    },
    metrics: {
      answered: 18,
      completion: 56,
    },
  },
  {
    id: 3,
    respondent: "Product Feedback Survey",
    completed: true,
    assignee: {
      avatar: "/images/avatar3.png",
      initials: "CD",
      color: "bg-amber-500",
    },
    metrics: {
      answered: 18,
      completion: 100,
    },
  },
  {
    id: 4,
    respondent: "Community Health Survey",
    completed: false,
    assignee: {
      avatar: "/images/avatar4.png",
      initials: "EF",
      color: "bg-orange-500",
    },
    metrics: {
      answered: 30,
      completion: 54,
    },
  },
  {
    id: 5,
    respondent: "Education Quality Survey",
    completed: true,
    assignee: {
      avatar: "/images/avatar5.png",
      initials: "GH",
      color: "bg-yellow-500",
    },
    metrics: {
      answered: 28,
      completion: 100,
    },
  },
  {
    id: 6,
    respondent: "Customer Satisfaction Survey",
    completed: false,
    assignee: {
      avatar: "/images/avatar6.png",
      initials: "IJ",
      color: "bg-emerald-500",
    },
    metrics: {
      answered: 22,
      completion: 49,
    },
  },
]

export function ResponsesCard() {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4">
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardTitle className="text-sm font-medium">Recent Responses</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 h-[250px] overflow-auto">
        <div className="space-y-3">
          {responses.map((response) => (
            <div key={response.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center mr-3",
                    response.completed ? "bg-indigo-100 border-indigo-500" : "border-gray-300",
                  )}
                >
                  {response.completed ? (
                    <Check className="h-2.5 w-2.5 text-indigo-500" />
                  ) : (
                    <Clock className="h-2.5 w-2.5 text-gray-400" />
                  )}
                </div>
                <span className={cn("text-xs", response.completed && "text-gray-500")}>{response.respondent}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={response.assignee.avatar} />
                  <AvatarFallback className={response.assignee.color}>{response.assignee.initials}</AvatarFallback>
                </Avatar>
                <div className="flex items-center text-[10px] text-gray-500">
                  <FileText className="h-3 w-3 mr-1" />
                  <span>{response.metrics.answered}</span>
                </div>
                <div className="flex items-center text-[10px] text-gray-500">
                  <span>{response.metrics.completion}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  )
}
