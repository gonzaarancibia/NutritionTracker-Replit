import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  UtensilsCrossed, 
  Bot, 
  BarChart3,
  UserCircle
} from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10">
      <div className="flex justify-around">
        <Link 
          href="/"
          className={`py-3 px-4 flex flex-col items-center ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs mt-1">Inicio</span>
        </Link>
        
        <Link 
          href="/daily-log"
          className={`py-3 px-4 flex flex-col items-center ${isActive('/daily-log') ? 'text-primary' : 'text-gray-500'}`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Diario</span>
        </Link>
        
        <Link 
          href="/my-meals"
          className={`py-3 px-4 flex flex-col items-center ${isActive('/my-meals') ? 'text-primary' : 'text-gray-500'}`}
        >
          <UtensilsCrossed className="h-5 w-5" />
          <span className="text-xs mt-1">Comidas</span>
        </Link>
        
        <Link 
          href="/ai-assistant"
          className={`py-3 px-4 flex flex-col items-center ${isActive('/ai-assistant') ? 'text-primary' : 'text-gray-500'}`}
        >
          <Bot className="h-5 w-5" />
          <span className="text-xs mt-1">IA</span>
        </Link>
        
        <Link 
          href="/statistics"
          className={`py-3 px-4 flex flex-col items-center ${isActive('/statistics') ? 'text-primary' : 'text-gray-500'}`}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs mt-1">Stats</span>
        </Link>
        
        <Link 
          href="/profile"
          className={`py-3 px-4 flex flex-col items-center ${isActive('/profile') ? 'text-primary' : 'text-gray-500'}`}
        >
          <UserCircle className="h-5 w-5" />
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}
