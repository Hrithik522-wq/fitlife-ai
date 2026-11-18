import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'fitlife.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function generateSeed() {
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const userPasswordHash = await bcrypt.hash('password123', salt);

  const initialData = {
    users: [
      {
        id: "user_admin",
        name: "Admin FitLife",
        email: "admin@fitlife.ai",
        password: adminPasswordHash,
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        age: 32,
        gender: "Male",
        height: 182,
        weight: 79,
        targetWeight: 78,
        fitnessLevel: "Advanced",
        fitnessGoal: "Strength building",
        equipment: ["Full Gym", "Barbells", "Dumbbells", "Cables"],
        location: "Gym",
        weeklyAvailability: 5,
        dietaryPreference: "Non-Vegetarian",
        dailyCalorieGoal: 2600,
        dailyProteinGoal: 170,
        dailyCarbsGoal: 280,
        dailyFatGoal: 70,
        dailyWaterGoal: 3500,
        dailyStepGoal: 10000,
        dailySleepGoal: 8,
        xp: 4500,
        level: "FitLife Master",
        streak: 24,
        isPublic: true,
        allowLeaderboard: true,
        units: "metric",
        theme: "dark",
        notifications: {
          workoutReminder: true,
          workoutTime: "07:30",
          waterReminder: true,
          waterIntervalHours: 2,
          mealReminder: true,
          streakReminder: true
        },
        createdAt: "2026-01-10T08:00:00.000Z"
      },
      {
        id: "user_alex",
        name: "Alex Morgan",
        email: "alex@fitlife.ai",
        password: userPasswordHash,
        role: "user",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        age: 27,
        gender: "Female",
        height: 168,
        weight: 63.5,
        targetWeight: 58.0,
        fitnessLevel: "Intermediate",
        fitnessGoal: "Body recomposition",
        equipment: ["Dumbbells", "Resistance Bands", "Yoga Mat", "Kettlebell"],
        location: "Home",
        weeklyAvailability: 4,
        dietaryPreference: "Vegetarian",
        dailyCalorieGoal: 2000,
        dailyProteinGoal: 120,
        dailyCarbsGoal: 210,
        dailyFatGoal: 55,
        dailyWaterGoal: 3000,
        dailyStepGoal: 10000,
        dailySleepGoal: 8,
        xp: 1850,
        level: "Silver II",
        streak: 8,
        isPublic: true,
        allowLeaderboard: true,
        units: "metric",
        theme: "dark",
        notifications: {
          workoutReminder: true,
          workoutTime: "18:00",
          waterReminder: true,
          waterIntervalHours: 2,
          mealReminder: true,
          streakReminder: true
        },
        createdAt: "2026-02-01T09:30:00.000Z"
      },
      {
        id: "user_marcus",
        name: "Marcus Vance",
        email: "marcus@fitlife.ai",
        password: userPasswordHash,
        role: "user",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        age: 29,
        gender: "Male",
        height: 178,
        weight: 75,
        targetWeight: 76,
        fitnessLevel: "Advanced",
        fitnessGoal: "Muscle gain",
        equipment: ["Full Gym"],
        location: "Gym",
        weeklyAvailability: 5,
        dietaryPreference: "Non-Vegetarian",
        xp: 3200,
        level: "Gold I",
        streak: 15,
        isPublic: true,
        allowLeaderboard: true,
        createdAt: "2026-02-15T10:00:00.000Z"
      },
      {
        id: "user_priya",
        name: "Priya Sharma",
        email: "priya@fitlife.ai",
        password: userPasswordHash,
        role: "user",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        age: 25,
        gender: "Female",
        height: 162,
        weight: 56,
        targetWeight: 54,
        fitnessLevel: "Beginner",
        fitnessGoal: "General fitness",
        equipment: ["Dumbbells", "Yoga Mat"],
        location: "Home",
        weeklyAvailability: 3,
        dietaryPreference: "Vegetarian",
        xp: 920,
        level: "Bronze III",
        streak: 5,
        isPublic: true,
        allowLeaderboard: true,
        createdAt: "2026-03-01T11:00:00.000Z"
      }
    ],

    exercises: [
      // Chest
      {
        id: "ex_bench_press",
        name: "Barbell Bench Press",
        category: "Chest",
        muscleGroup: "Chest",
        secondaryMuscles: ["Triceps", "Front Deltoids"],
        difficulty: "Intermediate",
        equipment: "Barbell",
        caloriesPerMin: 8,
        instructions: [
          "Lie flat on the bench with eyes positioned under the bar.",
          "Grip the bar with hands slightly wider than shoulder-width apart.",
          "Unrack the barbell, lower it with control to the mid-chest level.",
          "Drive feet into the floor and press the barbell back up explosively to arms extended."
        ],
        tips: "Keep your shoulder blades retracted and pinched together to protect rotator cuffs.",
        demonstrationUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_incline_db_press",
        name: "Incline Dumbbell Press",
        category: "Chest",
        muscleGroup: "Upper Chest",
        secondaryMuscles: ["Front Deltoids", "Triceps"],
        difficulty: "Intermediate",
        equipment: "Dumbbells",
        caloriesPerMin: 7,
        instructions: [
          "Set an adjustable bench at a 30 to 45-degree angle.",
          "Sit back with dumbbells resting on thighs, then kick them up to shoulder height.",
          "Press weights upwards over chest until elbows are nearly locked.",
          "Lower under control until upper arms are parallel to the floor."
        ],
        tips: "Avoid arching lower back excessively off the bench pad.",
        demonstrationUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_pushups",
        name: "Push-Ups",
        category: "Chest",
        muscleGroup: "Chest",
        secondaryMuscles: ["Triceps", "Core", "Shoulders"],
        difficulty: "Beginner",
        equipment: "Bodyweight",
        caloriesPerMin: 6,
        instructions: [
          "Place hands slightly wider than shoulder-width apart on the floor.",
          "Form a straight line from heels through hips to head.",
          "Lower chest until it hovers an inch above the floor.",
          "Push floor away to return to the plank starting position."
        ],
        tips: "Squeeze glutes and core throughout to prevent hip sag.",
        demonstrationUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_cable_crossover",
        name: "Cable Flyes / Crossover",
        category: "Chest",
        muscleGroup: "Chest",
        secondaryMuscles: ["Anterior Deltoids"],
        difficulty: "Intermediate",
        equipment: "Cable",
        caloriesPerMin: 6,
        instructions: [
          "Set cable pulleys at chest height. Grasp handles and step forward in a staggered stance.",
          "With slight bend in elbows, bring hands together in an arc in front of chest.",
          "Squeeze chest at peak contraction for 1 second.",
          "Slowly return to starting stretch position."
        ],
        tips: "Keep elbows fixed at a constant angle; don't turn it into a press.",
        demonstrationUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80"
      },

      // Back
      {
        id: "ex_deadlift",
        name: "Barbell Deadlift",
        category: "Back",
        muscleGroup: "Lower Back",
        secondaryMuscles: ["Hamstrings", "Glutes", "Traps", "Forearms"],
        difficulty: "Advanced",
        equipment: "Barbell",
        caloriesPerMin: 10,
        instructions: [
          "Stand with mid-foot under the barbell, feet hip-width apart.",
          "Hinge at hips, bend knees, and grip bar just outside knees.",
          "Flatten back, brace core, and drive through heels while pulling bar along shins.",
          "Lock out hips and knees at top; reverse hips back down safely."
        ],
        tips: "Do not round your lower spine. Keep the barbell tight against your body.",
        demonstrationUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_pullups",
        name: "Pull-Ups",
        category: "Back",
        muscleGroup: "Lats",
        secondaryMuscles: ["Biceps", "Upper Back", "Core"],
        difficulty: "Intermediate",
        equipment: "Pull-Up Bar",
        caloriesPerMin: 8,
        instructions: [
          "Grasp bar with an overhand grip wider than shoulders.",
          "Hang at full extension, engage lats by pulling shoulder blades down.",
          "Pull chest up toward the bar until chin clears the bar.",
          "Lower down with control to a full dead hang."
        ],
        tips: "Avoid swinging or kicking legs. Use a resistance band if needed for assistance.",
        demonstrationUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_lat_pulldown",
        name: "Lat Pulldown",
        category: "Back",
        muscleGroup: "Lats",
        secondaryMuscles: ["Biceps", "Rhomboids"],
        difficulty: "Beginner",
        equipment: "Cable",
        caloriesPerMin: 6,
        instructions: [
          "Sit down and secure thighs snugly under pads.",
          "Grip wide bar, lean torso back slightly (10-15 degrees).",
          "Pull bar down smoothly toward upper chest while driving elbows down.",
          "Extend arms back up slowly to full overhead stretch."
        ],
        tips: "Do not swing your torso backwards to gain momentum.",
        demonstrationUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_bent_over_row",
        name: "Bent-Over Barbell Row",
        category: "Back",
        muscleGroup: "Mid Back",
        secondaryMuscles: ["Lats", "Biceps", "Spinal Erectors"],
        difficulty: "Intermediate",
        equipment: "Barbell",
        caloriesPerMin: 8,
        instructions: [
          "Hinge forward at 45 degrees with knees slightly bent and spine neutral.",
          "Grip barbell with palms down, shoulder-width apart.",
          "Pull barbell up into lower ribcage/navel, squeezing shoulder blades together.",
          "Lower with control back to starting hang."
        ],
        tips: "Keep torso steady; do not jerk upwards to heave the weight.",
        demonstrationUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80"
      },

      // Shoulders
      {
        id: "ex_overhead_press",
        name: "Overhead Barbell Press",
        category: "Shoulders",
        muscleGroup: "Shoulders",
        secondaryMuscles: ["Triceps", "Upper Chest", "Core"],
        difficulty: "Intermediate",
        equipment: "Barbell",
        caloriesPerMin: 7,
        instructions: [
          "Stand tall with feet shoulder-width, bar resting on clavicles.",
          "Brace core and glutes tightly.",
          "Press barbell vertically upward, moving head back slightly to clear path.",
          "Lock out overhead with arms beside ears."
        ],
        tips: "Avoid leaning backwards excessively from lower spine.",
        demonstrationUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_lateral_raise",
        name: "Dumbbell Lateral Raise",
        category: "Shoulders",
        muscleGroup: "Lateral Deltoids",
        secondaryMuscles: ["Trapezius"],
        difficulty: "Beginner",
        equipment: "Dumbbells",
        caloriesPerMin: 5,
        instructions: [
          "Hold dumbbells at sides with palms facing inward, slight bend in elbows.",
          "Raise arms out to sides in an arc until parallel to floor.",
          "Pause briefly at peak with pinkies slightly higher than thumbs.",
          "Lower smoothly over 2 seconds."
        ],
        tips: "Lead with elbows rather than wrists to keep tension on the side delts.",
        demonstrationUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_face_pull",
        name: "Cable Face Pull",
        category: "Shoulders",
        muscleGroup: "Rear Deltoids",
        secondaryMuscles: ["Rotator Cuff", "Rhomboids"],
        difficulty: "Beginner",
        equipment: "Cable",
        caloriesPerMin: 5,
        instructions: [
          "Attach rope to cable set at eye height.",
          "Hold rope handles with thumbs pointing backward.",
          "Step back and pull rope directly toward bridge of nose, separating hands outward.",
          "Squeeze rear shoulders and external rotators firmly."
        ],
        tips: "Excellent exercise for posture and long-term shoulder joint health.",
        demonstrationUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80"
      },

      // Arms
      {
        id: "ex_bicep_curl",
        name: "Barbell Bicep Curl",
        category: "Arms",
        muscleGroup: "Biceps",
        secondaryMuscles: ["Forearms"],
        difficulty: "Beginner",
        equipment: "Barbell",
        caloriesPerMin: 5,
        instructions: [
          "Stand upright holding barbell with underhand shoulder-width grip.",
          "Keep elbows pinned close to torso.",
          "Curl bar upward while contracting biceps until fully flexed.",
          "Lower bar slowly under tension back to full extension."
        ],
        tips: "Do not swing torso to gain momentum on the way up.",
        demonstrationUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_tricep_pushdown",
        name: "Tricep Rope Pushdown",
        category: "Arms",
        muscleGroup: "Triceps",
        secondaryMuscles: ["Forearms"],
        difficulty: "Beginner",
        equipment: "Cable",
        caloriesPerMin: 5,
        instructions: [
          "Face cable station with rope attached to high pulley.",
          "Grip rope ends, lock elbows at sides of ribs.",
          "Push rope down until arms are straight, spreading rope ends apart at bottom.",
          "Allow rope to return to chest height while elbows stay static."
        ],
        tips: "Keep upper arms completely stationary throughout the movement.",
        demonstrationUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_hammer_curl",
        name: "Dumbbell Hammer Curl",
        category: "Arms",
        muscleGroup: "Brachialis & Biceps",
        secondaryMuscles: ["Forearms"],
        difficulty: "Beginner",
        equipment: "Dumbbells",
        caloriesPerMin: 5,
        instructions: [
          "Hold dumbbells at sides with palms facing each other (neutral grip).",
          "Curl dumbbells up toward shoulders while keeping palms facing in.",
          "Squeeze at top for 1 second, then lower with control."
        ],
        tips: "Builds arm thickness and forearm grip strength.",
        demonstrationUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80"
      },

      // Legs
      {
        id: "ex_barbell_squat",
        name: "Barbell Back Squat",
        category: "Legs",
        muscleGroup: "Quads & Glutes",
        secondaryMuscles: ["Hamstrings", "Core", "Calves"],
        difficulty: "Intermediate",
        equipment: "Barbell",
        caloriesPerMin: 9,
        instructions: [
          "Rest barbell across upper traps with hands securing the bar.",
          "Feet shoulder-width apart, toes flared slightly out.",
          "Hinge hips and bend knees simultaneously, sitting deep until thighs are at or below parallel.",
          "Drive into the floor through mid-foot to stand back up."
        ],
        tips: "Keep chest proud and knees tracking in line with toes.",
        demonstrationUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_rdl",
        name: "Romanian Deadlift (RDL)",
        category: "Legs",
        muscleGroup: "Hamstrings & Glutes",
        secondaryMuscles: ["Lower Back", "Forearms"],
        difficulty: "Intermediate",
        equipment: "Barbell",
        caloriesPerMin: 8,
        instructions: [
          "Hold bar at hips with an overhand grip.",
          "With soft knees, push hips backward as far as possible.",
          "Lower bar down shins until hamstrings feel a strong stretch.",
          "Drive hips forward powerfully to return to standing lockout."
        ],
        tips: "Do not squat down; this is a pure hip hinge movement.",
        demonstrationUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_bulgarian_split_squat",
        name: "Bulgarian Split Squat",
        category: "Legs",
        muscleGroup: "Quads & Glutes",
        secondaryMuscles: ["Hamstrings", "Calves"],
        difficulty: "Intermediate",
        equipment: "Dumbbells",
        caloriesPerMin: 8,
        instructions: [
          "Stand 2-3 feet in front of a flat bench.",
          "Place top of one foot rearward onto the bench.",
          "Lower front hip until front thigh is parallel to ground.",
          "Push through front heel to return to top position."
        ],
        tips: "Keep torso slightly leaned forward to bias glutes, or upright for quad bias.",
        demonstrationUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_calf_raise",
        name: "Standing Calf Raise",
        category: "Legs",
        muscleGroup: "Calves",
        secondaryMuscles: ["Ankles"],
        difficulty: "Beginner",
        equipment: "Dumbbells",
        caloriesPerMin: 4,
        instructions: [
          "Stand on edge of an elevated block or step with balls of feet.",
          "Lower heels deep for a full stretch.",
          "Raise up onto tiptoes as high as possible, squeezing calves at top.",
          "Lower smoothly under complete control."
        ],
        tips: "Pause at bottom stretch for 2 seconds to eliminate Achilles bounce.",
        demonstrationUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80"
      },

      // Abs
      {
        id: "ex_plank",
        name: "Forearm Plank",
        category: "Abs",
        muscleGroup: "Core",
        secondaryMuscles: ["Shoulders", "Glutes"],
        difficulty: "Beginner",
        equipment: "Bodyweight",
        caloriesPerMin: 5,
        instructions: [
          "Rest on forearms with elbows directly under shoulders.",
          "Extend legs back, balancing on balls of feet.",
          "Engage abs, flatten back, and maintain a rigid plank line.",
          "Breathe steadily and hold for target duration."
        ],
        tips: "Don't allow hips to hike up into the air or sag toward the floor.",
        demonstrationUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_hanging_leg_raise",
        name: "Hanging Leg Raise",
        category: "Abs",
        muscleGroup: "Lower Abs",
        secondaryMuscles: ["Hip Flexors", "Forearms"],
        difficulty: "Advanced",
        equipment: "Pull-Up Bar",
        caloriesPerMin: 7,
        instructions: [
          "Hang from pull-up bar with arms fully extended.",
          "Tilt pelvis slightly backward to engage lower abdominals.",
          "Raise straight legs up until parallel to floor (or toes to bar).",
          "Lower legs slowly without swinging."
        ],
        tips: "Initiate movement by tucking pelvis, not by kicking hip flexors.",
        demonstrationUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_russian_twist",
        name: "Russian Twists",
        category: "Abs",
        muscleGroup: "Obliques",
        secondaryMuscles: ["Transverse Abdominis"],
        difficulty: "Beginner",
        equipment: "Bodyweight",
        caloriesPerMin: 6,
        instructions: [
          "Sit on floor with knees bent and feet elevated slightly.",
          "Lean torso back at 45 degrees.",
          "Rotate torso side to side, tapping floor on each side of hip.",
          "Maintain braced core throughout."
        ],
        tips: "Rotate through shoulders and ribcage rather than just waving arms.",
        demonstrationUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80"
      },

      // Full Body
      {
        id: "ex_kettlebell_swing",
        name: "Kettlebell Swing",
        category: "Full body",
        muscleGroup: "Posterior Chain",
        secondaryMuscles: ["Glutes", "Hamstrings", "Shoulders", "Core"],
        difficulty: "Intermediate",
        equipment: "Kettlebell",
        caloriesPerMin: 11,
        instructions: [
          "Stand with feet shoulder-width, kettlebell one foot in front.",
          "Hinge at hips to grab bell, hike it between legs.",
          "Drive hips forward explosively, snapping hips to float kettlebell to chest height.",
          "Guide bell back into hip hinge and repeat fluidly."
        ],
        tips: "Power comes from hip snap, not an arm raise.",
        demonstrationUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_burpees",
        name: "Burpees",
        category: "Full body",
        muscleGroup: "Full Body",
        secondaryMuscles: ["Chest", "Quads", "Core", "Cardio"],
        difficulty: "Intermediate",
        equipment: "Bodyweight",
        caloriesPerMin: 12,
        instructions: [
          "From standing, drop into a squat and place hands on floor.",
          "Jump feet back into plank and perform a chest-to-floor push-up.",
          "Jump feet back toward hands into squat.",
          "Explode vertically upward, clapping hands overhead."
        ],
        tips: "Pace yourself evenly during high repetition circuits.",
        demonstrationUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80"
      },

      // Cardio
      {
        id: "ex_treadmill_run",
        name: "Treadmill Run / Jogging",
        category: "Cardio",
        muscleGroup: "Cardiovascular System",
        secondaryMuscles: ["Quads", "Calves", "Hamstrings"],
        difficulty: "Beginner",
        equipment: "Treadmill",
        caloriesPerMin: 10,
        instructions: [
          "Step onto treadmill deck and set comfortable warm-up pace.",
          "Increase speed to target aerobic or threshold pace.",
          "Maintain upright posture with natural arm swing.",
          "Cool down at a walking pace for 3-5 minutes."
        ],
        tips: "Land on midfoot rather than striking hard on heels.",
        demonstrationUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_jump_rope",
        name: "Jump Rope",
        category: "Cardio",
        muscleGroup: "Calves & Cardio",
        secondaryMuscles: ["Forearms", "Shoulders"],
        difficulty: "Beginner",
        equipment: "Jump Rope",
        caloriesPerMin: 11,
        instructions: [
          "Hold rope handles at hip height with elbows tucked in.",
          "Rotate rope using wrist motion rather than full arms.",
          "Jump lightly on balls of feet just 1-2 inches off the ground.",
          "Maintain a steady rhythmic cadence."
        ],
        tips: "Keep knees slightly soft to absorb shock.",
        demonstrationUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&auto=format&fit=crop&q=80"
      },

      // HIIT
      {
        id: "ex_jump_squats",
        name: "Jump Squats",
        category: "HIIT",
        muscleGroup: "Quads & Glutes",
        secondaryMuscles: ["Calves", "Cardio"],
        difficulty: "Intermediate",
        equipment: "Bodyweight",
        caloriesPerMin: 11,
        instructions: [
          "Start in a bodyweight squat stance.",
          "Lower hips into a parallel squat.",
          "Explosively leap straight up off the ground.",
          "Land softly through toes to heels and absorb directly into next squat."
        ],
        tips: "Cushion your landing softly to protect knee joints.",
        demonstrationUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_mountain_climbers",
        name: "Mountain Climbers",
        category: "HIIT",
        muscleGroup: "Core & Cardio",
        secondaryMuscles: ["Shoulders", "Hip Flexors"],
        difficulty: "Beginner",
        equipment: "Bodyweight",
        caloriesPerMin: 10,
        instructions: [
          "Assume a push-up plank position with hands under shoulders.",
          "Drive right knee up toward chest without raising hips.",
          "Quickly switch legs, driving left knee up as right extends back.",
          "Continue in a rapid running motion."
        ],
        tips: "Keep shoulders over hands and hips down.",
        demonstrationUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80"
      },

      // Yoga
      {
        id: "ex_downward_dog",
        name: "Downward-Facing Dog",
        category: "Yoga",
        muscleGroup: "Hamstrings & Shoulders",
        secondaryMuscles: ["Calves", "Spine"],
        difficulty: "Beginner",
        equipment: "Yoga Mat",
        caloriesPerMin: 4,
        instructions: [
          "Begin on hands and knees with wrists under shoulders.",
          "Tuck toes and lift hips up toward ceiling forming an inverted 'V'.",
          "Press palms firmly into mat, broadening shoulders.",
          "Gently press heels toward floor and hold for deep breaths."
        ],
        tips: "Bend knees slightly if hamstrings or lower back feel tight.",
        demonstrationUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_warrior_two",
        name: "Warrior II (Virabhadrasana II)",
        category: "Yoga",
        muscleGroup: "Hips & Legs",
        secondaryMuscles: ["Shoulders", "Core"],
        difficulty: "Beginner",
        equipment: "Yoga Mat",
        caloriesPerMin: 4,
        instructions: [
          "Step feet 4 feet apart, turn front foot out 90 degrees.",
          "Bend front knee over front ankle at 90 degrees.",
          "Extend arms out parallel to floor, gazing over front fingertips.",
          "Ground down through outer edge of back foot."
        ],
        tips: "Keep torso centered over pelvis; don't lean forward.",
        demonstrationUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80"
      },

      // Stretching
      {
        id: "ex_doorway_chest_stretch",
        name: "Doorway Chest Stretch",
        category: "Stretching",
        muscleGroup: "Pectorals",
        secondaryMuscles: ["Anterior Deltoids"],
        difficulty: "Beginner",
        equipment: "Doorway",
        caloriesPerMin: 2,
        instructions: [
          "Stand in an open doorway with forearm resting against doorframe at 90 degrees.",
          "Step forward with inside leg until you feel a gentle chest stretch.",
          "Hold steady for 30 seconds, breathing deeply.",
          "Switch arms and repeat."
        ],
        tips: "Do not twist spine; keep hips square.",
        demonstrationUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "ex_hamstring_stretch",
        name: "Standing Hamstring Stretch",
        category: "Stretching",
        muscleGroup: "Hamstrings",
        secondaryMuscles: ["Calves", "Lower Back"],
        difficulty: "Beginner",
        equipment: "Bodyweight",
        caloriesPerMin: 2,
        instructions: [
          "Extend one leg forward with heel on ground and toes pointing up.",
          "Hinge at hips, bending back knee slightly.",
          "Reach hands toward front toes until a mild stretch is felt along hamstring.",
          "Hold for 30 seconds without bouncing."
        ],
        tips: "Keep back flat as you hinge forward.",
        demonstrationUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80"
      }
    ],

    foods: [
      // Indian Staples
      {
        id: "food_roti",
        name: "Whole Wheat Roti (Chapati)",
        category: "Indian",
        servingUnit: "1 piece (40g)",
        calories: 104,
        protein: 3.1,
        carbs: 20.2,
        fat: 0.5,
        fiber: 2.8,
        dietType: "Vegetarian",
        isPopular: true
      },
      {
        id: "food_paneer_raw",
        name: "Fresh Paneer (Cottage Cheese)",
        category: "Indian",
        servingUnit: "100g",
        calories: 265,
        protein: 18.3,
        carbs: 3.4,
        fat: 20.8,
        fiber: 0.0,
        dietType: "Vegetarian",
        isPopular: true
      },
      {
        id: "food_dal_tadka",
        name: "Yellow Dal Tadka",
        category: "Indian",
        servingUnit: "1 bowl (150g)",
        calories: 145,
        protein: 7.8,
        carbs: 21.0,
        fat: 3.6,
        fiber: 4.2,
        dietType: "Vegetarian",
        isPopular: true
      },
      {
        id: "food_brown_rice",
        name: "Cooked Brown Basmati Rice",
        category: "Indian",
        servingUnit: "1 bowl (150g)",
        calories: 165,
        protein: 3.8,
        carbs: 34.5,
        fat: 1.2,
        fiber: 2.6,
        dietType: "Vegan",
        isPopular: true
      },
      {
        id: "food_white_rice",
        name: "Cooked White Basmati Rice",
        category: "Indian",
        servingUnit: "1 bowl (150g)",
        calories: 195,
        protein: 4.1,
        carbs: 43.0,
        fat: 0.4,
        fiber: 0.8,
        dietType: "Vegan",
        isPopular: true
      },
      {
        id: "food_curd",
        name: "Plain Curd / Dahi",
        category: "Indian",
        servingUnit: "1 cup (150g)",
        calories: 98,
        protein: 6.2,
        carbs: 7.1,
        fat: 4.5,
        fiber: 0.0,
        dietType: "Vegetarian",
        isPopular: true
      },
      {
        id: "food_moong_sprouts",
        name: "Moong Bean Sprouts",
        category: "Indian",
        servingUnit: "1 cup (100g)",
        calories: 30,
        protein: 3.2,
        carbs: 5.9,
        fat: 0.2,
        fiber: 1.9,
        dietType: "Vegan",
        isPopular: true
      },
      {
        id: "food_egg_bhurji",
        name: "Indian Egg Bhurji (2 Eggs)",
        category: "Indian",
        servingUnit: "1 plate (140g)",
        calories: 185,
        protein: 13.5,
        carbs: 3.8,
        fat: 12.8,
        fiber: 0.9,
        dietType: "Non-Vegetarian",
        isPopular: true
      },
      {
        id: "food_chicken_curry",
        name: "Home-Style Chicken Curry",
        category: "Indian",
        servingUnit: "1 bowl (180g)",
        calories: 240,
        protein: 24.5,
        carbs: 6.2,
        fat: 12.8,
        fiber: 1.5,
        dietType: "Non-Vegetarian",
        isPopular: true
      },
      {
        id: "food_rajma",
        name: "Rajma Masala (Kidney Beans)",
        category: "Indian",
        servingUnit: "1 bowl (180g)",
        calories: 178,
        protein: 9.2,
        carbs: 27.5,
        fat: 3.8,
        fiber: 6.5,
        dietType: "Vegetarian",
        isPopular: true
      },
      {
        id: "food_palak_paneer",
        name: "Palak Paneer",
        category: "Indian",
        servingUnit: "1 bowl (180g)",
        calories: 235,
        protein: 14.2,
        carbs: 8.5,
        fat: 16.5,
        fiber: 3.8,
        dietType: "Vegetarian",
        isPopular: true
      },
      {
        id: "food_idli",
        name: "Steamed Idli",
        category: "Indian",
        servingUnit: "2 pieces (80g)",
        calories: 120,
        protein: 4.2,
        carbs: 25.0,
        fat: 0.4,
        fiber: 1.4,
        dietType: "Vegan",
        isPopular: true
      },
      {
        id: "food_masala_oats",
        name: "Indian Masala Oats with Veggies",
        category: "Indian",
        servingUnit: "1 bowl (160g)",
        calories: 155,
        protein: 5.5,
        carbs: 27.0,
        fat: 2.8,
        fiber: 4.2,
        dietType: "Vegan",
        isPopular: true
      },
      {
        id: "food_soya_chunks",
        name: "Boiled Soya Chunks",
        category: "Indian",
        servingUnit: "1 cup (100g)",
        calories: 140,
        protein: 26.0,
        carbs: 9.0,
        fat: 0.5,
        fiber: 6.0,
        dietType: "Vegan",
        isPopular: true
      },

      // International & Staples
      {
        id: "food_chicken_breast",
        name: "Grilled Chicken Breast",
        category: "Poultry",
        servingUnit: "100g",
        calories: 165,
        protein: 31.0,
        carbs: 0.0,
        fat: 3.6,
        fiber: 0.0,
        dietType: "Non-Vegetarian",
        isPopular: true
      },
      {
        id: "food_salmon",
        name: "Baked Atlantic Salmon",
        category: "Fish",
        servingUnit: "100g",
        calories: 206,
        protein: 22.1,
        carbs: 0.0,
        fat: 12.3,
        fiber: 0.0,
        dietType: "Non-Vegetarian",
        isPopular: true
      },
      {
        id: "food_whole_egg",
        name: "Boiled Whole Egg",
        category: "Poultry",
        servingUnit: "1 large (50g)",
        calories: 74,
        protein: 6.3,
        carbs: 0.4,
        fat: 5.0,
        fiber: 0.0,
        dietType: "Non-Vegetarian",
        isPopular: true
      },
      {
        id: "food_egg_white",
        name: "Boiled Egg White",
        category: "Poultry",
        servingUnit: "1 large (33g)",
        calories: 17,
        protein: 3.6,
        carbs: 0.2,
        fat: 0.1,
        fiber: 0.0,
        dietType: "Non-Vegetarian",
        isPopular: true
      },
      {
        id: "food_whey_protein",
        name: "Whey Protein Isolate",
        category: "Supplements",
        servingUnit: "1 scoop (30g)",
        calories: 120,
        protein: 25.0,
        carbs: 2.0,
        fat: 1.0,
        fiber: 0.0,
        dietType: "Vegetarian",
        isPopular: true
      },
      {
        id: "food_rolled_oats",
        name: "Rolled Oatmeal (Dry)",
        category: "Grains",
        servingUnit: "1/2 cup (40g)",
        calories: 150,
        protein: 5.0,
        carbs: 27.0,
        fat: 2.5,
        fiber: 4.0,
        dietType: "Vegan",
        isPopular: true
      },
      {
        id: "food_peanut_butter",
        name: "Natural Peanut Butter",
        category: "Nuts & Spreads",
        servingUnit: "1 tbsp (16g)",
        calories: 95,
        protein: 4.0,
        carbs: 3.2,
        fat: 8.0,
        fiber: 1.0,
        dietType: "Vegan",
        isPopular: true
      },
      {
        id: "food_almonds",
        name: "Raw California Almonds",
        category: "Nuts",
        servingUnit: "1 handful (28g / 23 nuts)",
        calories: 164,
        protein: 6.0,
        carbs: 6.1,
        fat: 14.2,
        fiber: 3.5,
        dietType: "Vegan",
        isPopular: true
      },
      {
        id: "food_banana",
        name: "Fresh Banana",
        category: "Fruits",
        servingUnit: "1 medium (118g)",
        calories: 105,
        protein: 1.3,
        carbs: 27.0,
        fat: 0.3,
        fiber: 3.1,
        dietType: "Vegan",
        isPopular: true
      },
      {
        id: "food_apple",
        name: "Crisp Apple",
        category: "Fruits",
        servingUnit: "1 medium (182g)",
        calories: 95,
        protein: 0.5,
        carbs: 25.0,
        fat: 0.3,
        fiber: 4.4,
        dietType: "Vegan",
        isPopular: true
      },
      {
        id: "food_avocado",
        name: "Hass Avocado",
        category: "Fruits",
        servingUnit: "1/2 avocado (100g)",
        calories: 160,
        protein: 2.0,
        carbs: 8.5,
        fat: 14.7,
        fiber: 6.7,
        dietType: "Vegan",
        isPopular: true
      },
      {
        id: "food_broccoli",
        name: "Steamed Broccoli Florets",
        category: "Vegetables",
        servingUnit: "1 cup (91g)",
        calories: 31,
        protein: 2.6,
        carbs: 6.0,
        fat: 0.3,
        fiber: 2.4,
        dietType: "Vegan",
        isPopular: true
      }
    ],

    routines: [
      {
        id: "routine_push",
        name: "Push Day – Chest, Shoulders & Triceps",
        category: "Hypertrophy",
        difficulty: "Intermediate",
        estimatedMinutes: 50,
        caloriesBurnEstimate: 340,
        exercises: [
          { exerciseId: "ex_bench_press", sets: 4, targetReps: "8-10", restSeconds: 90 },
          { exerciseId: "ex_incline_db_press", sets: 3, targetReps: "10-12", restSeconds: 75 },
          { exerciseId: "ex_overhead_press", sets: 3, targetReps: "8-10", restSeconds: 90 },
          { exerciseId: "ex_lateral_raise", sets: 4, targetReps: "12-15", restSeconds: 60 },
          { exerciseId: "ex_tricep_pushdown", sets: 3, targetReps: "12-15", restSeconds: 60 }
        ]
      },
      {
        id: "routine_pull",
        name: "Pull Day – Back, Rear Delts & Biceps",
        category: "Hypertrophy",
        difficulty: "Intermediate",
        estimatedMinutes: 55,
        caloriesBurnEstimate: 360,
        exercises: [
          { exerciseId: "ex_deadlift", sets: 3, targetReps: "5-6", restSeconds: 120 },
          { exerciseId: "ex_pullups", sets: 3, targetReps: "8-10", restSeconds: 90 },
          { exerciseId: "ex_bent_over_row", sets: 3, targetReps: "8-10", restSeconds: 90 },
          { exerciseId: "ex_face_pull", sets: 4, targetReps: "15", restSeconds: 60 },
          { exerciseId: "ex_bicep_curl", sets: 3, targetReps: "10-12", restSeconds: 60 },
          { exerciseId: "ex_hammer_curl", sets: 3, targetReps: "12", restSeconds: 60 }
        ]
      },
      {
        id: "routine_legs",
        name: "Leg Day Annihilation",
        category: "Strength",
        difficulty: "Advanced",
        estimatedMinutes: 60,
        caloriesBurnEstimate: 420,
        exercises: [
          { exerciseId: "ex_barbell_squat", sets: 4, targetReps: "8", restSeconds: 120 },
          { exerciseId: "ex_rdl", sets: 3, targetReps: "10", restSeconds: 90 },
          { exerciseId: "ex_bulgarian_split_squat", sets: 3, targetReps: "10 each leg", restSeconds: 90 },
          { exerciseId: "ex_calf_raise", sets: 4, targetReps: "15", restSeconds: 60 },
          { exerciseId: "ex_hanging_leg_raise", sets: 3, targetReps: "12", restSeconds: 60 }
        ]
      },
      {
        id: "routine_hiit_shred",
        name: "20-Min Full Body HIIT Shred",
        category: "HIIT",
        difficulty: "Beginner",
        estimatedMinutes: 20,
        caloriesBurnEstimate: 250,
        exercises: [
          { exerciseId: "ex_burpees", sets: 4, targetReps: "15", restSeconds: 45 },
          { exerciseId: "ex_jump_squats", sets: 4, targetReps: "20", restSeconds: 45 },
          { exerciseId: "ex_mountain_climbers", sets: 4, targetReps: "30 sec", restSeconds: 30 },
          { exerciseId: "ex_pushups", sets: 4, targetReps: "12", restSeconds: 45 },
          { exerciseId: "ex_plank", sets: 4, targetReps: "45 sec", restSeconds: 30 }
        ]
      },
      {
        id: "routine_yoga_flow",
        name: "Morning Mobility & Yoga Flow",
        category: "Yoga",
        difficulty: "Beginner",
        estimatedMinutes: 25,
        caloriesBurnEstimate: 110,
        exercises: [
          { exerciseId: "ex_downward_dog", sets: 3, targetReps: "60 sec", restSeconds: 30 },
          { exerciseId: "ex_warrior_two", sets: 3, targetReps: "45 sec each", restSeconds: 30 },
          { exerciseId: "ex_doorway_chest_stretch", sets: 2, targetReps: "30 sec", restSeconds: 20 },
          { exerciseId: "ex_hamstring_stretch", sets: 2, targetReps: "30 sec each", restSeconds: 20 }
        ]
      }
    ],

    workoutLogs: [
      {
        id: "wlog_1",
        userId: "user_alex",
        routineId: "routine_push",
        routineName: "Push Day – Chest, Shoulders & Triceps",
        date: "2026-11-18",
        durationMinutes: 48,
        caloriesBurned: 320,
        completed: true,
        notes: "Hit a PR on bench press! Felt energetic throughout.",
        exercises: [
          {
            exerciseId: "ex_bench_press",
            exerciseName: "Barbell Bench Press",
            sets: [
              { setNumber: 1, reps: 10, weight: 45, completed: true },
              { setNumber: 2, reps: 10, weight: 50, completed: true },
              { setNumber: 3, reps: 8, weight: 55, completed: true },
              { setNumber: 4, reps: 8, weight: 55, completed: true }
            ]
          },
          {
            exerciseId: "ex_incline_db_press",
            exerciseName: "Incline Dumbbell Press",
            sets: [
              { setNumber: 1, reps: 12, weight: 14, completed: true },
              { setNumber: 2, reps: 10, weight: 16, completed: true },
              { setNumber: 3, reps: 10, weight: 16, completed: true }
            ]
          },
          {
            exerciseId: "ex_lateral_raise",
            exerciseName: "Dumbbell Lateral Raise",
            sets: [
              { setNumber: 1, reps: 15, weight: 7, completed: true },
              { setNumber: 2, reps: 14, weight: 7, completed: true },
              { setNumber: 3, reps: 12, weight: 8, completed: true }
            ]
          }
        ]
      },
      {
        id: "wlog_2",
        userId: "user_alex",
        routineId: "routine_hiit_shred",
        routineName: "20-Min Full Body HIIT Shred",
        date: "2026-11-16",
        durationMinutes: 22,
        caloriesBurned: 240,
        completed: true,
        notes: "Quick sweat session before work.",
        exercises: [
          {
            exerciseId: "ex_burpees",
            exerciseName: "Burpees",
            sets: [{ setNumber: 1, reps: 15, weight: 0, completed: true }]
          }
        ]
      }
    ],

    mealLogs: [
      {
        id: "mlog_1",
        userId: "user_alex",
        date: "2026-11-18",
        mealType: "breakfast",
        foodId: "food_masala_oats",
        foodName: "Indian Masala Oats with Veggies",
        servings: 1.5,
        servingUnit: "1 bowl (160g)",
        calories: 232,
        protein: 8.2,
        carbs: 40.5,
        fat: 4.2,
        fiber: 6.3,
        loggedAt: "2026-11-18T08:30:00.000Z"
      },
      {
        id: "mlog_2",
        userId: "user_alex",
        date: "2026-11-18",
        mealType: "breakfast",
        foodId: "food_almonds",
        foodName: "Raw California Almonds",
        servings: 1,
        servingUnit: "1 handful (28g / 23 nuts)",
        calories: 164,
        protein: 6.0,
        carbs: 6.1,
        fat: 14.2,
        fiber: 3.5,
        loggedAt: "2026-11-18T08:35:00.000Z"
      },
      {
        id: "mlog_3",
        userId: "user_alex",
        date: "2026-11-18",
        mealType: "lunch",
        foodId: "food_roti",
        foodName: "Whole Wheat Roti (Chapati)",
        servings: 2,
        servingUnit: "1 piece (40g)",
        calories: 208,
        protein: 6.2,
        carbs: 40.4,
        fat: 1.0,
        fiber: 5.6,
        loggedAt: "2026-11-18T13:15:00.000Z"
      },
      {
        id: "mlog_4",
        userId: "user_alex",
        date: "2026-11-18",
        mealType: "lunch",
        foodId: "food_paneer_raw",
        foodName: "Fresh Paneer (Cottage Cheese)",
        servings: 0.8,
        servingUnit: "100g",
        calories: 212,
        protein: 14.6,
        carbs: 2.7,
        fat: 16.6,
        fiber: 0.0,
        loggedAt: "2026-11-18T13:15:00.000Z"
      },
      {
        id: "mlog_5",
        userId: "user_alex",
        date: "2026-11-18",
        mealType: "lunch",
        foodId: "food_dal_tadka",
        foodName: "Yellow Dal Tadka",
        servings: 1,
        servingUnit: "1 bowl (150g)",
        calories: 145,
        protein: 7.8,
        carbs: 21.0,
        fat: 3.6,
        fiber: 4.2,
        loggedAt: "2026-11-18T13:15:00.000Z"
      },
      {
        id: "mlog_6",
        userId: "user_alex",
        date: "2026-11-18",
        mealType: "snack",
        foodId: "food_whey_protein",
        foodName: "Whey Protein Isolate",
        servings: 1,
        servingUnit: "1 scoop (30g)",
        calories: 120,
        protein: 25.0,
        carbs: 2.0,
        fat: 1.0,
        fiber: 0.0,
        loggedAt: "2026-11-18T16:45:00.000Z"
      }
    ],

    progressLogs: [
      {
        id: "plog_1",
        userId: "user_alex",
        date: "2026-10-15",
        weight: 65.5,
        height: 168,
        bmi: 23.2,
        bodyFat: 24.5,
        waist: 74,
        chest: 88,
        arm: 28,
        thigh: 56,
        notes: "Starting new fitness journey! Feeling motivated."
      },
      {
        id: "plog_2",
        userId: "user_alex",
        date: "2026-11-01",
        weight: 64.2,
        height: 168,
        bmi: 22.7,
        bodyFat: 23.8,
        waist: 72.5,
        chest: 87.5,
        arm: 28.5,
        thigh: 55,
        notes: "Feeling leaner and energy levels during workouts are way higher."
      },
      {
        id: "plog_3",
        userId: "user_alex",
        date: "2026-11-18",
        weight: 63.5,
        height: 168,
        bmi: 22.5,
        bodyFat: 23.0,
        waist: 71.0,
        chest: 87.0,
        arm: 29.0,
        thigh: 54.5,
        notes: "Noticeable tone in shoulders and abs. Waist down 3 cm!"
      }
    ],

    habitLogs: [
      {
        id: "hlog_1",
        userId: "user_alex",
        date: "2026-11-18",
        waterMl: 2250,
        steps: 8420,
        sleepHours: 7.5,
        sleepQuality: 4,
        sleepNotes: "Woke up refreshed after 7.5 hours of uninterrupted rest.",
        meditationMinutes: 10,
        wellnessScore: 88,
        habits: [
          { id: "h1", name: "Drink 500ml water upon waking", completed: true },
          { id: "h2", name: "10-minute morning meditation", completed: true },
          { id: "h3", name: "Hit daily protein target (120g)", completed: false },
          { id: "h4", name: "No phone 30 min before bed", completed: true },
          { id: "h5", name: "10,000 steps daily walk", completed: false }
        ]
      }
    ],

    challenges: [
      {
        id: "chal_shred_30",
        title: "30-Day Shred & Burn Challenge",
        description: "Complete 20 high-energy workout sessions within 30 days to maximize calorie burn, lean muscle retention, and cardiovascular endurance.",
        category: "Fitness",
        durationDays: 30,
        participantsCount: 1420,
        targetSessions: 20,
        xpReward: 500,
        badgeReward: "badge_shred_master",
        bannerUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        joinedUsers: ["user_alex", "user_marcus"]
      },
      {
        id: "chal_steps_10k",
        title: "10,000 Steps Daily Sprint",
        description: "Maintain a daily average of 10,000 steps for 14 consecutive days. Boost daily non-exercise physical activity and heart health.",
        category: "Habits",
        durationDays: 14,
        participantsCount: 2850,
        targetSessions: 14,
        xpReward: 350,
        badgeReward: "badge_step_king",
        bannerUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&auto=format&fit=crop&q=80",
        joinedUsers: ["user_alex", "user_priya"]
      },
      {
        id: "chal_hydration_hero",
        title: "Hydration Hero – 3L Daily for 21 Days",
        description: "Drink at least 3,000ml of water each day for 21 days straight to detoxify, enhance muscle pumps, and elevate daily cognitive focus.",
        category: "Wellness",
        durationDays: 21,
        participantsCount: 980,
        targetSessions: 21,
        xpReward: 300,
        badgeReward: "badge_hydration_master",
        bannerUrl: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80",
        joinedUsers: ["user_alex"]
      },
      {
        id: "chal_century_pushups",
        title: "100 Push-Ups in a Single Session",
        description: "Work your way up through sets to conquer 100 proper form push-ups in one workout.",
        category: "Strength",
        durationDays: 7,
        participantsCount: 750,
        targetSessions: 1,
        xpReward: 400,
        badgeReward: "badge_iron_arms",
        bannerUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=80",
        joinedUsers: ["user_marcus"]
      }
    ],

    badges: [
      {
        id: "badge_first_step",
        name: "First Step",
        description: "Complete and log your very first workout on FitLife AI.",
        icon: "Flame",
        category: "Workout",
        xp: 100,
        unlockedUsers: ["user_admin", "user_alex", "user_marcus", "user_priya"]
      },
      {
        id: "badge_streak_7",
        name: "Week Warrior",
        description: "Maintain a 7-day active daily logging streak.",
        icon: "Zap",
        category: "Streak",
        xp: 250,
        unlockedUsers: ["user_admin", "user_alex", "user_marcus"]
      },
      {
        id: "badge_hydration_master",
        name: "Hydration Hero",
        description: "Reach your daily 3L water goal 5 days in a row.",
        icon: "Droplets",
        category: "Habits",
        xp: 150,
        unlockedUsers: ["user_admin", "user_alex"]
      },
      {
        id: "badge_clean_eater",
        name: "Macro Master",
        description: "Hit your daily protein and calorie goals within 5% precision.",
        icon: "Apple",
        category: "Nutrition",
        xp: 200,
        unlockedUsers: ["user_alex", "user_admin"]
      },
      {
        id: "badge_iron_lifter",
        name: "Iron Lifter",
        description: "Log over 10,000 kg of total workout volume in a single week.",
        icon: "Dumbbell",
        category: "Workout",
        xp: 300,
        unlockedUsers: ["user_admin", "user_marcus"]
      },
      {
        id: "badge_zen_master",
        name: "Zen Master",
        description: "Log 60 minutes of mindfulness and recovery sessions.",
        icon: "HeartPulse",
        category: "Recovery",
        xp: 200,
        unlockedUsers: ["user_alex"]
      },
      {
        id: "badge_step_king",
        name: "Pacesetter",
        description: "Accumulate 50,000 steps logged across 5 days.",
        icon: "Footprints",
        category: "Habits",
        xp: 250,
        unlockedUsers: ["user_admin", "user_alex"]
      },
      {
        id: "badge_shred_master",
        name: "Shred Champion",
        description: "Finish the 30-Day Shred & Burn fitness challenge.",
        icon: "Trophy",
        category: "Challenge",
        xp: 500,
        unlockedUsers: ["user_admin"]
      }
    ],

    socialPosts: [
      {
        id: "post_1",
        userId: "user_marcus",
        authorName: "Marcus Vance",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        content: "Just smashed a heavy leg day! Hit 140kg x 6 on barbell squats. Consistency over everything. Remember to fuel your recovery with good carbs and clean protein!",
        tag: "Leg Day",
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80",
        likes: ["user_alex", "user_admin"],
        comments: [
          {
            id: "c1",
            userId: "user_alex",
            authorName: "Alex Morgan",
            text: "Huge numbers Marcus! Inspiring grind 🔥",
            timestamp: "2026-11-18T14:10:00.000Z"
          }
        ],
        timestamp: "2026-11-18T13:45:00.000Z"
      },
      {
        id: "post_2",
        userId: "user_alex",
        authorName: "Alex Morgan",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        content: "Completed my Push workout and logged my lunch: 2 whole wheat rotis, fresh paneer & yellow dal tadka. 38g of vegetarian protein secured! Day 8 streak intact ⚡",
        tag: "Nutrition & Strength",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
        likes: ["user_marcus", "user_priya", "user_admin"],
        comments: [
          {
            id: "c2",
            userId: "user_priya",
            authorName: "Priya Sharma",
            text: "Love this vegetarian protein combo! Going to try it today.",
            timestamp: "2026-11-18T15:20:00.000Z"
          }
        ],
        timestamp: "2026-11-18T14:00:00.000Z"
      },
      {
        id: "post_3",
        userId: "user_priya",
        authorName: "Priya Sharma",
        authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        content: "Started the 10,000 steps daily challenge. An evening walk in the park clears the mind like nothing else. Reached 8,200 steps so far!",
        tag: "Wellness Walk",
        imageUrl: "",
        likes: ["user_alex"],
        comments: [],
        timestamp: "2026-11-18T16:30:00.000Z"
      }
    ],

    notifications: [
      {
        id: "notif_1",
        userId: "user_alex",
        type: "reminder",
        title: "Hydration Reminder 💧",
        message: "You're 750ml away from your daily 3,000ml water goal. Take a refreshing sip!",
        read: false,
        timestamp: "2026-11-18T17:00:00.000Z"
      },
      {
        id: "notif_2",
        userId: "user_alex",
        type: "achievement",
        title: "Streak Milestones Unlocked! ⚡",
        message: "Congratulations! You've maintained an 8-day active streak. Keep the momentum going!",
        read: true,
        timestamp: "2026-11-18T09:00:00.000Z"
      },
      {
        id: "notif_3",
        userId: "user_alex",
        type: "social",
        title: "Marcus liked your post",
        message: "Marcus Vance liked your post 'Completed my Push workout and logged my lunch...'",
        read: true,
        timestamp: "2026-11-18T14:15:00.000Z"
      }
    ],

    reportedPosts: []
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  console.log(`Seed data successfully written to ${DATA_FILE}`);
}

generateSeed().catch(err => {
  console.error("Error generating seed data:", err);
  process.exit(1);
});
