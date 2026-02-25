import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, ClipboardList, FileText, Users, BarChart3, Heart, GripVertical } from "lucide-react"

const surveys = [
  {
    id: "customer-satisfaction",
    name: "Customer Satisfaction",
    questions: 45,
    icon: <Heart className="h-5 w-5 text-white" />,
    color: "bg-indigo-500",
  },
  {
    id: "employee-engagement",
    name: "Employee Engagement",
    questions: 32,
    icon: <Users className="h-5 w-5 text-white" />,
    color: "bg-indigo-500",
  },
  {
    id: "product-feedback",
    name: "Product Feedback",
    questions: 18,
    icon: <ClipboardList className="h-5 w-5 text-white" />,
    color: "bg-indigo-500",
  },
  {
    id: "community-health",
    name: "Community Health",
    questions: 56,
    icon: <BarChart3 className="h-5 w-5 text-white" />,
    color: "bg-slate-700",
  },
  {
    id: "education-quality",
    name: "Education Quality",
    questions: 28,
    icon: <FileText className="h-5 w-5 text-white" />,
    color: "bg-indigo-500",
  },
]

export function SurveysCard() {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4">
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardTitle className="text-sm font-medium">Surveys</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 border border-dashed rounded-md">
            <Plus className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-xs">New survey</span>
          </div>

          {surveys.map((survey) => (
            <div key={survey.id} className="flex items-start p-3 border rounded-md">
              <div className={`${survey.color} p-2 rounded-md mr-3 flex-shrink-0`}>{survey.icon}</div>
              <div>
                <div className="font-medium text-xs">{survey.name}</div>
                <div className="text-[10px] text-gray-500">{survey.questions} questions</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  )
}
