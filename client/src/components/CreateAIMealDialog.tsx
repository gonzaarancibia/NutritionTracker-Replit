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
import { LoaderCircle, Sparkles } from "lucide-react";
import { MacroNeeds } from "@/lib/openai";

const formSchema = z.object({
  prompt: z.string().min(3, "Por favor, describe la comida que deseas generar"),
  mealType: z.string(),
  useRemainingMacros: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateAIMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMacroNeeds?: MacroNeeds | null;
}

export default function CreateAIMealDialog({ 
  open, 
  onOpenChange, 
  defaultMacroNeeds
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
    },
  });

  // Reset form and set macroNeeds when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        prompt: "",
        mealType: "Comida",
        useRemainingMacros: true,
      });
      
      if (defaultMacroNeeds) {
        setMacroNeeds(defaultMacroNeeds);
      }
    }
  }, [open, defaultMacroNeeds, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Include macroNeeds if the option is selected
      const macroToUse = data.useRemainingMacros ? macroNeeds : undefined;
      
      // Build prompt with meal type and user input
      let enhancedPrompt = data.prompt;
      if (data.mealType && data.mealType !== "Comida") {
        enhancedPrompt = `${data.mealType}: ${enhancedPrompt}`;
      }
      
      // Request meal from AI
      const aiRequest = await requestAIMeal(enhancedPrompt, macroToUse);
      
      if (aiRequest?.result) {
        // Auto-save the meal if successful
        await saveAIMeal(aiRequest.id);
        
        toast({
          title: "Comida creada con éxito",
          description: "La comida ha sido creada y guardada en tu lista",
        });
        
        onOpenChange(false);
      } else {
        throw new Error("No se pudo generar la comida");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar la comida con IA. Intente con una descripción diferente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Crear comida con IA
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe la comida que quieres</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ej: Una comida alta en proteínas con pollo, que sea fácil de preparar"
                      {...field}
                      className="min-h-[100px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="text-sm text-gray-500">
              <p>La IA generará una receta completa con sus macronutrientes basada en tu descripción.</p>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  "Generar comida"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
