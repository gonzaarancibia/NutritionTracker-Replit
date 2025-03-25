import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  UtensilsCrossed, 
  Bot, 
  BarChart3
} from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`py-3 px-4 flex flex-col items-center ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}>
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs mt-1">Inicio</span>
          </a>
        </Link>
        
        <Link href="/daily-log">
          <a className={`py-3 px-4 flex flex-col items-center ${isActive('/daily-log') ? 'text-primary' : 'text-gray-500'}`}>
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Diario</span>
          </a>
        </Link>
        
        <Link href="/my-meals">
          <a className={`py-3 px-4 flex flex-col items-center ${isActive('/my-meals') ? 'text-primary' : 'text-gray-500'}`}>
            <UtensilsCrossed className="h-5 w-5" />
            <span className="text-xs mt-1">Comidas</span>
          </a>
        </Link>
        
        <Link href="/ai-assistant">
          <a className={`py-3 px-4 flex flex-col items-center ${isActive('/ai-assistant') ? 'text-primary' : 'text-gray-500'}`}>
            <Bot className="h-5 w-5" />
            <span className="text-xs mt-1">IA</span>
          </a>
        </Link>
        
        <Link href="/statistics">
          <a className={`py-3 px-4 flex flex-col items-center ${isActive('/statistics') ? 'text-primary' : 'text-gray-500'}`}>
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs mt-1">Stats</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
