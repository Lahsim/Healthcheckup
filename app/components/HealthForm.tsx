'use client';

import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const MEALS_TODAY = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lunch',     label: 'Lunch',     emoji: '🥗' },
  { id: 'snack',     label: 'Snack',     emoji: '🍎' },
  { id: 'dinner',    label: 'Dinner',    emoji: '🍽️' },
];


export default function HealthForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [eatenMeals, setEatenMeals] = useState<string[]>([]);
  const [dailyVitamins, setDailyVitamins] = useState('');
  const [noVitamins, setNoVitamins] = useState(false);
  const [vitaminsTaken, setVitaminsTaken] = useState<boolean | null>(null);
  const [waterGlasses, setWaterGlasses] = useState<number | null>(null);
  const [waterUnit, setWaterUnit] = useState<'glasses' | 'litres'>('glasses');
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [exerciseMins, setExerciseMins] = useState<number | null>(null);
  const [tiredness, setTiredness] = useState<number | null>(null);
  const [mood, setMood] = useState('');
  const [vibeComment, setVibeComment] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [periodDates, setPeriodDates] = useState<string[]>([]);
  const [periodCalendarOpen, setPeriodCalendarOpen] = useState(false);
  const [surpriseTaskAnswer, setSurpriseTaskAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Load persisted period dates from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('healthcheckup-period-dates');
      if (stored) setPeriodDates(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('healthcheckup-period-dates', JSON.stringify(periodDates));
    } catch {}
  }, [periodDates]);


  const getMealHint = () => {
    const all = MEALS_TODAY.map(m => m.id);
    const missed = all.filter(m => !eatenMeals.includes(m));
    if (missed.length === 0) return null;
    const missedLabels = missed.map(m => MEALS_TODAY.find(x => x.id === m)!.label);
    if (missed.length === 4) return { color: 'rose' as const, text: '😱 You haven\'t eaten anything today?! Please grab something to eat right now!' };
    if (missed.includes('breakfast') && missed.includes('lunch')) return { color: 'rose' as const, text: `😬 Skipping both breakfast and lunch? Your metabolism is crying! Don't forget ${missedLabels.join(' & ')}!` };
    if (missed.includes('breakfast')) return { color: 'rose' as const, text: '🍳 No breakfast?! Your brain runs on fuel — even a banana counts! 🍌' };
    if (missed.includes('lunch')) return { color: 'rose' as const, text: '🥗 Skipped lunch, huh? The afternoon slump hits different without it! 😵' };
    if (missed.includes('dinner')) return { color: 'rose' as const, text: '🍽️ No dinner yet? Go eat something warm and yummy, you deserve it! 🥰' };
    if (missed.includes('snack')) return { color: 'blue' as const, text: '🍎 No snack today — totally fine! But a little treat never hurt anyone 😉' };
    return { color: 'rose' as const, text: `😬 Missed: ${missedLabels.join(', ')}. Please take care of yourself!` };
  };

  const getSurpriseTaskForToday = () => {
    const tasks = [
      'Write one good thing that happened today',
      'Write two good things about you',
      'Write something healthy you did out of the normal',
      'Write one thing you are grateful for today',
      'Write one small win you had today',
      'Write one thing you did to take care of yourself',
      'Write one positive thought you had today',
      'Write one thing you are looking forward to',
      'Write one kind thing you did for someone',
      'Write one thing your body did for you today',
    ];
    const today = new Date();
    const dayIndex = today.getDate() % tasks.length;
    return tasks[dayIndex];
  };

  const togglePeriodDate = (dateStr: string) => {
    setPeriodDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
  };

  const buildEmailBody = () => {
    const tirednessLabel =
      tiredness === 11 ? '💀 11 - SEND HELP' :
      tiredness === 10 ? '😩 10 - Barely alive' :
      tiredness === 9  ? '😫 9  - Very exhausted' :
      tiredness === 8  ? '😴 8  - Pretty tired' :
      tiredness === 7  ? '😪 7  - Tired-ish' :
      tiredness === 6  ? '😐 6  - Meh' :
      tiredness === 5  ? '🙂 5  - OK-ish' :
      tiredness === 4  ? '😊 4  - Alright' :
      tiredness === 3  ? '😄 3  - Pretty good' :
      tiredness === 2  ? '✨ 2  - Great' :
      tiredness === 1  ? '🌟 1  - Full of energy!' : '❓ Not answered';

    return `
🌸 HEALTH CHECK-IN REPORT 🌸
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name: ${name || 'Anonymous'}
📧 Email: ${email || 'Not provided'}
📅 Date: ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍽️  TODAY'S MEALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${eatenMeals.length === MEALS_TODAY.length
  ? '✅ Ate all meals today! Absolute legend!'
  : eatenMeals.length === 0
    ? '❌ No meals eaten today!'
    : `✅ Eaten: ${eatenMeals.join(', ')}\n❌ Missed: ${MEALS_TODAY.map(m => m.id).filter(m => !eatenMeals.includes(m)).join(', ')}`
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💊  VITAMINS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${noVitamins
  ? '💊 No daily vitamins'
  : dailyVitamins
    ? `Daily vitamins: ${dailyVitamins}\n${vitaminsTaken === null ? '❓ Not answered' : vitaminsTaken ? '✅ All taken today!' : '😬 Forgot to take them!'}`
    : '❓ Not answered'
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💧  HYDRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${waterGlasses !== null ? `${waterGlasses >= 9 ? (waterUnit === 'glasses' ? '8+ glasses' : '3+ litres') : waterGlasses + ' ' + waterUnit} of water per day` : '❓ Not answered'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
😴  SLEEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sleepHours !== null ? `${sleepHours >= 11 ? '10+' : sleepHours} hours of sleep` : '❓ Not answered'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏃  EXERCISE TODAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${exerciseMins !== null ? (exerciseMins === 0 ? '🛋️ 0 mins — rest day!' : exerciseMins >= 120 ? '🏆 120+ mins — absolute athlete!' : `💪 ${exerciseMins} minutes of exercise`) : '❓ Not answered'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔋  TIREDNESS LEVEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${tirednessLabel}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
😊  MOOD / VIBE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${mood || '❓ Not answered'}
${vibeComment ? `💬 "${vibeComment}"` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡  SUGGESTIONS & FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${suggestions || 'No suggestions provided'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌸  PERIOD CALENDAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${periodDates.length === 0 ? 'No dates marked' : `Marked dates:\n${periodDates.sort().join('\n')}`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎁  SURPRISE TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task: ${getSurpriseTaskForToday()}
Answer: ${surpriseTaskAnswer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Made with care by Mish · Health Check-In
    `.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setEmailError('');

    if (!name.trim()) { setValidationError('Please enter your name 🌸'); return; }
    if (!noVitamins && !dailyVitamins.trim()) { setValidationError('Please list your daily vitamins or select "No vitamins" 💊'); return; }
    if (!noVitamins && vitaminsTaken === null) { setValidationError('Please tell us if you took your vitamins today! 💊'); return; }
    if (waterGlasses === null) { setValidationError('Please pick your daily water intake 💧'); return; }
    if (sleepHours === null) { setValidationError('Please pick your sleep hours 😴'); return; }
    if (exerciseMins === null) { setValidationError('Please pick your exercise minutes today 🏃‍♀️'); return; }
    if (tiredness === null) { setValidationError('Please rate your tiredness level 🔋'); return; }
    if (!mood) { setValidationError('Please pick your mood vibe 🌈'); return; }
    if (!vibeComment.trim()) { setValidationError('Please tell us more about your vibe today! 💬'); return; }
    if (!surpriseTaskAnswer.trim()) { setValidationError(`Please answer today's surprise task: ${getSurpriseTaskForToday()} 🎁`); return; }

    setSending(true);

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey ||
        serviceId === 'YOUR_SERVICE_ID' || templateId === 'YOUR_TEMPLATE_ID' || publicKey === 'YOUR_PUBLIC_KEY') {
      setEmailError('⚙️ EmailJS is not configured yet. See the README to set it up!');
      setSending(false);
      setSubmitted(true);
      return;
    }

    try {
      // Always send to admin
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: name || 'Anonymous User',
          reply_to: email || 'no-reply@healthcheckin.app',
          message: buildEmailBody(),
          user_email: email || 'Not provided',
        },
        publicKey
      );
      // Also send a copy to the user if they provided an email
      if (email.trim()) {
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: 'Health Check-In 🌸',
            reply_to: 'no-reply@healthcheckin.app',
            message: `Hi ${name || 'there'}! Here's your health check-in summary:\n\n` + buildEmailBody(),
            user_email: email.trim(),
          },
          publicKey
        );
      }
      setSubmitted(true);
    } catch {
      setEmailError('😬 Oops! Email failed to send. Please check your EmailJS config!');
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  const calculateScore = () => {
    let score = 0;
    // Meals: up to 2pts (0.5 per meal)
    score += eatenMeals.length * 0.5;
    // Vitamins: 1pt
    if (noVitamins) score += 1;
    else if (vitaminsTaken === true) score += 1;
    else if (vitaminsTaken === false) score += 0;
    // Hydration: up to 1pt
    if (waterGlasses !== null) {
      if (waterUnit === 'glasses') score += waterGlasses >= 8 ? 1 : waterGlasses >= 5 ? 0.5 : 0;
      else score += waterGlasses >= 7 ? 1 : waterGlasses >= 4 ? 0.5 : 0; // litres val 7 = 3+L
    }
    // Sleep: up to 2pts
    if (sleepHours !== null) {
      if (sleepHours >= 8) score += 2;
      else if (sleepHours === 7) score += 1.5;
      else if (sleepHours === 6) score += 1;
      else if (sleepHours === 5) score += 0.5;
    }
    // Exercise: up to 2pts
    if (exerciseMins !== null) {
      if (exerciseMins >= 60) score += 2;
      else if (exerciseMins >= 30) score += 1.5;
      else if (exerciseMins >= 15) score += 1;
      else score += 0.5; // rest day still gets a little credit
    }
    // Tiredness (inverse): up to 1pt
    if (tiredness !== null) {
      if (tiredness <= 3) score += 1;
      else if (tiredness <= 6) score += 0.5;
    }
    // Mood: up to 1pt
    if (mood === 'Thriving') score += 1;
    else if (mood === 'Good') score += 0.75;
    else if (mood === 'Meh') score += 0.5;
    else if (mood === 'Struggling' || mood === 'Rough day') score += 0.25;
    return Math.min(10, Math.round(score * 10) / 10);
  };

  if (submitted) {
    const score = calculateScore();
    const medal = score >= 8.5 ? 'gold' : score >= 6.5 ? 'silver' : score >= 4.5 ? 'bronze' : 'none';
    const medalEmoji = medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : medal === 'bronze' ? '🥉' : '💪';
    const medalLabel = medal === 'gold' ? 'Gold Star!' : medal === 'silver' ? 'Silver Star!' : medal === 'bronze' ? 'Bronze Star!' : 'Keep Going!';
    const medalColor = medal === 'gold' ? '#f59e0b' : medal === 'silver' ? '#94a3b8' : medal === 'bronze' ? '#b45309' : '#ec4899';
    const medalBg = medal === 'gold' ? '#fffbeb' : medal === 'silver' ? '#f1f5f9' : medal === 'bronze' ? '#fef3c7' : '#fff5f7';
    const scoreMsg =
      score >= 9   ? 'You are an absolute health LEGEND today! 🏆' :
      score >= 8   ? 'Crushing it! Your body is so proud of you! 💪' :
      score >= 7   ? 'Really solid day! Small wins add up! 🌟' :
      score >= 6   ? 'Not bad at all! Tomorrow is another chance! 🌸' :
      score >= 5   ? 'Getting there! Every healthy choice counts!' :
      score >= 4   ? 'Room to grow — but you showed up! That matters! 🌱' :
                     'Be gentle with yourself. Tomorrow is a fresh start!';
    const scoreItems = [
      { label: '🍽️ Meals', val: `${eatenMeals.length}/4 eaten`, pts: (eatenMeals.length * 0.5).toFixed(1), max: '2.0' },
      { label: '💊 Vitamins', val: noVitamins ? 'No vitamins' : vitaminsTaken ? 'All taken' : 'Forgot', pts: noVitamins || vitaminsTaken ? '1.0' : '0.0', max: '1.0' },
      { label: '💧 Hydration', val: waterGlasses !== null ? `${waterGlasses >= 9 ? '8+' : waterGlasses} ${waterUnit}` : '—', pts: waterGlasses !== null ? (waterUnit === 'glasses' ? (waterGlasses >= 8 ? '1.0' : waterGlasses >= 5 ? '0.5' : '0.0') : (waterGlasses >= 7 ? '1.0' : waterGlasses >= 4 ? '0.5' : '0.0')) : '0.0', max: '1.0' },
      { label: '😴 Sleep', val: sleepHours !== null ? `${sleepHours >= 11 ? '10+' : sleepHours}h` : '—', pts: sleepHours !== null ? (sleepHours >= 8 ? '2.0' : sleepHours === 7 ? '1.5' : sleepHours === 6 ? '1.0' : sleepHours === 5 ? '0.5' : '0.0') : '0.0', max: '2.0' },
      { label: '🏃 Exercise', val: exerciseMins !== null ? (exerciseMins === 0 ? 'Rest day' : `${exerciseMins}m`) : '—', pts: exerciseMins !== null ? (exerciseMins >= 60 ? '2.0' : exerciseMins >= 30 ? '1.5' : exerciseMins >= 15 ? '1.0' : '0.5') : '0.0', max: '2.0' },
      { label: '🔋 Energy', val: tiredness !== null ? `${tiredness}/11` : '—', pts: tiredness !== null ? (tiredness <= 3 ? '1.0' : tiredness <= 6 ? '0.5' : '0.0') : '0.0', max: '1.0' },
      { label: '🌈 Mood', val: mood || '—', pts: mood === 'Thriving' ? '1.0' : mood === 'Good' ? '0.75' : mood === 'Meh' ? '0.5' : mood ? '0.25' : '0.0', max: '1.0' },
    ];
    return (
      <div className="min-h-screen py-8 px-4"
        style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #fce7f3 40%, #fdf4ff 100%)' }}>
        <div className="max-w-lg mx-auto animate-float-in">
          {/* Medal + Score */}
          <div className="bg-white rounded-3xl p-8 text-center shadow-xl border-2 mb-4" style={{ borderColor: medalColor }}>
            <div className="text-8xl mb-2">{medalEmoji}</div>
            <h2 className="text-3xl font-black mb-1" style={{ color: medalColor }}>{medalLabel}</h2>
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="rounded-2xl px-6 py-4" style={{ background: medalBg }}>
                <span className="text-5xl font-black" style={{ color: medalColor }}>{score}</span>
                <span className="text-2xl font-black" style={{ color: medalColor }}>/10</span>
              </div>
            </div>
            <p className="text-sm font-bold" style={{ color: '#db2777' }}>{scoreMsg}</p>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-pink-200 mb-4">
            <h3 className="text-base font-black mb-4" style={{ color: '#db2777' }}>📊 Score Breakdown</h3>
            <div className="space-y-2">
              {scoreItems.map(item => {
                const pct = Math.min(100, (parseFloat(item.pts) / parseFloat(item.max)) * 100);
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-bold mb-1" style={{ color: '#4a1530' }}>
                      <span>{item.label} <span style={{ color: '#94a3b8' }}>({item.val})</span></span>
                      <span style={{ color: '#db2777' }}>{item.pts}/{item.max}</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: '#fce7f3' }}>
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 75 ? '#34d399' : pct >= 40 ? '#facc15' : '#fb7185' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email note */}
          <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-pink-200 mb-4 text-center">
            {emailError ? (
              <p className="text-xs font-bold" style={{ color: '#f97316' }}>{emailError}</p>
            ) : email.trim() ? (
              <p className="text-xs font-bold" style={{ color: '#34d399' }}>✅ A copy of your results was sent to {email}!</p>
            ) : (
              <p className="text-xs font-bold" style={{ color: '#94a3b8' }}>💡 No email provided — your results are shown above only!</p>
            )}
          </div>

          <button
            onClick={() => { setSubmitted(false); setEmailError(''); setValidationError(''); }}
            className="w-full py-4 rounded-2xl font-black text-white text-base transition-all"
            style={{ background: 'linear-gradient(135deg, #f472b6, #fb7185, #c084fc)' }}
          >
            Do Another Check-In 🌸
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4"
      style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #fce7f3 40%, #fdf4ff 100%)' }}>
      <div className="max-w-lg mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-wiggle inline-block">🌸</div>
          <h1 className="text-4xl font-black mb-2" style={{ color: '#db2777' }}>
            Health Check-In
          </h1>
          <p className="text-lg font-semibold" style={{ color: '#f43f5e' }}>
            ✨ Because you matter! ✨
          </p>
          <p className="text-sm mt-1" style={{ color: '#fb7185' }}>
            Let&apos;s see how you&apos;re really doing 🌸
          </p>
          <div className="mt-3 flex justify-center gap-3 text-2xl">
            🍓 💊 💧 😴 🏃‍♀️
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Your Info ── */}
          <Card emoji="👤" title="Tell us who you are!">
            <div className="space-y-3">
              <Field label="Your name ✨">
                <PinkInput
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Princess Wellness 👑"
                  required
                />
              </Field>
              <Field label="Your email (optional — we'll send you a copy!) 📧">
                <PinkInput
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com (optional)"
                />
              </Field>
            </div>
          </Card>

          {/* ── Today's Meals ── */}
          <Card emoji="🍽️" title="Did you eat today?" subtitle="Check everything you've had so far today! 🌟">
            <div className="space-y-2">
              {MEALS_TODAY.map(meal => {
                const eaten = eatenMeals.includes(meal.id);
                return (
                  <label
                    key={meal.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all select-none"
                    style={eaten
                      ? { background: '#ecfdf5', borderColor: '#6ee7b7' }
                      : { background: '#fff5f7', borderColor: '#fbcfe8' }
                    }
                  >
                    <input
                      type="checkbox"
                      checked={eaten}
                      onChange={() => setEatenMeals(prev =>
                        prev.includes(meal.id)
                          ? prev.filter(m => m !== meal.id)
                          : [...prev, meal.id]
                      )}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center"
                      style={eaten
                        ? { background: '#34d399', borderColor: '#34d399' }
                        : { background: '#fff', borderColor: '#f9a8d4' }
                      }
                    >
                      {eaten && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 900 }}>✓</span>}
                    </span>
                    <span className="text-2xl">{meal.emoji}</span>
                    <span className="font-black text-base" style={{ color: eaten ? '#059669' : '#ec4899' }}>{meal.label}</span>
                    {eaten && <span className="ml-auto text-xs font-bold" style={{ color: '#34d399' }}>eaten ✅</span>}
                  </label>
                );
              })}
            </div>
            {eatenMeals.length === MEALS_TODAY.length && (
              <Hint color="green">✅ Look at you eating all your meals! An absolute legend! 🏆</Hint>
            )}
            {eatenMeals.length < MEALS_TODAY.length && eatenMeals.length > 0 && getMealHint() && (
              <Hint color={getMealHint()!.color}>{getMealHint()!.text}</Hint>
            )}
            {eatenMeals.length === 0 && (
              <Hint color="rose">👆 Check off what you've eaten today so far!</Hint>
            )}
          </Card>

          {/* ── Vitamins ── */}
          <Card emoji="💊" title="Vitamin time!" subtitle="First — what vitamins do you take daily? 🌿">
            <textarea
              value={dailyVitamins}
              onChange={e => { setDailyVitamins(e.target.value); if (noVitamins) setNoVitamins(false); setVitaminsTaken(null); }}
              disabled={noVitamins}
              placeholder={"e.g. Vitamin D, Iron, Omega-3, B12… 💉"}
              rows={2}
              className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none border-2 mb-3"
              style={{ background: '#fff5f7', color: '#db2777', borderColor: '#fbcfe8', fontFamily: 'var(--font-nunito), Nunito, sans-serif', opacity: noVitamins ? 0.4 : 1 }}
            />
            <button
              type="button"
              onClick={() => { setNoVitamins(v => !v); setDailyVitamins(''); setVitaminsTaken(null); }}
              className="w-full py-2.5 rounded-2xl text-sm font-bold border-2 transition-all mb-4"
              style={noVitamins
                ? { background: '#a78bfa', color: '#fff', borderColor: '#a78bfa' }
                : { background: '#fff5f7', color: '#ec4899', borderColor: '#fbcfe8' }
              }
            >
              {noVitamins ? '✅ No vitamins selected' : '🚫 I don\'t take any vitamins'}
            </button>

            {(noVitamins || dailyVitamins.trim()) && (
              <>
                <p className="text-sm font-bold mb-2" style={{ color: '#f43f5e' }}>
                  {noVitamins ? 'No problem! Just checking in… 😊' : 'Did you take them today?'}
                </p>
                {!noVitamins && (
                  <div className="flex gap-3">
                    <ToggleButton active={vitaminsTaken === true} onClick={() => setVitaminsTaken(true)} activeColor="#34d399" className="flex-1 py-4 text-base">✅ All taken!</ToggleButton>
                    <ToggleButton active={vitaminsTaken === false} onClick={() => setVitaminsTaken(false)} activeColor="#fb7185" className="flex-1 py-4 text-base">💀 I forgor</ToggleButton>
                  </div>
                )}
                {vitaminsTaken === true && <Hint color="green">🌟 Your body is literally thriving right now! Keep it up!</Hint>}
                {vitaminsTaken === false && <Hint color="rose">😬 Go take them right now! Your future self will thank you! 💊</Hint>}
                {noVitamins && <Hint color="purple">✨ All good! Maybe chat with your doctor about vitamins someday 🩺</Hint>}
              </>
            )}
          </Card>

          {/* ── Hydration ── */}
          <Card emoji="💧" title="Hydration Station!" subtitle="How much water are you drinking daily? 🚰">
            {/* Unit toggle */}
            <div className="flex gap-2 mb-4">
              {(['glasses', 'litres'] as const).map(unit => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => { setWaterUnit(unit); setWaterGlasses(null); }}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-black border-2 transition-all"
                  style={waterUnit === unit
                    ? { background: '#38bdf8', color: '#fff', borderColor: '#38bdf8', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)' }
                    : { background: '#fff5f7', color: '#ec4899', borderColor: '#fbcfe8' }
                  }
                >
                  {unit === 'glasses' ? '🥛 Glasses' : '🍶 Litres'}
                </button>
              ))}
            </div>

            {/* Number options */}
            <div className="flex flex-wrap gap-2">
              {waterUnit === 'glasses'
                ? [1, 2, 3, 4, 5, 6, 7, 8, '8+'].map((n, i) => {
                    const val = i === 8 ? 9 : Number(n);
                    return (
                      <ToggleButton key={n} active={waterGlasses === val} onClick={() => setWaterGlasses(val)} activeColor="#38bdf8" className="w-14 h-14 text-base font-black">{n}</ToggleButton>
                    );
                  })
                : [0.5, 1, 1.5, 2, 2.5, 3, '3+'].map((n, i) => {
                    const val = i === 6 ? 9 : Number(n);
                    return (
                      <ToggleButton key={n} active={waterGlasses === val} onClick={() => setWaterGlasses(val)} activeColor="#38bdf8" className="w-16 h-14 text-sm font-black">{n}L</ToggleButton>
                    );
                  })
              }
            </div>

            {/* Pee jokes */}
            {waterGlasses !== null && (() => {
              if (waterUnit === 'glasses') {
                if (waterGlasses <= 2) return <Hint color="rose">🏜️ Your pee is probably the colour of apple juice rn. DRINK. WATER. NOW!! 🧃</Hint>;
                if (waterGlasses <= 4) return <Hint color="rose">😬 Mild yellow pee alert! You can do better! Chug chug chug! 💦</Hint>;
                if (waterGlasses <= 6) return <Hint color="blue">Getting there! Your pee is probably pale yellow — not bad! Keep sipping! 🥛</Hint>;
                if (waterGlasses <= 8) return <Hint color="blue">� Crystal clear pee incoming! A hydrated legend! 👑</Hint>;
                return <Hint color="blue">🚽 You&apos;re basically living in the bathroom at this point… and we RESPECT it! �</Hint>;
              } else {
                if (waterGlasses <= 1) return <Hint color="rose">🏜️ Half a litre?! Your kidneys are staging a protest! Drink UP! 😩</Hint>;
                if (waterGlasses <= 2) return <Hint color="rose">😬 Under 2L? Your pee is sending distress signals! Top up that bottle! 💦</Hint>;
                if (waterGlasses <= 5) return <Hint color="blue">💧 2–2.5L, solid! Your pee is probably a lovely pale yellow! 🌟</Hint>;
                if (waterGlasses <= 7) return <Hint color="blue">✨ 3L! Crystal clear and thriving — your bladder is doing laps! 🏊</Hint>;
                return <Hint color="blue">🚽 3L+?! You&apos;re basically a human water fountain! Incredible hydration! �</Hint>;
              }
            })()}
          </Card>

          {/* ── Sleep ── */}
          <Card emoji="😴" title="Sleep Report" subtitle="How many hours of sleep did you get last night? 🌙">
            <div className="flex flex-wrap gap-2">
              {[3, 4, 5, 6, 7, 8, 9, 10, '10+'].map((n, i) => {
                const val = i === 8 ? 11 : Number(n);
                return (
                  <ToggleButton key={n} active={sleepHours === val} onClick={() => setSleepHours(val)} activeColor="#a78bfa" className="w-14 h-14 text-base font-black">{n}</ToggleButton>
                );
              })}
            </div>
            {sleepHours === 3 && <Hint color="rose">☠️ THREE hours?! You&apos;re not sleeping, you&apos;re briefly leaving consciousness. Call your bed. NOW! 🛌</Hint>}
            {sleepHours === 4 && <Hint color="rose">💀 4 hours?! You&apos;re not a person, you&apos;re a zombie in a skin suit. GO. TO. BED.</Hint>}
            {sleepHours === 5 && <Hint color="rose">� 5 hours?! Your brain is running on vibes and spite. Please nap immediately! 🛌</Hint>}
            {sleepHours === 6 && <Hint color="rose">😮‍💨 6 hours… technically alive but emotionally a potato. You can do better! 🥔</Hint>}
            {sleepHours === 7 && <Hint color="blue">😐 7 hours — the bare minimum! Your body is surviving but not exactly thriving… 🌿</Hint>}
            {sleepHours === 8 && <Hint color="purple">🌙 8 hours! The golden standard! Your brain cells are literally doing a happy dance! 🧠💃</Hint>}
            {sleepHours === 9 && <Hint color="purple">✨ 9 hours of beauty sleep! You&apos;re glowing and your organs are throwing a party! 🎉</Hint>}
            {sleepHours === 10 && <Hint color="purple">👑 10 hours?! You are a SLEEP QUEEN/KING! We bow to your rest game! 🛏️💅</Hint>}
            {sleepHours === 11 && <Hint color="purple">🐻 10+ hours… you basically hibernated! Are you okay?? Either way, well rested legend! 🏆</Hint>}
          </Card>

          {/* ── Exercise ── */}
          <Card emoji="🏃‍♀️" title="Exercise Check!" subtitle="How many minutes did you exercise today? ⏱️">
            <div className="flex flex-wrap gap-2">
              {[0, 15, 30, 45, 60, 75, 90, 105, 120].map(n => (
                <ToggleButton key={n} active={exerciseMins === n} onClick={() => setExerciseMins(n)} activeColor="#34d399" className="w-16 h-14 text-sm font-black">
                  {n === 0 ? '0' : n === 120 ? '120+' : `${n}m`}
                </ToggleButton>
              ))}
            </div>
            {exerciseMins === 0 && (
              <Hint color="rose">🛋️ A full rest day! Totally valid — your muscles are rebuilding! ...probably. 😅</Hint>
            )}
            {exerciseMins === 15 && (
              <Hint color="blue">🐣 15 mins! A little something is better than nothing! The couch is proud of you! 🛋️✨</Hint>
            )}
            {exerciseMins === 30 && (
              <Hint color="blue">🚶‍♀️ 30 mins! You technically did the recommended amount. Science approves! 🧬</Hint>
            )}
            {exerciseMins === 45 && (
              <Hint color="green">💪 45 mins! Going above and beyond! Your heart is literally doing a happy dance! 🫀�</Hint>
            )}
            {exerciseMins === 60 && (
              <Hint color="green">🔥 A FULL HOUR?! Okay okay, we see you! Absolute unit of a human! 👑</Hint>
            )}
            {exerciseMins !== null && exerciseMins >= 75 && exerciseMins < 120 && (
              <Hint color="green">� {exerciseMins} minutes?! Are you training for the Olympics?? Send us your routine!! 🏋️‍♀️✨</Hint>
            )}
            {exerciseMins === 120 && (
              <Hint color="green">🏆 120+ MINUTES?! We are not worthy!! Please adopt us as your personal trainer! 🙇‍♀️💪</Hint>
            )}
          </Card>

          {/* ── Tiredness Level ── */}
          <Card emoji="🔋" title="How tired are you rn?" subtitle="On a scale of 1 to 10… or 11 if you're really cooked 💀">
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => {
                const isActive = tiredness === n;
                const activeColor =
                  n === 11 ? '#111827' :
                  n <= 3   ? '#34d399' :
                  n <= 6   ? '#facc15' :
                  n <= 9   ? '#fb923c' : '#ef4444';
                const activeText = n === 11 ? '#fde047' : '#fff';
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTiredness(n)}
                    className="flex-shrink-0 w-10 h-12 rounded-xl font-black text-sm border-2 transition-all"
                    style={isActive
                      ? { background: activeColor, color: activeText, borderColor: activeColor, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transform: 'scale(1.1)' }
                      : n === 11
                        ? { background: '#f3f4f6', color: '#6b7280', borderColor: '#d1d5db' }
                        : { background: '#fff5f7', color: '#ec4899', borderColor: '#fbcfe8' }
                    }
                  >
                    {n === 11 ? '💀' : n}
                  </button>
                );
              })}
            </div>
            {tiredness !== null && (
              <p className="mt-3 text-sm font-bold text-center" style={{ color: '#db2777' }}>
                {tiredness === 11 ? '💀 SEND HELP. You deserve a full week off honestly.' :
                 tiredness >= 9  ? '😩 Oh no… please rest tonight!' :
                 tiredness >= 7  ? '😴 Pretty tired. Can you sneak in a nap?' :
                 tiredness >= 5  ? '😐 Middle of the road. You got this! 💪' :
                 tiredness >= 3  ? '🙂 Doing decent! Keep up the good work!' :
                 '✨ Full of energy! Go SLAY the day!'}
              </p>
            )}
          </Card>

          {/* ── Mood ── */}
          <Card emoji="🌈" title="Vibe check!" subtitle="How are you feeling emotionally today? 💭">
            <div className="flex gap-2 justify-between flex-wrap">
              {[
                { emoji: '🤩', label: 'Thriving' },
                { emoji: '😊', label: 'Good' },
                { emoji: '😐', label: 'Meh' },
                { emoji: '😔', label: 'Struggling' },
                { emoji: '😭', label: 'Rough day' },
              ].map(m => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setMood(m.label)}
                  className="flex flex-col items-center p-3 rounded-2xl border-2 transition-all flex-1 min-w-[58px]"
                  style={mood === m.label
                    ? { background: '#fce7f3', borderColor: '#db2777', transform: 'scale(1.1)', boxShadow: '0 2px 8px rgba(219,39,119,0.2)' }
                    : { background: '#fff5f7', borderColor: '#fbcfe8' }
                  }
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-xs font-bold mt-1" style={{ color: '#db2777' }}>{m.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold mb-2" style={{ color: '#f43f5e' }}>Spill the tea — what&apos;s on your mind today? ☕</p>
              <textarea
                value={vibeComment}
                onChange={e => setVibeComment(e.target.value)}
                placeholder={mood === 'Thriving' ? "Tell us everything!! What\'s going so well? 🤩" :
                             mood === 'Good'     ? "What\'s making today a good one? 😊" :
                             mood === 'Meh'      ? "Meh days are valid. What\'s making it feel blah? 🦥" :
                             mood === 'Struggling' ? "Hey, it\'s okay to struggle. What\'s going on? We\'re listening" :
                             mood === 'Rough day'  ? "Sending you the biggest virtual hug. What happened? 🥺" :
                             "Pick a vibe above first, then tell us more! 👆"}
                rows={3}
                className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none border-2"
                style={{ background: '#fff5f7', color: '#db2777', borderColor: '#fbcfe8', fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}
              />
            </div>
          </Card>

          {/* ── Suggestions ── */}
          <Card emoji="💡" title="Got ideas for us? (optional)" subtitle="What health metrics are we missing? What should we add? 👂✨">
            <textarea
              value={suggestions}
              onChange={e => setSuggestions(e.target.value)}
              placeholder={"e.g. 'Add a stress level question!' or 'Track period symptoms too!'"}
              rows={4}
              className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none border-2"
              style={{ background: '#fff5f7', color: '#db2777', borderColor: '#fbcfe8', fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}
            />
          </Card>

          {/* ── Period Calendar ── */}
          <Card emoji="🌸" title="Period Calendar (optional)" subtitle="Track your cycle! Tap dates to mark them. Data stays in your browser. 🌸">
            <button
              type="button"
              onClick={() => setPeriodCalendarOpen(v => !v)}
              className="w-full py-3 rounded-2xl text-sm font-black border-2 transition-all"
              style={{ background: periodCalendarOpen ? '#fce7f3' : '#fff5f7', color: '#db2777', borderColor: '#fbcfe8' }}
            >
              {periodCalendarOpen ? '👆 Hide Calendar' : '📅 Open Calendar'}
            </button>
            {periodCalendarOpen && (
              <PeriodCalendar
                markedDates={periodDates}
                onToggle={togglePeriodDate}
              />
            )}
            {periodDates.length > 0 && (
              <p className="mt-3 text-xs font-bold text-center" style={{ color: '#db2777' }}>
                {periodDates.length} date{periodDates.length === 1 ? '' : 's'} marked 🌸
              </p>
            )}
          </Card>

          {/* ── Surprise Task ── */}
          <Card emoji="🎁" title="Surprise Task" subtitle="A little prompt for you today 🌟">
            <div className="rounded-2xl p-4 mb-3 border-2" style={{ background: '#fff5f7', borderColor: '#fbcfe8' }}>
              <p className="text-sm font-black" style={{ color: '#db2777' }}>
                {getSurpriseTaskForToday()} ✨
              </p>
            </div>
            <textarea
              value={surpriseTaskAnswer}
              onChange={e => setSurpriseTaskAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={3}
              className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none border-2"
              style={{ background: '#fff5f7', color: '#db2777', borderColor: '#fbcfe8', fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}
            />
          </Card>

          {/* ── Validation Error ── */}
          {validationError && (
            <div className="rounded-2xl p-4 text-center text-sm font-bold border-2 border-rose-200"
              style={{ background: '#fff1f2', color: '#e11d48' }}>
              {validationError}
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={sending}
            className="w-full py-4 rounded-3xl font-black text-xl text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: sending ? '#f9a8d4' : 'linear-gradient(135deg, #f472b6, #fb7185, #c084fc)' }}
          >
            {sending ? '✨ Sending your report…' : '✨ Submit My Health Check-In! 🌸'}
          </button>

        </form>


        <p className="text-center text-xs mt-6 mb-8" style={{ color: '#f9a8d4' }}>
          Made with care by Mish · Health Check-In 🌸
        </p>
      </div>
    </div>
  );
}

/* ── Reusable Sub-components ── */

function Card({
  emoji,
  title,
  subtitle,
  children,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-pink-100">
      <h2 className="text-lg font-black mb-1 flex items-center gap-2" style={{ color: '#db2777' }}>
        {emoji} {title}
      </h2>
      {subtitle && (
        <p className="text-xs font-semibold mb-3" style={{ color: '#fb7185' }}>{subtitle}</p>
      )}
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1" style={{ color: '#f43f5e' }}
        dangerouslySetInnerHTML={{ __html: label }} />
      {children}
    </div>
  );
}

function PinkInput({
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none border-2"
      style={{ background: '#fff5f7', color: '#db2777', borderColor: '#fbcfe8', fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}
    />
  );
}

function ToggleButton({
  active,
  onClick,
  children,
  activeColor = '#f472b6',
  className = '',
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeColor?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3 px-3 rounded-2xl text-sm font-bold border-2 transition-all ${className}`}
      style={active
        ? { background: activeColor, color: '#fff', borderColor: activeColor, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)' }
        : { background: '#fff5f7', color: '#ec4899', borderColor: '#fbcfe8' }
      }
    >
      {children}
    </button>
  );
}

function Hint({ children, color }: { children: React.ReactNode; color: 'green' | 'rose' | 'blue' | 'purple' }) {
  const colors = {
    green:  { bg: '#f0fdf4', text: '#16a34a' },
    rose:   { bg: '#fff1f2', text: '#e11d48' },
    blue:   { bg: '#eff6ff', text: '#2563eb' },
    purple: { bg: '#faf5ff', text: '#9333ea' },
  };
  const { bg, text } = colors[color];
  return (
    <p className="mt-3 text-xs font-bold text-center rounded-2xl py-2 px-3" style={{ background: bg, color: text }}>
      {children}
    </p>
  );
}

function PeriodCalendar({ markedDates, onToggle }: { markedDates: string[]; onToggle: (date: string) => void }) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onToggle(dateStr);
  };

  return (
    <div className="mt-4 rounded-2xl p-4 border-2" style={{ background: '#fff5f7', borderColor: '#fbcfe8' }}>
      <div className="flex justify-between items-center mb-3">
        <button type="button" onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="text-lg font-black" style={{ color: '#db2777' }}>‹</button>
        <p className="font-black text-sm" style={{ color: '#db2777' }}>{monthName} {year}</p>
        <button type="button" onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="text-lg font-black" style={{ color: '#db2777' }}>›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold mb-2" style={{ color: '#f43f5e' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map(b => <span key={`blank-${b}`} />)}
        {days.map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const marked = markedDates.includes(dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              className="aspect-square rounded-lg text-xs font-black flex flex-col items-center justify-center transition-all"
              style={marked
                ? { background: '#fce7f3', border: '2px solid #db2777', color: '#db2777' }
                : { background: '#fff', border: '2px solid #fbcfe8', color: isToday ? '#db2777' : '#4a1530' }
              }
            >
              <span>{day}</span>
              {marked && <span className="text-[10px] leading-none">🌸</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
