import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, GripVertical } from "lucide-react"

const surveys = [
  {
    id: "customer-satisfaction",
    name: "Customer Satisfaction",
    progress: 75,
    color: "bg-indigo-400",
  },
  {
    id: "employee-engagement",
    name: "Employee Engagement",
    progress: 85,
    color: "bg-indigo-400",
  },
  {
    id: "product-feedback",
    name: "Product Feedback",
    progress: 60,
    color: "bg-indigo-400",
  },
  {
    id: "community-health",
    name: "Community Health",
    progress: 90,
    color: "bg-slate-800",
  },
  {
    id: "education-quality",
    name: "Education Quality",
    progress: 45,
    color: "bg-indigo-400",
  },
]

export function CompletionCard() {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4">
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardTitle className="text-sm font-medium">Completion Rates</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 h-[250px] overflow-auto">
        <div className="space-y-4">
          {surveys.map((survey) => (
            <div key={survey.id} className="relative">
              <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${survey.color} rounded-full flex items-center pl-4`}
                  style={{ width: `${survey.progress}%` }}
                >
                  <span className="text-xs font-medium text-white truncate">{survey.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  )
}
