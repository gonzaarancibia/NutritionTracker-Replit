import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import TabNavigation from "@/components/TabNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMacros } from "@/hooks/useMacros";
import { useMeals } from "@/hooks/useMeals";
import MacroProgressCard from "@/components/MacroProgressCard";
import MealItem from "@/components/MealItem";
import AddMealDialog from "@/components/AddMealDialog";

export default function DailyLog() {
  const [date, setDate] = useState<Date>(new Date());
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  
  const { macros, userGoals, getDailyLogForDate } = useMacros();
  const { getMealsForDate } = useMeals();
  
  const selectedDateMeals = getMealsForDate(date);
  const dailyLog = getDailyLogForDate(date);
  
  const formattedDate = format(date, "d 'de' MMMM, yyyy", { locale: es });
  
  // Format macros with percentages
  const formattedMacros = [
    {
      name: "Proteínas",
      current: dailyLog?.totalProtein || 0,
      goal: userGoals?.proteinGoal || 0,
      color: "primary"
    },
    {
      name: "Carbohidratos",
      current: dailyLog?.totalCarbs || 0,
      goal: userGoals?.carbsGoal || 0,
      color: "accent"
    },
    {
      name: "Grasas",
      current: dailyLog?.totalFat || 0,
      goal: userGoals?.fatGoal || 0,
      color: "secondary"
    }
  ];

  return (
    <>
      <TabNavigation activeTab="Registro Diario" />
      
      <div className="container mx-auto px-4 pb-20">
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Registro Diario</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formattedMacros.map((macro) => (
              <MacroProgressCard
                key={macro.name}
                name={macro.name}
                current={macro.current}
                goal={macro.goal}
                color={macro.color as "primary" | "accent" | "secondary"}
              />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Comidas</h2>
            <Button 
              onClick={() => setIsAddMealOpen(true)}
              variant="default"
              size="sm"
            >
              Añadir comida
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              {selectedDateMeals.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateMeals.map((meal, index) => (
                    <MealItem key={index} meal={meal} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No hay comidas registradas para este día</p>
                  <Button 
                    onClick={() => setIsAddMealOpen(true)}
                    variant="outline"
                  >
                    Añadir primera comida
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-2">Resumen Calórico</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Calorías Objetivo</p>
                  <p className="font-bold text-lg">2,400</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Calorías Consumidas</p>
                  <p className="font-bold text-lg">{dailyLog?.totalCalories || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Add Meal Dialog */}
      <AddMealDialog 
        open={isAddMealOpen} 
        onOpenChange={setIsAddMealOpen} 
        selectedDate={date} 
      />
    </>
  );
}
