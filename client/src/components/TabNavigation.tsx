import { useLocation, Link } from "wouter";

interface TabProps {
  activeTab: string;
}

export default function TabNavigation({ activeTab }: TabProps) {
  const [location] = useLocation();

  const tabs = [
    { name: "Dashboard", path: "/" },
    { name: "Registro Diario", path: "/daily-log" },
    { name: "Mis Comidas", path: "/my-meals" },
    { name: "Asistente IA", path: "/ai-assistant" },
    { name: "Estadísticas", path: "/statistics" }
  ];

  return (
    <div className="bg-white shadow-sm mb-4 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <nav className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <Link 
              key={tab.name} 
              href={tab.path}
              className={`
                flex-shrink-0 px-5 py-3 font-medium border-b-2 transition
                ${tab.name === activeTab
                  ? "text-primary border-primary" 
                  : "text-gray-500 hover:text-primary border-transparent hover:border-gray-200"
                }
              `}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
