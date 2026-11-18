import express from 'express';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const SYSTEM_PROMPT = `You are FitLife Coach, an elite certified strength & conditioning specialist (CSCS), sports nutritionist, and compassionate wellness mentor.
Your guidelines:
1. Provide evidence-informed, sustainable fitness and nutrition advice.
2. Emphasize proper exercise biomechanics, progressive overload, and joint longevity.
3. Recommend balanced macro distribution (proteins, healthy fats, complex carbs, micronutrients).
4. Strictly avoid crash dieting, severe caloric deficits (<1200 kcal/day), or dangerous supplement recommendations.
5. Remind users when appropriate that fitness advice is for educational and wellness purposes and not a substitute for clinical medical evaluation.
6. Format answers with clear headings, bullet points, and concise workout/diet templates where suitable.
7. Be encouraging, empathetic, and motivating.`;

function generateLocalAiResponse(message, user, context) {
  const q = message.toLowerCase();
  const userName = user.name.split(' ')[0] || 'Friend';
  const goal = user.fitnessGoal || 'general fitness';
  const level = user.fitnessLevel || 'Intermediate';
  const equipment = Array.isArray(user.equipment) ? user.equipment.join(', ') : 'standard equipment';
  const diet = user.dietaryPreference || 'balanced';

  // 1. Workout plan generation
  if (q.includes('plan') || q.includes('routine') || q.includes('split') || q.includes('generate')) {
    return `### Personalized Workout Protocol for ${userName} ⚡
**Target Goal:** ${goal} | **Level:** ${level} | **Available Equipment:** ${equipment}

Here is a structured, evidence-informed 4-day training split designed to stimulate muscular adaptation while safeguarding joint health:

#### **Day 1: Upper Body Push & Core**
* **A1. Incline Dumbbell or Barbell Press:** 3-4 sets × 8-10 reps *(2 min rest)*
* **A2. Overhead Dumbbell Shoulder Press:** 3 sets × 10-12 reps *(90s rest)*
* **A3. Bodyweight or Weighted Dips / Push-ups:** 3 sets × to near failure *(60s rest)*
* **A4. Lateral Dumbbell Raises:** 4 sets × 12-15 reps *(45s rest)*
* **A5. Forearm Plank:** 3 sets × 45-60 seconds hold

#### **Day 2: Lower Body & Posterior Chain**
* **B1. Barbell or Goblet Squats:** 4 sets × 8-10 reps *(2 min rest)*
* **B2. Romanian Deadlifts (RDLs):** 3 sets × 10-12 reps *(Focus on slow 3s eccentric lowering)*
* **B3. Bulgarian Split Squats:** 3 sets × 10 reps each leg *(90s rest)*
* **B4. Standing Calf Raises:** 4 sets × 15 reps *(2s pause at peak stretch)*

#### **Day 3: Active Recovery & Mobility**
* 30-minute brisk outdoor walk + 15 minutes dedicated hip flexor, thoracic spine, and hamstring stretching.

#### **Day 4: Upper Body Pull & Posterior Delts**
* **C1. Neutral Grip Pull-Ups or Lat Pulldowns:** 4 sets × 8-10 reps
* **C2. Bent-Over Barbell or Dumbbell Rows:** 3 sets × 10 reps
* **C3. Cable or Resistance Band Face Pulls:** 4 sets × 15 reps *(Focus on rotator cuff external rotation)*
* **C4. Incline Dumbbell Bicep Curls:** 3 sets × 12 reps

> 💡 **Coach's Tip:** Apply progressive overload gradually: add 1 rep per set or 1-2 kg to the bar each week once you hit the top rep target with pristine form.

*Note: Always warm up for 5-7 minutes with dynamic mobility drills before loading heavy resistance.*`;
  }

  // 2. Exercise alternatives / substitutions
  if (q.includes('substitute') || q.includes('alternative') || q.includes('replace') || q.includes('hurt') || q.includes('pain') || q.includes('instead of')) {
    return `### Smart Exercise Alternatives for Joint Comfort 🛡️

When substituting exercises, our goal is to match the primary movement pattern and muscular stimulus while accommodating individual biomechanics or discomfort:

| Original Exercise | Recommended Alternative | Primary Advantage |
| :--- | :--- | :--- |
| **Barbell Bench Press** | **Neutral Grip Dumbbell Press** or **Floor Press** | Reduces anterior shoulder impingement and allows natural scapular movement |
| **Barbell Back Squat** | **Bulgarian Split Squat** or **Goblet Squat** | Deloads the lumbar spine while providing intense unilateral quad and glute stimulus |
| **Conventional Deadlift** | **Trap Bar (Hex Bar) Deadlift** or **Romanian Deadlift** | Keeps center of gravity closer to body, drastically reducing shear stress on L4/L5 |
| **Overhead Barbell Press** | **Half-Kneeling Landmine Press** | Provides a natural arc for the scapula without requiring hyper-extended lumbar mobility |
| **Pull-Ups** | **Chest-Supported Rows** or **Inverted TRX Rows** | Safer on rotator cuffs and allows controlled scapular retraction |

> ⚠️ *Important Disclaimer: If you experience sharp, pinching, or persistent joint pain during any exercise, stop immediately and consult an orthopedist or physical therapist for clinical assessment.*`;
  }

  // 3. Form and technique explanation
  if (q.includes('technique') || q.includes('form') || q.includes('how to do') || q.includes('explain')) {
    return `### Master the Form: Biomechanics & Cueing 🎯

Great technique is the ultimate shortcut to muscle hypertrophy and joint preservation. Here is the gold-standard cue checklist:

1. **The Set-Up & Bracing (The Valsalva Maneuver):**
   * Before every repetition, draw air into your abdomen (360-degree diaphragm expansion), not just your upper chest.
   * Lock your ribcage down toward your pelvis as if preparing for a punch. This stabilizes your spinal column.

2. **Scapular Control:**
   * For pressing and pulling movements, remember: **Down and Back**. Retract and depress your shoulder blades into your "back pockets."
   * Do not let shoulders roll forward at the bottom of a bench press or push-up.

3. **Tempo & Time Under Tension (TUT):**
   * Controlled 2-3 second lowering (eccentric phase).
   * Brief 1-second pause at maximum stretch without losing tension.
   * Explosive, intentional push or pull (concentric phase).

4. **Mind-Muscle Connection:**
   * Focus your cognitive attention directly on the muscle contracting rather than merely moving the external weight from Point A to Point B.`;
  }

  // 4. Nutrition, diet, protein, Indian foods
  if (q.includes('food') || q.includes('diet') || q.includes('protein') || q.includes('eat') || q.includes('calorie') || q.includes('meal')) {
    return `### Evidence-Informed Nutrition Strategy for ${userName} 🥗
**Your Preference:** ${diet} | **Calorie Target:** ~${user.dailyCalorieGoal || 2000} kcal/day

For sustainable ${goal}, focus on high nutrient density, sufficient protein synthesis, and consistent hydration:

#### **Top High-Protein Sources for Your Lifestyle:**
* **Indian Staples:**
  * **Paneer & Tofu:** 100g gives ~18g protein. High in leucine and calcium.
  * **Moong Dal & Chana / Rajma:** 1 bowl cooked delivers 8-10g protein plus 6g dietary fiber for gut health.
  * **Curd / Greek Yogurt:** 1 cup gives 10-15g protein and active probiotics.
  * **Soya Chunks:** One of the richest plant proteins (~52g protein per 100g dry weight).
  * **Eggs / Egg Whites:** Biological value of 100; 2 whole eggs + 2 egg whites provide ~20g bioavailable protein.
  * **Chicken Breast / Fish:** 150g grilled provides ~38-42g lean protein.

#### **Balanced Daily Blueprint:**
1. **Morning:** 500ml water + warm oats with nuts, seeds, and protein shake or eggs.
2. **Midday:** 2 whole wheat rotis or brown rice, 1 bowl dal tadka, 100g paneer or chicken, and a large raw salad.
3. **Pre-Workout (60 min before):** Banana with 1 tbsp peanut butter or a light rice cake.
4. **Dinner:** Light vegetable stir-fry, palak paneer or baked fish, and a cup of curd.

> 💧 **Hydration Reminder:** Keep your water intake near ${user.dailyWaterGoal || 3000}ml daily to maintain cellular hydration, nutrient delivery, and metabolic rate!`;
  }

  // 5. Rest, recovery, sore muscles, sleep
  if (q.includes('rest') || q.includes('sore') || q.includes('sleep') || q.includes('recovery') || q.includes('tired')) {
    return `### Optimal Recovery & Muscle Repair Protocol 🌙

Muscles do not grow in the gym—they are broken down during exercise and repaired during restful recovery. Here is how to accelerate your recovery:

1. **Sleep Optimization (The Ultimate Anabolic):**
   * Target **7.5 to 8.5 hours** of quality sleep. Deep sleep (Stages 3 & 4) is when 95% of human growth hormone (HGH) is naturally pulsed.
   * Keep your room cool (18-20°C / 65-68°F) and completely dark.
   * Dim screens 45 minutes before bedtime to prevent melatonin suppression.

2. **Managing Delayed Onset Muscle Soreness (DOMS):**
   * **Active Recovery:** A brisk 20-minute walk or light cycling increases capillary blood flow, flushing metabolic byproducts without incurring further muscle damage.
   * **Hydration & Electrolytes:** Ensure you are getting sodium, potassium, and magnesium.
   * **Gentle Static Stretching:** Spend 5-10 minutes on tight muscle bellies after a warm shower.

3. **When to Take a Full Rest Day:**
   * If your resting heart rate is elevated by 5+ bpm above normal.
   * If motivation feels completely drained or joints feel creaky rather than just muscularly fatigued.
   * *Take pride in rest days—they are where your gains consolidate!*`;
  }

  // 6. Motivation and mindset
  return `### You've Got This, ${userName}! 💥

Remember why you began this journey: **${goal}**.

Fitness is not about perfection; it is about showing up with relentless consistency.
* A 20-minute workout done today is infinitely better than the "perfect" 60-minute workout that gets skipped.
* Every glass of water, every balanced meal, every set where you pushed through discomfort is a vote for the strongest, healthiest version of yourself.

What specific question or routine can I help you adjust right now? Let's take the next positive step together!`;
}

// AI Chatbot endpoint
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const user = req.user;
    const userWorkouts = db.workoutLogs().filter(w => w.userId === user.id).slice(-3);
    const userHabits = db.habitLogs().find(h => h.userId === user.id && h.date === new Date().toISOString().split('T')[0]);

    // Check if external GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const fetchResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${SYSTEM_PROMPT}\n\nUser Context:\nName: ${user.name}\nAge: ${user.age}\nGender: ${user.gender}\nHeight: ${user.height}cm\nWeight: ${user.weight}kg\nTarget: ${user.targetWeight}kg\nGoal: ${user.fitnessGoal}\nLevel: ${user.fitnessLevel}\nEquipment: ${JSON.stringify(user.equipment)}\nDiet: ${user.dietaryPreference}\nDaily Calories Goal: ${user.dailyCalorieGoal}\n\nRecent Workouts: ${JSON.stringify(userWorkouts)}\nToday's Habits: ${JSON.stringify(userHabits)}\n\nUser Query: ${message}`
                  }
                ]
              }
            ]
          })
        });

        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiText) {
            return res.json({ reply: aiText, source: 'gemini' });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API fetch error, falling back to local expert engine:', geminiErr.message);
      }
    }

    // Fallback to high-quality local expert AI engine
    const reply = generateLocalAiResponse(message, user, { userWorkouts, userHabits });
    res.json({ reply, source: 'fitlife-engine' });
  } catch (err) {
    console.error('AI chat endpoint error:', err);
    res.status(500).json({ error: 'Failed to process AI response' });
  }
});

export default router;
