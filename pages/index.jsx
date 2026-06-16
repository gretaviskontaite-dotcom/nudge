import { useState, useEffect, useRef, useContext, createContext, useCallback } from "react";

// ── DESIGN TOKENS (from Figma inspect) ───────────────────────────────
// Font: Inter throughout
// Screen: full viewport width, margin 24px left/right
// Grid: 4 col, margin 24, gutter 16

// Color palette — approximated from Figma color styles
const C = {
  // Accent
  accent900: "#2D2361",
  accent700: "#4D3DB5",
  accent500: "#8070C8", // primary purple — buttons, labels
  accent300: "#A89FDE",
  accent200: "#C8C0E8",
  accent100: "#EEE9FF", // soft bg — small buttons, cards
  // Neutral
  neutral900: "#2A2826", // headings
  neutral700: "#4A4744", // subtitle
  neutral500: "#6B6B6B",
  neutral300: "#6E6B66", // hints, placeholders
  neutral200: "#DDDDDD", // ghost button border
  neutral100: "#F7F6F2", // card bg (Neutral/50 ≈ white, Neutral/100 ≈ off-white bg)
  neutral50:  "#FDFCF9", // card bg, button text on primary
  // Success
  success500: "#6BBF9A",
  success100: "#E6F7F0",
  // Warning
  warning100: "#FFF8EC",
  warning500: "#C9A24A",
};

const IsDarkContext = createContext(false);

function c9(isDark) { return isDark ? "#F0EEF8" : C.neutral900; }
function c7(isDark) { return isDark ? "#AAAAAA" : C.neutral700; }

function pillBackground(isDark, selected) {
  return selected ? C.accent100 : (isDark ? "#2D2A45" : C.neutral50);
}
function pillTextColor(isDark, selected) {
  return selected ? C.accent500 : (isDark ? "#F0EEF8" : C.neutral700);
}
function pillLabelColor(isDark, selected, lightUnselected = C.neutral900) {
  return selected ? C.accent500 : (isDark ? "#F0EEF8" : lightUnselected);
}
function pillHintColor(isDark, selected) {
  return selected ? C.accent500 : (isDark ? "#F0EEF8" : C.neutral300);
}
function pillBorder(isDark, selected, width = 1) {
  return selected
    ? `${width}px solid ${C.accent500}`
    : isDark
      ? `${width}px solid rgba(124,111,205,0.25)`
      : `${width}px solid ${C.neutral200}`;
}

// Typography scale
const T = {
  label:   { fontFamily: "Inter", fontWeight: 600, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" },
  heading: { fontFamily: "Inter", fontWeight: 700, fontSize: 30, lineHeight: 1.1 },
  title:   { fontFamily: "Inter", fontWeight: 700, fontSize: 18, lineHeight: 1.2 },
  subtitle:{ fontFamily: "Inter", fontWeight: 500, fontSize: 18, lineHeight: 1.3 },
  body:    { fontFamily: "Inter", fontWeight: 400, fontSize: 16, lineHeight: 1.0 },
  small:   { fontFamily: "Inter", fontWeight: 500, fontSize: 16, lineHeight: 1.4 },
  hint:    { fontFamily: "Inter", fontWeight: 500, fontSize: 14, color: C.neutral300 },
  btnPrimary: { fontFamily: "Inter", fontWeight: 600, fontSize: 18, color: C.neutral50 },
  btnSecondary: { fontFamily: "Inter", fontWeight: 500, fontSize: 18, color: "var(--n7)" },
};

// Spacing
const SCREEN_H_PAD = 24; // 24px margin each side
const CARD_RADIUS = 22;
const CARD_PAD = 16;
const BTN_RADIUS = 94;
const BTN_H = 51;
const BTN_FONT = { fontFamily: "Inter", fontWeight: 600, fontSize: 18 };
const BTN_LABEL = { ...BTN_FONT, fontSize: "18px", lineHeight: 1.2 };

// ── ICONS ─────────────────────────────────────────────────────────────
const ICONS = {
  // Energy battery icons
  batteryLow: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="18" height="10" rx="2.5" stroke={color} strokeWidth="1.5"/>
      <path d="M20 10v4a2 2 0 000-4z" fill={color}/>
      <rect x="4" y="9" width="4" height="6" rx="1" fill={color}/>
    </svg>
  ),
  batteryMedium: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="18" height="10" rx="2.5" stroke={color} strokeWidth="1.5"/>
      <path d="M20 10v4a2 2 0 000-4z" fill={color}/>
      <rect x="4" y="9" width="8" height="6" rx="1" fill={color}/>
    </svg>
  ),
  batteryHigh: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="18" height="10" rx="2.5" stroke={color} strokeWidth="1.5"/>
      <path d="M20 10v4a2 2 0 000-4z" fill={color}/>
      <rect x="4" y="9" width="13" height="6" rx="1" fill={color}/>
    </svg>
  ),
  // Pause arc icons (progress arcs for pause options)
  arcEmpty: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" strokeOpacity="0.3"/>
      <path d="M12 4a8 8 0 014 1.07" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  arcHalf: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" strokeOpacity="0.3"/>
      <path d="M12 4a8 8 0 018 8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  arcFull: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2"/>
      <path d="M8 12l3 3 5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  // List icon for "see all steps"
  list: (color) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="5" y="2" width="8" height="1.5" rx="0.75" fill={color}/>
      <rect x="5" y="6.25" width="8" height="1.5" rx="0.75" fill={color}/>
      <rect x="5" y="10.5" width="8" height="1.5" rx="0.75" fill={color}/>
      <circle cx="2" cy="2.75" r="1" fill={color}/>
      <circle cx="2" cy="7" r="1" fill={color}/>
      <circle cx="2" cy="11.25" r="1" fill={color}/>
    </svg>
  ),
  // Flag for progress bar end
  flag: (color) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 1v12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 2h8l-2 3 2 3H2" fill={color} fillOpacity="0.9"/>
    </svg>
  ),
  // Animated checkmark (done screen)
  checkAnimated: (color) => (
    <svg width="56" height="42" viewBox="0 0 48 36" fill="none">
      <path d="M4 18L18 32L44 4" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 80, strokeDashoffset: 0,
          animation: "drawCheck 0.5s ease-out forwards" }}/>
    </svg>
  ),
};


// ── AI INTEGRATION ────────────────────────────────────────────────────

const FALLBACK_STEPS = [
  { text: "Write down exactly what's blocking you.", tags: ["tiny step", "2 min"], mins: 2, energy: "low", tooHard: "Open a notes app." },
  { text: "Do the very first physical action for this task.", tags: ["5 min"], mins: 5, energy: "low", tooHard: "Describe the first action in one word." },
  { text: "Set a 10-minute timer and start.", tags: ["10 min"], mins: 10, energy: "medium", tooHard: "Just set the timer. Don't start yet." },
];

async function fetchTaskSteps(task, energy, timeAvailable, granularity = "balanced") {
  const prompt = `You are a productivity assistant helping someone who feels overwhelmed by a big task. Break this task into 4-6 micro-steps that take someone from the very beginning to full completion.

Task: "${task}"

Context:
- Current energy level: ${energy}
- Time available per session: ${timeAvailable}
- How granular: ${granularity} (gentle = very tiny steps, balanced = moderate, detailed = thorough)

Rules:
- Each step description must be maximum 60 characters. Be very concise.
- Steps must be in logical order from first action to done
- Each step must be immediately actionable with no ambiguity
- Match step duration to energy: low = 2-10 min, medium = 10-20 min, high = 20+ min
- For physical or practical tasks (fixing, building, cleaning, cooking), the first step must identify any tools or materials needed before starting, e.g. 'Get a screwdriver and a cloth — that's all you need.'
- At medium energy, steps should represent real visible progress (15-25 min each). At high energy, steps should be substantial and move the task meaningfully forward (20-40 min each). Never give the same step sizes regardless of energy level.
- At low energy, steps should require minimal thinking or decision-making
- Each step needs a "tooHard" fallback that is even smaller
- Tags should describe the nature of the step (e.g. "tiny step", "no prep needed", "quick win", "focused work")
- The last step should represent genuine completion of the task

Respond ONLY with a JSON array, no markdown, no explanation:
[
  {
    "text": "The micro-step description",
    "tags": ["tag1", "tag2"],
    "mins": 5,
    "energy": "low",
    "tooHard": "An even smaller version of this step"
  }
]`;

  const response = await fetch("/api/breakdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, energy, timeAvailable, prompt }),
  });

  if (!response.ok) throw new Error("API request failed");
  return await response.json();
}

function useTaskBreakdown(task, energy, timeAvailable, granularity) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stepsTask, setStepsTask] = useState(null);
  const cache = useRef({});

  useEffect(() => {
    if (!task) {
      setLoading(false);
      setSteps([]);
      setStepsTask(null);
      return;
    }
    const key = `${task}__${energy}__${timeAvailable}__${granularity}`;
    if (cache.current[key]) {
      setSteps(cache.current[key]);
      setStepsTask(task);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSteps([]);
    setStepsTask(null);

    let cancelled = false;
    fetchTaskSteps(task, energy, timeAvailable, granularity)
      .then(result => {
        if (cancelled) return;
        cache.current[key] = result;
        setSteps(result);
        setStepsTask(task);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error("AI step generation failed:", err);
        setError(err.message);
        setSteps(FALLBACK_STEPS);
        setStepsTask(task);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [task, energy, timeAvailable, granularity]);

  return { steps, loading, error, stepsTask };
}

const NUDGE_SESSION_HISTORY_KEY = "nudge_session_history";

function loadNudgeSessionHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NUDGE_SESSION_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function usePatternLearning() {
  const history = useRef(loadNudgeSessionHistory());

  useEffect(() => {
    if (typeof window === "undefined") return;
    history.current = loadNudgeSessionHistory();
  }, []);

  const recordSession = (task, energy, stepIndex, stepsTotal, timeSlot) => {
    history.current.push({
      task,
      energy,
      stepIndex,
      stepsTotal,
      timeSlot: timeSlot || null,
      completedAt: Date.now(),
    });
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(NUDGE_SESSION_HISTORY_KEY, JSON.stringify(history.current));
    } catch { /* ignore quota / private mode */ }
  };

  const getInsights = () => {
    if (history.current.length < 2) return null;
    const sessions = history.current;

    const energyCounts = sessions.reduce((acc, s) => {
      acc[s.energy] = (acc[s.energy] || 0) + 1;
      return acc;
    }, {});
    const topEnergy = Object.entries(energyCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    const completedSessions = sessions.filter(
      s => s.stepsTotal > 0 && s.stepIndex === s.stepsTotal - 1
    );

    const taskCounts = sessions.reduce((acc, s) => {
      if (s.task) acc[s.task] = (acc[s.task] || 0) + 1;
      return acc;
    }, {});
    const topTaskEntry = Object.entries(taskCounts).sort((a, b) => b[1] - a[1])[0];

    const completedTaskCounts = completedSessions.reduce((acc, s) => {
      if (s.task) acc[s.task] = (acc[s.task] || 0) + 1;
      return acc;
    }, {});
    const topCompletedTaskEntry = Object.entries(completedTaskCounts).sort((a, b) => b[1] - a[1])[0];

    const avgStepCompletion = sessions.reduce((sum, s) => {
      const stepsDone = s.stepsTotal > 0
        ? Math.min(s.stepIndex + 1, s.stepsTotal)
        : s.stepIndex + 1;
      return sum + stepsDone;
    }, 0) / sessions.length;

    const timeSlotCounts = sessions.reduce((acc, s) => {
      if (s.timeSlot) acc[s.timeSlot] = (acc[s.timeSlot] || 0) + 1;
      return acc;
    }, {});
    const topTimeSlotEntry = Object.entries(timeSlotCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      topEnergy,
      completedCount: completedSessions.length,
      totalSessions: sessions.length,
      topTask: topTaskEntry?.[0] ?? null,
      topTaskCount: topTaskEntry?.[1] ?? 0,
      topCompletedTask: topCompletedTaskEntry?.[0] ?? null,
      topCompletedTaskCount: topCompletedTaskEntry?.[1] ?? 0,
      avgStepCompletion: Math.round(avgStepCompletion * 10) / 10,
      topTimeSlot: topTimeSlotEntry?.[0] ?? null,
      topTimeSlotCount: topTimeSlotEntry?.[1] ?? 0,
    };
  };

  return { recordSession, getInsights };
}

// ── BASE COMPONENTS ───────────────────────────────────────────────────

// Screen label (WELCOME, QUICK SETUP, etc.)
function Label({ children, color = C.accent500, style = {} }) {
  return <div style={{ ...T.label, color, marginBottom: 8, ...style }}>{children}</div>;
}

// Back chevron
function Back({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", padding: "0 0 16px 0",
      color: C.neutral300, fontSize: 28, cursor: "pointer",
      fontFamily: "Inter", lineHeight: 1, alignSelf: "flex-start",
    }}>‹</button>
  );
}

// Progress dots (stepper)
function Dots({ total = 3, active = 0 }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 8, borderRadius: 8,
          width: i === active ? 28 : 8,
          background: i === active ? C.accent500 : C.accent200,
          transition: "all 0.3s",
        }} />
      ))}
    </div>
  );
}

// Primary button — Accent/500, full width, radius 94, h 51
const BTN_PRIMARY_SHADOW = "0 4px 16px rgba(124,111,205,0.35)";
const BTN_PRIMARY_SHADOW_PRESSED = "0 2px 8px rgba(124,111,205,0.2)";

function BtnPrimary({ children, onClick, disabled }) {
  const releasePress = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = "";
    e.currentTarget.style.boxShadow = BTN_PRIMARY_SHADOW;
  };
  const applyPress = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = "translateY(1px)";
    e.currentTarget.style.boxShadow = BTN_PRIMARY_SHADOW_PRESSED;
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={applyPress}
      onMouseUp={releasePress}
      onMouseLeave={(e) => { releasePress(e); if (!disabled) e.currentTarget.style.opacity = "1"; }}
      onTouchStart={applyPress}
      onTouchEnd={releasePress}
      style={{
      width: "100%", height: BTN_H, borderRadius: BTN_RADIUS,
      background: disabled ? C.accent300 : C.accent500,
      border: "none", cursor: disabled ? "default" : "pointer",
      ...BTN_FONT, color: C.neutral50,
      boxShadow: disabled ? "none" : BTN_PRIMARY_SHADOW,
      transition: "opacity 0.15s, transform 0.1s ease, box-shadow 0.1s ease",
    }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = "0.88")}
    >{children}</button>
  );
}

// Secondary button — no fill, Neutral/200 stroke, Neutral/700 text
function BtnSecondary({ children, onClick, small, disabled }) {
  const isDark = useContext(IsDarkContext);
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      style={{
        width: small ? undefined : "100%",
        flex: small ? 1 : undefined,
        height: BTN_H,
        borderRadius: BTN_RADIUS,
        background: "transparent",
        border: pillBorder(isDark, false),
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        padding: 0,
        margin: 0,
        boxSizing: "border-box",
        appearance: "none",
        WebkitAppearance: "none",
        color: "var(--n7)",
        transition: "opacity 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = "0.7")}
      onMouseLeave={e => (e.currentTarget.style.opacity = disabled ? "0.5" : "1")}
    >
      <span style={BTN_LABEL}>{children}</span>
    </button>
  );
}

// Small accent-filled button (Too hard / Another) — Accent/100 fill
function BtnAccent({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, height: BTN_H, borderRadius: BTN_RADIUS,
      background: C.accent100, border: "none",
      cursor: "pointer",
      ...BTN_FONT, color: C.accent500,
      transition: "opacity 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >{children}</button>
  );
}

// White card container
function Card({ children, style = {} }) {
  const isDark = useContext(IsDarkContext);
  return (
    <div style={{
      background: isDark ? "#2D2A45" : C.neutral50,
      borderRadius: CARD_RADIUS,
      padding: CARD_PAD,
      boxShadow: "0 1px 3px rgba(100,90,180,0.08), 0 8px 24px rgba(100,90,180,0.06)",
      ...style,
    }}>{children}</div>
  );
}

// Tag pill
function Tag({ label, green, compact }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      gap: compact ? 4 : 6,
      ...T.hint, fontSize: compact ? 12 : 15,
      color: green ? C.success500 : C.neutral300,
    }}>
      <span style={{
        width: compact ? 6 : 8, height: compact ? 6 : 8, borderRadius: "50%", flexShrink: 0,
        background: green ? C.success500 : C.accent200,
      }} />
      {label}
    </span>
  );
}

// Divider
function Divider() {
  return <div style={{ height: 1, background: C.neutral200, margin: "0" }} />;
}

// ═══════════════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════════════

function SplashScreen({ next }) {
  useEffect(() => { const t = setTimeout(next, 1600); return () => clearTimeout(t); }, []);
  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, background: C.accent500,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 8px 32px ${C.accent500}55`,
          color: C.neutral50, fontSize: 36, fontWeight: 700,
        }}>›</div>
        <div style={{ ...T.heading, fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "var(--n9)" }}>Nudge</div>
        <div style={{ ...T.hint }}>one small step at a time</div>
      </div>
    </>
  );
}

function OnboardingScreen({ next, tasks, setTasks }) {
  const [input, setInput] = useState("");
  const addTask = () => { if (input.trim()) { setTasks(p => [...p, input.trim()]); setInput(""); } };
  const remove = (i) => setTasks(tasks.filter((_, idx) => idx !== i));
  return (
    <>
      <Dots total={3} active={0} />
      <Label>Welcome</Label>
      <div style={{ ...T.heading, fontFamily: "'DM Serif Display', serif", color: "var(--n9)", marginBottom: 8 }}>What's weighing on you right now?</div>
      <div style={{ ...T.small, color: "var(--n7)", marginBottom: 20 }}>Add one thing at a time.</div>

      <Card style={{ marginBottom: 12, gap: 0, padding: 0, overflow: "hidden" }}>
        {/* Scrollable task list — fixed height once 5+ items */}
        <div style={{
          maxHeight: tasks.length >= 5 ? 240 : "none",
          overflowY: tasks.length >= 5 ? "auto" : "visible",
          padding: `0 ${CARD_PAD}px`,
        }}>
          {tasks.map((t, i) => (
            <div key={i}>
              <div onClick={() => remove(i)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 0", cursor: "pointer",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent300, flexShrink: 0 }} />
                <span style={{ ...T.body, color: "var(--n9)", flex: 1 }}>{t}</span>
              </div>
              <Divider />
            </div>
          ))}
        </div>

        {/* Input row — always visible below the scroll area */}
        <div style={{ padding: `0 ${CARD_PAD}px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.neutral200, flexShrink: 0 }} />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder={tasks.length === 0 ? "Something you've been putting off…" : "Another thing…"}
              style={{
                border: "none", outline: "none", flex: 1,
                ...T.body, color: "var(--n9)",
                background: "transparent", fontFamily: "Inter",
              }}
            />
            {input.trim() && (
              <button onClick={addTask} style={{
                background: C.accent500, color: C.neutral50, border: "none",
                borderRadius: 8, padding: "6px 12px", fontSize: 13,
                fontWeight: 600, cursor: "pointer", fontFamily: "Inter", flexShrink: 0,
              }}>Add</button>
            )}
          </div>
          {tasks.length > 0 && (
            <>
              <Divider />
              <div style={{ ...T.hint, fontSize: 14, textAlign: "center", padding: "8px 0" }}>
                tap any item to remove it
              </div>
            </>
          )}
        </div>
      </Card>

      {tasks.length > 0 && (
        <div style={{ ...T.hint, textAlign: "center", marginBottom: 16 }}>
          {tasks.length} thing{tasks.length !== 1 ? "s" : ""}
        </div>
      )}

      <div style={{ marginTop: "auto" }}>
        {tasks.length > 0 && <BtnPrimary onClick={next}>That's enough</BtnPrimary>}
        {tasks.length >= 6 && (
          <div style={{ ...T.hint, textAlign: "center", marginTop: 12 }}>
            That's already a lot — no need to add more
          </div>
        )}
      </div>
    </>
  );
}

function SetupScreen({ next, back, setDefaultEnergy, setDefaultTime }) {
  const isDark = useContext(IsDarkContext);
  const [slot, setSlot] = useState(null);
  const [duration, setDuration] = useState(null);
  const [energy, setEnergy] = useState(null);
  const ready = slot && duration && energy;
  const slots = ["Morning", "Lunch", "Evening", "Random"];
  const durations = ["5 min", "10 min", "15 min", "20 min", "30 min", "45 min", "60 min", "90 min"];
  const energies = ["low", "medium", "high"];
  return (
    <>
      <Dots total={3} active={1} />
      <Back onClick={back} />
      <Label>Quick Setup</Label>
      <div style={{ ...T.heading, color: "var(--n9)", marginBottom: 24 }}>When do you usually have a few minutes?</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {slots.map(s => (
          <button key={s} onClick={() => setSlot(s)} style={{
            padding: "14px", borderRadius: BTN_RADIUS,
            border: pillBorder(isDark, slot === s),
            background: pillBackground(isDark, slot === s),
            color: pillTextColor(isDark, slot === s),
            ...BTN_FONT, fontSize: 16, cursor: "pointer", fontFamily: "Inter",
          }}>{s}</button>
        ))}
      </div>

      <div style={{ height: 1, background: C.neutral200, marginBottom: 20 }} />

      <div style={{ ...T.small, color: "var(--n7)", marginBottom: 12 }}>How long are your typical pockets?</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {durations.map(d => (
          <button key={d} onClick={() => { setDuration(d); setDefaultTime(d); }} style={{
            flex: "1 1 auto", minWidth: 72, padding: "10px 12px", borderRadius: BTN_RADIUS,
            border: pillBorder(isDark, duration === d),
            background: pillBackground(isDark, duration === d),
            color: pillTextColor(isDark, duration === d),
            ...BTN_FONT, fontSize: 16, cursor: "pointer", fontFamily: "Inter",
          }}>{d}</button>
        ))}
      </div>

      <div style={{ height: 1, background: C.neutral200, marginBottom: 20 }} />

      <div style={{ ...T.small, color: "var(--n7)", marginBottom: 12 }}>Your usual energy level?</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { key: "low", label: "Low", icon: ICONS.batteryLow },
          { key: "medium", label: "Medium", icon: ICONS.batteryMedium },
          { key: "high", label: "High", icon: ICONS.batteryHigh },
        ].map(e => (
          <button key={e.key} onClick={() => { setEnergy(e.key); setDefaultEnergy(e.key); }} style={{
            flex: 1, padding: "8px 0", borderRadius: BTN_RADIUS,
            border: pillBorder(isDark, energy === e.key),
            background: pillBackground(isDark, energy === e.key),
            color: pillTextColor(isDark, energy === e.key),
            cursor: "pointer", fontFamily: "Inter",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {e.icon(energy === e.key ? C.accent500 : pillHintColor(isDark, false))}
            <span style={{ ...BTN_FONT, fontSize: 16 }}>{e.label}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={ready ? next : undefined} disabled={!ready}>Almost there</BtnPrimary>
      </div>
    </>
  );
}

function ReadyScreen({ next, back, setGranularity }) {
  const isDark = useContext(IsDarkContext);
  const [selected, setSelected] = useState("balanced");
  const readyInfoBg = isDark ? "#2A2445" : C.accent100;
  return (
    <>
      <Dots total={3} active={2} />
      <Back onClick={back} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
        <div style={{
          width: 88, height: 88, borderRadius: "50%", background: C.accent100,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24,
        }}>
          <svg width="36" height="27" viewBox="0 0 36 27" fill="none">
            <path d="M3 13L14 24L33 3" stroke={C.accent500} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div style={{ ...T.heading, color: "var(--n9)", textAlign: "center", marginBottom: 10 }}>{"You're all set"}</div>
        <div style={{ ...T.subtitle, color: "var(--n7)", textAlign: "center", lineHeight: 1.5, marginBottom: 28 }}>
          {"We'll help you take one small step at a time. No pressure."}
        </div>

        {/* Granularity selector */}
        <div style={{ width: "100%", marginBottom: 24 }}>
          <div style={{ ...T.hint, textAlign: "center", marginBottom: 12 }}>How small should the steps be?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              {
                key: "gentle", label: "Gentle", desc: "Tiny wins",
                illustration: (active) => (
                  <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
                    {[0,1,2,3,4,5].map(i => (
                      <rect key={i} x={0} y={i * 5} width={[22,28,18,24,20,16][i]} height={3} rx={1.5}
                        fill={active ? C.accent500 : C.neutral200}/>
                    ))}
                  </svg>
                ),
              },
              {
                key: "balanced", label: "Balanced", desc: "Mix of sizes",
                illustration: (active) => (
                  <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
                    {[0,1,2,3].map(i => (
                      <rect key={i} x={0} y={i * 8} width={[32,24,36,28][i]} height={4} rx={2}
                        fill={active ? C.accent500 : C.neutral200}/>
                    ))}
                  </svg>
                ),
              },
              {
                key: "detailed", label: "Detailed", desc: "Deep breakdown",
                illustration: (active) => (
                  <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
                    {[0,1,2].map(i => (
                      <rect key={i} x={0} y={i * 12} width={[40,34,38][i]} height={6} rx={3}
                        fill={active ? C.accent500 : C.neutral200}/>
                    ))}
                  </svg>
                ),
              },
            ].map(o => (
              <button key={o.key} onClick={() => { setSelected(o.key); setGranularity(o.key); }} style={{
                flex: 1, padding: "14px 6px 12px", borderRadius: 16,
                border: pillBorder(isDark, selected === o.key, 1.5),
                background: pillBackground(isDark, selected === o.key),
                cursor: "pointer", fontFamily: "Inter",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              }}>
                {o.illustration(selected === o.key)}
                <span style={{ ...T.small, color: pillLabelColor(isDark, selected === o.key), fontWeight: 600, fontSize: 14 }}>{o.label}</span>
                <span style={{ ...T.hint, fontSize: 11, color: pillHintColor(isDark, selected === o.key) }}>{o.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: readyInfoBg, borderRadius: 20,
          padding: "20px 24px", width: "100%",
          textAlign: "center", boxSizing: "border-box",
        }}>
          <div style={{ ...T.subtitle, color: C.accent500, fontWeight: 600 }}>Your first suggestion is ready</div>
        </div>
      </div>

      <BtnPrimary onClick={next}>Show me</BtnPrimary>
    </>
  );
}

function LoadingStepCard({ style = {} }) {
  const line = (extra = {}) => (
    <div style={{
      height: 14, borderRadius: 7, background: C.neutral200,
      animation: "ghostPulse 1.4s ease-in-out infinite",
      ...extra,
    }} />
  );
  return (
    <Card style={{ marginBottom: 0, ...style }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {line({ width: 72 })}
        {line({ width: 48 })}
        {line({ width: 64 })}
      </div>
      {line({ width: "100%", marginBottom: 10 })}
      {line({ width: "88%", marginBottom: 10 })}
      {line({ width: "60%", marginBottom: 20 })}
      <div style={{ display: "flex", gap: 8 }}>
        {line({ width: 80 })}
        {line({ width: 100 })}
      </div>
    </Card>
  );
}

const SUGGESTION_FADE_MS = 300;
const SUGGESTION_STAGGER_MS = 150;
const SUGGESTION_CARD_SLOT_MIN_H = 158;
const SUGGESTION_PROGRESS_H = 52;
const SUGGESTION_SEE_ALL_H = 38;
const SUGGESTION_ACTIONS_H = BTN_H * 2 + 10;

function SuggestionScreen({ next, onTooHard, onAnother, onSkip, onExit, task, stepIndex, steps, energy, loading, deferredNote, onDismissDeferNote }) {
  const isDark = useContext(IsDarkContext);
  const step = steps[stepIndex] || steps[0];
  const total = steps.length || 1;
  const stepReady = !loading && steps.length > 0 && !!step?.text;
  const pct = stepReady ? ((stepIndex + 1) / total) * 100 : 0;
  const taskLabel = task.length > 18 ? task.slice(0, 16) + "…" : task.toUpperCase();
  const fadeBelow = (delayMs) =>
    `opacity ${SUGGESTION_FADE_MS}ms ease ${delayMs}ms`;
  return (
    <>
      {deferredNote ? (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          background: C.warning100, borderRadius: 12, padding: "12px 14px",
          marginBottom: 12,
        }}>
          <div style={{ ...T.small, color: C.warning500, flex: 1, lineHeight: 1.4 }}>
            Prep needed: {deferredNote}
          </div>
          <button onClick={onDismissDeferNote} style={{
            background: "none", border: "none", color: C.neutral300,
            fontSize: 18, cursor: "pointer", padding: 0, lineHeight: 1, fontFamily: "Inter",
          }}>✕</button>
        </div>
      ) : null}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <Label style={{ margin: 0 }}>Your One Thing</Label>
        <button onClick={onExit} style={{
          background: "none", border: "none", cursor: "pointer",
          color: C.neutral300, padding: 4, lineHeight: 1,
          fontSize: 20, fontFamily: "Inter",
        }}>✕</button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>
        <div style={{ width: "100%" }}>
          <div style={{
            position: "relative",
            minHeight: SUGGESTION_CARD_SLOT_MIN_H,
            marginBottom: 28,
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              opacity: stepReady ? 0 : 1,
              transition: `opacity ${SUGGESTION_FADE_MS}ms ease`,
              pointerEvents: "none",
            }}>
              <LoadingStepCard />
            </div>
            <div style={{
              opacity: stepReady ? 1 : 0,
              transition: `opacity ${SUGGESTION_FADE_MS}ms ease`,
              pointerEvents: stepReady ? "auto" : "none",
            }}>
              <Card style={{
                marginBottom: 0,
                background: isDark ? "#2D2A45" : "linear-gradient(145deg, #FDFCF9 0%, #F5F0FF 60%, #FDF8F0 100%)",
                boxShadow: "0 2px 8px rgba(100,90,180,0.08), 0 16px 48px rgba(100,90,180,0.08)",
                border: isDark ? "1px solid rgba(124,111,205,0.2)" : "1px solid rgba(124,111,205,0.12)",
              }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
                  <span style={{ ...T.label, color: C.accent500 }}>{taskLabel}</span>
                  <span style={{ color: C.accent200 }}>•</span>
                  <span style={{ ...T.label, color: C.accent500 }}>{step?.mins ?? 0} MIN</span>
                  <span style={{ color: C.accent200 }}>•</span>
                  <span style={{ ...T.label, color: C.accent500 }}>{energy.toUpperCase()} ENERGY</span>
                </div>
                <div style={{ ...T.subtitle, color: "var(--n9)", fontWeight: 700, marginBottom: 20 }}>{step?.text ?? ""}</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {(step?.tags ?? []).map((t, i) => <Tag key={t} label={t} green={i === 1 || t === "no prep needed"} />)}
                </div>
              </Card>
            </div>
          </div>

          <div style={{
            height: SUGGESTION_PROGRESS_H,
            opacity: stepReady ? 1 : 0,
            transition: fadeBelow(SUGGESTION_STAGGER_MS),
            pointerEvents: stepReady ? "auto" : "none",
          }}>
            <div style={{ marginBottom: 6 }}>
              <div style={{ height: 4, borderRadius: 4, background: C.neutral200, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: C.accent500,
                  borderRadius: 4,
                  transition: stepReady ? "width 0.4s ease" : "none",
                }} />
              </div>
            </div>
            <div style={{ ...T.hint, fontSize: 14, textAlign: "right" }}>
              step {stepIndex + 1} of {total}
            </div>
          </div>

          <div style={{
            height: SUGGESTION_SEE_ALL_H,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            opacity: stepReady ? 1 : 0,
            transition: fadeBelow(SUGGESTION_STAGGER_MS + 50),
            pointerEvents: stepReady ? "auto" : "none",
          }}>
            <button
              type="button"
              onClick={onAnother}
              tabIndex={stepReady ? 0 : -1}
              aria-hidden={!stepReady}
              style={{
                background: "none", border: "none", color: C.accent500,
                ...T.hint, fontSize: 14, cursor: "pointer",
                fontFamily: "Inter", textDecoration: "underline",
                padding: 0, display: "flex", alignItems: "center",
                gap: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <rect x="1" y="1" width="12" height="3" rx="1" fill={C.accent500} fillOpacity="0.4"/>
                <rect x="1" y="5.5" width="12" height="3" rx="1" fill={C.accent500} fillOpacity="0.7"/>
                <rect x="1" y="10" width="12" height="3" rx="1" fill={C.accent500}/>
              </svg>
              see all steps
            </button>
          </div>

          <div style={{
            height: SUGGESTION_ACTIONS_H,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            opacity: stepReady ? 1 : 0,
            transition: fadeBelow(SUGGESTION_STAGGER_MS + 100),
            pointerEvents: stepReady ? "auto" : "none",
          }}>
            <BtnPrimary onClick={next} disabled={!stepReady}>I can do that</BtnPrimary>
            <div style={{ display: "flex", gap: 10 }}>
              <BtnAccent onClick={onTooHard}>Too hard</BtnAccent>
              <BtnAccent onClick={onAnother}>Another</BtnAccent>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AllStepsScreen({ back, steps, stepIndex, onPick, task, loading, stepLinks, onSetStepLink }) {
  const isDark = useContext(IsDarkContext);
  const stepDivider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const [linkEditingIndex, setLinkEditingIndex] = useState(null);
  const [linkDraft, setLinkDraft] = useState("");

  const openLinkEditor = (i, e) => {
    e.stopPropagation();
    setLinkEditingIndex(i);
    setLinkDraft(stepLinks[i] || steps[i]?.link || "");
  };

  return (
    <>
      <Back onClick={back} />
      <Label>All Steps</Label>
      <div style={{ ...T.subtitle, color: "var(--n9)", marginBottom: 20 }}>{task}</div>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "visible" }}>
        {loading ? [0, 1, 2, 3].map(i => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", flexShrink: 0, boxSizing: "border-box",
              background: C.neutral200, animation: "ghostPulse 1.4s ease-in-out infinite",
            }} />
            <div style={{
              flex: 1, borderRadius: CARD_RADIUS, padding: "14px 16px",
              border: `1px solid ${C.neutral200}`, background: C.neutral50,
            }}>
              <div style={{
                height: 14, borderRadius: 7, background: C.neutral200, marginBottom: 10,
                width: i % 2 ? "75%" : "90%", animation: "ghostPulse 1.4s ease-in-out infinite",
              }} />
              <div style={{
                height: 10, borderRadius: 5, background: C.neutral200, width: "50%",
                animation: "ghostPulse 1.4s ease-in-out infinite",
              }} />
            </div>
          </div>
        )) : steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 4 }}>
            {/* Spine */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0, boxSizing: "border-box",
                background: i < stepIndex ? C.success500 : i === stepIndex ? C.accent500 : C.neutral200,
                border: `2px solid ${i < stepIndex ? C.success500 : i === stepIndex ? C.accent500 : C.neutral200}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {i < stepIndex
                  ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === stepIndex ? "white" : C.neutral300 }} />
                }
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 2, flex: 1, minHeight: 20,
                  background: i < stepIndex ? C.success500 : C.neutral200,
                  margin: "3px 0",
                }} />
              )}
            </div>
            {/* Step row */}
            <div onClick={() => onPick(i)} style={{
              flex: 1,
              padding: "12px 0",
              cursor: "pointer",
              opacity: i < stepIndex ? 0.5 : 1,
              borderBottom: i < steps.length - 1 ? `1px solid ${stepDivider}` : "none",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ ...T.small, color: "var(--n9)", flex: 1, textDecoration: i < stepIndex ? "line-through" : "none" }}>{s.text}</div>
                {i === stepIndex && <span style={{ ...T.label, color: C.accent500, fontSize: 10 }}>NOW</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, rowGap: 4, marginTop: 8 }}>
                {s.tags.map((t, j) => <Tag key={t} label={t} green={j === 1} compact />)}
              </div>
              <div onClick={e => e.stopPropagation()} style={{ marginTop: 10 }}>
                {linkEditingIndex === i ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      value={linkDraft}
                      onChange={e => setLinkDraft(e.target.value)}
                      placeholder="Paste a URL"
                      onClick={e => e.stopPropagation()}
                      style={{
                        border: `1px solid ${C.neutral200}`, borderRadius: 8,
                        padding: "8px 10px", width: "100%", boxSizing: "border-box",
                        ...T.small, fontFamily: "Inter", color: "var(--n9)",
                        background: C.neutral50,
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetStepLink(i, linkDraft.trim());
                        setLinkEditingIndex(null);
                      }}
                      style={{
                        alignSelf: "flex-start", background: C.accent500, color: C.neutral50,
                        border: "none", borderRadius: 8, padding: "6px 12px",
                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter",
                      }}
                    >Save link</button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => openLinkEditor(i, e)}
                    style={{
                      background: "none", border: "none", padding: 0,
                      color: C.accent500, ...T.hint, fontSize: 13,
                      cursor: "pointer", fontFamily: "Inter", textDecoration: "underline",
                    }}
                  >{stepLinks[i] || s.link ? "Edit link" : "+ Add link"}</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const GATHER_HOLD_MS = 850;
const GATHER_CANVAS_W = 390;
const GATHER_CANVAS_H = 368;
const GATHER_CIRCLE_CX = GATHER_CANVAS_W / 2;
const GATHER_CIRCLE_CY = GATHER_CANVAS_H / 2;
const GATHER_CIRCLE_R = 130;
const FOCUS_CAPTION_MIN_H = 52;
const FOCUS_ACTIONS_H = BTN_H * 2 + 12;
const GATHER_TEXT_WIDTH = Math.round(GATHER_CIRCLE_R * 2 * 0.80);
const GATHER_TEXT_MAX_H = Math.round(GATHER_CIRCLE_R * 1.55);

const GATHER_THEME = {
  light: {
    purple: [124, 111, 205],
    mint: [95, 191, 155],
    text: "#3A372F",
    loadingHint: "#9D93D8",
    a: {
      haloBase: 0.04,
      haloBreathe: 0.06,
      haloHold: 0.05,
      haloMid: 0.008,
      gatherIdle: 0.15,
      gatherGlow: 0.12,
      gatherAlphaMin: 0.25,
      gatherAlphaRange: 0.55,
      fillInner: 0.18,
      fillHold: 0.10,
      fillComplete: 0.12,
      fillMid: 0.09,
      fillHoldMid: 0.05,
      strokeCircle: 0.40,
      tideLayer0: 0.30,
      tideLayer1: 0.18,
      tideHoldBoost: 0.15,
      tideCrest: 0.85,
      tideRingBase: 0.4,
      tideRingHold: 0.4,
      completeTide0: 0.32,
      completeTide1: 0.18,
      completeRing: 0.7,
      bloom: 0.6,
      check: 0.95,
      checkWidth: 5.5,
      droplet: 0.35,
    },
  },
  dark: {
    purple: [124, 111, 205],
    mint: [111, 208, 172],
    tide: [111, 208, 172],
    interior: [26, 45, 36],
    checkStroke: [168, 230, 205],
    skipCompleteTideFill: true,
    text: "#EDEAE4",
    loadingHint: C.accent300,
    a: {
      haloBase: 0.08,
      haloBreathe: 0.12,
      haloHold: 0.10,
      haloMid: 0.016,
      gatherIdle: 0.30,
      gatherGlow: 0.24,
      gatherAlphaMin: 0.25,
      gatherAlphaRange: 0.55,
      fillInner: 0.12,
      fillHold: 0.06,
      fillComplete: 0,
      fillMid: 0.06,
      fillHoldMid: 0.03,
      strokeCircle: 0.68,
      tideLayer0: 0.30,
      tideLayer1: 0.15,
      tideHoldBoost: 0.05,
      tideCrest: 0.72,
      tideRingBase: 0.55,
      tideRingHold: 0.30,
      completeGlowInner: 0.11,
      completeGlowMid: 0.035,
      completeTide0: 0.15,
      completeTide1: 0.08,
      completeRing: 0.88,
      bloom: 0.75,
      check: 0.95,
      checkWidth: 6.5,
      droplet: 0.35,
    },
  },
};

function getGatherTheme(isDark) {
  return isDark ? GATHER_THEME.dark : GATHER_THEME.light;
}

function gatherTaskTextStyle(text, theme) {
  const len = (text || "").length;
  const fontSize =
    len <= 30 ? 19 :
    len <= 55 ? 17 :
    len <= 85 ? 15 :
    len <= 120 ? 13.5 : 12;
  return {
    margin: 0,
    position: "absolute",
    left: "50%",
    top: `${(GATHER_CIRCLE_CY / GATHER_CANVAS_H) * 100}%`,
    transform: "translate(-50%, -50%)",
    width: GATHER_TEXT_WIDTH,
    maxHeight: GATHER_TEXT_MAX_H,
    overflow: "hidden",
    fontSize,
    lineHeight: 1.4,
    fontWeight: 600,
    color: theme.text,
    textAlign: "center",
    overflowWrap: "break-word",
  };
}

function GatherBloomCircle({ sessionId, stepText, loading, phase, onPhaseChange, onComplete, resourceLink }) {
  const isDark = useContext(IsDarkContext);
  const theme = getGatherTheme(isDark);
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const displayText = stepText || "Your step is loading…";
  const [runId, setRunId] = useState(0);
  const canvasRef = useRef(null);
  const phaseRef = useRef(phase);
  const phaseStart = useRef(performance.now());
  const onPhaseChangeRef = useRef(onPhaseChange);
  const hold = useRef({ active: false, value: 0 });
  const gatherers = useRef([]);
  const bloomers = useRef([]);
  const colorMix = useRef(0);
  const circleAlpha = useRef(0);
  const reduceMotion = useRef(false);
  const loadingRef = useRef(loading);
  const stepTextRef = useRef(stepText);
  const focusTriggered = useRef(false);
  const completeFired = useRef(false);
  const completeFiredSession = useRef(null);
  const onCompleteRef = useRef(onComplete);

  phaseRef.current = phase;
  loadingRef.current = loading;
  stepTextRef.current = stepText;
  onCompleteRef.current = onComplete;
  onPhaseChangeRef.current = onPhaseChange;

  useEffect(() => {
    if (window.matchMedia) {
      reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }, []);

  const resetGatherAnimation = useCallback(() => {
    onPhaseChangeRef.current("loading");
    phaseRef.current = "loading";
    phaseStart.current = performance.now();
    focusTriggered.current = false;
    completeFired.current = false;
    completeFiredSession.current = null;
    hold.current = { active: false, value: 0 };
    bloomers.current = [];
    colorMix.current = 0;
    circleAlpha.current = reduceMotion.current ? 1 : 0;
    spawnGather();
    setRunId(r => r + 1);
  }, []);

  useEffect(() => {
    resetGatherAnimation();
  }, [sessionId, resetGatherAnimation]);

  useEffect(() => {
    phaseRef.current = phase;
    phaseStart.current = performance.now();
    if (phase === "complete") {
      spawnBloom();
    }
  }, [phase, runId]);

  useEffect(() => {
    if (phase !== "complete") return;
    const firedFor = sessionId;
    const t = setTimeout(() => {
      if (completeFiredSession.current === firedFor) return;
      completeFiredSession.current = firedFor;
      completeFired.current = true;
      onCompleteRef.current();
    }, 2200);
    return () => clearTimeout(t);
  }, [phase, sessionId]);

  const spawnGather = () => {
    if (reduceMotion.current) { gatherers.current = []; return; }
    const arr = [];
    const W = GATHER_CANVAS_W, H = GATHER_CANVAS_H;
    for (let i = 0; i < 44; i++) {
      const edge = Math.floor(Math.random() * 4);
      let x, y;
      if (edge === 0) { x = Math.random() * W; y = -20 - Math.random() * 40; }
      else if (edge === 1) { x = W + 20 + Math.random() * 40; y = Math.random() * H; }
      else if (edge === 2) { x = Math.random() * W; y = H + 20 + Math.random() * 40; }
      else { x = -20 - Math.random() * 40; y = Math.random() * H; }
      const targetAngle = Math.random() * Math.PI * 2;
      arr.push({
        x, y,
        tx: GATHER_CIRCLE_CX + Math.cos(targetAngle) * GATHER_CIRCLE_R,
        ty: GATHER_CIRCLE_CY + Math.sin(targetAngle) * GATHER_CIRCLE_R,
        delay: Math.random() * 1.1,
        dur: 1.2 + Math.random() * 0.7,
        size: 1.8 + Math.random() * 3.0,
        curve: (Math.random() - 0.5) * 120,
        arrived: false,
      });
    }
    gatherers.current = arr;
  };

  const spawnBloom = () => {
    if (reduceMotion.current) return;
    const arr = [];
    const cx = GATHER_CIRCLE_CX, cy = GATHER_CIRCLE_CY, R = GATHER_CIRCLE_R + 4;
    for (let i = 0; i < 52; i++) {
      const spread = (Math.random() - 0.5) * 2;
      const a = -Math.PI / 2 + spread * spread * spread * 1.5;
      const ox = cx + Math.cos(a) * R;
      const oy = cy + Math.sin(a) * R;
      const power = 2.6 + Math.random() * 3.2;
      arr.push({
        x: ox, y: oy,
        vx: Math.cos(a) * power * 0.55 + (Math.random() - 0.5) * 0.8,
        vy: Math.sin(a) * power - Math.random() * 1.6,
        size: 1.4 + Math.random() * 3.0,
        life: 1,
        decay: 0.0055 + Math.random() * 0.007,
        mint: Math.random() > 0.25,
      });
    }
    bloomers.current = arr;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const W = GATHER_CANVAS_W, H = GATHER_CANVAS_H;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    let raf;
    const cx = GATHER_CIRCLE_CX, cy = GATHER_CIRCLE_CY;
    const baseR = GATHER_CIRCLE_R;
    const lerp = (a, b, k) => a + (b - a) * k;
    const easeInOut = (k) => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const mixCol = (c1, c2, k) => c1.map((v, i) => Math.round(lerp(v, c2[i], k)));

    const draw = (now) => {
      const t = now / 1000;
      const ph = phaseRef.current;
      const since = (now - phaseStart.current) / 1000;

      if (ph === "focus") {
        const dt = 16.7;
        if (hold.current.active) {
          hold.current.value = Math.min(1, hold.current.value + dt / GATHER_HOLD_MS);
          if (hold.current.value >= 1) {
            hold.current = { active: false, value: 0 };
            if (phaseRef.current !== "complete") {
              phaseRef.current = "complete";
              phaseStart.current = performance.now();
              spawnBloom();
              onPhaseChangeRef.current("complete");
            }
          }
        } else {
          hold.current.value = Math.max(0, hold.current.value - dt / (GATHER_HOLD_MS * 0.55));
        }
      }
      const hv = hold.current.value;

      colorMix.current = lerp(colorMix.current, ph === "complete" ? 1 : hv * 0.35, 0.05);
      const th = themeRef.current;
      const a = th.a;
      const [cr, cg, cb] = mixCol(th.purple, th.mint, colorMix.current);

      ctx.clearRect(0, 0, W, H);

      const breathe = reduceMotion.current
        ? 0.5
        : ph === "loading"
        ? Math.min(1, since / 2.5)
        : ph === "focus"
        ? Math.sin(t * 0.85) * 0.5 + 0.5
        : 0.65;

      let R = baseR;
      if (!reduceMotion.current) {
        if (ph === "focus") R += Math.sin(t * 0.85) * 5 + hv * 7;
        if (ph === "complete") {
          const k = Math.min(1, since / 0.6);
          R += 4 + Math.sin(k * Math.PI) * 6 * (1 - k);
        }
      }

      const haloGate = ph === "loading" ? circleAlpha.current : 1;
      const skipOuterHalo = ph === "complete" && th.interior;
      if (!skipOuterHalo) {
        const haloR = R + 52;
        const halo = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, haloR);
        halo.addColorStop(0, `rgba(${cr},${cg},${cb},${(a.haloBase + breathe * a.haloBreathe + hv * a.haloHold) * haloGate})`);
        halo.addColorStop(0.55, `rgba(${cr},${cg},${cb},${a.haloMid * haloGate})`);
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();
      }

      if (ph === "loading" && gatherers.current.length) {
        let arrivedCount = 0;
        const stillLoading = loadingRef.current;
        const landBoost = stillLoading
          ? Math.max(0.28, 0.72 / (1 + since * 0.18))
          : 1.85;
        for (const g of gatherers.current) {
          const k = Math.min(1, Math.max(0, ((since - g.delay) / g.dur) * landBoost));
          if (k >= 1) { g.arrived = true; arrivedCount++; continue; }
          if (k <= 0) {
            ctx.beginPath();
            ctx.arc(g.x, g.y, g.size * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${th.purple[0]},${th.purple[1]},${th.purple[2]},${a.gatherIdle})`;
            ctx.fill();
            continue;
          }
          const e = easeInOut(k);
          const mx = (g.x + g.tx) / 2 + g.curve * Math.sin(Math.PI * 0.5);
          const my = (g.y + g.ty) / 2 + g.curve * 0.6;
          const x = (1 - e) * (1 - e) * g.x + 2 * (1 - e) * e * mx + e * e * g.tx;
          const y = (1 - e) * (1 - e) * g.y + 2 * (1 - e) * e * my + e * e * g.ty;
          const alpha = a.gatherAlphaMin + e * a.gatherAlphaRange;
          ctx.beginPath();
          ctx.arc(x, y, g.size * (0.6 + e * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${th.purple[0]},${th.purple[1]},${th.purple[2]},${alpha})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, g.size * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${th.purple[0]},${th.purple[1]},${th.purple[2]},${alpha * a.gatherGlow})`;
          ctx.fill();
        }
        const rawTarget = gatherers.current.length ? arrivedCount / gatherers.current.length : 1;
        const target = stillLoading ? Math.min(rawTarget, 0.82) : rawTarget;
        const alphaSpeed = stillLoading
          ? Math.max(0.025, 0.055 / (1 + since * 0.1))
          : 0.14;
        circleAlpha.current = lerp(circleAlpha.current, target, alphaSpeed);
        if (
          !loadingRef.current &&
          stepTextRef.current &&
          !focusTriggered.current &&
          (circleAlpha.current > 0.88 || target >= 0.95 || reduceMotion.current)
        ) {
          focusTriggered.current = true;
          onPhaseChangeRef.current("focus");
          phaseRef.current = "focus";
          phaseStart.current = performance.now();
        }
      } else if (ph !== "loading") {
        circleAlpha.current = lerp(circleAlpha.current, 1, 0.08);
      }
      const ca = circleAlpha.current;

      if (ca > 0.02) {
        if (ph === "complete" && th.interior) {
          const [ir, ig, ib] = th.interior;
          const [mr, mg, mb] = th.mint;
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ir},${ig},${ib},${0.94 * ca})`;
          ctx.fill();
          const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
          glow.addColorStop(0, `rgba(${mr},${mg},${mb},${a.completeGlowInner * ca})`);
          glow.addColorStop(0.42, `rgba(${mr},${mg},${mb},${a.completeGlowMid * ca})`);
          glow.addColorStop(0.72, `rgba(${mr},${mg},${mb},${0.012 * ca})`);
          glow.addColorStop(1, `rgba(${mr},${mg},${mb},0)`);
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
          ctx.strokeStyle = `rgba(${mr},${mg},${mb},${a.completeRing * ca})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else {
          const fg = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.1, cx, cy, R * 1.12);
          fg.addColorStop(0, `rgba(${cr},${cg},${cb},${(a.fillInner + hv * a.fillHold + (ph === "complete" ? a.fillComplete : 0)) * ca})`);
          fg.addColorStop(0.7, `rgba(${cr},${cg},${cb},${(a.fillMid + hv * a.fillHoldMid) * ca})`);
          fg.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI * 2);
          ctx.fillStyle = fg;
          ctx.fill();
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a.strokeCircle * ca})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      const tideRgb = (holdMix) =>
        th.tide ?? mixCol(th.purple, th.mint, holdMix);

      if (ph === "focus" && hv > 0.005) {
        const waveAmp = 4.5 * (1 - hv * 0.5);
        const level = cy + R - hv * (R * 2 + waveAmp * 2 + 16);
        const tideCol = tideRgb(hv);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
        ctx.clip();
        for (let layer = 0; layer < 2; layer++) {
          const dir = layer === 0 ? 1 : -1;
          const speed = layer === 0 ? 2.6 : 1.9;
          const yOff = layer === 0 ? 0 : 3;
          ctx.beginPath();
          ctx.moveTo(cx - R, cy + R + 4);
          for (let x = cx - R; x <= cx + R; x += 4) {
            const wy =
              level + yOff +
              Math.sin((x / 34) * dir + t * speed) * waveAmp +
              Math.sin((x / 13) * dir - t * speed * 1.4) * waveAmp * 0.35;
            ctx.lineTo(x, wy);
          }
          ctx.lineTo(cx + R, cy + R + 4);
          ctx.closePath();
          const layerA = layer === 0 ? a.tideLayer0 : a.tideLayer1;
          ctx.fillStyle = `rgba(${tideCol[0]},${tideCol[1]},${tideCol[2]},${layerA + hv * a.tideHoldBoost})`;
          ctx.fill();
        }
        ctx.beginPath();
        for (let x = cx - R; x <= cx + R; x += 4) {
          const wy =
            level +
            Math.sin((x / 34) + t * 2.6) * waveAmp +
            Math.sin((x / 13) - t * 3.64) * waveAmp * 0.35;
          x === cx - R ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
        }
        ctx.strokeStyle = `rgba(${tideCol[0]},${tideCol[1]},${tideCol[2]},${a.tideCrest})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        if (!reduceMotion.current && hv > 0.12) {
          for (let i = 0; i < 7; i++) {
            const seed = i * 137.5;
            const bx = cx - R * 0.7 + ((seed * 7.3) % (R * 1.4));
            const cycle = ((t * (0.35 + (i % 3) * 0.12) + i * 0.21) % 1);
            const by = cy + R - cycle * (cy + R - level - 6);
            if (by > level + 4) {
              ctx.beginPath();
              ctx.arc(bx, by, 1.3 + (i % 3) * 0.6, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255,255,255,${a.droplet * (1 - cycle)})`;
              ctx.fill();
            }
          }
        }
        ctx.restore();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${tideCol[0]},${tideCol[1]},${tideCol[2]},${a.tideRingBase + hv * a.tideRingHold})`;
        ctx.lineWidth = 1.5 + hv * 1.5;
        ctx.stroke();
      }

      if (ph === "complete" && !th.skipCompleteTideFill) {
        const settle = Math.min(1, since / 1.5);
        const waveAmp = 4.5 * (1 - settle);
        const tideCol = tideRgb(Math.min(1, 0.6 + settle * 0.4));
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
        ctx.clip();
        const level = cy - R - waveAmp - 6 + settle * 0;
        for (let layer = 0; layer < 2; layer++) {
          const dir = layer === 0 ? 1 : -1;
          const speed = layer === 0 ? 2.6 : 1.9;
          ctx.beginPath();
          ctx.moveTo(cx - R, cy + R + 4);
          for (let x = cx - R; x <= cx + R; x += 4) {
            const wy =
              level +
              Math.sin((x / 34) * dir + t * speed) * waveAmp +
              Math.sin((x / 13) * dir - t * speed * 1.4) * waveAmp * 0.35;
            ctx.lineTo(x, wy);
          }
          ctx.lineTo(cx + R, cy + R + 4);
          ctx.closePath();
          ctx.fillStyle = `rgba(${tideCol[0]},${tideCol[1]},${tideCol[2]},${layer === 0 ? a.completeTide0 : a.completeTide1})`;
          ctx.fill();
        }
        ctx.restore();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${tideCol[0]},${tideCol[1]},${tideCol[2]},${a.completeRing})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      if (bloomers.current.length) {
        bloomers.current = bloomers.current.filter((p) => p.life > 0);
        for (const p of bloomers.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.085;
          p.vx *= 0.985;
          p.vy *= 0.992;
          p.life -= p.decay;
          if (p.life <= 0) continue;
          const c = p.mint ? th.mint : th.purple;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a.bloom * p.life})`;
          ctx.fill();
        }
      }

      if (ph === "complete") {
        const k = Math.min(1, Math.max(0, (since - 0.55) / 0.5));
        if (k > 0) {
          const ease = 1 - Math.pow(1 - k, 3);
          ctx.save();
          ctx.translate(cx, cy);
          const [ckr, ckg, ckb] = th.checkStroke ?? th.mint;
          ctx.strokeStyle = `rgba(${ckr},${ckg},${ckb},${a.check})`;
          ctx.lineWidth = a.checkWidth ?? 5.5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          const p1 = [-52, 4], p2 = [-12, 44], p3 = [60, -36];
          const l1 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
          const l2 = Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);
          const drawn = ease * (l1 + l2);
          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          if (drawn <= l1) {
            const k1 = drawn / l1;
            ctx.lineTo(p1[0] + (p2[0] - p1[0]) * k1, p1[1] + (p2[1] - p1[1]) * k1);
          } else {
            ctx.lineTo(p2[0], p2[1]);
            const k2 = (drawn - l1) / l2;
            ctx.lineTo(p2[0] + (p3[0] - p2[0]) * k2, p2[1] + (p3[1] - p2[1]) * k2);
          }
          ctx.stroke();
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const startHold = useCallback((e) => {
    e.preventDefault();
    if (phaseRef.current !== "focus" || loadingRef.current) return;
    hold.current.active = true;
    if (navigator.vibrate) navigator.vibrate(8);
  }, []);
  const endHold = useCallback(() => {
    hold.current.active = false;
  }, []);

  const showFocusText = phase === "focus" && !!stepText;
  const showLoadingHint = phase === "loading";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: GATHER_CANVAS_W,
        aspectRatio: `${GATHER_CANVAS_W} / ${GATHER_CANVAS_H}`,
        touchAction: "none",
        cursor: phase === "focus" && !loading ? "pointer" : "default",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      onTouchCancel={endHold}
      role={phase === "focus" && !loading ? "button" : undefined}
      aria-label={phase === "focus" && !loading ? "Press and hold to finish this step" : undefined}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        opacity: showFocusText ? 1 : 0,
        transform: showFocusText ? "scale(1)" : "scale(0.97)",
        transition: showFocusText ? "opacity 600ms ease 300ms, transform 600ms ease 300ms" : "opacity 600ms ease, transform 600ms ease",
      }}>
        <p style={gatherTaskTextStyle(displayText, theme)}>{displayText}</p>
        {resourceLink ? (
          <a
            href={resourceLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "absolute",
              left: "50%",
              top: `${((GATHER_CIRCLE_CY + GATHER_CIRCLE_R * 0.55) / GATHER_CANVAS_H) * 100}%`,
              transform: "translateX(-50%)",
              color: C.accent500,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "underline",
              fontFamily: "Inter",
              pointerEvents: "auto",
            }}
          >Open resource →</a>
        ) : null}
      </div>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
        opacity: showLoadingHint ? 1 : 0,
        transform: showLoadingHint ? "scale(1)" : "scale(0.97)",
        transition: "opacity 600ms ease, transform 600ms ease",
      }}>
        <p style={{
          margin: 0,
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: theme.loadingHint,
        }}>gathering your step</p>
      </div>
    </div>
  );
}

function inProgressShellBackground(isDark) {
  return isDark
    ? "radial-gradient(ellipse at 50% 30%, #1E1B35 0%, #1A1828 60%)"
    : "radial-gradient(ellipse at 50% 30%, #EEE9FF 0%, #F0EEF5 60%)";
}

function InProgressScreen({ gatherPhase, onGatherPhaseChange, onDone, onPause, onTooMuch, onDefer, step, resourceLink, stepsLoading }) {
  const isDark = useContext(IsDarkContext);
  const [showDeferInput, setShowDeferInput] = useState(false);
  const [deferDraft, setDeferDraft] = useState("");
  const [gatherSessionId] = useState(() => Math.random());
  const isComplete = gatherPhase === "complete";

  return (
    <>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        minHeight: 28,
        flexShrink: 0,
      }}>
        <Label style={{ margin: 0 }}>{isComplete ? "Step complete" : "In Progress"}</Label>
        <button
          onClick={onPause}
          aria-hidden={isComplete}
          tabIndex={isComplete ? -1 : 0}
          style={{
            background: "none", border: "none", color: C.neutral500,
            ...T.small, fontWeight: 600, cursor: isComplete ? "default" : "pointer", fontFamily: "Inter",
            display: "flex", alignItems: "center", gap: 6,
            visibility: isComplete ? "hidden" : "visible",
            pointerEvents: isComplete ? "none" : "auto",
          }}
        >‖ Pause</button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, width: "100%" }}>
        <div style={{ flex: 1, minHeight: 0 }} />
        <div style={{ width: "100%", flexShrink: 0, display: "flex", justifyContent: "center" }}>
          <GatherBloomCircle
            sessionId={gatherSessionId}
            phase={gatherPhase}
            onPhaseChange={onGatherPhaseChange}
            stepText={step?.text}
            loading={stepsLoading}
            onComplete={onDone}
            resourceLink={resourceLink}
          />
        </div>
        <div style={{
          flex: 1,
          minHeight: FOCUS_CAPTION_MIN_H,
          width: "100%",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            opacity: isComplete ? 0 : 1,
            pointerEvents: "none",
            transition: "opacity 300ms ease",
          }}>
            <div style={{
              ...T.small, color: C.accent500, fontWeight: 600, marginBottom: 6,
            }}>
              Take your time. No rush.
            </div>
            <div style={{ ...T.hint }}>Press and hold the circle to finish.</div>
          </div>
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            opacity: isComplete ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 300ms ease",
          }}>
            <div style={{
              ...T.small, color: C.success500, fontWeight: 600, marginBottom: 6,
            }}>
              Small step taken.
            </div>
            <div style={{ ...T.hint }}>That's real progress.</div>
          </div>
        </div>
        <div style={{
          flexShrink: 0,
          minHeight: FOCUS_ACTIONS_H,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          visibility: isComplete ? "hidden" : "visible",
          pointerEvents: isComplete ? "none" : "auto",
        }}>
          <BtnSecondary key="too-much" onClick={onTooMuch}>Too much?</BtnSecondary>
          {showDeferInput ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
              <div style={{ ...T.small, color: "var(--n7)" }}>What do you need first?</div>
              <input
                className="nudge-defer-input"
                value={deferDraft}
                onChange={e => setDeferDraft(e.target.value)}
                placeholder="e.g. find the right document"
                style={{
                  border: `1.5px solid ${C.accent500}`, borderRadius: 12,
                  padding: "12px 14px", width: "100%", boxSizing: "border-box",
                  ...T.body, fontFamily: "Inter", color: "var(--n9)",
                  background: isDark ? "#2D2A45" : C.neutral50,
                }}
              />
              <style>{`.nudge-defer-input::placeholder { color: ${C.neutral300}; opacity: 1; }`}</style>
              <BtnPrimary onClick={() => deferDraft.trim() && onDefer(deferDraft.trim())}>Save & come back</BtnPrimary>
            </div>
          ) : (
            <BtnSecondary key="not-ready" onClick={() => setShowDeferInput(true)}>Not ready yet</BtnSecondary>
          )}
        </div>
      </div>
    </>
  );
}

const SIMPLIFY_TOTAL_MS = 1200;
const SIMPLIFY_ASIDE_START_MS = 180;
const SIMPLIFY_ASIDE_MS = 420;
const SIMPLIFY_HERO_START_MS = 420;
const SIMPLIFY_HERO_MS = 520;
const SIMPLIFY_BUTTONS_START_MS = 820;
const SIMPLIFY_BUTTONS_STAGGER_MS = 110;
const SIMPLIFY_BUTTONS_MS = 440;
const SIMPLIFY_HERO_PAD = 26;

function simplifyClamp(v, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, v));
}

function simplifyLerp(a, b, t) {
  return a + (b - a) * t;
}

function simplifyEaseOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function SimplifyScreen({ next, onStillTooMuch, step }) {
  const isDark = useContext(IsDarkContext);
  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [progress, setProgress] = useState(reducedMotion ? 1 : 0);
  const originalText = step?.text ?? "";
  const smallerText = step?.tooHard ?? "";

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    setProgress(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const p = simplifyClamp((now - start) / SIMPLIFY_TOTAL_MS);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [originalText]);

  const elapsed = progress * SIMPLIFY_TOTAL_MS;
  const asideT = simplifyEaseOutQuart(
    simplifyClamp((elapsed - SIMPLIFY_ASIDE_START_MS) / SIMPLIFY_ASIDE_MS)
  );
  const heroT = simplifyEaseOutQuart(
    simplifyClamp((elapsed - SIMPLIFY_HERO_START_MS) / SIMPLIFY_HERO_MS)
  );
  const primaryBtnT = simplifyEaseOutQuart(
    simplifyClamp((elapsed - SIMPLIFY_BUTTONS_START_MS) / SIMPLIFY_BUTTONS_MS)
  );
  const secondaryBtnT = simplifyEaseOutQuart(
    simplifyClamp((elapsed - SIMPLIFY_BUTTONS_START_MS - SIMPLIFY_BUTTONS_STAGGER_MS) / SIMPLIFY_BUTTONS_MS)
  );

  const asideColor = isDark ? "rgba(240,238,248,0.5)" : "rgba(42,39,47,0.5)";
  const heroBg = isDark ? "#1A2D24" : C.neutral50;
  const heroBorder = isDark ? "rgba(111,208,172,0.48)" : "rgba(107,191,154,0.42)";
  const heroGlow = isDark
    ? "0 8px 40px rgba(111,208,172,0.16), 0 0 48px rgba(111,208,172,0.08)"
    : "0 8px 36px rgba(107,191,154,0.14), 0 0 44px rgba(95,191,155,0.07)";

  return (
    <>
      <div style={{ marginBottom: 28, flexShrink: 0 }}>
        <Label color={C.warning500}>Let's Simplify</Label>
        <div style={{ ...T.heading, fontFamily: "'DM Serif Display', serif", color: "var(--n9)", marginBottom: 8 }}>That one felt like too much?</div>
        <div style={{ ...T.small, color: "var(--n7)", marginBottom: 0 }}>No problem. Here's something smaller.</div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, width: "100%" }}>
        <div style={{ flex: 1, minHeight: 0 }} />
        <div style={{
          width: "100%",
          maxWidth: GATHER_CANVAS_W,
          margin: "0 auto",
          flexShrink: 0,
        }}>
          <p style={{
            margin: "0 0 36px",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 1.55,
            color: asideColor,
            textAlign: "center",
            opacity: asideT,
            transform: `translateY(${simplifyLerp(6, 0, asideT)}px)`,
          }}>
            instead of{" "}
            <span style={{
              textDecoration: "line-through",
              textDecorationColor: "currentColor",
            }}>
              {originalText}
            </span>
          </p>

          <div style={{
            opacity: heroT,
            transform: `translateY(${simplifyLerp(12, 0, heroT)}px)`,
          }}>
            <div style={{
              borderRadius: CARD_RADIUS,
              padding: SIMPLIFY_HERO_PAD,
              background: heroBg,
              border: `1.5px solid ${heroBorder}`,
              boxShadow: heroGlow,
            }}>
              <div style={{
                fontFamily: "Inter",
                fontSize: 20,
                fontWeight: 600,
                lineHeight: 1.45,
                color: isDark ? "#EDEAE4" : "var(--n9)",
                textAlign: "center",
              }}>
                {smallerText}
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: FOCUS_CAPTION_MIN_H, width: "100%" }} />

        <div style={{
          flexShrink: 0,
          minHeight: FOCUS_ACTIONS_H,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          justifyContent: "flex-end",
        }}>
          <div style={{
            opacity: primaryBtnT,
            transform: `translateY(${simplifyLerp(6, 0, primaryBtnT)}px)`,
            pointerEvents: primaryBtnT > 0.4 ? "auto" : "none",
          }}>
            <BtnPrimary onClick={next}>That feels doable</BtnPrimary>
          </div>
          <div style={{
            opacity: secondaryBtnT,
            transform: `translateY(${simplifyLerp(6, 0, secondaryBtnT)}px)`,
            pointerEvents: secondaryBtnT > 0.4 ? "auto" : "none",
          }}>
            <BtnSecondary onClick={onStillTooMuch || next}>Still too much</BtnSecondary>
          </div>
        </div>
      </div>
    </>
  );
}

const PAUSE_PROGRESS_OPTIONS = [
  { label: "Barely started", fillLevel: 0.15 },
  { label: "Started it", fillLevel: 0.35 },
  { label: "Got halfway", fillLevel: 0.55 },
];

function pauseProgressLiquidPath(cx, cy, r, fillLevel) {
  const level = cy + r - fillLevel * 2 * r;
  const left = cx - r - 1;
  const right = cx + r + 1;
  const bottom = cy + r + 2;
  let d = `M ${left} ${bottom} L ${right} ${bottom} L ${right} ${level}`;
  for (let x = right; x >= left; x -= 3) {
    const wy =
      level +
      Math.sin((x / 7) * Math.PI) * 0.7 +
      Math.sin((x / 3.5) * Math.PI) * 0.28;
    d += ` L ${x} ${wy}`;
  }
  d += " Z";
  return d;
}

function PauseProgressIcon({ fillLevel, selected, isDark, clipId }) {
  const size = 28;
  const cx = 14;
  const cy = 14;
  const r = 11;
  const ringColor = isDark ? "rgba(124,111,205,0.35)" : C.neutral200;
  const liquidColor = selected
    ? (isDark ? "#6FD0AC" : C.success500)
    : (isDark ? "rgba(111,208,172,0.38)" : "rgba(107,191,154,0.42)");
  const crestColor = selected
    ? (isDark ? "rgba(168,230,205,0.85)" : "rgba(255,255,255,0.55)")
    : (isDark ? "rgba(111,208,172,0.55)" : "rgba(107,191,154,0.55)");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden
      style={{
        flexShrink: 0,
        transform: selected ? "scale(1.1)" : "scale(1)",
        transformOrigin: "center center",
        transition: "transform 160ms ease",
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r} stroke={ringColor} strokeWidth="1.5" />
      <g clipPath={`url(#${clipId})`}>
        <path d={pauseProgressLiquidPath(cx, cy, r, fillLevel)} fill={liquidColor} />
        <path
          d={(() => {
            const level = cy + r - fillLevel * 2 * r;
            const left = cx - r;
            const right = cx + r;
            let crest = `M ${left} ${level}`;
            for (let x = left; x <= right; x += 3) {
              const wy =
                level +
                Math.sin((x / 7) * Math.PI) * 0.7 +
                Math.sin((x / 3.5) * Math.PI) * 0.28;
              crest += ` L ${x} ${wy}`;
            }
            return crest;
          })()}
          stroke={crestColor}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function PauseScreen({ onSaveAndPause, onComeBackLater, onResume }) {
  const isDark = useContext(IsDarkContext);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const pausePayload = () => ({ progress: selected || "", note: note.trim() });
  return (
    <>
      <Label>Pause</Label>
      <div style={{ ...T.heading, fontFamily: "'DM Serif Display', serif", color: "var(--n9)", marginBottom: 4 }}>Life happened.</div>
      <div style={{ ...T.small, color: "var(--n7)", marginBottom: 24 }}>{"That's okay. Where did you get to?"}</div>

      <div style={{ ...T.small, color: "var(--n7)", marginBottom: 12 }}>What did you manage?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {PAUSE_PROGRESS_OPTIONS.map(o => {
          const isSelected = selected === o.label;
          return (
            <button
              key={o.label}
              type="button"
              onClick={() => setSelected(o.label)}
              style={{
                padding: "14px 18px",
                borderRadius: BTN_RADIUS,
                border: pillBorder(isDark, false),
                background: pillBackground(isDark, false),
                color: "var(--n7)",
                fontFamily: "Inter",
                fontSize: 18,
                fontWeight: isSelected ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                textAlign: "left",
              }}
            >
              <PauseProgressIcon
                fillLevel={o.fillLevel}
                selected={isSelected}
                isDark={isDark}
                clipId={`pause-progress-${o.label.replace(/\s+/g, "-").toLowerCase()}`}
              />
              {o.label}
            </button>
          );
        })}
      </div>

      <div style={{ ...T.small, color: "var(--n7)", marginBottom: 8 }}>Next step? (optional)</div>
      <Card style={{ marginBottom: 28 }}>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Open the doc and read what I wrote"
          style={{
            border: "none", outline: "none", width: "100%",
            ...T.body, fontFamily: "Inter", background: "transparent",
            color: "var(--n9)",
          }}
        />
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={() => onSaveAndPause(pausePayload())}>Save & pause</BtnPrimary>
        <BtnSecondary onClick={() => onComeBackLater(pausePayload())}>I'll come back later</BtnSecondary>
        <button
          onClick={onResume}
          style={{
            width: "100%", height: BTN_H, borderRadius: BTN_RADIUS,
            background: "transparent", border: "none",
            cursor: "pointer",
            ...BTN_FONT, color: C.neutral500,
          }}
        >Resume</button>
      </div>
    </>
  );
}

function HistoryScreen({ history, onBack }) {
  const sorted = [...history].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  const grouped = sorted.reduce((acc, entry) => {
    const key = entry.taskId ?? entry.task;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});
  const taskOrder = [...new Set(sorted.map(e => e.taskId ?? e.task))];

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <>
      <Back onClick={onBack} />
      <Label>History</Label>
      <div style={{ ...T.heading, color: "var(--n9)", marginBottom: 20 }}>Steps you've taken</div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {history.length === 0 ? (
          <div style={{ ...T.small, color: "var(--n7)", textAlign: "center", padding: "32px 0" }}>
            No completed steps yet.
          </div>
        ) : taskOrder.map(taskName => (
          <div key={taskName} style={{ marginBottom: 24 }}>
            <div style={{ ...T.label, color: C.accent500, marginBottom: 10 }}>{taskName}</div>
            {grouped[taskName].map((entry, i) => (
              <div key={i} style={{ marginBottom: 12, paddingLeft: 4 }}>
                <div style={{ ...T.small, color: "var(--n9)", marginBottom: 4, lineHeight: 1.4 }}>{entry.step}</div>
                <div style={{ ...T.hint, fontSize: 12 }}>{formatDate(entry.completedAt)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function homeLerp(a, b, k) {
  return a + (b - a) * k;
}
function homeLerpCol(c1, c2, k) {
  return c1.map((v, i) => Math.round(homeLerp(v, c2[i], k)));
}

const HOME_PALETTES = {
  morning: {
    top: [255, 208, 188],
    horizon: [52, 78, 132],
    bottom: [92, 168, 148],
    serif: [42, 36, 56],
    muted: [110, 100, 130],
    accent: [86, 70, 175],
    cardBg: [70, 60, 110],
    cardAlpha: 0.12,
    starOpacity: 0,
  },
  afternoon: {
    top: [218, 232, 222],
    horizon: [168, 158, 205],
    bottom: [108, 92, 152],
    serif: [42, 38, 64],
    muted: [120, 110, 142],
    accent: [92, 75, 178],
    cardBg: [50, 38, 95],
    cardAlpha: 0.14,
    starOpacity: 0,
  },
  evening: {
    top: [16, 20, 46],
    horizon: [118, 72, 138],
    bottom: [8, 5, 22],
    serif: [237, 234, 228],
    muted: [160, 152, 188],
    accent: [180, 172, 219],
    cardBg: [180, 172, 219],
    cardAlpha: 0.14,
    starOpacity: 0.45,
  },
};

function homePaletteForHour(h) {
  const lerpPal = (a, b, k) => ({
    top: homeLerpCol(a.top, b.top, k),
    horizon: homeLerpCol(a.horizon, b.horizon, k),
    bottom: homeLerpCol(a.bottom, b.bottom, k),
    serif: homeLerpCol(a.serif, b.serif, k),
    muted: homeLerpCol(a.muted, b.muted, k),
    accent: homeLerpCol(a.accent, b.accent, k),
    cardBg: homeLerpCol(a.cardBg, b.cardBg, k),
    cardAlpha: homeLerp(a.cardAlpha, b.cardAlpha, k),
    starOpacity: homeLerp(a.starOpacity, b.starOpacity, k),
  });

  if (h >= 5 && h < 11) return HOME_PALETTES.morning;
  if (h >= 11 && h < 13) return lerpPal(HOME_PALETTES.morning, HOME_PALETTES.afternoon, (h - 11) / 2);
  if (h >= 13 && h < 17) return HOME_PALETTES.afternoon;
  if (h >= 17 && h < 19) return lerpPal(HOME_PALETTES.afternoon, HOME_PALETTES.evening, (h - 17) / 2);
  if (h >= 19 || h < 3) return HOME_PALETTES.evening;
  return lerpPal(HOME_PALETTES.evening, HOME_PALETTES.morning, (h - 3) / 2);
}

function homeFractionalHour(date = new Date()) {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

function homeGreeting(returning, reason) {
  if (reason === "exit") return { hint: "That's okay.", line1: "Welcome back.", line2: "What now?" };
  if (reason === "done") return { hint: "Well done.", line1: "Welcome back.", line2: "What now?" };
  if (returning) return { hint: null, line1: "Welcome back.", line2: "What now?" };
  return { hint: null, line1: "What would you like", line2: "to work on?" };
}

function HomeScreen({ onResume, onContinueSession, inProgressSession, tasks, setTasks, onHistory, reason }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const draftRef = useRef(null);
  const typingTimer = useRef(null);
  const paletteRef = useRef(homePaletteForHour(homeFractionalHour()));
  const [draft, setDraft] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [palette, setPalette] = useState(() => homePaletteForHour(homeFractionalHour()));

  const returning = tasks.length > 0 || !!inProgressSession;
  const greeting = homeGreeting(returning, reason);
  const canStart = tasks.length > 0;

  useEffect(() => {
    setSelectedIndex(i => (tasks.length === 0 ? 0 : Math.min(i, tasks.length - 1)));
  }, [tasks.length]);

  useEffect(() => {
    const tick = () => {
      const h = homeFractionalHour();
      const next = homePaletteForHour(h);
      paletteRef.current = next;
      setPalette(next);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const stars = [
      { xRatio: 0.24, yRatio: 0.16, size: 1.0, twinkle: 0.2, speed: 0.35 },
      { xRatio: 0.74, yRatio: 0.24, size: 0.75, twinkle: 2.1, speed: 0.5 },
    ];

    let raf;
    let W = 0;
    let H = 0;
    const startTime = performance.now();

    const resize = () => {
      W = container.clientWidth;
      H = container.clientHeight;
      canvas.width = Math.max(1, W * DPR);
      canvas.height = Math.max(1, H * DPR);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
    const mixStop = (c1, c2, k) => rgb(homeLerpCol(c1, c2, k));

    const draw = (now) => {
      if (W <= 0 || H <= 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const pal = paletteRef.current;
      const t = (now - startTime) / 1000;
      const driftAmp = isTyping ? 1 : 0.4;
      const drift = Math.sin(t * 0.15) * driftAmp * 0.006;
      const horizon = 0.62 + drift;
      const blend = 0.11;
      const core = blend / 3;

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, rgb(pal.top));
      grad.addColorStop(Math.max(0, horizon - blend * 1.6), mixStop(pal.top, pal.horizon, 0.18));
      grad.addColorStop(Math.max(0, horizon - blend * 0.95), mixStop(pal.top, pal.horizon, 0.42));
      grad.addColorStop(Math.max(0, horizon - core), mixStop(pal.top, pal.horizon, 0.72));
      grad.addColorStop(horizon, mixStop(pal.top, pal.horizon, 0.88));
      grad.addColorStop(Math.min(1, horizon + core), mixStop(pal.horizon, pal.bottom, 0.16));
      grad.addColorStop(Math.min(1, horizon + blend * 0.95), mixStop(pal.horizon, pal.bottom, 0.48));
      grad.addColorStop(Math.min(1, horizon + blend * 1.6), mixStop(pal.horizon, pal.bottom, 0.74));
      grad.addColorStop(1, rgb(pal.bottom));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      if (pal.starOpacity > 0) {
        for (const s of stars) {
          const tw = 0.45 + Math.sin(t * s.speed + s.twinkle) * 0.35;
          const x = s.xRatio * W;
          const y = s.yRatio * H;
          ctx.beginPath();
          ctx.arc(x, y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 248, 238], pal.starOpacity * (0.35 + tw * 0.45));
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(container);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [isTyping]);

  useEffect(() => {
    paletteRef.current = palette;
  }, [palette]);

  const onDraftInput = (value) => {
    setDraft(value);
    setIsTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsTyping(false), 1500);
  };

  const addTask = () => {
    const text = draft.trim();
    if (!text) return;
    setTasks(p => [...p, text]);
    setDraft("");
    requestAnimationFrame(() => draftRef.current?.focus());
  };

  const removeTask = (i) => {
    setTasks(p => p.filter((_, idx) => idx !== i));
    setSelectedIndex(prev => {
      if (i < prev) return prev - 1;
      if (i === prev) return Math.max(0, prev - 1);
      return prev;
    });
  };

  const handleReady = () => {
    const picked = tasks[selectedIndex];
    if (!picked) return;
    onResume(picked);
  };

  const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

  return (
    <div
      ref={containerRef}
      className="home-landscape"
      style={{
        position: "relative",
        flex: 1,
        minHeight: "100dvh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%" }}
      />

      <div style={{
        position: "absolute",
        inset: 0,
        padding: "26px 28px max(32px, env(safe-area-inset-bottom))",
        display: "flex",
        flexDirection: "column",
        zIndex: 1,
        boxSizing: "border-box",
      }}>
        <div style={{
          flex: "0 0 52%",
          paddingTop: 30,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}>
          {greeting.hint ? (
            <div
              className="home-rise"
              style={{
                margin: "0 0 8px",
                fontSize: 14,
                fontWeight: 500,
                color: rgba(palette.muted, 0.85),
                opacity: 0,
                animation: "homeRise 800ms 120ms cubic-bezier(.3,.9,.4,1) forwards",
              }}
            >
              {greeting.hint}
            </div>
          ) : null}
          <h1 style={{
            margin: greeting.hint ? "0 0 0" : "16px 0 0",
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontWeight: 400,
            fontSize: 38,
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            color: rgb(palette.serif),
          }}>
            <span className="home-rise home-line1">{greeting.line1}</span>
            <br />
            <span className="home-rise home-line2">{greeting.line2}</span>
          </h1>

          <div style={{
            marginTop: 4,
            marginBottom: 28,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: tasks.length >= 5 ? 168 : "none",
            overflowY: tasks.length >= 5 ? "auto" : "visible",
          }}>
            {tasks.map((t, i) => (
              <div
                key={`${i}-${t}`}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <button
                  type="button"
                  aria-label={`Select task ${i + 1}`}
                  onClick={() => setSelectedIndex(i)}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    flexShrink: 0,
                    padding: 0,
                    border: "none",
                    cursor: "pointer",
                    background: selectedIndex === i
                      ? rgb(palette.accent)
                      : rgba(palette.serif, 0.28),
                  }}
                />
                <input
                  type="text"
                  readOnly
                  value={t}
                  onClick={() => setSelectedIndex(i)}
                  className="home-task-input"
                  style={{
                    color: rgb(palette.serif),
                    borderColor: rgba(palette.serif, selectedIndex === i ? 0.42 : 0.18),
                    opacity: selectedIndex === i ? 1 : 0.82,
                    cursor: "pointer",
                  }}
                />
                <button
                  type="button"
                  aria-label={`Remove ${t}`}
                  onClick={() => removeTask(i)}
                  style={{
                    background: "none",
                    border: "none",
                    color: rgba(palette.muted, 0.75),
                    fontSize: 15,
                    lineHeight: 1,
                    cursor: "pointer",
                    padding: "4px 2px",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                flexShrink: 0,
                background: rgba(palette.serif, 0.18),
              }} />
              <input
                ref={draftRef}
                type="text"
                value={draft}
                onChange={(e) => onDraftInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder={tasks.length === 0 ? "Anything on your mind" : "Another thing…"}
                className="home-task-input home-rise home-input"
                style={{
                  color: rgb(palette.serif),
                  borderColor: rgba(palette.serif, 0.25),
                }}
              />
              {draft.trim() ? (
                <button
                  type="button"
                  className="home-add-btn"
                  onClick={addTask}
                  style={{ color: rgb(palette.accent) }}
                >
                  Add
                </button>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            className="home-primary-btn home-rise home-ready"
            disabled={!canStart}
            onClick={handleReady}
            style={{
              opacity: canStart ? 1 : 0.45,
              cursor: canStart ? "pointer" : "default",
            }}
          >
            I'm ready
          </button>
        </div>

        <div style={{ flex: "0 0 14%" }} aria-hidden="true" />

        <div style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          paddingTop: 18,
        }}>
          {inProgressSession ? (
            <div
              className="home-resume-card home-rise home-resume"
              style={{
                background: rgba(palette.cardBg, palette.cardAlpha),
                borderColor: rgba(palette.cardBg, palette.cardAlpha + 0.1),
              }}
            >
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: rgba(palette.serif, 0.65),
              }}>
                Where you left off
              </div>
              <div style={{
                margin: "8px 0 14px",
                fontSize: 15.5,
                fontWeight: 500,
                lineHeight: 1.35,
                color: rgb(palette.serif),
              }}>
                {inProgressSession.step?.text || "Your step is loading…"}
              </div>
              <button
                type="button"
                className="home-resume-btn"
                onClick={onContinueSession}
                style={{ color: rgb(palette.accent) }}
              >
                Continue ›
              </button>
            </div>
          ) : null}

          <button
            type="button"
            className="home-history-link home-rise home-history"
            onClick={onHistory}
            style={{ color: rgba(palette.accent, 0.75) }}
          >
            History
          </button>
        </div>
      </div>
    </div>
  );
}

function doneShellBackground(isDark) {
  return isDark
    ? "radial-gradient(ellipse at 50% 20%, #1A2D24 0%, #1A1828 60%)"
    : "radial-gradient(ellipse at 50% 20%, #E8FFF4 0%, #F0EEF5 60%)";
}

function sessionCompleteShellBackground() {
  return "radial-gradient(ellipse at 50% 18%, #1A2D24 0%, #141022 45%, #0F0D1E 100%)";
}

const SESSION_COMPLETE_PURPLE = [124, 111, 205];
const SESSION_COMPLETE_MINT = [111, 208, 172];
const SESSION_COMPLETE_HALO_R = GATHER_CIRCLE_R + 52;
const SESSION_COMPLETE_EYEBROW = "#9D93D8";
const SESSION_COMPLETE_HEADLINE = "#EDEAE4";
const SESSION_COMPLETE_TIMESTAMP = "#6FD0AC";
const SESSION_COMPLETE_CLOSE_BORDER = "#2F2C42";
const SESSION_COMPLETE_CLOSE_COLOR = "#B4ACDB";

const lineFor = (n) => {
  if (n <= 1) return "You showed up.";
  if (n === 2) return "You showed up. Twice.";
  if (n <= 5) return "You kept showing up.";
  return "Quietly remarkable.";
};

function sessionCompleteLabel(text) {
  if (!text) return "";
  return text.length <= 30 ? text : `${text.slice(0, 29)}…`;
}

function sessionCompleteCaptionStyle(text) {
  const len = (text || "").length;
  const fontSize =
    len <= 30 ? 19 :
    len <= 55 ? 17 :
    len <= 85 ? 15 :
    len <= 120 ? 13.5 : 12;
  return { fontSize, lineHeight: 1.4 };
}

function SessionCompleteScreen({ stepCount, sessionSteps, fallbackSteps, onClose }) {
  const canvasRef = useRef(null);
  const captionOverlayRef = useRef(null);
  const stepCountRef = useRef(stepCount);
  const sessionStepsRef = useRef(sessionSteps);
  const fallbackStepsRef = useRef(fallbackSteps);
  stepCountRef.current = stepCount;
  sessionStepsRef.current = sessionSteps;
  fallbackStepsRef.current = fallbackSteps;

  const startTime = useRef(performance.now());
  const reduceMotion = useRef(false);
  const schedule = useRef(null);
  const [phaseTail, setPhaseTail] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(0);
  const [contentOpacity, setContentOpacity] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const reduced = typeof window !== "undefined"
      && window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reduceMotion.current = reduced;
    setPrefersReducedMotion(reduced);
    if (reduced) {
      setBgOpacity(1);
      setContentOpacity(1);
      return;
    }
    const bgFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setBgOpacity(1));
    });
    const contentTimer = setTimeout(() => setContentOpacity(1), 320);
    return () => {
      cancelAnimationFrame(bgFrame);
      clearTimeout(contentTimer);
    };
  }, []);

  useEffect(() => {
    startTime.current = performance.now();
    setPhaseTail(false);

    const labels = sessionSteps.length
      ? sessionSteps.slice(0, stepCount)
      : fallbackSteps.slice(-stepCount);

    const events = [];
    const fillTargets = [{ t: 0, value: 0 }];
    let t = 1.4;
    let tailAt = t;

    if (stepCount <= 1) {
      fillTargets.push({ t: 1.1, value: 1 });
      tailAt = 1.4;
      events.push({ kind: "tail", t: tailAt });
    } else {
      for (let i = 0; i < stepCount; i++) {
        events.push({ kind: "stepIn", t, idx: i });
        fillTargets.push({ t: t + 1.0, value: fillTargets[fillTargets.length - 1].value });
        fillTargets.push({ t: t + 1.8, value: (i + 1) / stepCount });
        t += 2.3;
      }
      tailAt = t;
      events.push({ kind: "tail", t });
    }

    schedule.current = { events, fillTargets, tailAt, labels };

    if (reduceMotion.current) {
      setPhaseTail(true);
    }
  }, [stepCount, sessionSteps, fallbackSteps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const W = GATHER_CANVAS_W;
    const H = GATHER_CANVAS_H;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    let raf;
    const cx = GATHER_CIRCLE_CX;
    const cy = GATHER_CIRCLE_CY;
    const R = GATHER_CIRCLE_R;
    const firedEvents = new Set();
    let displayedLevel = 0;
    const ripples = [];
    let nextRippleAt = Infinity;
    const RIPPLE_LIFE = 1.4;

    const waveY = (x, surface, amp, t, dir, speed) =>
      surface +
      Math.sin((x / 34) * dir + t * speed) * amp +
      Math.sin((x / 13) * dir - t * speed * 1.4) * amp * 0.35;

    const lerp = (a, b, k) => a + (b - a) * k;
    const mixCol = (c1, c2, k) => c1.map((v, i) => Math.round(lerp(v, c2[i], k)));

    const sampleLevel = (time, keyframes) => {
      if (!keyframes || keyframes.length === 0) return 0;
      if (time <= keyframes[0].t) return keyframes[0].value;
      for (let i = 1; i < keyframes.length; i++) {
        if (time <= keyframes[i].t) {
          const a = keyframes[i - 1];
          const b = keyframes[i];
          const k = (time - a.t) / Math.max(0.0001, b.t - a.t);
          const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          return lerp(a.value, b.value, ease);
        }
      }
      return keyframes[keyframes.length - 1].value;
    };

    const resolveLabels = () => {
      if (schedule.current?.labels?.length) return schedule.current.labels;
      const steps = sessionStepsRef.current;
      if (steps.length) return steps.slice(0, stepCountRef.current);
      return fallbackStepsRef.current.slice(-stepCountRef.current);
    };

    const updateCaptionOverlay = (text, alpha, color, vesselAlpha) => {
      const el = captionOverlayRef.current;
      if (!el) return;
      if (!text || alpha <= 0.01 || vesselAlpha <= 0) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        return;
      }
      // TODO: replace with past-tense completion form
      el.textContent = text;
      const { fontSize, lineHeight } = sessionCompleteCaptionStyle(text);
      el.style.fontSize = `${fontSize}px`;
      el.style.lineHeight = String(lineHeight);
      el.style.opacity = String(alpha * vesselAlpha);
      el.style.visibility = "visible";
      if (color) {
        el.style.color = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      }
    };

    const draw = (now) => {
      const time = (now - startTime.current) / 1000;
      ctx.clearRect(0, 0, W, H);

      if (schedule.current) {
        for (const e of schedule.current.events) {
          const key = `${e.kind}-${e.idx ?? "x"}-${e.t}`;
          if (!firedEvents.has(key) && time >= e.t) {
            firedEvents.add(key);
            if (e.kind === "tail") setPhaseTail(true);
          }
        }
      }

      let activeCaptionIdx = -1;
      let captionAlpha = 0;
      let captionStepColor = null;
      const labels = resolveLabels();

      if (stepCountRef.current <= 1 && labels[0]) {
        const holdStart = 0.4;
        const holdEnd = schedule.current?.tailAt ?? 1.4;
        const localT = time - holdStart;
        if (localT >= 0 && time < holdEnd) {
          activeCaptionIdx = 0;
          const inA = Math.min(1, Math.max(0, localT / 0.4));
          const outA = Math.min(1, Math.max(0, (holdEnd - time) / 0.4));
          captionAlpha = Math.min(inA, outA);
          captionStepColor = mixCol(SESSION_COMPLETE_PURPLE, SESSION_COMPLETE_MINT, 1);
        }
      } else if (schedule.current) {
        for (const e of schedule.current.events) {
          if (e.kind !== "stepIn") continue;
          const localT = time - e.t;
          if (localT < 0 || localT > 2.3) continue;
          const inA = Math.min(1, Math.max(0, localT / 0.4));
          const outA = Math.min(1, Math.max(0, (2.3 - localT) / 0.4));
          const a = Math.min(inA, outA);
          if (a > captionAlpha) {
            captionAlpha = a;
            activeCaptionIdx = e.idx;
            const targetLevel = (e.idx + 1) / stepCountRef.current;
            captionStepColor = mixCol(SESSION_COMPLETE_PURPLE, SESSION_COMPLETE_MINT, Math.min(1, targetLevel * 1.1));
          }
        }
      }

      const captionLabel = activeCaptionIdx >= 0 ? labels[activeCaptionIdx] : "";

      const vesselK = reduceMotion.current
        ? 1
        : Math.min(1, Math.max(0, (time - 0.2) / 0.9));
      const vesselEase = 1 - Math.pow(1 - vesselK, 3);
      const vesselScale = 0.92 + 0.08 * vesselEase;
      const vesselAlpha = vesselEase;

      const targetLevel = reduceMotion.current
        ? 1
        : sampleLevel(time, schedule.current?.fillTargets);
      displayedLevel = lerp(displayedLevel, targetLevel, 0.12);
      const level = displayedLevel;

      const haloT = time * 0.15;
      const haloCx = cx + Math.sin(haloT) * 18;
      const haloCy = cy + Math.cos(haloT * 0.7) * 12;
      const halo = ctx.createRadialGradient(
        haloCx,
        haloCy,
        0,
        cx,
        cy,
        SESSION_COMPLETE_HALO_R
      );
      const haloColor = mixCol(SESSION_COMPLETE_PURPLE, SESSION_COMPLETE_MINT, level);
      const haloCenterAlpha = Math.min(0.18, 0.10 + level * 0.08);
      halo.addColorStop(0, `rgba(${haloColor[0]},${haloColor[1]},${haloColor[2]},${haloCenterAlpha})`);
      halo.addColorStop(0.35, `rgba(${haloColor[0]},${haloColor[1]},${haloColor[2]},${haloCenterAlpha * 0.45})`);
      halo.addColorStop(0.65, `rgba(${haloColor[0]},${haloColor[1]},${haloColor[2]},${haloCenterAlpha * 0.12})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, W, H);

      if (vesselAlpha > 0) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(vesselScale, vesselScale);
        ctx.globalAlpha = vesselAlpha;

        const rimCol = mixCol(SESSION_COMPLETE_PURPLE, SESSION_COMPLETE_MINT, Math.min(1, level + 0.2));

        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rimCol[0]},${rimCol[1]},${rimCol[2]},${0.4 + level * 0.45})`;
        ctx.lineWidth = 1.8 + level * 0.6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, R - 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${SESSION_COMPLETE_PURPLE[0]},${SESSION_COMPLETE_PURPLE[1]},${SESSION_COMPLETE_PURPLE[2]},${0.05 + (1 - level) * 0.04})`;
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R - 1, 0, Math.PI * 2);
        ctx.clip();

        const waterCol = mixCol(SESSION_COMPLETE_PURPLE, SESSION_COMPLETE_MINT, Math.min(1, level * 1.2));
        const baseAmp = 4.5;
        const tailAt = schedule.current?.tailAt ?? Infinity;
        const atRest = level >= 0.98 && time >= tailAt;
        if (atRest && nextRippleAt === Infinity) {
          nextRippleAt = time + 5 + Math.random() * 2;
        }
        const fillCalm = !atRest && level >= 0.99
          ? Math.max(0.15, 1 - (time - tailAt))
          : 1;
        const waveAmp = atRest
          ? 1.5
          : baseAmp * (1 - level * 0.4) * fillCalm;
        const speedMul = atRest ? 0.4 : 1;
        const surface = level <= 0
          ? R + 4
          : -R - waveAmp - 2 + (1 - level) * (R * 2 + waveAmp * 2 + 8);

        const lightMint = [
          Math.min(255, waterCol[0] + 22),
          Math.min(255, waterCol[1] + 28),
          Math.min(255, waterCol[2] + 20),
        ];
        const deepMint = [
          Math.max(0, waterCol[0] - 18),
          Math.max(0, waterCol[1] - 32),
          Math.max(0, waterCol[2] - 16),
        ];
        const depthGrad = ctx.createLinearGradient(0, surface, 0, R);
        depthGrad.addColorStop(0, `rgba(${lightMint[0]},${lightMint[1]},${lightMint[2]},${0.22 * level})`);
        depthGrad.addColorStop(1, `rgba(${deepMint[0]},${deepMint[1]},${deepMint[2]},${0.28 * level})`);

        ctx.beginPath();
        ctx.moveTo(-R, R + 4);
        for (let x = -R; x <= R; x += 4) {
          ctx.lineTo(x, waveY(x, surface, waveAmp, time, 1, 2.4 * speedMul));
        }
        ctx.lineTo(R, R + 4);
        ctx.closePath();
        ctx.fillStyle = depthGrad;
        ctx.fill();

        for (let layer = 0; layer < 2; layer++) {
          const dir = layer === 0 ? 1 : -1;
          const speed = (layer === 0 ? 2.4 : 1.8) * speedMul;
          ctx.beginPath();
          ctx.moveTo(-R, R + 4);
          for (let x = -R; x <= R; x += 4) {
            ctx.lineTo(x, waveY(x, surface, waveAmp, time, dir, speed));
          }
          ctx.lineTo(R, R + 4);
          ctx.closePath();
          const a = layer === 0 ? 0.32 : 0.18;
          ctx.fillStyle = `rgba(${waterCol[0]},${waterCol[1]},${waterCol[2]},${a + level * 0.1})`;
          ctx.fill();
        }

        if (level > 0.02) {
          ctx.beginPath();
          for (let x = -R; x <= R; x += 4) {
            const wy = waveY(x, surface, waveAmp, time, 1, 2.4 * speedMul);
            x === -R ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
          }
          const meniscusA = atRest ? 0.18 : 0.6 + level * 0.3;
          ctx.strokeStyle = `rgba(${waterCol[0]},${waterCol[1]},${waterCol[2]},${meniscusA})`;
          ctx.lineWidth = atRest ? 1 : 1.8;
          ctx.stroke();
        }

        if (atRest && !reduceMotion.current && level > 0.5) {
          if (ripples.length === 0 && time >= nextRippleAt) {
            const rx = (Math.random() * 2 - 1) * R * 0.8;
            ripples.push({
              x: rx,
              y: waveY(rx, surface, waveAmp, time, 1, 2.4 * speedMul),
              born: time,
            });
          }
          const brightMint = [
            Math.min(255, waterCol[0] + 18),
            Math.min(255, waterCol[1] + 30),
            Math.min(255, waterCol[2] + 22),
          ];
          for (let i = ripples.length - 1; i >= 0; i--) {
            const rip = ripples[i];
            const age = time - rip.born;
            const k = age / RIPPLE_LIFE;
            if (k >= 1) {
              ripples.splice(i, 1);
              nextRippleAt = time + 5 + Math.random() * 2;
              continue;
            }
            const radius = 2 + 28 * k;
            const alpha = 0.3 * (1 - k);
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${brightMint[0]},${brightMint[1]},${brightMint[2]},${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        ctx.restore();
        ctx.restore();
      }

      updateCaptionOverlay(captionLabel, captionAlpha, captionStepColor, vesselAlpha);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [stepCount, sessionSteps, fallbackSteps]);

  const eyebrowColor = SESSION_COMPLETE_EYEBROW;
  const headlineColor = SESSION_COMPLETE_HEADLINE;
  const timestampColor = SESSION_COMPLETE_TIMESTAMP;
  const closeBorder = SESSION_COMPLETE_CLOSE_BORDER;
  const closeColor = SESSION_COMPLETE_CLOSE_COLOR;

  return (
    <>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: sessionCompleteShellBackground(),
          opacity: bgOpacity,
          transition: prefersReducedMotion
            ? "none"
            : "opacity 900ms cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <style>{`
@keyframes sessionCompleteRise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .session-complete-rise { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`}</style>
      <div style={{
        position: "relative",
        zIndex: 1,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        width: "100%",
        opacity: contentOpacity,
        transition: prefersReducedMotion
          ? "none"
          : "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div
          className="session-complete-rise"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: eyebrowColor,
            opacity: 0,
            animation: "sessionCompleteRise 700ms 100ms cubic-bezier(.3,.9,.4,1) forwards",
          }}
        >
          Session complete
        </div>

        <div style={{ flex: 1, minHeight: 0 }} />
        <div style={{ width: "100%", flexShrink: 0, display: "flex", justifyContent: "center" }}>
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: GATHER_CANVAS_W,
            aspectRatio: `${GATHER_CANVAS_W} / ${GATHER_CANVAS_H}`,
          }}>
            <canvas
              ref={canvasRef}
              style={{ display: "block", width: "100%", height: "100%", background: "transparent" }}
            />
            <div
              ref={captionOverlayRef}
              style={{
                position: "absolute",
                left: "50%",
                top: `${(GATHER_CIRCLE_CY / GATHER_CANVAS_H) * 100}%`,
                transform: "translate(-50%, -50%)",
                width: GATHER_TEXT_WIDTH,
                maxHeight: GATHER_TEXT_MAX_H,
                overflow: "hidden",
                zIndex: 2,
                margin: 0,
                fontFamily: "'DM Serif Display', serif",
                fontSize: 19,
                lineHeight: 1.4,
                fontWeight: 400,
                textAlign: "center",
                letterSpacing: "-0.005em",
                opacity: 0,
                visibility: "hidden",
                pointerEvents: "none",
                color: SESSION_COMPLETE_HEADLINE,
                textShadow: "0 1px 14px rgba(15, 13, 30, 0.85), 0 0 24px rgba(15, 13, 30, 0.5)",
                overflowWrap: "break-word",
              }}
            />
          </div>
        </div>

        <div style={{
          marginTop: 8,
          minHeight: 160,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          flexShrink: 0,
        }}>
          {phaseTail && (
            <>
              <h1
                className="session-complete-rise"
                style={{
                  margin: "28px 0 0",
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 40,
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                  color: headlineColor,
                  fontWeight: 400,
                  opacity: 0,
                  animation: "sessionCompleteRise 700ms 200ms cubic-bezier(.3,.9,.4,1) forwards",
                }}
              >
                {lineFor(stepCount)}
              </h1>
              <p
                className="session-complete-rise"
                style={{
                  margin: "14px 0 0",
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: timestampColor,
                  letterSpacing: "0.04em",
                  opacity: 0,
                  animation: "sessionCompleteRise 700ms 700ms cubic-bezier(.3,.9,.4,1) forwards",
                }}
              >
                Today · {stepCount} step{stepCount === 1 ? "" : "s"}
              </p>
            </>
          )}
        </div>

        <div style={{ flex: 1, minHeight: 0 }} />

        {phaseTail && (
          <button
            type="button"
            className="session-complete-rise"
            onClick={onClose}
            style={{
              marginTop: "auto",
              width: "100%",
              background: "transparent",
              border: `1.5px solid ${closeBorder}`,
              borderRadius: 999,
              padding: "14px 16px",
              color: closeColor,
              fontFamily: "Inter",
              fontSize: 15.5,
              fontWeight: 600,
              cursor: "pointer",
              opacity: 0,
              animation: "sessionCompleteRise 700ms 1200ms cubic-bezier(.3,.9,.4,1) forwards",
            }}
          >
            Close
          </button>
        )}
      </div>
    </>
  );
}

function DoneScreen({ next, onMore, onDoneForNow, isLast }) {
  const isDark = useContext(IsDarkContext);
  const [flashOpacity, setFlashOpacity] = useState(0);

  useEffect(() => {
    let hideTimer;
    const showTimer = setTimeout(() => {
      setFlashOpacity(0.15);
      hideTimer = setTimeout(() => setFlashOpacity(0), 300);
    }, 0);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "#4CAF88", opacity: flashOpacity,
        transition: "opacity 300ms ease-in-out",
      }} />
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center" }}>
        <div style={{
          width: 110, height: 110, borderRadius: "50%",
          background: isDark ? "#1A2D24" : C.neutral50,
          border: `2px solid ${C.success100}`,
          boxShadow: "0 8px 28px rgba(107,191,154,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8,
        }}>
          {ICONS.checkAnimated(C.success500)}
        </div>
        <div style={{ ...T.heading, fontFamily: "'DM Serif Display', serif", color: "var(--n9)" }}>Small step taken.</div>
        <div style={{ ...T.subtitle, color: "var(--n7)" }}>That's real progress.</div>
        <div style={{ ...T.hint, color: C.neutral300, marginTop: 4, lineHeight: 1.4 }}>You started. That's the hardest part.</div>
        {isLast && (
          <div style={{
            background: C.success100, borderRadius: 16, padding: "14px 20px",
            marginTop: 12, width: "100%", boxSizing: "border-box",
          }}>
            <div style={{ ...T.small, color: C.success500, fontWeight: 600, textAlign: "center" }}>
              Wrote 3 bullets about portfolio project
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={onMore}>{isLast ? "See what's next" : "One more thing"}</BtnPrimary>
        <BtnSecondary onClick={onDoneForNow ?? next}>I'm done now</BtnSecondary>
      </div>
      </div>
    </>
  );
}


function PausedConfirmScreen({ next }) {
  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: C.accent100,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="6" y="5" width="5" height="18" rx="2" fill={C.accent500}/>
            <rect x="17" y="5" width="5" height="18" rx="2" fill={C.accent500}/>
          </svg>
        </div>
        <div style={{ ...T.heading, color: "var(--n9)" }}>Saved for later.</div>
        <div style={{ ...T.small, color: "var(--n7)", lineHeight: 1.7, maxWidth: 260 }}>
          {"Come back whenever you're ready. It'll be right here."}
        </div>
      </div>
      <BtnPrimary onClick={next}>Done for now</BtnPrimary>
    </>
  );
}

function SwitchTaskScreen({ tasks, onPick, onAdd, onBack }) {
  const isDark = useContext(IsDarkContext);
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState("");
  const [newTasks, setNewTasks] = useState([]);
  const inputRef = useRef(null);

  const addToList = () => {
    if (input.trim()) {
      setNewTasks(p => [...p, input.trim()]);
      setInput("");
    }
  };

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  return (
    <>
      <Back onClick={onBack} />
      <Label>Switch Task</Label>
      <div style={{ ...T.heading, color: "var(--n9)", marginBottom: 8 }}>What would you like to work on?</div>
      <div style={{ ...T.small, color: "var(--n7)", marginBottom: 28 }}>Pick from your list or add something new.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {tasks.map((t, i) => (
          <button key={i} onClick={() => onPick(t)} style={{
            padding: "16px 18px", borderRadius: CARD_RADIUS,
            border: pillBorder(isDark, false), background: pillBackground(isDark, false),
            display: "flex", alignItems: "center", gap: 12,
            cursor: "pointer", fontFamily: "Inter", textAlign: "left",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent300, flexShrink: 0 }} />
            <span style={{ ...T.small, color: pillLabelColor(isDark, false, "var(--n9)") }}>{t}</span>
          </button>
        ))}

        {/* Newly added tasks */}
        {newTasks.map((t, i) => (
          <div key={"new-" + i} style={{
            padding: "16px 18px", borderRadius: CARD_RADIUS,
            border: `1px solid ${C.accent200}`, background: C.accent100,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent500, flexShrink: 0 }} />
            <span style={{ ...T.small, color: C.accent700 }}>{t}</span>
          </div>
        ))}

        {/* Add something new — expands inline */}
        {!adding ? (
          <button onClick={() => setAdding(true)} style={{
            padding: "16px 18px", borderRadius: CARD_RADIUS,
            border: `1.5px dashed ${C.neutral200}`, background: "transparent",
            display: "flex", alignItems: "center", gap: 12,
            cursor: "pointer", fontFamily: "Inter",
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", background: C.accent100,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.accent500, fontSize: 18, lineHeight: 1, flexShrink: 0,
            }}>+</div>
            <span style={{ ...T.small, color: C.neutral500 }}>Add something new</span>
          </button>
        ) : (
          <div style={{
            padding: "14px 18px", borderRadius: CARD_RADIUS,
            border: `1.5px solid ${C.accent500}`, background: pillBackground(isDark, false),
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent300, flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addToList()}
              placeholder="What do you want to work on?"
              style={{
                border: "none", outline: "none", flex: 1,
                ...T.small, color: "var(--n9)",
                background: "transparent", fontFamily: "Inter",
              }}
            />
            {input.trim() && (
              <button onClick={addToList} style={{
                background: C.accent500, color: C.neutral50, border: "none",
                borderRadius: 8, padding: "6px 12px", fontSize: 13,
                fontWeight: 600, cursor: "pointer", fontFamily: "Inter", flexShrink: 0,
              }}>Add</button>
            )}
          </div>
        )}
      </div>

      {newTasks.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <BtnPrimary onClick={() => onAdd(newTasks[0])}>
            {newTasks.length === 1 ? `Start "${newTasks[0].slice(0, 20)}${newTasks[0].length > 20 ? "…" : ""}"` : "Let's go"}
          </BtnPrimary>
        </div>
      )}
    </>
  );
}

function ReturnPausedScreen({ next, onFresh, onPickTask, step, task, note, pauseProgress, tasks }) {
  const isDark = useContext(IsDarkContext);
  const chipTasks = (tasks || []).slice(0, 3);
  const chipLabel = (name) => {
    const max = 22;
    return name.length > max ? `${name.slice(0, max)}…` : name;
  };

  return (
    <>
      <Label color={C.accent500}>Good Morning</Label>
      <div style={{ ...T.heading, color: "var(--n9)", marginBottom: 8 }}>Welcome back</div>
      <div style={{ ...T.hint, marginBottom: 28 }}>You were in the middle of something.</div>

      <Card style={{ background: isDark ? "#2A2445" : C.accent100, marginBottom: 24, borderRadius: 20 }}>
        <div style={{ ...T.label, color: C.accent500, marginBottom: 6 }}>You were here</div>
        <div style={{ ...T.small, color: isDark ? "var(--n9)" : C.accent700, marginBottom: 4 }}>{task || "Your task"}</div>
        {pauseProgress ? (
          <div style={{ ...T.hint, color: C.accent500, marginBottom: 8 }}>{pauseProgress}</div>
        ) : null}
        <div style={{ ...T.subtitle, color: "var(--n9)", marginBottom: note ? 12 : 16, fontWeight: 700 }}>{step?.text || "Pick one bullet and expand it"}</div>
        {note ? (
          <div style={{ ...T.small, color: "var(--n7)", marginBottom: 16, lineHeight: 1.5, fontStyle: "italic" }}>{note}</div>
        ) : null}
        <BtnPrimary onClick={next}>Continue where you left off</BtnPrimary>
      </Card>

      <div style={{ ...T.label, color: C.neutral300, textAlign: "center", marginBottom: 16 }}>Or start something new</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {chipTasks.map(t => (
          <button
            key={t}
            title={t}
            onClick={() => onPickTask(t)}
            style={{
              padding: "10px 18px", borderRadius: BTN_RADIUS,
              border: pillBorder(isDark, false), background: pillBackground(isDark, false),
              color: pillTextColor(isDark, false), ...BTN_FONT, fontSize: 16,
              cursor: "pointer", fontFamily: "Inter",
            }}
          >{chipLabel(t)}</button>
        ))}
        <button onClick={onFresh} style={{
          padding: "10px 18px", borderRadius: BTN_RADIUS,
          border: pillBorder(isDark, false), background: pillBackground(isDark, false),
          color: pillTextColor(isDark, false), ...BTN_FONT, fontSize: 16,
          cursor: "pointer", fontFamily: "Inter",
        }}>+ Add</button>
      </div>
    </>
  );
}

function ReturnShortScreen({ next, onExit }) {
  const isDark = useContext(IsDarkContext);
  return (
    <>
      <Label color={C.accent500}>Good Morning</Label>
      <div style={{ ...T.heading, color: "var(--n9)", marginBottom: 8 }}>Welcome back</div>
      <div style={{ ...T.subtitle, color: "var(--n7)", marginBottom: 24, lineHeight: 1.5 }}>
        {"You finished everything on your list. What's next?"}
      </div>
      {/* Streak */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, alignItems: "center" }}>
        {[1,2,3,4,5].map(d => (
          <div key={d} style={{
            flex: 1, height: 6, borderRadius: 6,
            background: d <= 3 ? C.accent500 : C.neutral200,
          }} />
        ))}
        <div style={{ ...T.hint, fontSize: 12, marginLeft: 6, whiteSpace: "nowrap" }}>3 days showing up</div>
      </div>
      <Card style={{ background: isDark ? "#1A2D24" : C.success100, borderRadius: 16, marginBottom: 32 }}>
        <div style={{ ...T.label, color: C.success500, marginBottom: 6 }}>Earlier today</div>
        <div style={{ ...T.subtitle, color: "var(--n9)", fontWeight: 700, marginBottom: 4 }}>Finished everything on your list</div>
        <div style={{ ...T.hint, color: "var(--n7)" }}>3 things done</div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={next}>What's next?</BtnPrimary>
        <BtnSecondary onClick={onExit}>{"I'm good for now"}</BtnSecondary>
      </div>
    </>
  );
}

function ReturnLongScreen({ next }) {
  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        {/* Soft seedling/spark illustration */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ marginBottom: 32 }}>
          <circle cx="40" cy="40" r="36" fill={C.accent100}/>
          {/* stem */}
          <path d="M40 58V38" stroke={C.accent500} strokeWidth="2" strokeLinecap="round"/>
          {/* left leaf */}
          <path d="M40 44 C34 40 28 42 28 36 C34 36 40 40 40 44Z" fill={C.accent300}/>
          {/* right leaf */}
          <path d="M40 50 C46 46 52 48 52 42 C46 42 40 46 40 50Z" fill={C.accent500}/>
          {/* sparkles */}
          <circle cx="28" cy="28" r="2" fill={C.accent300}/>
          <circle cx="52" cy="24" r="1.5" fill={C.accent200}/>
          <circle cx="56" cy="36" r="1" fill={C.accent300}/>
          <circle cx="24" cy="40" r="1" fill={C.accent200}/>
        </svg>

        <div style={{ ...T.heading, fontFamily: "'DM Serif Display', serif", color: "var(--n9)", marginBottom: 16 }}>
          {"It's been a while."}
        </div>
        <div style={{ ...T.subtitle, color: "var(--n7)", lineHeight: 1.8, marginBottom: 12 }}>
          No pressure. Life gets busy.
        </div>
        <div style={{ ...T.subtitle, color: "var(--n7)", lineHeight: 1.8, marginBottom: 48 }}>
          {"What's weighing on you today?"}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={next}>{"Let's go"}</BtnPrimary>
        <BtnSecondary onClick={next}>{"I'm good for now"}</BtnSecondary>
      </div>
    </>
  );
}

// ── INSIGHT LIBRARY ───────────────────────────────────────────────────
// Each insight has: id, headline, body, items[]
// Items have: label, value, icon key
// In production, pick based on real session data
const INSIGHT_LIBRARY = [
  {
    id: "burst_worker",
    headline: "You work best in short bursts.",
    body: "5–10 minute tasks get done. Longer ones tend to get paused.",
    items: [
      { label: "Sweet spot", value: "5–10 min tasks", iconKey: "bolt" },
      { label: "Best time", value: "Evening", iconKey: "time" },
      { label: "Go-to small task", value: "Portfolio bullet points", iconKey: "task" },
    ],
  },
  {
    id: "morning_starter",
    headline: "Mornings are your momentum window.",
    body: "You complete more tasks before noon than any other time of day.",
    items: [
      { label: "Peak hour", value: "8–10am", iconKey: "time" },
      { label: "Avg tasks done", value: "2–3 before lunch", iconKey: "task" },
      { label: "Energy then", value: "Medium — not high, not low", iconKey: "bolt" },
    ],
  },
  {
    id: "low_energy_finisher",
    headline: "You actually do a lot at low energy.",
    body: "Most of your completed tasks were picked at low energy. Small steps add up.",
    items: [
      { label: "Completed at low energy", value: "68% of your tasks", iconKey: "bolt" },
      { label: "Avg step length", value: "5 minutes", iconKey: "time" },
      { label: "Most picked", value: "Writing, reading, reviewing", iconKey: "task" },
    ],
  },
  {
    id: "task_avoider",
    headline: "One task keeps coming back.",
    body: "You've seen it on your list multiple times. That usually means it needs breaking down smaller.",
    items: [
      { label: "Circling", value: "Email tax accountant", iconKey: "task" },
      { label: "Times seen", value: "4 sessions in a row", iconKey: "time" },
      { label: "Suggested fix", value: "Try the 2-min version first", iconKey: "bolt" },
    ],
  },
  {
    id: "streak_builder",
    headline: "You've shown up 4 days in a row.",
    body: "Not every session is big. But you keep coming back. That's the whole thing.",
    items: [
      { label: "Current streak", value: "4 days", iconKey: "time" },
      { label: "Total sessions", value: "11 this month", iconKey: "bolt" },
      { label: "Longest streak", value: "6 days", iconKey: "task" },
    ],
  },
  {
    id: "completer",
    headline: "You finish what you start.",
    body: "When you say 'I can do that', you follow through more often than not.",
    items: [
      { label: "Completion rate", value: "74%", iconKey: "task" },
      { label: "Most finished", value: "Portfolio tasks", iconKey: "bolt" },
      { label: "Avg per session", value: "1.8 steps", iconKey: "time" },
    ],
  },
  {
    id: "context_switcher",
    headline: "Different tasks, different times.",
    body: "You tend to do creative work in the evening and admin in short daytime gaps.",
    items: [
      { label: "Creative window", value: "Evening, medium energy", iconKey: "bolt" },
      { label: "Admin window", value: "Lunch, low energy", iconKey: "time" },
      { label: "Physical tasks", value: "Mornings", iconKey: "task" },
    ],
  },
];

function formatEnergyLabel(energy) {
  if (!energy) return "Medium";
  return energy.charAt(0).toUpperCase() + energy.slice(1);
}

function truncateInsightText(text, max = 32) {
  if (!text) return "Your tasks";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function buildRealInsightCards(insights) {
  const energy = formatEnergyLabel(insights.topEnergy);
  const completed = insights.completedCount ?? 0;
  const sessions = insights.totalSessions ?? 0;
  const topTask = truncateInsightText(insights.topTask);
  const taskSessions = insights.topTaskCount ?? 0;

  return [{
    id: "real_patterns",
    headline: `${energy} energy is where you show up most.`,
    body: `Across ${sessions} sessions, you've finished ${completed} ${completed === 1 ? "task" : "tasks"}. Here's what your history shows.`,
    items: [
      { label: "Top energy", value: `${energy} energy`, iconKey: "bolt" },
      { label: "Tasks completed", value: String(completed), iconKey: "task" },
      {
        label: "Most worked on",
        value: taskSessions > 1 ? `${topTask} (${taskSessions}×)` : topTask,
        iconKey: "time",
      },
    ],
  }];
}

function PatternScreen({ next, onExit, completedCount, topEnergy, insights }) {
  const isDark = useContext(IsDarkContext);
  const curveOpacity = isDark ? 0.08 : undefined;
  const useRealData = insights?.totalSessions >= 3;
  const insightSet = useRealData ? buildRealInsightCards(insights) : INSIGHT_LIBRARY;
  const insightCount = insightSet.length;
  const [insightIndex, setInsightIndex] = useState(0);
  useEffect(() => {
    setInsightIndex(
      useRealData ? 0 : Math.floor(Math.random() * INSIGHT_LIBRARY.length)
    );
  }, [useRealData]);
  const insight = insightSet[insightIndex % insightCount];
  const touchStartX = useRef(null);

  const goToInsight = (index) => {
    if (insightCount <= 1) return;
    setInsightIndex((index + insightCount) % insightCount);
  };

  const onInsightTouchStart = (e) => {
    if (insightCount <= 1) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const onInsightTouchEnd = (e) => {
    if (insightCount <= 1 || touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -50) goToInsight(insightIndex + 1);
    else if (dx > 50) goToInsight(insightIndex - 1);
  };

  const iconSvgs = {
    time: (color) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.5"/>
        <path d="M10 5.5V10.5L13 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    bolt: (color) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M11.5 2L4 11.5H10L8.5 18L16 8.5H10L11.5 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    task: (color) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="3" stroke={color} strokeWidth="1.5"/>
        <path d="M7 10L9 12L13 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    calendar: (color) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="4" width="15" height="13" rx="2.5" stroke={color} strokeWidth="1.5"/>
        <path d="M6 2v4M14 2v4M2.5 8h15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    star: (color) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L10 14.4l-4.8 2.4.9-5.3L2.2 7.7l5.4-.8L10 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  };

  return (
    <div style={{ position: "relative" }}>
      <svg width="390" height="300" viewBox="0 0 390 300" fill="none" style={{ position: "absolute", top: 0, left: 0, width: "100%", pointerEvents: "none", zIndex: 0 }}>
        <ellipse cx="320" cy="80" rx="200" ry="160" fill="#EEE9FF" fillOpacity={curveOpacity ?? 0.4} />
        <ellipse cx="60" cy="220" rx="150" ry="120" fill="#F0FFF8" fillOpacity={curveOpacity ?? 0.3} />
      </svg>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Label color={C.success500}>Something I've noticed</Label>
        <div
          onTouchStart={onInsightTouchStart}
          onTouchEnd={onInsightTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <div style={{ ...T.heading, color: "var(--n9)", lineHeight: 1.3, marginBottom: 8 }}>
            {insight.headline}
          </div>
          <div style={{ ...T.small, color: "var(--n7)", marginBottom: 24, lineHeight: 1.6 }}>
            {insight.body}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {insight.items.map(item => (
              <Card key={item.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: C.accent100,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {(iconSvgs[item.iconKey] || iconSvgs.task)(C.accent500)}
                </div>
                <div>
                  <div style={{ ...T.hint, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--n7)" }}>{item.label}</div>
                  <div style={{ ...T.small, color: "var(--n9)", fontWeight: 600 }}>{item.value}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination dots — library only when fewer than 3 recorded sessions */}
        {insightCount > 1 && (
        <div style={{ display: "flex", gap: 2, justifyContent: "center", marginBottom: 12 }}>
          {insightSet.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Insight ${i + 1} of ${insightCount}`}
              aria-current={i === insightIndex ? "true" : undefined}
              onClick={() => setInsightIndex(i)}
              style={{
                width: 44, height: 44, padding: 0, border: "none", background: "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span style={{
                display: "block",
                width: i === insightIndex ? 16 : 6, height: 6, borderRadius: 6,
                background: i === insightIndex ? C.accent500 : C.neutral200,
                transition: "all 0.3s",
              }} />
            </button>
          ))}
        </div>
        )}

        <div style={{ ...T.hint, textAlign: "center", marginBottom: 20, lineHeight: 1.5 }}>
          {"I'll use this to suggest better-fitting tasks."}
        </div>
        <BtnPrimary onClick={next}>Got it</BtnPrimary>
        <div style={{ height: 12 }} />
        <BtnSecondary onClick={onExit}>Done for now</BtnSecondary>
      </div>
    </div>
  );
}

function MomentumScreen({ next, onExit, completedSteps, onMarkDone, task }) {
  const isDark = useContext(IsDarkContext);
  const [markDoneMsg, setMarkDoneMsg] = useState(false);
  const steps = completedSteps?.length > 0 ? completedSteps : [];

  const handleMarkDone = () => {
    setMarkDoneMsg(true);
    setTimeout(() => onMarkDone(), 1400);
  };

  return (
    <>
      <Label>Building up</Label>
      <div style={{ ...T.heading, color: "var(--n9)", marginBottom: 8 }}>Look at what's adding up.</div>
      <div style={{ ...T.small, color: "var(--n7)", marginBottom: 20, lineHeight: 1.6 }}>Each small step connects to something bigger.</div>

      <Card style={{ background: isDark ? "#2A2445" : C.accent100, marginBottom: 14 }}>
        <div style={{ ...T.label, color: C.accent500, marginBottom: 12 }}>{task || "Your project"}</div>
        {steps.length === 0 && (
          <div style={{ ...T.hint, color: "var(--n7)", marginBottom: 0 }}>Your completed steps will appear here.</div>
        )}
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: i < steps.length - 1 ? 8 : 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.accent500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ ...T.small, color: "var(--n9)" }}>{s}</span>
          </div>
        ))}
        {completedSteps?.length > 0 && (
          <>
            <Divider />
            <div style={{ ...T.small, color: C.accent500, fontWeight: 600, marginTop: 12 }}>→ Portfolio essentially done.</div>
          </>
        )}
      </Card>

      <Card style={{
        background: isDark ? "#2D2A45" : "#F0FAF0",
        border: isDark ? "1px solid rgba(124,111,205,0.2)" : "1px solid #D4EAD4",
        marginBottom: 16,
      }}>
        <div style={{ ...T.label, color: C.warning500, marginBottom: 6 }}>Coming back to this</div>
        {task ? (
          <div style={{ ...T.small, color: "var(--n9)", fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{task}</div>
        ) : null}
        <div style={{ ...T.small, color: "var(--n9)" }}>You've started this before. Want to try a smaller first step?</div>
      </Card>

      {markDoneMsg ? (
        <div style={{ ...T.small, color: C.success500, fontWeight: 600, textAlign: "center", marginBottom: 16 }}>
          Task complete. Removed from your list.
        </div>
      ) : (
        <button onClick={handleMarkDone} style={{
          width: "100%", height: BTN_H, borderRadius: BTN_RADIUS,
          background: "transparent", border: `1px solid ${C.neutral200}`,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          marginBottom: 16, ...BTN_FONT, color: "var(--n7)",
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke={C.accent500} strokeWidth="1.5"/>
            <path d="M5.5 9L8 11.5L12.5 6.5" stroke={C.accent500} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Mark as done
        </button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={next} disabled={markDoneMsg}>One more thing</BtnPrimary>
        <BtnSecondary onClick={onExit || next} disabled={markDoneMsg}>I'm done for now</BtnSecondary>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════

const NUDGE_IN_PROGRESS_SESSION_KEY = "nudge_in_progress_session";

function loadInProgressSessionFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(NUDGE_IN_PROGRESS_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.taskId) return null;
    return {
      ...parsed,
      taskName: parsed.taskName || parsed.taskId,
    };
  } catch {
    return null;
  }
}

function saveInProgressSessionToStorage(session) {
  if (typeof window === "undefined") return;
  if (!session?.taskId || !session?.taskName) return;
  localStorage.setItem(NUDGE_IN_PROGRESS_SESSION_KEY, JSON.stringify(session));
}

function clearInProgressSessionStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(NUDGE_IN_PROGRESS_SESSION_KEY);
}

function resolveInitialScreen(tasks) {
  const hasTasks = Array.isArray(tasks) && tasks.length > 0;
  if (!hasTasks) return "onboarding";
  return "home";
}

function migrateInProgressSession(tasks, stepIndex, savedScreen) {
  const existing = loadInProgressSessionFromStorage();
  if (existing) {
    if (tasks.length && existing.taskId !== tasks[0]) {
      clearInProgressSessionStorage();
      return null;
    }
    return existing;
  }
  if (!tasks.length) return null;
  if (savedScreen !== "inprogress" && savedScreen !== "suggestion") return null;
  const session = {
    taskId: tasks[0],
    taskName: tasks[0],
    stepIndex: Number.isInteger(stepIndex) ? stepIndex : 0,
    step: null,
    savedAt: new Date().toISOString(),
  };
  saveInProgressSessionToStorage(session);
  return session;
}

function loadPersistedAppState() {
  try {
    const tasks = JSON.parse(localStorage.getItem("nudge_tasks")) || [];
    const savedScreen = localStorage.getItem("nudge_screen");
    const stepIndexRaw = JSON.parse(localStorage.getItem("nudge_step_index"));
    const sessionCountRaw = JSON.parse(localStorage.getItem("nudge_session_count"));
    const historyRaw = localStorage.getItem("nudge_history");
    const step = localStorage.getItem("nudge_paused_step");
    const taskName = localStorage.getItem("nudge_paused_task");
    const note = localStorage.getItem("nudge_paused_note");
    const progress = localStorage.getItem("nudge_paused_progress");
    const stepIndex = Number.isInteger(stepIndexRaw) ? stepIndexRaw : 0;
    const inProgressSession = migrateInProgressSession(tasks, stepIndex, savedScreen);

    return {
      tasks: Array.isArray(tasks) ? tasks : [],
      screen: resolveInitialScreen(tasks),
      defaultEnergy: localStorage.getItem("nudge_energy") || "low",
      defaultTime: localStorage.getItem("nudge_time") || "10 min",
      stepIndex,
      sessionCount: Number.isInteger(sessionCountRaw) ? sessionCountRaw : 0,
      completedSteps: JSON.parse(localStorage.getItem("nudge_completed_steps")) || [],
      granularity: localStorage.getItem("nudge_granularity") || "balanced",
      completedHistory: historyRaw ? JSON.parse(historyRaw) : [],
      pausedStep: step ? JSON.parse(step) : null,
      pausedTaskName: taskName ? JSON.parse(taskName) : "",
      pausedNote: note ? JSON.parse(note) : "",
      pausedProgress: progress ? JSON.parse(progress) : "",
      inProgressSession,
    };
  } catch {
    return {
      tasks: [],
      screen: "onboarding",
      defaultEnergy: "low",
      defaultTime: "10 min",
      stepIndex: 0,
      sessionCount: 0,
      completedSteps: [],
      granularity: "balanced",
      completedHistory: [],
      pausedStep: null,
      pausedTaskName: "",
      pausedNote: "",
      pausedProgress: "",
      inProgressSession: null,
    };
  }
}

export default function NudgeApp() {
  const [hydrated, setHydrated] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [screen, setScreen] = useState("splash");
  const [tasks, setTasks] = useState([]);
  const [defaultEnergy, setDefaultEnergy] = useState("low");
  const [defaultTime, setDefaultTime] = useState("10 min");
  const [stepIndex, setStepIndex] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [granularity, setGranularity] = useState("balanced");
  const [pausedStep, setPausedStep] = useState(null);
  const [pausedTaskName, setPausedTaskName] = useState("");
  const [pausedNote, setPausedNote] = useState("");
  const [pausedProgress, setPausedProgress] = useState("");
  const [stepLinks, setStepLinks] = useState({});
  const [deferredNote, setDeferredNote] = useState("");
  const [completedHistory, setCompletedHistory] = useState([]);
  const [inProgressSession, setInProgressSession] = useState(null);
  const [sessionStepCount, setSessionStepCount] = useState(0);
  const [sessionSteps, setSessionSteps] = useState([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
    const onChange = (e) => setIsDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const saved = loadPersistedAppState();
    setTasks(saved.tasks);
    setScreen(saved.screen);
    setDefaultEnergy(saved.defaultEnergy);
    setDefaultTime(saved.defaultTime);
    setStepIndex(saved.stepIndex);
    setSessionCount(saved.sessionCount);
    setCompletedSteps(saved.completedSteps);
    setGranularity(saved.granularity);
    setCompletedHistory(saved.completedHistory);
    setPausedStep(saved.pausedStep);
    setPausedTaskName(saved.pausedTaskName);
    setPausedNote(saved.pausedNote);
    setPausedProgress(saved.pausedProgress);
    setInProgressSession(saved.inProgressSession);
    setHydrated(true);
  }, []);

  const clearInProgressSession = useCallback(() => {
    clearInProgressSessionStorage();
    setInProgressSession(null);
  }, []);

  const persistInProgressSession = useCallback((session) => {
    if (!session?.taskId || !session?.taskName) return;
    const payload = {
      taskId: session.taskId,
      taskName: session.taskName,
      stepIndex: session.stepIndex,
      step: session.step?.text ? session.step : null,
      savedAt: new Date().toISOString(),
    };
    saveInProgressSessionToStorage(payload);
    setInProgressSession(payload);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("nudge_history", JSON.stringify(completedHistory));
  }, [completedHistory, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("nudge_tasks", JSON.stringify(tasks));
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("nudge_step_index", JSON.stringify(stepIndex));
  }, [stepIndex, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("nudge_session_count", JSON.stringify(sessionCount));
  }, [sessionCount, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("nudge_energy", defaultEnergy);
  }, [defaultEnergy, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("nudge_time", defaultTime);
  }, [defaultTime, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("nudge_granularity", granularity);
  }, [granularity, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("nudge_completed_steps", JSON.stringify(completedSteps));
  }, [completedSteps, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("nudge_screen", screen);
  }, [screen, hydrated]);

  const [homeReason, setHomeReason] = useState("list");
  const prevScreen = useRef(null);
  const lastScreen = useRef(null);
  const activeCompletionTask = useRef("");
  const fullyCompletedTaskRef = useRef("");
  const taskAllStepsCompleteRef = useRef(false);
  const handleDoneGuard = useRef("");
  const pinnedInProgressStep = useRef(null);
  const prevPrimaryTask = useRef(null);
  const resumeStepIndexRef = useRef(null);
  const go = s => { prevScreen.current = screen; setScreen(s); };
  const goHome = (reason = "list") => { setHomeReason(reason); go("home"); };
  const task = tasks[0] || "Work on portfolio";
  const { steps, loading: stepsLoading, stepsTask } = useTaskBreakdown(task, defaultEnergy, defaultTime, granularity);
  const { recordSession, getInsights } = usePatternLearning();
  const stepsMatchTask = stepsTask === task;
  const taskSteps = stepsMatchTask ? steps : [];
  const stepsBusy = stepsLoading || !stepsMatchTask;
  const currentStep = taskSteps.length ? (taskSteps[stepIndex] || taskSteps[0]) : null;

  useEffect(() => {
    if (!hydrated) return;
    if (prevPrimaryTask.current !== null && prevPrimaryTask.current !== task) {
      if (resumeStepIndexRef.current !== null) {
        setStepIndex(resumeStepIndexRef.current);
        resumeStepIndexRef.current = null;
      } else {
        setStepIndex(0);
      }
      setStepLinks({});
    }
    prevPrimaryTask.current = task;
  }, [task, hydrated]);

  useEffect(() => {
    if (!stepsMatchTask || !taskSteps.length) return;
    setStepIndex(i => (i >= taskSteps.length ? 0 : i));
  }, [stepsMatchTask, taskSteps.length]);

  useEffect(() => {
    const workTask = tasks[0] || "Work on portfolio";
    if (screen === "suggestion" && lastScreen.current !== "suggestion") {
      activeCompletionTask.current = workTask;
    }
    if (screen === "inprogress" && lastScreen.current !== "inprogress") {
      activeCompletionTask.current = workTask;
      handleDoneGuard.current = "";
    }
    if (screen !== "inprogress") pinnedInProgressStep.current = null;
    lastScreen.current = screen;
  }, [screen, tasks]);

  const inProgressStep = screen === "inprogress" && pinnedInProgressStep.current
    ? pinnedInProgressStep.current
    : currentStep;

  const enterInProgress = () => {
    if (stepsBusy || !currentStep?.text) return;
    pinnedInProgressStep.current = currentStep;
    activeCompletionTask.current = task;
    go("inprogress");
  };

  useEffect(() => {
    if (!hydrated || screen !== "inprogress") return;
    const workTask = activeCompletionTask.current;
    const stepToPersist = inProgressStep || currentStep;
    if (!workTask || workTask !== task) return;
    if (!stepToPersist?.text) return;
    if (!pinnedInProgressStep.current && (stepsBusy || !stepsMatchTask)) return;
    persistInProgressSession({
      taskId: workTask,
      taskName: workTask,
      stepIndex,
      step: stepToPersist,
    });
  }, [hydrated, screen, stepIndex, inProgressStep, currentStep, task, stepsMatchTask, stepsBusy, persistInProgressSession]);

  const continueInProgressSession = () => {
    if (!inProgressSession) return;
    const name = inProgressSession.taskName || inProgressSession.taskId;
    const idx = inProgressSession.stepIndex;
    resumeStepIndexRef.current = idx;
    setTasks([name, ...tasks.filter(t => t !== name)]);
    activeCompletionTask.current = name;
    handleDoneGuard.current = "";
    if (inProgressSession.step?.text) pinnedInProgressStep.current = inProgressSession.step;
    go("inprogress");
  };

  const removeTaskByName = (name) => {
    if (!name) return;
    setTasks(t => (t.includes(name) ? t.filter(x => x !== name) : t));
  };

  const advanceTaskAfterSession = ({ fullyComplete = false, completedTask = null } = {}) => {
    const name = completedTask || fullyCompletedTaskRef.current || activeCompletionTask.current || tasks[0];
    if (fullyComplete) {
      removeTaskByName(name);
    } else if (tasks.length > 1) {
      setTasks(t => [...t.slice(1), t[0]]);
    }
    setStepIndex(0);
    setIsLastStep(false);
    setCompletedSteps([]);
    fullyCompletedTaskRef.current = "";
    taskAllStepsCompleteRef.current = false;
  };

  const startFreshTask = (picked) => {
    clearInProgressSession();
    activeCompletionTask.current = picked;
    const wasPrimary = picked === tasks[0];
    setTasks([picked, ...tasks.filter(x => x !== picked)]);
    if (!wasPrimary) setStepIndex(0);
    go("suggestion");
  };

  const savePauseState = ({ note, progress }) => {
    const pauseTask = activeCompletionTask.current || task;
    setPausedStep(currentStep);
    setPausedTaskName(pauseTask);
    setPausedNote(note || "");
    setPausedProgress(progress || "");
    if (typeof window !== "undefined") {
      localStorage.setItem("nudge_paused_step", JSON.stringify(currentStep));
      localStorage.setItem("nudge_paused_task", JSON.stringify(pauseTask));
      localStorage.setItem("nudge_paused_note", JSON.stringify(note || ""));
      localStorage.setItem("nudge_paused_progress", JSON.stringify(progress || ""));
      localStorage.setItem("nudge_session_state", JSON.stringify("paused"));
    }
  };

  const [isLastStep, setIsLastStep] = useState(false);
  const [gatherPhase, setGatherPhase] = useState("loading");
  const resourceLink = stepLinks[stepIndex] || inProgressStep?.link || currentStep?.link || "";

  useEffect(() => {
    if (screen !== "inprogress") setGatherPhase("loading");
  }, [screen]);

  const handleDone = () => {
    const doneStep = inProgressStep || currentStep;
    const stepLabel = (doneStep?.text || "").trim();
    if (!stepLabel) return;
    const taskId = activeCompletionTask.current || tasks[0] || "Work on portfolio";
    const guardKey = `${taskId}::${stepIndex}::${stepLabel}`;
    if (handleDoneGuard.current === guardKey) return;
    handleDoneGuard.current = guardKey;
    clearInProgressSession();

    setCompletedSteps(p => (p.includes(stepLabel) ? p : [...p, stepLabel]));
    setSessionStepCount(p => p + 1);
    setSessionSteps(p => [...p, stepLabel]);
    setCompletedHistory(h => {
      const entry = {
        taskId,
        task: taskId,
        step: stepLabel,
        stepIndex,
        completedAt: new Date().toISOString(),
      };
      const isDupe = h.some(e =>
        (e.taskId ?? e.task) === taskId &&
        e.step === entry.step &&
        e.stepIndex === entry.stepIndex &&
        Math.abs(new Date(e.completedAt).getTime() - Date.now()) < 15000
      );
      if (isDupe) return h;
      return [entry, ...h];
    });
    recordSession(taskId, defaultEnergy, stepIndex, taskSteps.length, defaultTime);
    const next = stepIndex + 1;
    const c = sessionCount + 1;
    setSessionCount(c);
    if (taskSteps.length > 0 && next >= taskSteps.length) {
      setIsLastStep(true);
      setStepIndex(0);
      fullyCompletedTaskRef.current = taskId;
      taskAllStepsCompleteRef.current = true;
      removeTaskByName(taskId);
      go("momentum");
    } else { setIsLastStep(next >= taskSteps.length - 1); setStepIndex(next); if (c === 2) go("pattern"); else go("done"); }
  };

  const endSessionWithTaskAdvance = ({ fullyComplete = false, resetSessionSteps = false, completedTask = null } = {}) => {
    clearInProgressSession();
    const shouldRemove = fullyComplete || taskAllStepsCompleteRef.current;
    if (shouldRemove || sessionStepCount > 0) {
      advanceTaskAfterSession({ fullyComplete: shouldRemove, completedTask });
    }
    if (resetSessionSteps) {
      setSessionStepCount(0);
      setSessionSteps([]);
    }
  };

  const finishSessionComplete = () => {
    endSessionWithTaskAdvance({
      fullyComplete: taskAllStepsCompleteRef.current,
      resetSessionSteps: true,
      completedTask: fullyCompletedTaskRef.current || activeCompletionTask.current,
    });
    goHome("done");
  };

  const openSessionComplete = () => {
    go("session_complete");
  };

  const screens = {
    splash: <SplashScreen next={() => go("onboarding")} />,
    onboarding: <OnboardingScreen next={() => go("setup")} tasks={tasks} setTasks={setTasks} />,
    setup: <SetupScreen next={() => go("ready")} back={() => go("onboarding")} setDefaultEnergy={setDefaultEnergy} setDefaultTime={setDefaultTime} />,
    ready: <ReadyScreen next={() => go("suggestion")} back={() => go("setup")} setGranularity={setGranularity} />,
    suggestion: <SuggestionScreen next={enterInProgress} onTooHard={() => { if (!stepsBusy && currentStep) go("simplify"); }} onAnother={() => go("allsteps")} onSkip={() => setStepIndex(i => (taskSteps.length ? (i + 1) % taskSteps.length : 0))} onExit={() => goHome("exit")} task={task} stepIndex={stepIndex} steps={taskSteps} energy={defaultEnergy} loading={stepsBusy} deferredNote={deferredNote} onDismissDeferNote={() => setDeferredNote("")} />,
    allsteps: <AllStepsScreen back={() => go("suggestion")} steps={taskSteps} task={task} stepIndex={stepIndex} onPick={i => { setStepIndex(i); go("suggestion"); }} loading={stepsBusy} stepLinks={stepLinks} onSetStepLink={(i, url) => setStepLinks(p => ({ ...p, [i]: url }))} />,
    inprogress: <InProgressScreen gatherPhase={gatherPhase} onGatherPhaseChange={setGatherPhase} step={inProgressStep} resourceLink={resourceLink} stepsLoading={stepsBusy && !pinnedInProgressStep.current} onDone={handleDone} onPause={() => { setPausedStep(inProgressStep); go("pause"); }} onTooMuch={() => go("simplify")} onDefer={(note) => { setDeferredNote(note); go("suggestion"); }} />,
    simplify: <SimplifyScreen next={enterInProgress} onStillTooMuch={() => go("suggestion")} step={currentStep} />,
    pause: <PauseScreen
      onSaveAndPause={(data) => { savePauseState(data); go("return_paused"); }}
      onComeBackLater={(data) => { savePauseState(data); go("return_paused"); }}
      onResume={enterInProgress}
    />,
    home: <HomeScreen
      reason={homeReason}
      inProgressSession={inProgressSession}
      onContinueSession={continueInProgressSession}
      onResume={startFreshTask}
      tasks={tasks}
      setTasks={setTasks}
      onHistory={() => go("history")}
    />,
    history: <HistoryScreen history={completedHistory} onBack={() => goHome("list")} />,
    paused_confirm: <PausedConfirmScreen next={() => goHome("done")} />,
    done: <DoneScreen onDoneForNow={openSessionComplete} next={() => goHome("done")} onMore={() => go("suggestion")} isLast={isLastStep} />,
    session_complete: <SessionCompleteScreen
      stepCount={sessionStepCount}
      sessionSteps={sessionSteps}
      fallbackSteps={completedSteps}
      onClose={finishSessionComplete}
    />,
    return_paused: <ReturnPausedScreen
      next={enterInProgress}
      onFresh={() => { clearInProgressSession(); go("switch_task"); }}
      onPickTask={(t) => { clearInProgressSession(); setTasks([t, ...tasks.filter(x => x !== t)]); setStepIndex(0); go("suggestion"); }}
      tasks={tasks}
      step={pausedStep || currentStep}
      task={pausedTaskName || task}
      note={pausedNote}
      pauseProgress={pausedProgress}
    />,
    switch_task: <SwitchTaskScreen tasks={tasks.length ? tasks : ["Work on portfolio", "Clean kitchen", "Baby sleep schedule"]} onPick={t => { clearInProgressSession(); setTasks([t, ...tasks.filter(x => x !== t)]); setStepIndex(0); go("suggestion"); }} onAdd={t => { clearInProgressSession(); setTasks(p => [t, ...p]); setStepIndex(0); go("suggestion"); }} onBack={() => { const dest = prevScreen.current || "home"; if (dest === "home") setHomeReason("list"); go(dest); }} />,
    return_short: <ReturnShortScreen next={() => go("suggestion")} onExit={() => goHome("list")} />,
    return_long: <ReturnLongScreen next={() => go("switch_task")} />,
    pattern: <PatternScreen next={() => go("suggestion")} onExit={() => { endSessionWithTaskAdvance({ fullyComplete: false }); goHome("done"); }} completedCount={sessionCount} topEnergy={defaultEnergy} insights={getInsights()} />,
    momentum: <MomentumScreen
      next={() => go("suggestion")}
      onExit={() => {
        endSessionWithTaskAdvance({
          fullyComplete: true,
          resetSessionSteps: true,
          completedTask: fullyCompletedTaskRef.current || activeCompletionTask.current,
        });
        goHome("done");
      }}
      completedSteps={completedSteps}
      task={fullyCompletedTaskRef.current || activeCompletionTask.current || task}
      onMarkDone={() => {
        endSessionWithTaskAdvance({
          fullyComplete: true,
          resetSessionSteps: true,
          completedTask: fullyCompletedTaskRef.current || activeCompletionTask.current,
        });
        goHome("done");
      }}
    />,
  };

  const shellBackground = screen === "home"
    ? "transparent"
    : screen === "session_complete"
      ? doneShellBackground(isDark)
      : screen === "inprogress"
        ? (gatherPhase === "complete" ? doneShellBackground(isDark) : inProgressShellBackground(isDark))
        : screen === "done"
          ? doneShellBackground(isDark)
          : (isDark ? "#1A1828" : C.neutral100);
  const isHome = screen === "home";

  return (
    <IsDarkContext.Provider value={isDark}>
    <div style={{
      flex: 1,
      minHeight: "100vh",
      width: "100%",
      maxWidth: "100%",
      display: "flex",
      flexDirection: "column",
      background: shellBackground,
      fontFamily: "Inter, sans-serif",
      position: "relative",
      boxSizing: "border-box",
      overflow: "hidden",
      "--n9": c9(isDark),
      "--n7": c7(isDark),
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  background: ${shellBackground};
}
#__next {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: ${shellBackground};
}
@keyframes drawCheck { from { stroke-dashoffset: 80; } to { stroke-dashoffset: 0; } }
@keyframes ghostPulse { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
@keyframes homeRise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.home-line1 { display: inline-block; opacity: 0; animation: homeRise 800ms 300ms cubic-bezier(.3,.9,.4,1) forwards; }
.home-line2 { display: inline-block; opacity: 0; animation: homeRise 800ms 550ms cubic-bezier(.3,.9,.4,1) forwards; }
.home-input { opacity: 0; animation: homeRise 800ms 850ms cubic-bezier(.3,.9,.4,1) forwards; }
.home-ready { opacity: 0; animation: homeRise 800ms 1100ms cubic-bezier(.3,.9,.4,1) forwards; }
.home-resume { opacity: 0; animation: homeRise 800ms 1400ms cubic-bezier(.3,.9,.4,1) forwards; }
.home-history { opacity: 0; animation: homeRise 800ms 1700ms cubic-bezier(.3,.9,.4,1) forwards; }
.home-task-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid;
  border-radius: 0;
  padding: 6px 2px 8px;
  font: inherit;
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 17px;
  font-weight: 400;
  outline: none;
  transition: border-color 200ms ease;
}
.home-task-input::placeholder { color: currentColor; opacity: 0.45; }
.home-task-input:focus { border-bottom-width: 1.5px; }
.home-add-btn {
  background: transparent;
  border: 0;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 2px;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.home-add-btn:hover { opacity: 0.75; }
.home-primary-btn {
  width: 100%;
  background: #7C6FCD;
  border: none;
  border-radius: 999px;
  padding: 17px 20px;
  color: #fff;
  font: inherit;
  font-size: 16.5px;
  font-weight: 700;
  box-shadow: 0 6px 24px rgba(124,111,205,0.42);
  transition: transform 150ms ease, background 150ms ease, opacity 250ms ease;
}
.home-primary-btn:hover:not(:disabled) { background: #6F61C4; transform: translateY(-1px); }
.home-primary-btn:active:not(:disabled) { transform: scale(0.99); }
.home-primary-btn:disabled { box-shadow: 0 6px 24px rgba(124,111,205,0.18); }
.home-resume-card {
  margin-top: 20px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.home-resume-btn {
  background: transparent;
  border: 0;
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.01em;
  transition: opacity 150ms ease;
}
.home-resume-btn:hover { opacity: 0.75; }
.home-history-link {
  margin: 14px auto 0;
  background: transparent;
  border: 0;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  padding: 6px 10px;
}
.home-history-link:hover { opacity: 1 !important; }
@media (prefers-reduced-motion: reduce) {
  .home-line1, .home-line2, .home-input, .home-ready, .home-resume, .home-history, .home-rise {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`}</style>
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: isHome ? 0 : `16px ${SCREEN_H_PAD}px 40px`,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        minHeight: 0,
      }}>
        {screens[screen] || screens.splash}
      </div>
    </div>
    </IsDarkContext.Provider>
  );
}
