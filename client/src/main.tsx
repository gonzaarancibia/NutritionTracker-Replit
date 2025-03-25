import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("Iniciando la aplicación NutriTrack...");

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("No se encontró el elemento root en el DOM");
  } else {
    console.log("Renderizando la aplicación en el elemento root");
    createRoot(rootElement).render(<App />);
    console.log("Aplicación renderizada correctamente");
  }
} catch (error) {
  console.error("Error al renderizar la aplicación:", error);
}
