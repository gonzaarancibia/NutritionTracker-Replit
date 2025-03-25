import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Meal, type MealEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMeals() {
  const { toast } = useToast();

  // Fetch all meals
  const { 
    data: allMeals = [], 
    isLoading: isLoadingMeals
  } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  // Fetch favorite meals
  const { 
    data: favoriteData = [], 
    isLoading: isLoadingFavorites
  } = useQuery<Meal[]>({
    queryKey: ["/api/meals/favorites"],
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Fetch daily log for today
  const { 
    data: dailyLog, 
    isLoading: isLoadingDailyLog
  } = useQuery<any>({
    queryKey: ["/api/daily-logs", { date: today }],
  });

  // Today's meals from the daily log
  const todayMeals = useMemo(() => {
    if (!dailyLog || !dailyLog.mealEntries || !allMeals.length) return [];
    
    return dailyLog.mealEntries.map((entry: MealEntry) => {
      const meal = allMeals.find(m => m.id === entry.mealId);
      if (!meal) return null;
      
      return {
        ...meal,
        time: entry.time
      };
    }).filter(Boolean);
  }, [dailyLog, allMeals]);

  // Mutation to create a meal
  const createMealMutation = useMutation({
    mutationFn: async (data: Partial<Meal>) => {
      const response = await apiRequest("POST", "/api/meals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la comida",
        variant: "destructive",
      });
    }
  });

  // Mutation to update a meal
  const updateMealMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Meal> }) => {
      const response = await apiRequest("PUT", `/api/meals/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/meals/favorites"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la comida",
        variant: "destructive",
      });
    }
  });

  // Mutation to delete a meal
  const deleteMealMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/meals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/meals/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-logs"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la comida",
        variant: "destructive",
      });
    }
  });

  // Mutation to toggle favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/meals/${id}/toggle-favorite`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/meals/favorites"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de favorito",
        variant: "destructive",
      });
    }
  });

  // Mutation to add a meal to daily log
  const addMealToDailyLogMutation = useMutation({
    mutationFn: async ({ 
      meal, 
      date, 
      time 
    }: { 
      meal: Meal; 
      date: Date; 
      time: string;
    }) => {
      // First, get or create the daily log for this date
      const dateString = date.toISOString().split('T')[0];
      const logResponse = await apiRequest("GET", `/api/daily-logs?date=${dateString}`);
      const log = await logResponse.json();
      
      const mealEntry: MealEntry = {
        mealId: meal.id,
        time,
        servings: 1,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        calories: meal.calories
      };
      
      // If log exists, add meal to it, otherwise create a new log
      if (log && log.id) {
        const response = await apiRequest("POST", `/api/daily-logs/${log.id}/add-meal`, mealEntry);
        return response.json();
      } else {
        // Create a new daily log with this meal
        const newLog = {
          date: dateString,
          mealEntries: [mealEntry],
          totalProtein: meal.protein,
          totalCarbs: meal.carbs,
          totalFat: meal.fat,
          totalCalories: meal.calories
        };
        
        const response = await apiRequest("POST", "/api/daily-logs", newLog);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-logs"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo añadir la comida al registro diario",
        variant: "destructive",
      });
    }
  });

  // Function to get meals for a specific date
  const getMealsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    if (dateString === today && todayMeals.length > 0) {
      return todayMeals;
    }
    
    // For other dates, you would need to fetch the log for that specific date
    // This is a simplified implementation
    return [];
  };

  // Function to search meals
  const searchMeals = (query: string) => {
    if (!query.trim()) return allMeals;
    
    return allMeals.filter(meal => 
      meal.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    meals: allMeals,
    favoriteMeals: favoriteData,
    todayMeals,
    isLoading: isLoadingMeals || isLoadingFavorites || isLoadingDailyLog,
    getMealsForDate,
    searchMeals,
    createMeal: async (data: Partial<Meal>) => {
      return createMealMutation.mutateAsync(data);
    },
    updateMeal: async (id: number, data: Partial<Meal>) => {
      return updateMealMutation.mutateAsync({ id, data });
    },
    deleteMeal: async (id: number) => {
      return deleteMealMutation.mutateAsync(id);
    },
    toggleFavoriteMeal: async (id: number) => {
      return toggleFavoriteMutation.mutateAsync(id);
    },
    addMealToDailyLog: async (meal: Meal, date: Date, time: string) => {
      return addMealToDailyLogMutation.mutateAsync({ meal, date, time });
    }
  };
}
