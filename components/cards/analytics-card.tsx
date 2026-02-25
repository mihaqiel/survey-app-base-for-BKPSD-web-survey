import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, GripVertical } from "lucide-react"

export function AnalyticsCard() {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4">
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardTitle className="text-sm font-medium">Response Trends</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 h-[350px] flex items-center">
        <div className="w-full h-full relative">
          <svg viewBox="0 0 1000 300" className="w-full h-full" preserveAspectRatio="none">
            <g className="grid">
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={`horizontal-${i}`}
                  x1="0"
                  y1={50 + i * 50}
                  x2="1000"
                  y2={50 + i * 50}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <line
                  key={`vertical-${i}`}
                  x1={100 * i}
                  y1="0"
                  x2={100 * i}
                  y2="300"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
            </g>

            <path
              d="M0,250 C50,230 100,180 150,190 C200,200 250,150 300,140 C350,130 400,100 450,80 C500,60 550,70 600,90 C650,110 700,130 750,120 C800,110 850,90 900,100 C950,110 1000,130 1000,130"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
            <path
              d="M0,250 C50,230 100,180 150,190 C200,200 250,150 300,140 C350,130 400,100 450,80 C500,60 550,70 600,90 C650,110 700,130 750,120 C800,110 850,90 900,100 C950,110 1000,130 1000,130 L1000,300 L0,300 Z"
              fill="url(#gradient)"
            />

            {[
              [0, 250],
              [150, 190],
              [300, 140],
              [450, 80],
              [600, 90],
              [750, 120],
              [900, 100],
              [1000, 130],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3" fill="white" stroke="#8b5cf6" strokeWidth="1.5" />
            ))}
          </svg>

          <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-[10px] text-gray-500 py-2">
            <div>500</div>
            <div>400</div>
            <div>300</div>
            <div>200</div>
            <div>100</div>
            <div>0</div>
          </div>

          <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-gray-500 px-2">
            <div>Jan</div>
            <div>Feb</div>
            <div>Mar</div>
            <div>Apr</div>
            <div>May</div>
            <div>Jun</div>
            <div>Jul</div>
          </div>
        </div>
      </CardContent>
    </>
  )
}
