import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool, initMySQL } from './mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'fitlife.json');

class Database {
  constructor() {
    this.cache = null;
    this.mysqlPool = null;
    this.init();
  }

  init() {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      this.cache = JSON.parse(raw);
    } else {
      this.cache = {
        users: [], exercises: [], foods: [], routines: [], workoutLogs: [],
        mealLogs: [], progressLogs: [], habitLogs: [], challenges: [],
        badges: [], socialPosts: [], notifications: [], reportedPosts: []
      };
    }

    // Connect to MySQL
    initMySQL()
      .then(pool => {
        this.mysqlPool = pool;
        console.log('⚡ MySQL Database connection pool active for FitLife AI');
      })
      .catch(err => {
        console.warn('MySQL init failed, operating with local atomic store:', err.message);
      });
  }

  get data() {
    if (!this.cache) {
      this.init();
    }
    return this.cache;
  }

  async syncToMySQL() {
    if (!this.mysqlPool) return;
    try {
      // Async sync user table state
      for (const u of this.data.users) {
        await this.mysqlPool.query(`
          INSERT INTO users (
            id, name, email, password, role, avatar, age, gender, height, weight, target_weight,
            fitness_level, fitness_goal, equipment, location, weekly_availability, dietary_preference,
            daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal, daily_water_goal,
            daily_step_goal, daily_sleep_goal, xp, level, streak, is_public, allow_leaderboard, units,
            theme, notifications, is_banned
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name=VALUES(name), password=VALUES(password), role=VALUES(role), avatar=VALUES(avatar),
            age=VALUES(age), height=VALUES(height), weight=VALUES(weight), target_weight=VALUES(target_weight),
            fitness_goal=VALUES(fitness_goal), fitness_level=VALUES(fitness_level), xp=VALUES(xp),
            level=VALUES(level), streak=VALUES(streak), notifications=VALUES(notifications),
            daily_calorie_goal=VALUES(daily_calorie_goal), daily_water_goal=VALUES(daily_water_goal),
            is_banned=VALUES(is_banned), units=VALUES(units), theme=VALUES(theme)
        `, [
          u.id, u.name, u.email, u.password, u.role || 'user', u.avatar, u.age, u.gender, u.height, u.weight,
          u.targetWeight, u.fitnessLevel, u.fitnessGoal, JSON.stringify(u.equipment || []), u.location,
          u.weeklyAvailability, u.dietaryPreference, u.dailyCalorieGoal, u.dailyProteinGoal, u.dailyCarbsGoal,
          u.dailyFatGoal, u.dailyWaterGoal, u.dailyStepGoal, u.dailySleepGoal, u.xp, u.level, u.streak,
          u.isPublic ?? true, u.allowLeaderboard ?? true, u.units || 'metric', u.theme || 'dark',
          JSON.stringify(u.notifications || {}), u.isBanned ? 1 : 0
        ]);
      }
    } catch (err) {
      console.error('Error syncing to MySQL:', err.message);
    }
  }

  save() {
    try {
      const tempPath = `${DATA_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.cache, null, 2), 'utf-8');
      fs.renameSync(tempPath, DATA_FILE);

      // Trigger asynchronous background sync to MySQL
      this.syncToMySQL().catch(() => {});
      return true;
    } catch (err) {
      console.error('Failed to save database:', err);
      return false;
    }
  }

  users() { return this.data.users; }
  exercises() { return this.data.exercises; }
  foods() { return this.data.foods; }
  routines() { return this.data.routines; }
  workoutLogs() { return this.data.workoutLogs; }
  mealLogs() { return this.data.mealLogs; }
  progressLogs() { return this.data.progressLogs; }
  habitLogs() { return this.data.habitLogs; }
  challenges() { return this.data.challenges; }
  badges() { return this.data.badges; }
  socialPosts() { return this.data.socialPosts; }
  notifications() { return this.data.notifications; }
  reportedPosts() { return this.data.reportedPosts || []; }
}

export const db = new Database();
