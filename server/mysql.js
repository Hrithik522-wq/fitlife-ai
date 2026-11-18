import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_FILE = path.join(__dirname, 'data', 'fitlife.json');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '@Hrithik2323',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
};

let pool = null;

export async function initMySQL() {
  console.log(`Connecting to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port} as '${DB_CONFIG.user}'...`);

  // 1. Initial connection without database to ensure database exists
  const rootConn = await mysql.createConnection(DB_CONFIG);
  const dbName = process.env.DB_NAME || 'fitlife_ai_db';
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await rootConn.end();
  console.log(`MySQL Database '${dbName}' ready.`);

  // 2. Create pool connected to fitlife_ai_db
  pool = mysql.createPool({
    ...DB_CONFIG,
    database: dbName
  });

  // 3. Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      email VARCHAR(128) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(32) DEFAULT 'user',
      avatar TEXT,
      age INT DEFAULT 25,
      gender VARCHAR(32) DEFAULT 'Other',
      height FLOAT DEFAULT 170,
      weight FLOAT DEFAULT 70,
      target_weight FLOAT DEFAULT 70,
      fitness_level VARCHAR(64) DEFAULT 'Beginner',
      fitness_goal VARCHAR(128) DEFAULT 'General fitness',
      equipment JSON,
      location VARCHAR(64) DEFAULT 'Home',
      weekly_availability INT DEFAULT 3,
      dietary_preference VARCHAR(64) DEFAULT 'Vegetarian',
      daily_calorie_goal INT DEFAULT 2000,
      daily_protein_goal INT DEFAULT 120,
      daily_carbs_goal INT DEFAULT 220,
      daily_fat_goal INT DEFAULT 55,
      daily_water_goal INT DEFAULT 3000,
      daily_step_goal INT DEFAULT 10000,
      daily_sleep_goal INT DEFAULT 8,
      xp INT DEFAULT 100,
      level VARCHAR(64) DEFAULT 'Bronze I',
      streak INT DEFAULT 1,
      is_public BOOLEAN DEFAULT TRUE,
      allow_leaderboard BOOLEAN DEFAULT TRUE,
      units VARCHAR(16) DEFAULT 'metric',
      theme VARCHAR(16) DEFAULT 'dark',
      notifications JSON,
      is_banned BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS exercises (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      category VARCHAR(64) NOT NULL,
      muscle_group VARCHAR(64) NOT NULL,
      secondary_muscles JSON,
      difficulty VARCHAR(32) DEFAULT 'Intermediate',
      equipment VARCHAR(64) DEFAULT 'Bodyweight',
      calories_per_min FLOAT DEFAULT 7,
      instructions JSON,
      tips TEXT,
      demonstration_url TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS foods (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NULL,
      name VARCHAR(128) NOT NULL,
      category VARCHAR(64) DEFAULT 'General',
      serving_unit VARCHAR(64) DEFAULT '1 serving',
      calories INT NOT NULL,
      protein FLOAT DEFAULT 0,
      carbs FLOAT DEFAULT 0,
      fat FLOAT DEFAULT 0,
      fiber FLOAT DEFAULT 0,
      diet_type VARCHAR(64) DEFAULT 'Vegetarian',
      is_popular BOOLEAN DEFAULT FALSE,
      is_custom BOOLEAN DEFAULT FALSE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS routines (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NULL,
      name VARCHAR(128) NOT NULL,
      category VARCHAR(64) DEFAULT 'Hypertrophy',
      difficulty VARCHAR(32) DEFAULT 'Intermediate',
      estimated_minutes INT DEFAULT 45,
      calories_burn_estimate INT DEFAULT 300,
      exercises JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS workout_logs (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      routine_id VARCHAR(64),
      routine_name VARCHAR(128),
      date VARCHAR(32) NOT NULL,
      duration_minutes INT DEFAULT 30,
      calories_burned INT DEFAULT 250,
      exercises JSON,
      notes TEXT,
      completed BOOLEAN DEFAULT TRUE,
      logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS meal_logs (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      date VARCHAR(32) NOT NULL,
      meal_type VARCHAR(32) NOT NULL,
      food_id VARCHAR(64),
      food_name VARCHAR(128),
      servings FLOAT DEFAULT 1,
      serving_unit VARCHAR(64) DEFAULT '1 serving',
      calories INT DEFAULT 0,
      protein FLOAT DEFAULT 0,
      carbs FLOAT DEFAULT 0,
      fat FLOAT DEFAULT 0,
      fiber FLOAT DEFAULT 0,
      logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS progress_logs (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      date VARCHAR(32) NOT NULL,
      weight FLOAT NOT NULL,
      height FLOAT NOT NULL,
      bmi FLOAT NOT NULL,
      bmi_category VARCHAR(64),
      body_fat FLOAT NULL,
      waist FLOAT NULL,
      chest FLOAT NULL,
      arm FLOAT NULL,
      thigh FLOAT NULL,
      hips FLOAT NULL,
      photo_url TEXT NULL,
      photo_tag VARCHAR(64) NULL,
      notes TEXT NULL,
      logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      date VARCHAR(32) NOT NULL,
      water_ml INT DEFAULT 0,
      steps INT DEFAULT 0,
      sleep_hours FLOAT DEFAULT 0,
      sleep_quality INT DEFAULT 3,
      sleep_notes TEXT NULL,
      meditation_minutes INT DEFAULT 0,
      wellness_score INT DEFAULT 0,
      habits JSON
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS challenges (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(128) NOT NULL,
      description TEXT,
      category VARCHAR(64) DEFAULT 'Fitness',
      duration_days INT DEFAULT 30,
      participants_count INT DEFAULT 0,
      target_sessions INT DEFAULT 1,
      xp_reward INT DEFAULT 100,
      badge_reward VARCHAR(64),
      banner_url TEXT,
      joined_users JSON
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS badges (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      description TEXT,
      icon VARCHAR(64),
      category VARCHAR(64),
      xp INT DEFAULT 100,
      unlocked_users JSON
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_posts (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      author_name VARCHAR(128),
      author_avatar TEXT,
      content TEXT,
      tag VARCHAR(64),
      image_url TEXT,
      likes JSON,
      comments JSON,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      type VARCHAR(32) DEFAULT 'reminder',
      title VARCHAR(128),
      message TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reported_posts (
      id VARCHAR(64) PRIMARY KEY,
      post_id VARCHAR(64),
      post_content TEXT,
      reported_by_user_id VARCHAR(64),
      author_id VARCHAR(64),
      author_name VARCHAR(128),
      reason TEXT,
      status VARCHAR(32) DEFAULT 'pending',
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('All MySQL tables verified and synchronized.');

  // 4. Seed tables if users table is empty
  const [existingUsers] = await pool.query('SELECT COUNT(*) as cnt FROM users');
  if (existingUsers[0].cnt === 0 && fs.existsSync(SEED_FILE)) {
    console.log('Seeding MySQL database from fitlife.json...');
    const seedData = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));

    // Users
    for (const u of seedData.users || []) {
      await pool.query(`
        INSERT INTO users (
          id, name, email, password, role, avatar, age, gender, height, weight, target_weight,
          fitness_level, fitness_goal, equipment, location, weekly_availability, dietary_preference,
          daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal, daily_water_goal,
          daily_step_goal, daily_sleep_goal, xp, level, streak, is_public, allow_leaderboard, units,
          theme, notifications
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        u.id, u.name, u.email, u.password, u.role || 'user', u.avatar, u.age, u.gender, u.height, u.weight,
        u.targetWeight, u.fitnessLevel, u.fitnessGoal, JSON.stringify(u.equipment || []), u.location,
        u.weeklyAvailability, u.dietaryPreference, u.dailyCalorieGoal, u.dailyProteinGoal, u.dailyCarbsGoal,
        u.dailyFatGoal, u.dailyWaterGoal, u.dailyStepGoal, u.dailySleepGoal, u.xp, u.level, u.streak,
        u.isPublic ?? true, u.allowLeaderboard ?? true, u.units || 'metric', u.theme || 'dark',
        JSON.stringify(u.notifications || {})
      ]);
    }

    // Exercises
    for (const ex of seedData.exercises || []) {
      await pool.query(`
        INSERT INTO exercises (
          id, name, category, muscle_group, secondary_muscles, difficulty, equipment,
          calories_per_min, instructions, tips, demonstration_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        ex.id, ex.name, ex.category, ex.muscleGroup, JSON.stringify(ex.secondaryMuscles || []),
        ex.difficulty, ex.equipment, ex.caloriesPerMin, JSON.stringify(ex.instructions || []),
        ex.tips, ex.demonstrationUrl
      ]);
    }

    // Foods
    for (const f of seedData.foods || []) {
      await pool.query(`
        INSERT INTO foods (
          id, user_id, name, category, serving_unit, calories, protein, carbs, fat, fiber,
          diet_type, is_popular, is_custom
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        f.id, f.userId || null, f.name, f.category, f.servingUnit, f.calories, f.protein, f.carbs,
        f.fat, f.fiber, f.dietType, f.isPopular ? 1 : 0, f.isCustom ? 1 : 0
      ]);
    }

    // Routines
    for (const r of seedData.routines || []) {
      await pool.query(`
        INSERT INTO routines (
          id, user_id, name, category, difficulty, estimated_minutes, calories_burn_estimate, exercises
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        r.id, r.userId || null, r.name, r.category, r.difficulty, r.estimatedMinutes,
        r.caloriesBurnEstimate, JSON.stringify(r.exercises || [])
      ]);
    }

    // Workout logs
    for (const w of seedData.workoutLogs || []) {
      await pool.query(`
        INSERT INTO workout_logs (
          id, user_id, routine_id, routine_name, date, duration_minutes, calories_burned, exercises, notes, completed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        w.id, w.userId, w.routineId, w.routineName, w.date, w.durationMinutes, w.caloriesBurned,
        JSON.stringify(w.exercises || []), w.notes, w.completed ? 1 : 0
      ]);
    }

    // Meal logs
    for (const m of seedData.mealLogs || []) {
      await pool.query(`
        INSERT INTO meal_logs (
          id, user_id, date, meal_type, food_id, food_name, servings, serving_unit, calories, protein, carbs, fat, fiber
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        m.id, m.userId, m.date, m.mealType, m.foodId, m.foodName, m.servings, m.servingUnit,
        m.calories, m.protein, m.carbs, m.fat, m.fiber
      ]);
    }

    // Progress logs
    for (const p of seedData.progressLogs || []) {
      await pool.query(`
        INSERT INTO progress_logs (
          id, user_id, date, weight, height, bmi, bmi_category, body_fat, waist, chest, arm, thigh, hips, photo_url, photo_tag, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        p.id, p.userId, p.date, p.weight, p.height, p.bmi, p.bmiCategory || 'Normal weight',
        p.bodyFat || null, p.waist || null, p.chest || null, p.arm || null, p.thigh || null,
        p.hips || null, p.photoUrl || null, p.photoTag || null, p.notes || null
      ]);
    }

    // Habit logs
    for (const h of seedData.habitLogs || []) {
      await pool.query(`
        INSERT INTO habit_logs (
          id, user_id, date, water_ml, steps, sleep_hours, sleep_quality, sleep_notes, meditation_minutes, wellness_score, habits
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        h.id, h.userId, h.date, h.waterMl, h.steps, h.sleepHours, h.sleepQuality, h.sleepNotes,
        h.meditationMinutes, h.wellnessScore, JSON.stringify(h.habits || [])
      ]);
    }

    // Challenges
    for (const c of seedData.challenges || []) {
      await pool.query(`
        INSERT INTO challenges (
          id, title, description, category, duration_days, participants_count, target_sessions, xp_reward, badge_reward, banner_url, joined_users
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        c.id, c.title, c.description, c.category, c.durationDays, c.participantsCount,
        c.targetSessions, c.xpReward, c.badgeReward, c.bannerUrl, JSON.stringify(c.joinedUsers || [])
      ]);
    }

    // Badges
    for (const b of seedData.badges || []) {
      await pool.query(`
        INSERT INTO badges (
          id, name, description, icon, category, xp, unlocked_users
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        b.id, b.name, b.description, b.icon, b.category, b.xp, JSON.stringify(b.unlockedUsers || [])
      ]);
    }

    // Social posts
    for (const sp of seedData.socialPosts || []) {
      await pool.query(`
        INSERT INTO social_posts (
          id, user_id, author_name, author_avatar, content, tag, image_url, likes, comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        sp.id, sp.userId, sp.authorName, sp.authorAvatar, sp.content, sp.tag, sp.imageUrl,
        JSON.stringify(sp.likes || []), JSON.stringify(sp.comments || [])
      ]);
    }

    // Notifications
    for (const n of seedData.notifications || []) {
      await pool.query(`
        INSERT INTO notifications (
          id, user_id, type, title, message, is_read
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        n.id, n.userId, n.type, n.title, n.message, n.read ? 1 : 0
      ]);
    }

    console.log('MySQL database successfully seeded with all users, exercises, foods, challenges & social data!');
  }

  return pool;
}

export function getPool() {
  return pool;
}
