import { useEffect, useState } from "react";
import TabNavigation from "@/components/TabNavigation";
import MacroProgressCard from "@/components/MacroProgressCard";
import WeeklyProgressChart from "@/components/WeeklyProgressChart";
import MealItem from "@/components/MealItem";
import AIRecommendation from "@/components/AIRecommendation";
import QuickMeal from "@/components/QuickMeal";
import AddMealDialog from "@/components/AddMealDialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMacros } from "@/hooks/useMacros";
import { useMeals } from "@/hooks/useMeals";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const { toast } = useToast();
  const { macros, dailyLog, userGoals, isLoading: macrosLoading } = useMacros();
  const { favoriteMeals, todayMeals, isLoading: mealsLoading } = useMeals();

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Format macros with percentages
  const formattedMacros = [
    {
      name: "Proteínas",
      current: macros?.protein || 0,
      goal: userGoals?.proteinGoal || 0,
      color: "primary"
    },
    {
      name: "Carbohidratos",
      current: macros?.carbs || 0,
      goal: userGoals?.carbsGoal || 0,
      color: "accent"
    },
    {
      name: "Grasas",
      current: macros?.fat || 0,
      goal: userGoals?.fatGoal || 0,
      color: "secondary"
    }
  ];

  const handleAddMeal = () => {
    setIsAddMealOpen(true);
  };

  // Show toast message if there's an error
  useEffect(() => {
    if (!macrosLoading && !userGoals) {
      toast({
        title: "No se pudieron cargar tus objetivos",
        description: "Por favor configura tus objetivos de macronutrientes",
        variant: "destructive"
      });
    }
  }, [macrosLoading, userGoals, toast]);

  return (
    <>
      <TabNavigation activeTab="Dashboard" />
      
      <div className="container mx-auto px-4 pb-20">
        {/* Daily Progress Summary */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Progreso del Día</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{currentDate}</span>
            </div>
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

        {/* Weekly Progress */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Progreso Semanal</h2>
            <Button variant="link" className="text-primary p-0">
              Ver detalles
            </Button>
          </div>

          <WeeklyProgressChart />
        </section>

        {/* Today's Meals */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Comidas de Hoy</h2>
            <Button 
              onClick={handleAddMeal}
              className="text-sm"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Añadir comida
            </Button>
          </div>

          <div className="space-y-4">
            {mealsLoading ? (
              <div className="text-center py-4">Cargando comidas...</div>
            ) : todayMeals.length > 0 ? (
              todayMeals.map((meal, index) => (
                <MealItem key={index} meal={meal} />
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No hay comidas registradas para hoy</p>
                <Button 
                  onClick={handleAddMeal} 
                  variant="outline" 
                  className="mt-2"
                >
                  Añadir primera comida
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* AI Assistant */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Asistente IA</h2>
          </div>

          <AIRecommendation />
        </section>

        {/* Quick Meals */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Comidas Frecuentes</h2>
            <Button variant="link" className="text-primary p-0">
              Ver todas
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mealsLoading ? (
              <div className="text-center py-4">Cargando comidas...</div>
            ) : favoriteMeals.slice(0, 4).map((meal, index) => (
              <QuickMeal key={index} meal={meal} />
            ))}
          </div>
        </section>
      </div>

      {/* Floating Action Button for mobile */}
      <Button 
        onClick={handleAddMeal}
        className="md:hidden fixed right-6 bottom-20 w-14 h-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Meal Dialog */}
      <AddMealDialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen} />
    </>
  );
}
