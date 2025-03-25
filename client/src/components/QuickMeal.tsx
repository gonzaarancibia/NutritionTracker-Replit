import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { type Meal } from "@shared/schema";
import { useMeals } from "@/hooks/useMeals";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import AddMealDialog from "@/components/AddMealDialog";

interface QuickMealProps {
  meal: Meal;
  showActions?: boolean;
}

export default function QuickMeal({ meal, showActions = false }: QuickMealProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toggleFavoriteMeal, deleteMeal } = useMeals();
  const { toast } = useToast();

  const handleToggleFavorite = async () => {
    try {
      await toggleFavoriteMeal(meal.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar favorito",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMeal(meal.id);
      toast({
        title: "Comida eliminada",
        description: "La comida ha sido eliminada correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la comida",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardContent className="p-3 flex flex-col h-full">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium text-sm">{meal.name}</h3>
            {showActions && (
              <div className="flex">
                <Button 
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${meal.isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                  onClick={handleToggleFavorite}
                >
                  <Heart className="h-4 w-4" fill={meal.isFavorite ? "currentColor" : "none"} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          {meal.imageUrl && (
            <div className="h-24 bg-gray-100 rounded-lg mb-2 overflow-hidden">
              <img 
                src={meal.imageUrl} 
                alt={meal.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="mt-auto flex text-xs text-gray-500 space-x-2">
            <span>P: {meal.protein}g</span>
            <span>C: {meal.carbs}g</span>
            <span>G: {meal.fat}g</span>
          </div>
        </CardContent>
      </Card>

      <AddMealDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editMeal={meal}
      />
    </>
  );
}
