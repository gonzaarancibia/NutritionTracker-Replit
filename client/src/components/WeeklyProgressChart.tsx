import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useMacros } from "@/hooks/useMacros";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WeeklyProgressChart() {
  const [selectedMacro, setSelectedMacro] = useState("protein");
  const [timeRange, setTimeRange] = useState("week");
  const { weeklyLogs, userGoals } = useMacros();

  // Calculate weekly totals for selected macro
  const macroName = selectedMacro === "protein" 
    ? "proteínas" 
    : selectedMacro === "carbs" 
      ? "carbohidratos" 
      : "grasas";

  const weeklyTotal = weeklyLogs.reduce((sum, log) => {
    if (selectedMacro === "protein") return sum + log.totalProtein;
    if (selectedMacro === "carbs") return sum + log.totalCarbs;
    return sum + log.totalFat;
  }, 0);

  const weeklyGoal = userGoals 
    ? selectedMacro === "protein" 
      ? userGoals.proteinGoal * 7
      : selectedMacro === "carbs"
        ? userGoals.carbsGoal * 7
        : userGoals.fatGoal * 7
    : 0;

  const weeklyPercentage = weeklyGoal > 0 ? Math.round((weeklyTotal / weeklyGoal) * 100) : 0;

  // Chart data
  const chartData = weeklyLogs.map(log => {
    let value = 0;
    if (selectedMacro === "protein") value = log.totalProtein;
    else if (selectedMacro === "carbs") value = log.totalCarbs;
    else value = log.totalFat;
    
    return {
      name: new Date(log.date).toLocaleDateString('es-ES', { weekday: 'short' }),
      value
    };
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button 
              variant={selectedMacro === "protein" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMacro("protein")}
            >
              Proteínas
            </Button>
            <Button 
              variant={selectedMacro === "carbs" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMacro("carbs")}
            >
              Carbohidratos
            </Button>
            <Button 
              variant={selectedMacro === "fat" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMacro("fat")}
            >
              Grasas
            </Button>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="lastWeek">Semana pasada</SelectItem>
              <SelectItem value="month">Últimas 4 semanas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-[200px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar 
                dataKey="value" 
                name={macroName}
                fill={
                  selectedMacro === "protein" 
                    ? "#3498db" 
                    : selectedMacro === "carbs" 
                      ? "#f39c12" 
                      : "#2ecc71"
                } 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-gray-100">
            <p className="text-sm text-gray-500 mb-1">Objetivo Semanal</p>
            <p className="font-bold text-lg text-gray-900">{weeklyGoal}g</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-100">
            <p className="text-sm text-gray-500 mb-1">Consumido</p>
            <p className="font-bold text-lg text-gray-900">{weeklyTotal}g ({weeklyPercentage}%)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
