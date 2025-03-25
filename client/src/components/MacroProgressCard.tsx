import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MacroProgressCardProps {
  name: string;
  current: number;
  goal: number;
  color: "primary" | "accent" | "secondary";
}

export default function MacroProgressCard({ name, current, goal, color }: MacroProgressCardProps) {
  const percentage = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;
  const remaining = goal - current > 0 ? goal - current : 0;

  const getColorClass = () => {
    switch (color) {
      case "primary":
        return "bg-primary";
      case "accent":
        return "bg-amber-500"; // accent color
      case "secondary":
        return "bg-green-500"; // secondary color
      default:
        return "bg-primary";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900">{name}</h3>
          <span className={`text-sm font-bold text-${color === "primary" ? "primary" : color === "accent" ? "amber-500" : "green-500"}`}>
            {percentage}%
          </span>
        </div>
        <Progress 
          value={percentage} 
          className="h-2.5 mb-2"
          indicatorClassName={getColorClass()}
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{current}g / {goal}g</span>
          {remaining > 0 && <span>Faltan: {remaining}g</span>}
        </div>
      </CardContent>
    </Card>
  );
}
