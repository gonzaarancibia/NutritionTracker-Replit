import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TabNavigation from "@/components/TabNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UserCircle, Save } from "lucide-react";

const formSchema = z.object({
  proteinGoal: z.coerce
    .number()
    .min(0, "No puede ser negativo")
    .max(500, "El valor es demasiado alto"),
  carbsGoal: z.coerce
    .number()
    .min(0, "No puede ser negativo")
    .max(500, "El valor es demasiado alto"),
  fatGoal: z.coerce
    .number()
    .min(0, "No puede ser negativo")
    .max(500, "El valor es demasiado alto"),
  caloriesGoal: z.coerce
    .number()
    .min(0, "No puede ser negativo")
    .max(5000, "El valor es demasiado alto")
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user goals
  const { data: userGoals, isLoading } = useQuery({
    queryKey: ["/api/user-goals"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proteinGoal: 0,
      carbsGoal: 0,
      fatGoal: 0,
      caloriesGoal: 0,
    },
  });

  // Update form when user goals are loaded
  useEffect(() => {
    if (userGoals) {
      form.reset({
        proteinGoal: userGoals.proteinGoal || 0,
        carbsGoal: userGoals.carbsGoal || 0,
        fatGoal: userGoals.fatGoal || 0,
        caloriesGoal: userGoals.caloriesGoal || 0,
      });
    }
  }, [userGoals, form]);

  // Auto-calculate calories when macros change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "proteinGoal" || name === "carbsGoal" || name === "fatGoal") {
        const protein = form.getValues("proteinGoal") || 0;
        const carbs = form.getValues("carbsGoal") || 0;
        const fat = form.getValues("fatGoal") || 0;
        
        // Calories calculation: protein (4) + carbs (4) + fat (9)
        const calories = (protein * 4) + (carbs * 4) + (fat * 9);
        form.setValue("caloriesGoal", Math.round(calories));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Mutation to save user goals
  const saveGoalsMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/user-goals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-goals"] });
      toast({
        title: "Objetivos guardados",
        description: "Los objetivos de macros han sido actualizados",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron guardar los objetivos",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await saveGoalsMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TabNavigation activeTab="Perfil" />
      
      <div className="container mx-auto px-4 pb-20">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <UserCircle className="mr-2 h-6 w-6" />
          Mi Perfil
        </h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Objetivos de Macronutrientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="proteinGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proteínas diarias (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="carbsGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carbohidratos diarios (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fatGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grasas diarias (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="caloriesGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calorías diarias (automático)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} readOnly className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Guardando..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar objetivos
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">Esta sección mostrará información del perfil del usuario cuando implementemos el sistema de autenticación.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}