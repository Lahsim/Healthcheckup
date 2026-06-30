'use client';

import { useState } from 'react';
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
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [validationError, setValidationError] = useState('');


  const getMealHint = () => {
    const all = MEALS_TODAY.map(m => m.id);
    const missed = all.filter(m => !eatenMeals.includes(m));
    if (missed.length === 0) return null;
    const missedLabels = missed.map(m => MEALS_TODAY.find(x => x.id === m)!.label);
    if (missed.length === 4) return { color: 'rose' as const, text: '😱 You haven\'t eaten anything today?! Please grab something to eat right now! 💕' };
    if (missed.includes('breakfast') && missed.includes('lunch')) return { color: 'rose' as const, text: `😬 Skipping both breakfast and lunch? Your metabolism is crying! Don't forget ${missedLabels.join(' & ')}!` };
    if (missed.includes('breakfast')) return { color: 'rose' as const, text: '🍳 No breakfast?! Your brain runs on fuel — even a banana counts! 🍌' };
    if (missed.includes('lunch')) return { color: 'rose' as const, text: '🥗 Skipped lunch, huh? The afternoon slump hits different without it! 😵' };
    if (missed.includes('dinner')) return { color: 'rose' as const, text: '🍽️ No dinner yet? Go eat something warm and yummy, you deserve it! 🥰' };
    if (missed.includes('snack')) return { color: 'blue' as const, text: '🍎 No snack today — totally fine! But a little treat never hurt anyone 😉' };
    return { color: 'rose' as const, text: `😬 Missed: ${missedLabels.join(', ')}. Please take care of yourself! 💕` };
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
Made with 💕 by Health Check-In
    `.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setEmailError('');

    if (!name.trim()) { setValidationError('Please enter your name 🌸'); return; }
    if (!email.trim()) { setValidationError('Please enter your email so we can send your report! 💌'); return; }
    if (!noVitamins && !dailyVitamins.trim()) { setValidationError('Please list your daily vitamins or select "No vitamins" 💊'); return; }
    if (!noVitamins && vitaminsTaken === null) { setValidationError('Please tell us if you took your vitamins today! 💊'); return; }
    if (waterGlasses === null) { setValidationError('Please pick your daily water intake 💧'); return; }
    if (sleepHours === null) { setValidationError('Please pick your sleep hours 😴'); return; }
    if (exerciseMins === null) { setValidationError('Please pick your exercise minutes today 🏃‍♀️'); return; }
    if (tiredness === null) { setValidationError('Please rate your tiredness level 🔋'); return; }
    if (!mood) { setValidationError('Please pick your mood vibe 🌈'); return; }
    if (!vibeComment.trim()) { setValidationError('Please tell us more about your vibe today! 💬'); return; }

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
      setSubmitted(true);
    } catch {
      setEmailError('😬 Oops! Email failed to send. Please check your EmailJS config!');
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #fce7f3 50%, #fdf4ff 100%)' }}>
        <div className="bg-white rounded-3xl p-10 text-center shadow-2xl border-2 border-pink-200 max-w-sm w-full animate-float-in">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-pink-600 mb-3">Yay, all done! ✨</h2>
          <p className="text-gray-500 mb-2 text-sm leading-relaxed">
            Your health check-in was submitted! 💌
          </p>
          {validationError && (
            <p className="text-rose-500 text-xs mb-3 bg-rose-50 rounded-2xl p-3 text-center font-bold">{validationError}</p>
          )}
          {emailError ? (
            <p className="text-orange-500 text-xs mb-4 bg-orange-50 rounded-2xl p-3">{emailError}</p>
          ) : (
            <p className="text-pink-400 text-xs mb-4">A summary has been sent to your email! 🌸</p>
          )}
          <p className="text-gray-400 text-xs mb-6">Remember to drink water, rest up, and be kind to yourself today 💕</p>
          <button
            onClick={() => { setSubmitted(false); setEmailError(''); setValidationError(''); }}
            className="w-full py-3 rounded-2xl font-bold text-white transition-all hover:scale-105"
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
            Let&apos;s see how you&apos;re really doing 💕
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
              <Field label="Your email (we'll send you a report!) 📧">
                <PinkInput
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com 💌"
                  required
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
                if (waterGlasses <= 6) return <Hint color="blue">💛 Getting there! Your pee is probably pale yellow — not bad! Keep sipping! 🥛</Hint>;
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
                             mood === 'Struggling' ? "Hey, it\'s okay to struggle. What\'s going on? We\'re listening 💕" :
                             mood === 'Rough day'  ? "Sending you the biggest virtual hug. What happened? 🥺" :
                             "Pick a vibe above first, then tell us more! 👆"}
                rows={3}
                className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none border-2"
                style={{ background: '#fff5f7', color: '#db2777', borderColor: '#fbcfe8', fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}
              />
            </div>
          </Card>

          {/* ── Suggestions ── */}
          <Card emoji="💡" title="Got ideas for us?" subtitle="What health metrics are we missing? What should we add? 👂✨">
            <textarea
              value={suggestions}
              onChange={e => setSuggestions(e.target.value)}
              placeholder={"e.g. 'Add a stress level question!' or 'Track period symptoms too!' 🩷"}
              rows={4}
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
            {sending ? '💌 Sending your report…' : '✨ Submit My Health Check-In! 🌸'}
          </button>

        </form>


        <p className="text-center text-xs mt-6 mb-8" style={{ color: '#f9a8d4' }}>
          Made with 💕 for your wellness journey · Health Check-In 🌸
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
