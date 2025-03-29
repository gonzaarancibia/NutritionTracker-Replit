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
      structuredPrompt = `Eres un asistente experto en nutrición. Tu tarea es analizar los ingredientes y calcular las macros por 100g del producto final.

### **Proceso de cálculo**
1. **Identifica los ingredientes y sus cantidades en gramos.** 
2. **Suma los macronutrientes de cada ingrediente para obtener los totales de proteína, carbohidratos y grasa.**  
3. **Si la comida es cocida u horneada, ajusta los valores según la pérdida de peso:**  
   - Si el usuario proporciona el peso final después de la cocción, usa ese dato.  
   - Si no hay peso final, asume una pérdida del 10% para hervidos y 15% para horneados por defecto.  
4. **Divide los macros ajustados por el peso final para obtener los valores por 100g.**  
5. **Calcula las calorías totales usando:**  
   - Proteína y carbohidratos: 4 kcal por gramo  
   - Grasas: 9 kcal por gramo  
6. **Responde en formato JSON, pero antes explica cómo llegaste al cálculo.**  

Analiza este texto: "${prompt}"

### **Ejemplo de formato de respuesta esperado**  
**Explicación previa:**  
> "La receta contiene [ingredientes]. La suma total de macros antes de la cocción es: [valores]. Como [método de cocción] y [peso final/pérdida asumida], los macros se ajustan para obtener valores por 100g."  

**JSON esperado:**
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