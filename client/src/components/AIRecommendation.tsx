import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react"; // Cambiado de Robot a Bot
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useMacros } from "@/hooks/useMacros";
import { useToast } from "@/hooks/use-toast";
import CreateAIMealDialog from "@/components/CreateAIMealDialog";

export default function AIRecommendation() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { lastAIMealRequest, saveAIMeal, isLoading } = useAIAssistant();
  const { macros, userGoals } = useMacros();
  const { toast } = useToast();

  const macroNeeds = userGoals ? {
    protein: Math.max(0, userGoals.proteinGoal - (macros?.protein || 0)),
    carbs: Math.max(0, userGoals.carbsGoal - (macros?.carbs || 0)),
    fat: Math.max(0, userGoals.fatGoal - (macros?.fat || 0))
  } : null;

  const handleSaveMeal = async () => {
    if (!lastAIMealRequest?.id) return;
    
    try {
      await saveAIMeal(lastAIMealRequest.id);
      toast({
        title: "Comida guardada",
        description: "La comida ha sido guardada en tu lista.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la comida.",
        variant: "destructive",
      });
    }
  };

  const handleRequestNewMeal = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">NutriBot</h3>
              <p className="text-sm text-gray-500">Tu asistente de nutrición personal</p>
            </div>
          </div>

          {lastAIMealRequest?.result ? (
            <div className="p-4 bg-gray-100 rounded-lg mb-4">
              <p className="text-sm">Para completar tus macros del día, te recomiendo:</p>
              <p className="font-medium mt-2">{lastAIMealRequest.result.name}</p>
              <p className="text-sm mt-1">{lastAIMealRequest.result.description}</p>
              
              <ul className="mt-2 list-disc list-inside text-sm">
                {lastAIMealRequest.result.ingredients.slice(0, 3).map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
                {lastAIMealRequest.result.ingredients.length > 3 && (
                  <li>y {lastAIMealRequest.result.ingredients.length - 3} ingredientes más...</li>
                )}
              </ul>
              
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-white">
                  <p className="text-xs text-gray-500">Proteínas</p>
                  <p className="font-medium text-sm">{lastAIMealRequest.result.protein}g</p>
                </div>
                <div className="p-2 rounded bg-white">
                  <p className="text-xs text-gray-500">Carbohidratos</p>
                  <p className="font-medium text-sm">{lastAIMealRequest.result.carbs}g</p>
                </div>
                <div className="p-2 rounded bg-white">
                  <p className="text-xs text-gray-500">Grasas</p>
                  <p className="font-medium text-sm">{lastAIMealRequest.result.fat}g</p>
                </div>
              </div>
              
              <div className="mt-3 flex justify-end space-x-2">
                <Button 
                  onClick={handleRequestNewMeal}
                  variant="outline" 
                  size="sm"
                >
                  Otra opción
                </Button>
                <Button 
                  onClick={handleSaveMeal}
                  size="sm"
                >
                  Guardar comida
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-100 rounded-lg mb-4 text-center">
              <p className="text-sm mb-3">
                {isLoading 
                  ? "Generando recomendación personalizada..." 
                  : "No hay recomendaciones recientes. ¡Genera una con el asistente de IA!"}
              </p>
              {!isLoading && (
                <Button 
                  onClick={handleRequestNewMeal}
                  size="sm"
                  className="mx-auto"
                >
                  Generar recomendación
                </Button>
              )}
            </div>
          )}

          <div className="flex">
            <Button 
              variant="ghost" 
              className="flex-1 text-sm text-primary"
              onClick={() => window.location.href = "/ai-assistant"}
            >
              Preguntar al asistente
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1 text-sm text-primary"
              onClick={() => setIsDialogOpen(true)}
            >
              Crear comida con IA
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateAIMealDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        defaultMacroNeeds={macroNeeds}
      />
    </>
  );
}
