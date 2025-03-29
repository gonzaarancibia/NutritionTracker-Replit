import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Sparkles, Calculator, ChefHat } from "lucide-react";
import { MacroNeeds } from "@/lib/openai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  prompt: z.string().min(3, "Por favor, describe la comida o los ingredientes"),
  mealType: z.string(),
  useRemainingMacros: z.boolean().optional(),
  mode: z.enum(["recipe", "analysis"]), // New field to distinguish between recipe generation and food analysis
});

type FormValues = z.infer<typeof formSchema>;

interface CreateAIMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMacroNeeds?: MacroNeeds | null;
  lastAIMealRequest?: any; // Add lastAIMealRequest prop
}

export default function CreateAIMealDialog({ 
  open, 
  onOpenChange, 
  defaultMacroNeeds,
  lastAIMealRequest
}: CreateAIMealDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [macroNeeds, setMacroNeeds] = useState<MacroNeeds | null>(null);
  const { requestAIMeal, saveAIMeal } = useAIAssistant();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      mealType: "Comida",
      useRemainingMacros: true,
      mode: "recipe", // Default to recipe creation mode
    },
  });

  // Reset form and set macroNeeds when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        prompt: "",
        mealType: "Comida",
        useRemainingMacros: true,
        mode: "recipe",
      });

      if (defaultMacroNeeds) {
        setMacroNeeds(defaultMacroNeeds);
      }
    }
  }, [open, defaultMacroNeeds, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // Preparar el prompt según el modo seleccionado
      let enhancedPrompt = data.prompt;

      // Para modo de receta, agregar tipo de comida
      if (data.mode === "recipe" && data.mealType && data.mealType !== "Comida") {
        enhancedPrompt = `${data.mealType}: ${enhancedPrompt}`;
      }

      // Para modo de análisis, asegurarse que el prompt sea claro
      if (data.mode === "analysis" && !enhancedPrompt.toLowerCase().includes("estoy haciendo")) {
        enhancedPrompt = `Estoy haciendo ${enhancedPrompt}`;
      }

      // Incluir macros solo en modo de receta y si están disponibles
      let macroToUse: MacroNeeds | undefined = undefined;
      if (data.mode === "recipe" && data.useRemainingMacros && macroNeeds) {
        macroToUse = macroNeeds;
      }

      // Request meal from AI
      const aiRequest = await requestAIMeal(enhancedPrompt, macroToUse, data.mode);

      if (aiRequest?.result) {
        // Auto-save the meal if successful
        await saveAIMeal(aiRequest.id);

        toast({
          title: data.mode === "recipe" ? "Receta creada con éxito" : "Cálculo de macros completado",
          description: "La comida ha sido creada y guardada en tu lista de comidas",
        });

        onOpenChange(false);
      } else {
        throw new Error(data.mode === "recipe" ? "No se pudo generar la receta" : "No se pudieron calcular los macros");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: data.mode === "recipe" 
          ? "No se pudo generar la receta con IA. Intente con otra descripción."
          : "No se pudieron calcular los macronutrientes. Intente describir los ingredientes con más detalle.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Crear comida con IA
          </DialogTitle>
          {lastAIMealRequest?.result?.calculation_explanation && (
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
              <p className="text-sm font-medium text-blue-900 mb-1">Explicación del cálculo:</p>
              <p className="text-sm text-blue-800 whitespace-pre-line">{lastAIMealRequest.result.calculation_explanation}</p>
            </div>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Modo de IA - Pestañas */}
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tabs 
                      value={field.value} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset prompt based on selected mode
                        form.setValue("prompt", "");
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="recipe" className="flex items-center justify-center">
                          <ChefHat className="h-4 w-4 mr-2" />
                          Crear Receta
                        </TabsTrigger>
                        <TabsTrigger value="analysis" className="flex items-center justify-center">
                          <Calculator className="h-4 w-4 mr-2" />
                          Calcular Macros
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="recipe" className="mt-4">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="mealType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de comida</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona el tipo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Desayuno">Desayuno</SelectItem>
                                    <SelectItem value="Almuerzo">Almuerzo</SelectItem>
                                    <SelectItem value="Cena">Cena</SelectItem>
                                    <SelectItem value="Merienda">Merienda</SelectItem>
                                    <SelectItem value="Snack">Snack</SelectItem>
                                    <SelectItem value="Comida">Cualquiera</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {macroNeeds && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium mb-2">Macros restantes para hoy:</p>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded bg-white">
                                  <p className="text-xs text-gray-500">Proteínas</p>
                                  <p className="font-medium text-sm">{macroNeeds.protein}g</p>
                                </div>
                                <div className="p-2 rounded bg-white">
                                  <p className="text-xs text-gray-500">Carbohidratos</p>
                                  <p className="font-medium text-sm">{macroNeeds.carbs}g</p>
                                </div>
                                <div className="p-2 rounded bg-white">
                                  <p className="text-xs text-gray-500">Grasas</p>
                                  <p className="font-medium text-sm">{macroNeeds.fat}g</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <FormDescription>
                            La IA creará una receta completa con sus macronutrientes basada en tu descripción.
                          </FormDescription>
                        </div>
                      </TabsContent>

                      <TabsContent value="analysis" className="mt-4">
                        <FormDescription>
                          Describe lo que estás preparando o comiendo con sus ingredientes y cantidades aproximadas. La IA calculará los macronutrientes por cada 100g.
                        </FormDescription>
                      </TabsContent>
                    </Tabs>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Campo para describir lo que quiere el usuario */}
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("mode") === "recipe" 
                      ? "Describe la comida que quieres generar" 
                      : "Describe los ingredientes de tu comida"}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={form.watch("mode") === "recipe"
                        ? "Ej: Una comida alta en proteínas con pollo, que sea fácil de preparar"
                        : "Ej: Estoy haciendo un pan al horno con 250g harina 000, 30g aceite, 20g azúcar negra"
                      }
                      {...field}
                      className="min-h-[100px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {form.watch("mode") === "recipe" ? "Generando receta..." : "Calculando macros..."}
                  </>
                ) : (
                  form.watch("mode") === "recipe" ? "Generar receta" : "Calcular macros"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}