import { queryClient, apiRequest } from "./queryClient";
import { type AIMealRequest } from "@shared/schema";

// Meal macronutrient needs interface
export interface MacroNeeds {
  protein: number;
  carbs: number;
  fat: number;
}

// Function to request a meal from the AI assistant
export async function requestAIMeal(prompt: string, macroNeeds?: MacroNeeds): Promise<AIMealRequest> {
  const response = await apiRequest("POST", "/api/ai-meals", {
    prompt,
    macroNeeds
  });
  
  return response.json();
}

// Function to save an AI meal to the user's meals
export async function saveAIMealAsMeal(requestId: number): Promise<void> {
  await apiRequest("POST", `/api/ai-meals/${requestId}/save`);
  
  // Invalidate the meals cache to refresh the list
  queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
}

// Function to get all AI meal requests for the user
export async function getAIMealRequests(): Promise<AIMealRequest[]> {
  const response = await apiRequest("GET", "/api/ai-meals");
  return response.json();
}
