import { useState } from "react";
import TabNavigation from "@/components/TabNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMeals } from "@/hooks/useMeals";
import QuickMeal from "@/components/QuickMeal";
import AddMealDialog from "@/components/AddMealDialog";
import CreateAIMealDialog from "@/components/CreateAIMealDialog";
import { Search, Plus } from "lucide-react";

export default function MyMeals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isCreateAIMealOpen, setIsCreateAIMealOpen] = useState(false);
  const { meals, favoriteMeals, isLoading, searchMeals } = useMeals();
  
  // Filter meals based on search term
  const filteredMeals = searchTerm ? searchMeals(searchTerm) : meals;

  return (
    <>
      <TabNavigation activeTab="Mis Comidas" />
      
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Mis Comidas</h2>
          
          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                className="pl-8"
                placeholder="Buscar comidas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddMealOpen(true)} size="sm">
              Manual
            </Button>
            <Button onClick={() => setIsCreateAIMealOpen(true)} size="sm" variant="secondary">
              Con IA
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4 w-full md:w-auto">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="favorites">Favoritas</TabsTrigger>
            <TabsTrigger value="ai">Creadas con IA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-6">Cargando comidas...</div>
            ) : filteredMeals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredMeals.map((meal) => (
                  <QuickMeal key={meal.id} meal={meal} showActions />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 mb-2">
                  {searchTerm 
                    ? "No se encontraron comidas que coincidan con tu búsqueda" 
                    : "No tienes comidas guardadas"}
                </p>
                <Button 
                  onClick={() => setIsAddMealOpen(true)}
                  variant="outline"
                  className="mr-2"
                >
                  Añadir comida manual
                </Button>
                <Button 
                  onClick={() => setIsCreateAIMealOpen(true)}
                  variant="outline"
                >
                  Crear con IA
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites">
            {isLoading ? (
              <div className="text-center py-6">Cargando comidas...</div>
            ) : favoriteMeals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {favoriteMeals.map((meal) => (
                  <QuickMeal key={meal.id} meal={meal} showActions />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 mb-2">No tienes comidas favoritas</p>
                <p className="text-sm text-gray-400 mb-4">Marca tus comidas como favoritas para acceder rápidamente a ellas</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ai">
            {isLoading ? (
              <div className="text-center py-6">Cargando comidas...</div>
            ) : meals.filter(m => m.isAIGenerated).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {meals
                  .filter(m => m.isAIGenerated)
                  .map((meal) => (
                    <QuickMeal key={meal.id} meal={meal} showActions />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 mb-2">No tienes comidas creadas con IA</p>
                <Button 
                  onClick={() => setIsCreateAIMealOpen(true)}
                  variant="outline"
                >
                  Crear comida con IA
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating action button for mobile */}
      <Button 
        onClick={() => setIsAddMealOpen(true)}
        className="md:hidden fixed right-6 bottom-20 w-14 h-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Meal Dialog */}
      <AddMealDialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen} />
      
      {/* Create AI Meal Dialog */}
      <CreateAIMealDialog open={isCreateAIMealOpen} onOpenChange={setIsCreateAIMealOpen} />
    </>
  );
}
