import { pgTable, text, serial, integer, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User Goals Schema
export const userGoals = pgTable("user_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  proteinGoal: integer("protein_goal").notNull(),
  carbsGoal: integer("carbs_goal").notNull(),
  fatGoal: integer("fat_goal").notNull(),
});

export const insertUserGoalSchema = createInsertSchema(userGoals).pick({
  userId: true,
  proteinGoal: true,
  carbsGoal: true,
  fatGoal: true,
});

export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;
export type UserGoal = typeof userGoals.$inferSelect;

// Meal Schema
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
  calories: integer("calories").notNull(),
  mealType: text("meal_type").notNull(), // Desayuno, Almuerzo, Cena, Merienda, etc.
  isAIGenerated: boolean("is_ai_generated").default(false),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  imageUrl: text("image_url"),
});

export const insertMealSchema = createInsertSchema(meals).pick({
  userId: true,
  name: true,
  protein: true,
  carbs: true,
  fat: true,
  calories: true,
  mealType: true,
  isAIGenerated: true,
  isFavorite: true,
  imageUrl: true,
});

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

// Daily Log Schema
export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  mealEntries: json("meal_entries").notNull().$type<MealEntry[]>(),
  totalProtein: integer("total_protein").notNull(),
  totalCarbs: integer("total_carbs").notNull(),
  totalFat: integer("total_fat").notNull(),
  totalCalories: integer("total_calories").notNull(),
});

export const insertDailyLogSchema = createInsertSchema(dailyLogs).pick({
  userId: true,
  date: true,
  mealEntries: true,
  totalProtein: true,
  totalCarbs: true,
  totalFat: true,
  totalCalories: true,
});

export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;
export type DailyLog = typeof dailyLogs.$inferSelect;

// Meal Entry Type (for daily logs)
export type MealEntry = {
  mealId: number;
  time: string;
  servings: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

// AI Meal Request Schema
export const aiMealRequests = pgTable("ai_meal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  prompt: text("prompt").notNull(),
  result: json("result").$type<AIMealResult>(),
  createdAt: timestamp("created_at").defaultNow(),
  saved: boolean("saved").default(false),
});

export const insertAIMealRequestSchema = createInsertSchema(aiMealRequests).pick({
  userId: true,
  prompt: true,
  result: true,
  saved: true,
});

export type InsertAIMealRequest = z.infer<typeof insertAIMealRequestSchema>;
export type AIMealRequest = typeof aiMealRequests.$inferSelect;

// AI Meal Result Type
export type AIMealResult = {
  name: string;
  description: string;
  ingredients: string[];
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  mealType: string;
};
