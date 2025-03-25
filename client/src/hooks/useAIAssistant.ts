import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { requestAIMeal, saveAIMealAsMeal, getAIMealRequests, type MacroNeeds } from "@/lib/openai";
import { type AIMealRequest } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export function useAIAssistant() {
  // Fetch all AI meal requests
  const { 
    data: aiMealRequests = [], 
    isLoading: isLoadingRequests,
    refetch: refetchAIMealRequests
  } = useQuery<AIMealRequest[]>({
    queryKey: ["/api/ai-meals"],
  });

  // Get the most recent AI meal request
  const lastAIMealRequest = useMemo(() => {
    if (!aiMealRequests.length) return null;
    
    // Sort by creation date (newest first)
    return [...aiMealRequests]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      [0];
  }, [aiMealRequests]);

  // Mutation to request a meal from AI
  const requestAIMealMutation = useMutation({
    mutationFn: async ({ prompt, macroNeeds }: { prompt: string; macroNeeds?: MacroNeeds }) => {
      return await requestAIMeal(prompt, macroNeeds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-meals"] });
    }
  });

  // Mutation to save an AI meal as a regular meal
  const saveAIMealMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await saveAIMealAsMeal(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-meals"] });
    }
  });

  return {
    aiMealRequests,
    lastAIMealRequest,
    isLoading: isLoadingRequests || requestAIMealMutation.isPending || saveAIMealMutation.isPending,
    requestAIMeal: async (prompt: string, macroNeeds?: MacroNeeds) => {
      return requestAIMealMutation.mutateAsync({ prompt, macroNeeds });
    },
    saveAIMeal: async (requestId: number) => {
      return saveAIMealMutation.mutateAsync(requestId);
    },
    refetchAIMealRequests
  };
}
