import { useState } from "react";
import TabNavigation from "@/components/TabNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMacros } from "@/hooks/useMacros";

export default function Statistics() {
  const [timeRange, setTimeRange] = useState("week");
  const [macroType, setMacroType] = useState("all");
  const { weeklyLogs } = useMacros();

  // Format data for charts
  const dailyData = weeklyLogs.map(log => ({
    name: new Date(log.date).toLocaleDateString('es-ES', { weekday: 'short' }),
    proteinas: log.totalProtein,
    carbohidratos: log.totalCarbs,
    grasas: log.totalFat,
    calorias: log.totalCalories
  }));

  // Calculate weekly averages
  const weeklyAverages = {
    protein: Math.round(dailyData.reduce((sum, day) => sum + day.proteinas, 0) / Math.max(1, dailyData.length)),
    carbs: Math.round(dailyData.reduce((sum, day) => sum + day.carbohidratos, 0) / Math.max(1, dailyData.length)),
    fat: Math.round(dailyData.reduce((sum, day) => sum + day.grasas, 0) / Math.max(1, dailyData.length)),
    calories: Math.round(dailyData.reduce((sum, day) => sum + day.calorias, 0) / Math.max(1, dailyData.length))
  };

  return (
    <>
      <TabNavigation activeTab="Estadísticas" />
      
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Estadísticas</h2>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumen semanal</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Proteínas (prom.)</p>
                  <p className="font-bold text-lg">{weeklyAverages.protein}g</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Carbohidratos (prom.)</p>
                  <p className="font-bold text-lg">{weeklyAverages.carbs}g</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Grasas (prom.)</p>
                  <p className="font-bold text-lg">{weeklyAverages.fat}g</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Calorías (prom.)</p>
                  <p className="font-bold text-lg">{weeklyAverages.calories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Progreso de calorías</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="calorias" 
                    name="Calorías" 
                    stroke="#3498db" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Consumo diario de macronutrientes</CardTitle>
            <Select value={macroType} onValueChange={setMacroType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Macros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="protein">Proteínas</SelectItem>
                <SelectItem value="carbs">Carbohidratos</SelectItem>
                <SelectItem value="fat">Grasas</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {(macroType === "all" || macroType === "protein") && (
                  <Bar dataKey="proteinas" name="Proteínas" fill="#3498db" />
                )}
                {(macroType === "all" || macroType === "carbs") && (
                  <Bar dataKey="carbohidratos" name="Carbohidratos" fill="#f39c12" />
                )}
                {(macroType === "all" || macroType === "fat") && (
                  <Bar dataKey="grasas" name="Grasas" fill="#2ecc71" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
