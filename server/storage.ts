import {
  users, type User, type InsertUser,
  userGoals, type UserGoal, type InsertUserGoal,
  meals, type Meal, type InsertMeal,
  dailyLogs, type DailyLog, type InsertDailyLog,
  aiMealRequests, type AIMealRequest, type InsertAIMealRequest,
  type MealEntry, type AIMealResult
} from "@shared/schema";

// Interface for storage operations
import session from "express-session";
import createMemoryStore from "memorystore";

// Crear memory store para las sesiones
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store para auth
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // User Goals operations
  getUserGoals(userId: number): Promise<UserGoal | undefined>;
  createUserGoals(goals: InsertUserGoal): Promise<UserGoal>;
  updateUserGoals(id: number, goals: Partial<InsertUserGoal>): Promise<UserGoal | undefined>;

  // Meal operations
  getMeal(id: number): Promise<Meal | undefined>;
  getMealsByUserId(userId: number): Promise<Meal[]>;
  getFavoriteMeals(userId: number): Promise<Meal[]>;
  searchMeals(userId: number, query: string): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: number, meal: Partial<InsertMeal>): Promise<Meal | undefined>;
  deleteMeal(id: number): Promise<boolean>;
  toggleFavorite(id: number): Promise<Meal | undefined>;

  // Daily Log operations
  getDailyLog(userId: number, date: string): Promise<DailyLog | undefined>;
  getDailyLogsByDateRange(userId: number, startDate: string, endDate: string): Promise<DailyLog[]>;
  createDailyLog(log: InsertDailyLog): Promise<DailyLog>;
  updateDailyLog(id: number, log: Partial<InsertDailyLog>): Promise<DailyLog | undefined>;
  addMealToDailyLog(logId: number, mealEntry: MealEntry): Promise<DailyLog | undefined>;
  removeMealFromDailyLog(logId: number, mealEntryIndex: number): Promise<DailyLog | undefined>;

  // AI Meal Request operations
  getAIMealRequest(id: number): Promise<AIMealRequest | undefined>;
  getAIMealRequestsByUserId(userId: number): Promise<AIMealRequest[]>;
  createAIMealRequest(request: InsertAIMealRequest): Promise<AIMealRequest>;
  updateAIMealRequest(id: number, request: Partial<InsertAIMealRequest>): Promise<AIMealRequest | undefined>;
  saveAIMealRequestAsMeal(requestId: number): Promise<Meal | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userGoals: Map<number, UserGoal>;
  private meals: Map<number, Meal>;
  private dailyLogs: Map<number, DailyLog>;
  private aiMealRequests: Map<number, AIMealRequest>;
  private currentId: {
    users: number;
    userGoals: number;
    meals: number;
    dailyLogs: number;
    aiMealRequests: number;
  };

  // Session store
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.userGoals = new Map();
    this.meals = new Map();
    this.dailyLogs = new Map();
    this.aiMealRequests = new Map();
    this.currentId = {
      users: 1,
      userGoals: 1,
      meals: 1,
      dailyLogs: 1,
      aiMealRequests: 1
    };
    
    // Inicializar session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Limpiar sesiones expiradas cada 24 horas
    });

    // Add a default user for testing
    this.createUser({ username: "demo", password: "demo" });
    
    // Add default user goals
    this.createUserGoals({
      userId: 1,
      proteinGoal: 160,
      carbsGoal: 240,
      fatGoal: 53
    });

    // Add some default meals
    this.createMeal({
      userId: 1,
      name: "Avena con frutas y yogurt",
      protein: 15,
      carbs: 45,
      fat: 8,
      calories: 312,
      mealType: "Desayuno",
      isAIGenerated: false,
      isFavorite: true,
      imageUrl: "https://images.unsplash.com/photo-1607532941433-304659e8198a"
    });

    this.createMeal({
      userId: 1,
      name: "Pollo a la parrilla con ensalada",
      protein: 35,
      carbs: 20,
      fat: 12,
      calories: 328,
      mealType: "Almuerzo",
      isAIGenerated: false,
      isFavorite: true,
      imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b"
    });

    this.createMeal({
      userId: 1,
      name: "Batido de proteínas",
      protein: 25,
      carbs: 15,
      fat: 2,
      calories: 178,
      mealType: "Merienda",
      isAIGenerated: false,
      isFavorite: true,
      imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187"
    });

    this.createMeal({
      userId: 1,
      name: "Ensalada mixta",
      protein: 12,
      carbs: 10,
      fat: 5,
      calories: 133,
      mealType: "Cena",
      isAIGenerated: false,
      isFavorite: true,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
    });

    // Set up default daily log with some meals
    const today = new Date().toISOString().split('T')[0];
    const mealEntries: MealEntry[] = [
      {
        mealId: 1,
        time: "08:30",
        servings: 1,
        protein: 15,
        carbs: 45,
        fat: 8,
        calories: 312
      },
      {
        mealId: 2,
        time: "13:00",
        servings: 1,
        protein: 35,
        carbs: 20,
        fat: 12,
        calories: 328
      },
      {
        mealId: 3,
        time: "16:30",
        servings: 1,
        protein: 25,
        carbs: 15,
        fat: 2,
        calories: 178
      }
    ];

    this.createDailyLog({
      userId: 1,
      date: today as any,
      mealEntries,
      totalProtein: 75,
      totalCarbs: 80,
      totalFat: 22,
      totalCalories: 818
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // User Goals operations
  async getUserGoals(userId: number): Promise<UserGoal | undefined> {
    return Array.from(this.userGoals.values()).find(
      (goal) => goal.userId === userId,
    );
  }

  async createUserGoals(goals: InsertUserGoal): Promise<UserGoal> {
    const id = this.currentId.userGoals++;
    const userGoal: UserGoal = { ...goals, id };
    this.userGoals.set(id, userGoal);
    return userGoal;
  }

  async updateUserGoals(id: number, goals: Partial<InsertUserGoal>): Promise<UserGoal | undefined> {
    const existing = this.userGoals.get(id);
    if (!existing) return undefined;
    
    const updated: UserGoal = { ...existing, ...goals };
    this.userGoals.set(id, updated);
    return updated;
  }

  // Meal operations
  async getMeal(id: number): Promise<Meal | undefined> {
    return this.meals.get(id);
  }

  async getMealsByUserId(userId: number): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(
      (meal) => meal.userId === userId,
    );
  }

  async getFavoriteMeals(userId: number): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(
      (meal) => meal.userId === userId && meal.isFavorite,
    );
  }

  async searchMeals(userId: number, query: string): Promise<Meal[]> {
    const lowercasedQuery = query.toLowerCase();
    return Array.from(this.meals.values()).filter(
      (meal) => 
        meal.userId === userId && 
        meal.name.toLowerCase().includes(lowercasedQuery)
    );
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const id = this.currentId.meals++;
    const createdAt = new Date();
    const newMeal: Meal = { ...meal, id, createdAt };
    this.meals.set(id, newMeal);
    return newMeal;
  }

  async updateMeal(id: number, meal: Partial<InsertMeal>): Promise<Meal | undefined> {
    const existing = this.meals.get(id);
    if (!existing) return undefined;
    
    const updated: Meal = { ...existing, ...meal };
    this.meals.set(id, updated);
    return updated;
  }

  async deleteMeal(id: number): Promise<boolean> {
    return this.meals.delete(id);
  }

  async toggleFavorite(id: number): Promise<Meal | undefined> {
    const meal = this.meals.get(id);
    if (!meal) return undefined;
    
    const updated: Meal = { ...meal, isFavorite: !meal.isFavorite };
    this.meals.set(id, updated);
    return updated;
  }

  // Daily Log operations
  async getDailyLog(userId: number, date: string): Promise<DailyLog | undefined> {
    return Array.from(this.dailyLogs.values()).find(
      (log) => log.userId === userId && log.date.toString() === date
    );
  }

  async getDailyLogsByDateRange(userId: number, startDate: string, endDate: string): Promise<DailyLog[]> {
    return Array.from(this.dailyLogs.values()).filter(log => {
      const logDate = log.date.toString();
      return log.userId === userId && logDate >= startDate && logDate <= endDate;
    });
  }

  async createDailyLog(log: InsertDailyLog): Promise<DailyLog> {
    const id = this.currentId.dailyLogs++;
    const dailyLog: DailyLog = { ...log, id };
    this.dailyLogs.set(id, dailyLog);
    return dailyLog;
  }

  async updateDailyLog(id: number, log: Partial<InsertDailyLog>): Promise<DailyLog | undefined> {
    const existing = this.dailyLogs.get(id);
    if (!existing) return undefined;
    
    const updated: DailyLog = { ...existing, ...log };
    this.dailyLogs.set(id, updated);
    return updated;
  }

  async addMealToDailyLog(logId: number, mealEntry: MealEntry): Promise<DailyLog | undefined> {
    const log = this.dailyLogs.get(logId);
    if (!log) return undefined;
    
    const updatedEntries = [...log.mealEntries, mealEntry];
    
    // Recalculate totals
    const totals = updatedEntries.reduce(
      (acc, entry) => ({
        totalProtein: acc.totalProtein + entry.protein,
        totalCarbs: acc.totalCarbs + entry.carbs,
        totalFat: acc.totalFat + entry.fat,
        totalCalories: acc.totalCalories + entry.calories,
      }),
      { totalProtein: 0, totalCarbs: 0, totalFat: 0, totalCalories: 0 }
    );
    
    const updated: DailyLog = { 
      ...log, 
      mealEntries: updatedEntries,
      totalProtein: totals.totalProtein,
      totalCarbs: totals.totalCarbs,
      totalFat: totals.totalFat,
      totalCalories: totals.totalCalories
    };
    
    this.dailyLogs.set(logId, updated);
    return updated;
  }

  async removeMealFromDailyLog(logId: number, mealEntryIndex: number): Promise<DailyLog | undefined> {
    const log = this.dailyLogs.get(logId);
    if (!log || mealEntryIndex < 0 || mealEntryIndex >= log.mealEntries.length) {
      return undefined;
    }
    
    const updatedEntries = [...log.mealEntries];
    updatedEntries.splice(mealEntryIndex, 1);
    
    // Recalculate totals
    const totals = updatedEntries.reduce(
      (acc, entry) => ({
        totalProtein: acc.totalProtein + entry.protein,
        totalCarbs: acc.totalCarbs + entry.carbs,
        totalFat: acc.totalFat + entry.fat,
        totalCalories: acc.totalCalories + entry.calories,
      }),
      { totalProtein: 0, totalCarbs: 0, totalFat: 0, totalCalories: 0 }
    );
    
    const updated: DailyLog = { 
      ...log, 
      mealEntries: updatedEntries,
      totalProtein: totals.totalProtein,
      totalCarbs: totals.totalCarbs,
      totalFat: totals.totalFat,
      totalCalories: totals.totalCalories
    };
    
    this.dailyLogs.set(logId, updated);
    return updated;
  }

  // AI Meal Request operations
  async getAIMealRequest(id: number): Promise<AIMealRequest | undefined> {
    return this.aiMealRequests.get(id);
  }

  async getAIMealRequestsByUserId(userId: number): Promise<AIMealRequest[]> {
    return Array.from(this.aiMealRequests.values()).filter(
      (request) => request.userId === userId,
    );
  }

  async createAIMealRequest(request: InsertAIMealRequest): Promise<AIMealRequest> {
    const id = this.currentId.aiMealRequests++;
    const createdAt = new Date();
    const aiMealRequest: AIMealRequest = { ...request, id, createdAt };
    this.aiMealRequests.set(id, aiMealRequest);
    return aiMealRequest;
  }

  async updateAIMealRequest(id: number, request: Partial<InsertAIMealRequest>): Promise<AIMealRequest | undefined> {
    const existing = this.aiMealRequests.get(id);
    if (!existing) return undefined;
    
    const updated: AIMealRequest = { ...existing, ...request };
    this.aiMealRequests.set(id, updated);
    return updated;
  }

  async saveAIMealRequestAsMeal(requestId: number): Promise<Meal | undefined> {
    const request = this.aiMealRequests.get(requestId);
    if (!request || !request.result) return undefined;
    
    // Mark the request as saved
    await this.updateAIMealRequest(requestId, { saved: true });
    
    // Create a new meal from the AI result
    const result = request.result;
    const meal: InsertMeal = {
      userId: request.userId,
      name: result.name,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      calories: result.calories,
      mealType: result.mealType || "Comida",
      isAIGenerated: true,
      isFavorite: false,
      imageUrl: ""
    };
    
    return this.createMeal(meal);
  }
}

export const storage = new MemStorage();
