import { useState } from "react";
import TabNavigation from "@/components/TabNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useMacros } from "@/hooks/useMacros";
import { LoaderCircle, MessageSquare, Wand2 } from "lucide-react";
import CreateAIMealDialog from "@/components/CreateAIMealDialog";
import AIRecommendation from "@/components/AIRecommendation";

export default function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const { requestAIMeal } = useAIAssistant();
  const { macros, userGoals } = useMacros();

  const macroNeeds = userGoals ? {
    protein: Math.max(0, userGoals.proteinGoal - (macros?.protein || 0)),
    carbs: Math.max(0, userGoals.carbsGoal - (macros?.carbs || 0)),
    fat: Math.max(0, userGoals.fatGoal - (macros?.fat || 0))
  } : null;

  const handleAskAI = async () => {
    if (!prompt.trim()) return;
    
    setIsAskingAI(true);
    setAIResponse(null);
    
    try {
      // In a real implementation, this would call the AI API
      // For this demo, we'll simulate a response
      
      // Give the AI time to "think"
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = `Basado en tu pregunta "${prompt}", puedo recomendarte lo siguiente:\n\n` +
        "1. Para mantener un balance adecuado de macronutrientes, asegúrate de consumir proteínas en cada comida.\n" +
        "2. Los carbohidratos complejos te darán energía sostenida durante el día.\n" +
        "3. No olvides incluir grasas saludables como aguacate o aceite de oliva.\n\n" +
        "¿Necesitas alguna recomendación específica para alguna comida del día?";
      
      setAIResponse(response);
    } catch (error) {
      setAIResponse("Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, intenta de nuevo más tarde.");
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <>
      <TabNavigation activeTab="Asistente IA" />
      
      <div className="container mx-auto px-4 pb-20">
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Asistente IA</h2>
          
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recomendación del día</CardTitle>
              <CardDescription>
                Basado en tus macros restantes del día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIRecommendation />
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Preguntar al asistente</CardTitle>
              <CardDescription>
                Haz preguntas sobre nutrición, recetas o recomendaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Tu pregunta</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Ej: ¿Qué alimentos tienen más proteína?"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="resize-none min-h-[100px]"
                  />
                </div>
                
                <Button 
                  onClick={handleAskAI}
                  disabled={isAskingAI || !prompt.trim()}
                  className="w-full"
                >
                  {isAskingAI ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Pensando...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Preguntar al asistente
                    </>
                  )}
                </Button>
                
                {aiResponse && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
                    <p className="font-medium mb-2">Respuesta:</p>
                    <div className="whitespace-pre-line">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Crear comida con IA</CardTitle>
              <CardDescription>
                Genera recetas personalizadas basadas en tus necesidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {macroNeeds && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-2 rounded bg-blue-50 text-center">
                      <p className="text-xs text-gray-500">Proteínas</p>
                      <p className="font-medium">{macroNeeds.protein}g</p>
                    </div>
                    <div className="p-2 rounded bg-blue-50 text-center">
                      <p className="text-xs text-gray-500">Carbohidratos</p>
                      <p className="font-medium">{macroNeeds.carbs}g</p>
                    </div>
                    <div className="p-2 rounded bg-blue-50 text-center">
                      <p className="text-xs text-gray-500">Grasas</p>
                      <p className="font-medium">{macroNeeds.fat}g</p>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="w-full"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Crear comida con IA
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Create AI Meal Dialog */}
      <CreateAIMealDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        defaultMacroNeeds={macroNeeds}
      />
    </>
  );
}
