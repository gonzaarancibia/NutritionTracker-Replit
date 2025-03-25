import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { useMeals } from "@/hooks/useMeals";
import { useToast } from "@/hooks/use-toast";
import { type Meal } from "@shared/schema";
import { TimePicker } from "@/components/ui/time-picker";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  protein: z.coerce.number().min(0, "No puede ser negativo"),
  carbs: z.coerce.number().min(0, "No puede ser negativo"),
  fat: z.coerce.number().min(0, "No puede ser negativo"),
  calories: z.coerce.number().min(0, "No puede ser negativo"),
  mealType: z.string(),
  time: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMeal?: Meal;
  selectedDate?: Date;
}

export default function AddMealDialog({ 
  open, 
  onOpenChange, 
  editMeal, 
  selectedDate = new Date() 
}: AddMealDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createMeal, updateMeal, addMealToDailyLog } = useMeals();
  const { toast } = useToast();

  const defaultValues: FormValues = {
    name: "",
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
    mealType: "Desayuno",
    time: format(new Date().setHours(8, 0), "HH:mm"),
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editMeal ? {
      name: editMeal.name,
      protein: editMeal.protein,
      carbs: editMeal.carbs,
      fat: editMeal.fat,
      calories: editMeal.calories,
      mealType: editMeal.mealType,
      time: format(new Date().setHours(8, 0), "HH:mm"), // Default time if not provided
    } : defaultValues,
  });

  // Reset form when dialog opens/closes or editMeal changes
  useEffect(() => {
    if (open) {
      if (editMeal) {
        form.reset({
          name: editMeal.name,
          protein: editMeal.protein,
          carbs: editMeal.carbs,
          fat: editMeal.fat,
          calories: editMeal.calories || 0,
          mealType: editMeal.mealType,
          time: format(new Date().setHours(8, 0), "HH:mm"),
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [open, editMeal, form]);

  // Calculate calories automatically when macros change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "protein" || name === "carbs" || name === "fat") {
        const protein = form.getValues("protein") || 0;
        const carbs = form.getValues("carbs") || 0;
        const fat = form.getValues("fat") || 0;
        
        // Calories calculation: protein (4) + carbs (4) + fat (9)
        const calories = (protein * 4) + (carbs * 4) + (fat * 9);
        form.setValue("calories", Math.round(calories));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      if (editMeal) {
        // Update existing meal
        await updateMeal(editMeal.id, data);
        toast({
          title: "Comida actualizada",
          description: "La comida ha sido actualizada correctamente",
        });
      } else {
        // Create new meal
        const newMeal = await createMeal(data);
        
        // Add to daily log if time is provided
        if (data.time) {
          await addMealToDailyLog(newMeal, selectedDate, data.time);
        }
        
        toast({
          title: "Comida añadida",
          description: "La comida ha sido añadida correctamente",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la comida",
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
          <DialogTitle>
            {editMeal ? "Editar comida" : "Añadir comida"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Ensalada de pollo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!editMeal && (
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proteínas (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbos (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grasas (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calorías (calculadas)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} readOnly />
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
                {isSubmitting ? "Guardando..." : editMeal ? "Actualizar" : "Añadir"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Note: TimePicker has been moved to client/src/components/ui/time-picker.tsx
