import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializar la API de Google Generative AI (Gemini)
export const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Función para generar una comida con Gemini
export async function generateMealWithGemini(prompt: string, mode: string = "recipe") {
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
    let structuredPrompt;
    
    if (mode === "analysis") {
      // Prompt para análisis de ingredientes
      structuredPrompt = `
      Eres un nutricionista experto que analiza con precisión el contenido nutricional de los alimentos.
      Analiza los ingredientes descritos en el siguiente texto: "${prompt}"
      
      Calcula los valores nutricionales por cada 100g del producto final.
      
      Responde SOLO con un objeto JSON válido con el siguiente formato exacto (sin comentarios ni explicaciones adicionales):
      {
        "name": "Nombre de la comida (breve y descriptivo)",
        "description": "Descripción breve del proceso de preparación",
        "ingredients": ["Ingrediente 1 con cantidad", "Ingrediente 2 con cantidad", ...],
        "protein": número con un decimal (gramos de proteína por 100g),
        "carbs": número con un decimal (gramos de carbohidratos por 100g),
        "fat": número con un decimal (gramos de grasa por 100g),
        "calories": número entero (calorías por 100g),
        "mealType": "Tipo de comida: Desayuno, Almuerzo, Cena, Merienda, o Snack"
      }
      `;
    } else {
      // Prompt para creación de receta (predeterminado)
      structuredPrompt = `
      Eres un chef y nutricionista experto. Crea una receta saludable basada en la siguiente petición:
      "${prompt}"
      
      Responde SOLO con un objeto JSON válido con el siguiente formato exacto (sin comentarios ni explicaciones adicionales):
      {
        "name": "Nombre de la comida",
        "description": "Descripción breve",
        "ingredients": ["Ingrediente 1 con cantidad", "Ingrediente 2 con cantidad", ...],
        "protein": número con un decimal (gramos de proteína por porción),
        "carbs": número con un decimal (gramos de carbohidratos por porción),
        "fat": número con un decimal (gramos de grasa por porción),
        "calories": número entero (calorías totales por porción),
        "mealType": "Tipo de comida: Desayuno, Almuerzo, Cena, Merienda o Snack"
      }
      `;
    }
    
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