import { BellIcon, Settings, User, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function Header() {
  const { user, isLoading, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Obtener iniciales de nombre de usuario
  const getUserInitials = (username: string) => {
    if (!username) return "?";
    const parts = username.split(/[\s_-]/); // Dividir por espacios, guiones o guiones bajos
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-primary text-white shadow-md z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">NutriTrack</h1>
        {user ? (
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-primary-dark rounded-full">
              <BellIcon className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-white/20 hover:bg-white/30">
                  <span className="text-sm font-medium">
                    {getUserInitials(user.username)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
                  {user.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                  {logoutMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link href="/auth">
            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white">
              Iniciar sesión
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
