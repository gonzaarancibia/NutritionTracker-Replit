import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializar la API de Google Generative AI (Gemini)
export const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Función para generar una comida con Gemini
export async function generateMealWithGemini(prompt: string) {
  try {
    // Intentar con varios modelos en orden de preferencia
    let model;
    try {
      // Gemini-1.5-pro es el modelo más avanzado actual
      model = geminiAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    } catch (error) {
      console.log("Modelo gemini-1.5-pro no disponible, intentando con gemini-pro");
      model = geminiAI.getGenerativeModel({ model: "gemini-pro" });
    }
    
    // Estructurar el prompt para obtener datos en formato JSON
    const structuredPrompt = `
    Eres un chef y nutricionista experto. Crea una receta saludable basada en la siguiente petición:
    "${prompt}"
    
    Responde SOLO con un objeto JSON válido con el siguiente formato exacto (sin comentarios ni explicaciones adicionales):
    {
      "name": "Nombre de la comida",
      "description": "Descripción breve",
      "ingredients": ["Ingrediente 1", "Ingrediente 2", ...],
      "protein": número (gramos de proteína),
      "carbs": número (gramos de carbohidratos),
      "fat": número (gramos de grasa),
      "calories": número (calorías totales),
      "mealType": "Tipo de comida: Desayuno, Almuerzo, Cena o Merienda"
    }
    `;
    
    // Generar la respuesta
    const result = await model.generateContent(structuredPrompt);
    const response = result.response;
    const text = response.text();
    
    // Extraer el JSON de la respuesta
    // A veces Gemini puede incluir markdown, así que intentamos extraer solo el JSON
    const jsonRegex = /{[\s\S]*}/;
    const match = text.match(jsonRegex);
    
    if (match) {
      return JSON.parse(match[0]);
    } else {
      throw new Error("No se pudo extraer JSON de la respuesta de Gemini");
    }
  } catch (error) {
    console.error("Error with Gemini API:", error);
    throw error;
  }
}