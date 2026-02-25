import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, GripVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Survey activity data
const activities = [
  {
    id: 1,
    type: "response",
    user: {
      name: "John Doe",
      avatar: "/images/avatar2.png",
      initials: "JD",
      color: "bg-indigo-500",
    },
    content: "Submitted response to Customer Satisfaction Survey",
    time: "10 min ago",
    iconBg: "bg-indigo-500",
  },
  {
    id: 2,
    type: "create",
    user: {
      name: "Alice Brown",
      avatar: "/images/avatar6.png",
      initials: "AB",
      color: "bg-pink-500",
    },
    content: "Created new Education Quality Survey",
    time: "1 hour ago",
    iconBg: "bg-blue-500",
  },
  {
    id: 3,
    type: "export",
    user: {
      name: "Carlos Diaz",
      avatar: "/images/avatar3.png",
      initials: "CD",
      color: "bg-amber-500",
    },
    content: "Exported analytics report for Product Feedback",
    time: "3 hours ago",
    iconBg: "bg-green-500",
  },
  {
    id: 4,
    type: "distribute",
    user: {
      name: "Emma Foster",
      avatar: "/images/avatar7.png",
      initials: "EF",
      color: "bg-orange-500",
    },
    content: "Distributed Community Health Survey via email",
    time: "5 hours ago",
    iconBg: "bg-purple-500",
  },
  {
    id: 5,
    type: "update",
    user: {
      name: "Gabriel Harris",
      avatar: "/images/avatar1.png",
      initials: "GH",
      color: "bg-yellow-500",
    },
    content: "Updated questions in Employee Engagement Survey",
    time: "Yesterday",
    iconBg: "bg-indigo-500",
  },
]

export function ActivitiesCard() {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4">
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 h-[350px] overflow-auto">
        <div className="relative pl-5">
          {/* Linha vertical do timeline */}
          <div className="absolute top-0 bottom-0 left-2 w-0.5 bg-gray-200"></div>

          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {/* Avatar no lugar do ícone */}
                <div className="absolute -left-5 mt-1">
                  <Avatar className="h-4 w-4 ring-2 ring-white">
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback className={activity.user.color}>{activity.user.initials}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center mb-1">
                    <span className="text-xs font-medium">{activity.user.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{activity.content}</p>
                  <span className="text-[10px] text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </>
  )
}

