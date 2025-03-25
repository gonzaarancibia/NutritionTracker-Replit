import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Meal, type MealEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMeals } from "@/hooks/useMeals";

interface MealItemProps {
  meal: Meal & { time?: string };
  onEditClick?: () => void;
}

export default function MealItem({ meal, onEditClick }: MealItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { deleteMeal } = useMeals();

  const formatMealType = (type: string) => {
    switch (type.toLowerCase()) {
      case "desayuno":
        return "Desayuno";
      case "almuerzo":
        return "Almuerzo";
      case "cena":
        return "Cena";
      case "merienda":
        return "Merienda";
      default:
        return type;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMeal(meal.id);
      toast({
        title: "Comida eliminada",
        description: "La comida ha sido eliminada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la comida.",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2 text-xs bg-gray-100">
                  {formatMealType(meal.mealType)}
                </Badge>
                <h3 className="font-medium">{meal.name}</h3>
              </div>
              {meal.time && (
                <p className="text-sm text-gray-500 mt-1">{meal.time}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-500 p-1 hover:text-primary rounded">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEditClick}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-gray-100">
              <p className="text-xs text-gray-500">Proteínas</p>
              <p className="font-medium text-sm">{meal.protein}g</p>
            </div>
            <div className="p-2 rounded bg-gray-100">
              <p className="text-xs text-gray-500">Carbohidratos</p>
              <p className="font-medium text-sm">{meal.carbs}g</p>
            </div>
            <div className="p-2 rounded bg-gray-100">
              <p className="text-xs text-gray-500">Grasas</p>
              <p className="font-medium text-sm">{meal.fat}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comida?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta comida?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
