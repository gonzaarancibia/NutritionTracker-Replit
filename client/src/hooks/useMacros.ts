import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type DailyLog, type UserGoal, type MealEntry } from "@shared/schema";

interface MacroSummary {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export function useMacros() {
  // Fetch user goals
  const { data: userGoals, isLoading: isLoadingGoals } = useQuery<UserGoal>({
    queryKey: ["/api/user-goals"],
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Fetch daily log for today
  const { 
    data: dailyLog, 
    isLoading: isLoadingDailyLog
  } = useQuery<DailyLog | null>({
    queryKey: ["/api/daily-logs/today"],
    queryFn: () => fetch(`/api/daily-logs?date=${today}`).then(res => res.json()),
  });

  // Fetch logs for the past 7 days for weekly view
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  const endDate = new Date();
  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];
  
  const { 
    data: weeklyData, 
    isLoading: isLoadingWeekly
  } = useQuery<DailyLog[]>({
    queryKey: ["/api/daily-logs/weekly"],
    queryFn: () => fetch(`/api/daily-logs?startDate=${startDateString}&endDate=${endDateString}`).then(res => res.json()),
  });

  // Process and memoize weekly logs
  const weeklyLogs = useMemo(() => {
    if (!weeklyData) return [];
    
    // Sort logs by date
    return [...weeklyData].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [weeklyData]);

  // Calculate today's macros
  const macros: MacroSummary | null = useMemo(() => {
    if (!dailyLog) return null;
    
    return {
      protein: dailyLog.totalProtein,
      carbs: dailyLog.totalCarbs,
      fat: dailyLog.totalFat,
      calories: dailyLog.totalCalories
    };
  }, [dailyLog]);

  // Function to get daily log for a specific date
  const getDailyLogForDate = (date: Date): DailyLog | null => {
    if (!weeklyData) return null;
    
    const dateString = date.toISOString().split('T')[0];
    const log = weeklyData.find(log => log.date.toString() === dateString);
    
    return log || null;
  };

  return {
    userGoals,
    dailyLog,
    macros,
    weeklyLogs,
    isLoading: isLoadingGoals || isLoadingDailyLog || isLoadingWeekly,
    getDailyLogForDate
  };
}
