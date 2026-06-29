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

function useTaskBreakdown(task, energy, timeAvailable, granularity, enabled = true) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stepsTask, setStepsTask] = useState(null);
  const cache = useRef({});

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
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
  }, [task, energy, timeAvailable, granularity, enabled]);

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

// Primary button — palette-aware action color, full width, radius 94, h 51
function BtnPrimary({ children, onClick, disabled }) {
  const action = homeActionColor();
  const shadowRest = `0 4px 16px rgba(${action[0]},${action[1]},${action[2]},0.35)`;
  const shadowPressed = `0 2px 8px rgba(${action[0]},${action[1]},${action[2]},0.2)`;
  const releasePress = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = "";
    e.currentTarget.style.boxShadow = shadowRest;
  };
  const applyPress = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = "translateY(1px)";
    e.currentTarget.style.boxShadow = shadowPressed;
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
      background: disabled ? `rgba(${action[0]},${action[1]},${action[2]},0.4)` : `rgb(${action[0]},${action[1]},${action[2]})`,
      border: "none", cursor: disabled ? "default" : "pointer",
      ...BTN_FONT, color: C.neutral50,
      boxShadow: disabled ? "none" : shadowRest,
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

const DESCENT_FIRST_MS = 1800;
const DESCENT_NEXT_MS = 600;
const DESCENT_REDUCE_MS = 250;
const DESCENT_BG_EASE = 2.3;

function descentBgProgress(rawT, reducedMotion) {
  return reducedMotion ? rawT : Math.pow(Math.min(1, Math.max(0, rawT)), DESCENT_BG_EASE);
}

function descentMoteProgress(rawT, reducedMotion) {
  if (reducedMotion) return rawT >= 1 ? 1 : 0;
  return Math.min(1, Math.max(0, rawT));
}

function vesselAssemblyFromProgress(progress) {
  const p = Math.min(1, Math.max(0, progress));
  const eased = p * p * (3 - 2 * p);
  const ringAlpha = Math.min(1, Math.max(0, (p - 0.22) / 0.58)) * Math.pow(eased, 0.85);
  const glowStrength = eased * eased;
  return { ringAlpha, glowStrength, eased };
}

function drawAssemblingVessel(ctx, { cx, cy, R, fp, progress }) {
  const { ringAlpha, glowStrength, eased } = vesselAssemblyFromProgress(progress);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  if (glowStrength > 0.003) {
    if (eased >= 0.995) {
      const dome = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      dome.addColorStop(0, `rgba(${fp.domeCenter[0]},${fp.domeCenter[1]},${fp.domeCenter[2]},1)`);
      dome.addColorStop(1, `rgba(${fp.domeEdge[0]},${fp.domeEdge[1]},${fp.domeEdge[2]},1)`);
      ctx.fillStyle = dome;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    } else {
      const intensity = glowStrength * 0.88;
      const reach = 0.58 + eased * 0.38;
      const glow = ctx.createRadialGradient(cx, cy, R * 0.08, cx, cy, R);
      glow.addColorStop(0, `rgba(${fp.domeCenter[0]},${fp.domeCenter[1]},${fp.domeCenter[2]},${intensity * 0.42})`);
      glow.addColorStop(0.32, `rgba(${fp.domeCenter[0]},${fp.domeCenter[1]},${fp.domeCenter[2]},${intensity * 0.22})`);
      glow.addColorStop(reach, `rgba(${fp.domeEdge[0]},${fp.domeEdge[1]},${fp.domeEdge[2]},${intensity * 0.09})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      if (eased > 0.28) {
        const deep = (eased - 0.28) / 0.72;
        const deepA = deep * deep * 0.38;
        const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (0.35 + deep * 0.65));
        inner.addColorStop(0, `rgba(${fp.domeCenter[0]},${fp.domeCenter[1]},${fp.domeCenter[2]},${deepA})`);
        inner.addColorStop(0.55, `rgba(${fp.domeEdge[0]},${fp.domeEdge[1]},${fp.domeEdge[2]},${deepA * 0.45})`);
        inner.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = inner;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      }
    }
  }

  ctx.restore();

  if (ringAlpha > 0.012) {
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${fp.ring[0]},${fp.ring[1]},${fp.ring[2]},${ringAlpha * 0.82})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

const DESCENT_TEXT_SHADOW = "0 1px 14px rgba(0,0,0,0.38), 0 0 2px rgba(0,0,0,0.28)";

function spawnGatherers(quick = false) {
  const arr = [];
  const W = GATHER_CANVAS_W;
  const H = GATHER_CANVAS_H;
  const count = quick ? 42 : 78;
  const delayMax = quick ? 0.24 : 0.95;
  const durBase = quick ? 0.44 : 1.05;
  const durRange = quick ? 0.3 : 0.55;
  const curveSpread = quick ? 70 : 100;
  for (let i = 0; i < count; i++) {
    const edge = Math.floor(Math.random() * 4);
    let x;
    let y;
    if (edge === 0) { x = Math.random() * W; y = -20 - Math.random() * 40; }
    else if (edge === 1) { x = W + 20 + Math.random() * 40; y = Math.random() * H; }
    else if (edge === 2) { x = Math.random() * W; y = H + 20 + Math.random() * 40; }
    else { x = -20 - Math.random() * 40; y = Math.random() * H; }
    const targetAngle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    arr.push({
      x, y,
      tx: GATHER_CIRCLE_CX + Math.cos(targetAngle) * GATHER_CIRCLE_R,
      ty: GATHER_CIRCLE_CY + Math.sin(targetAngle) * GATHER_CIRCLE_R,
      delay: Math.random() * delayMax,
      dur: durBase + Math.random() * durRange,
      size: 1.6 + Math.random() * 2.8,
      curve: (Math.random() - 0.5) * curveSpread,
      arrived: false,
    });
  }
  return arr;
}

function spawnDescentGatherers(quick = false) {
  return spawnGatherers(quick);
}

function drawGatherMotes(ctx, gatherers, {
  moteSince,
  landBoost,
  fp,
  a,
  easeInOut,
  fadeArrived = true,
}) {
  let arrivedCount = 0;
  let progressSum = 0;
  for (const g of gatherers) {
    const k = Math.min(1, Math.max(0, ((moteSince - g.delay) / g.dur) * landBoost));
    if (k >= 1) {
      g.arrived = true;
      arrivedCount++;
      progressSum += 1;
      ctx.beginPath();
      ctx.arc(g.tx, g.ty, g.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${fp.mote[0]},${fp.mote[1]},${fp.mote[2]},${a.gatherAlphaMin + a.gatherAlphaRange * 0.85})`;
      ctx.fill();
      continue;
    }
    if (k <= 0) {
      progressSum += 0.04;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.size * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${fp.mote[0]},${fp.mote[1]},${fp.mote[2]},${a.gatherIdle})`;
      ctx.fill();
      continue;
    }
    progressSum += k;
    const e = easeInOut(k);
    const mx = (g.x + g.tx) / 2 + g.curve * Math.sin(Math.PI * 0.5);
    const my = (g.y + g.ty) / 2 + g.curve * 0.6;
    const x = (1 - e) * (1 - e) * g.x + 2 * (1 - e) * e * mx + e * e * g.tx;
    const y = (1 - e) * (1 - e) * g.y + 2 * (1 - e) * e * my + e * e * g.ty;
    const mergeFade = fadeArrived ? Math.max(0, 1 - Math.max(0, k - 0.82) / 0.18) : 1;
    const alpha = (a.gatherAlphaMin + e * a.gatherAlphaRange) * mergeFade;
    if (alpha <= 0.004) continue;
    ctx.beginPath();
    ctx.arc(x, y, g.size * (0.6 + e * 0.4), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${fp.mote[0]},${fp.mote[1]},${fp.mote[2]},${alpha})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, g.size * 2.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${fp.mote[0]},${fp.mote[1]},${fp.mote[2]},${alpha * a.gatherGlow})`;
    ctx.fill();
  }
  const coverage = gatherers.length ? progressSum / gatherers.length : 1;
  return { arrivedCount, coverage };
}

function StepTextBridge({ text, focusPalette, isDark }) {
  if (!text) return null;
  const fp = focusPalette || focusPaletteForHour();
  const theme = getGatherTheme(isDark);
  return (
    <div
      aria-hidden
      style={{
        ...GATHER_SLOT_FIXED_STYLE,
        pointerEvents: "none",
        zIndex: 10003,
      }}
    >
      <p style={{
        ...gatherTaskTextStyle(text, theme),
        color: `rgb(${fp.vesselText[0]}, ${fp.vesselText[1]}, ${fp.vesselText[2]})`,
        textShadow: DESCENT_TEXT_SHADOW,
      }}>
        {text}
      </p>
    </div>
  );
}

function DescentOverlay({ descent, onComplete, onShellBg, isDark }) {
  const bgRef = useRef(null);
  const canvasRef = useRef(null);
  const gatherersRef = useRef([]);
  const circleAlphaRef = useRef(0);
  const startRef = useRef(performance.now());
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onShellBgRef = useRef(onShellBg);
  onCompleteRef.current = onComplete;
  onShellBgRef.current = onShellBg;

  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const quick = descent.sessionStepCount > 0;
  const durationMs = reducedMotion
    ? DESCENT_REDUCE_MS
    : (quick ? DESCENT_NEXT_MS : DESCENT_FIRST_MS);
  const theme = getGatherTheme(isDark);
  const { text, homePalette, focusPalette } = descent;

  useEffect(() => {
    gatherersRef.current = reducedMotion ? [] : spawnDescentGatherers(quick);
    circleAlphaRef.current = 0;
    startRef.current = performance.now();
    doneRef.current = false;

    const canvas = canvasRef.current;
    const bg = bgRef.current;
    if (!canvas || !bg) return;

    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const W = GATHER_CANVAS_W;
    const H = GATHER_CANVAS_H;
    const cx = GATHER_CIRCLE_CX;
    const cy = GATHER_CIRCLE_CY;
    const baseR = GATHER_CIRCLE_R;
    const lerp = (a, b, k) => a + (b - a) * k;
    const easeInOut = (k) => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const fp = focusPalette;
    const sky = homePalette.sky;
    const ocean = homePalette.ocean;

    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    let raf;

    const draw = (now) => {
      const elapsed = now - startRef.current;
      const rawT = Math.min(1, elapsed / durationMs);
      const bgT = descentBgProgress(rawT, reducedMotion);
      const motePhase = descentMoteProgress(rawT, reducedMotion);
      const bgRgb = sky.map((v, i) => Math.round(v + (ocean[i] - v) * bgT));
      bg.style.backgroundColor = `rgb(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]})`;
      onShellBgRef.current?.(bgRgb);

      ctx.clearRect(0, 0, W, H);

      const moteSince = elapsed / 1000;
      const a = theme.a;
      const breathe = reducedMotion ? 0.5 : Math.min(1, moteSince / (quick ? 0.45 : 1.2));
      let gatherCoverage = circleAlphaRef.current;

      if (!reducedMotion && motePhase > 0 && gatherersRef.current.length) {
        const landBoost = quick
          ? (rawT < 1 ? Math.max(0.62, 1.05 / (1 + moteSince * 0.28)) : 1.9)
          : (rawT < 1 ? Math.max(0.32, 0.78 / (1 + moteSince * 0.14)) : 1.75);
        const { coverage } = drawGatherMotes(ctx, gatherersRef.current, {
          moteSince,
          landBoost,
          fp,
          a,
          easeInOut,
        });
        gatherCoverage = Math.max(circleAlphaRef.current, coverage);
        const rawTarget = gatherersRef.current.length ? coverage : 1;
        const cap = rawT < (quick ? 0.88 : 0.92) ? (quick ? 0.78 : 0.72) : 1;
        const target = Math.min(rawTarget, cap);
        const alphaSpeed = quick
          ? (rawT < 1 ? Math.max(0.035, 0.07 / (1 + moteSince * 0.1)) : 0.16)
          : (rawT < 1 ? Math.max(0.018, 0.042 / (1 + moteSince * 0.08)) : 0.1);
        circleAlphaRef.current = lerp(circleAlphaRef.current, target * motePhase, alphaSpeed);
      } else if (reducedMotion) {
        circleAlphaRef.current = rawT >= 1 ? 1 : 0;
      }

      if (rawT >= 1) {
        circleAlphaRef.current = 1;
        gatherCoverage = 1;
      }

      const assembly = circleAlphaRef.current;
      gatherCoverage = Math.max(assembly, gatherCoverage);
      const R = baseR;
      const maxGlowR = gatherGlowMaxR(cx, cy, W, H);
      const haloGate = gatherCoverage;

      {
        const [pr, pg, pb] = fp.pulse;
        const peak = (a.haloBase + breathe * a.haloBreathe) * haloGate;
        const haloR = Math.min(R + 52, maxGlowR);
        if (haloR > R + 4 && peak > 0.002) {
          const halo = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, haloR);
          halo.addColorStop(0, `rgba(${pr},${pg},${pb},${peak})`);
          halo.addColorStop(0.55, `rgba(${pr},${pg},${pb},${a.haloMid * haloGate})`);
          halo.addColorStop(0.82, `rgba(${pr},${pg},${pb},${a.haloMid * haloGate * 0.35})`);
          halo.addColorStop(1, "rgba(0,0,0,0)");
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
          ctx.arc(cx, cy, R, 0, Math.PI * 2, true);
          ctx.clip();
          ctx.beginPath();
          ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();
          ctx.restore();
        }
      }

      drawAssemblingVessel(ctx, { cx, cy, R, fp, progress: gatherCoverage });

      if (rawT >= 1 && !doneRef.current) {
        doneRef.current = true;
        onCompleteRef.current(focusPalette);
        return;
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [descent.sessionStepCount, durationMs, reducedMotion, quick, focusPalette, homePalette]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        pointerEvents: "none",
      }}
    >
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: `rgb(${homePalette.sky[0]}, ${homePalette.sky[1]}, ${homePalette.sky[2]})`,
        }}
      />
      <div style={{ ...GATHER_SLOT_FIXED_STYLE, zIndex: 1 }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>
      <StepTextBridge
        text={text}
        focusPalette={focusPalette}
        isDark={isDark}
      />
    </div>
  );
}

function SuggestionScreen({
  onConfirm,
  onStartDescent,
  onTooHard,
  onAnother,
  onSkip,
  onExit,
  task,
  stepIndex,
  steps,
  energy,
  loading,
  deferredNote,
  onDismissDeferNote,
  sessionStepCount,
  isDescentActive,
}) {
  const isDark = useContext(IsDarkContext);
  const stepTextRef = useRef(null);

  const [palette, setPalette] = useState(() => homePaletteForHour());

  useEffect(() => {
    const tick = () => setPalette(homePaletteForHour());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const step = steps[stepIndex] || steps[0];
  const stepReady = !loading && steps.length > 0 && !!step?.text;
  const skyInk = homeSkyInk(palette);
  const focusFp = focusPaletteForHour();
  const stepTextRgb = `rgb(${focusFp.vesselText[0]}, ${focusFp.vesselText[1]}, ${focusFp.vesselText[2]})`;
  const action = homeActionColor();
  const theme = getGatherTheme(isDark);
  const serifRgb = `rgb(${skyInk.ink[0]}, ${skyInk.ink[1]}, ${skyInk.ink[2]})`;
  const serifMuted = `rgba(${skyInk.ink[0]}, ${skyInk.ink[1]}, ${skyInk.ink[2]}, 0.55)`;
  const serifGhost = `rgba(${skyInk.ink[0]}, ${skyInk.ink[1]}, ${skyInk.ink[2]}, 0.6)`;
  const serifBorder = `rgba(${skyInk.ink[0]}, ${skyInk.ink[1]}, ${skyInk.ink[2]}, 0.15)`;
  const shadowRest = `0 4px 16px rgba(${action[0]},${action[1]},${action[2]},0.35)`;
  const minsLabel = step?.mins ? `${step.mins} min` : "";
  const uiVisible = stepReady && !isDescentActive;

  const beginDescent = () => {
    if (!stepReady || isDescentActive || !onStartDescent) return;
    onStartDescent({
      text: step.text,
      homePalette: palette,
      focusPalette: focusPaletteForHour(),
      sessionStepCount,
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: `rgb(${palette.sky[0]}, ${palette.sky[1]}, ${palette.sky[2]})`,
        }}
      />

      {deferredNote ? (
        <div style={{
          position: "relative",
          zIndex: 3,
          display: "flex", alignItems: "flex-start", gap: 10,
          background: C.warning100, borderRadius: 12, padding: "12px 14px",
          margin: "16px 28px 0",
        }}>
          <div style={{ ...T.small, color: C.warning500, flex: 1, lineHeight: 1.4 }}>
            Prep needed: {deferredNote}
          </div>
          <button onClick={onDismissDeferNote} type="button" style={{
            background: "none", border: "none", color: C.neutral300,
            fontSize: 18, cursor: "pointer", padding: 0, lineHeight: 1, fontFamily: "Inter",
          }}>✕</button>
        </div>
      ) : null}

      <div style={{
        ...GATHER_SLOT_FIXED_STYLE,
        zIndex: 2,
      }}>
        <div style={{
          position: "absolute",
          top: 10,
          left: 0,
          right: 0,
          opacity: uiVisible && minsLabel ? 1 : 0,
          transition: "opacity 300ms ease",
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 15,
          fontWeight: 400,
          letterSpacing: "0.04em",
          color: serifMuted,
          textAlign: "center",
          pointerEvents: "none",
        }}>
          {minsLabel || "\u00a0"}
        </div>
        <p
          ref={stepTextRef}
          style={{
            ...gatherTaskTextStyle(step?.text, theme),
            color: stepReady ? stepTextRgb : serifMuted,
            textShadow: stepReady ? DESCENT_TEXT_SHADOW : "none",
            visibility: isDescentActive ? "hidden" : "visible",
            opacity: stepReady ? 1 : 0.45,
          }}
        >
          {stepReady ? (step?.text ?? "") : "Finding your step…"}
        </p>
      </div>

      <div style={{
        position: "fixed",
        left: SCREEN_H_PAD,
        right: SCREEN_H_PAD,
        bottom: "max(40px, env(safe-area-inset-bottom))",
        maxWidth: GATHER_CANVAS_W,
        margin: "0 auto",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: uiVisible ? 1 : 0,
        pointerEvents: uiVisible ? "auto" : "none",
        transition: "opacity 280ms ease",
        boxSizing: "border-box",
      }}>
        <button
          type="button"
          onClick={beginDescent}
          disabled={!stepReady}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 999,
            padding: "17px 20px",
            lineHeight: 1.4,
            fontFamily: "Inter, sans-serif",
            fontSize: 16.5,
            fontWeight: 700,
            cursor: stepReady ? "pointer" : "default",
            color: C.neutral50,
            background: `rgb(${action[0]}, ${action[1]}, ${action[2]})`,
            boxShadow: shadowRest,
            opacity: stepReady ? 1 : 0.5,
          }}
        >
          I can do that
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onTooHard}
            disabled={!stepReady}
            style={{
              flex: 1,
              background: "transparent",
              border: `1px solid ${serifBorder}`,
              borderRadius: 999,
              padding: "14px 12px",
              lineHeight: 1.4,
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: stepReady ? "pointer" : "default",
              color: serifGhost,
              opacity: stepReady ? 1 : 0.5,
            }}
          >
            Smaller, please
          </button>
          <button
            type="button"
            onClick={onAnother}
            disabled={!stepReady}
            style={{
              flex: 1,
              background: "transparent",
              border: `1px solid ${serifBorder}`,
              borderRadius: 999,
              padding: "14px 12px",
              lineHeight: 1.4,
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: stepReady ? "pointer" : "default",
              color: serifGhost,
              opacity: stepReady ? 1 : 0.5,
            }}
          >
            Different idea
          </button>
        </div>
      </div>
    </div>
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
        )) : (Array.isArray(steps) ? steps : []).map((s, i) => (
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
                {(Array.isArray(s.tags) ? s.tags : []).map((t, j) => <Tag key={t} label={t} green={j === 1} compact />)}
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
// Keep outer glow fully inside the canvas so the rectangular canvas edge never clips visible bloom.
const gatherGlowMaxR = (cx = GATHER_CIRCLE_CX, cy = GATHER_CIRCLE_CY, W = GATHER_CANVAS_W, H = GATHER_CANVAS_H, pad = 10) =>
  Math.min(cx, cy, W - cx, H - cy) - pad;
const FOCUS_CAPTION_MIN_H = 52;
const FOCUS_ACTIONS_H = BTN_H * 2 + 12;
const GATHER_TEXT_WIDTH = Math.round(GATHER_CIRCLE_R * 2 * 0.80);
const GATHER_TEXT_MAX_H = Math.round(GATHER_CIRCLE_R * 1.55);

// Circle center sits at 40% viewport height on every gather screen (arrival
// gathering → suggestion → descent → focus) so the vessel never jumps.
const GATHER_VIEWPORT_CY_RATIO = 0.40;

const GATHER_SLOT_FIXED_STYLE = {
  position: "fixed",
  left: "50%",
  top: `${GATHER_VIEWPORT_CY_RATIO * 100}%`,
  transform: "translate(-50%, -50%)",
  width: `min(calc(100vw - 32px), ${GATHER_CANVAS_W}px)`,
  aspectRatio: `${GATHER_CANVAS_W} / ${GATHER_CANVAS_H}`,
  overflow: "visible",
  zIndex: 2,
};

const GATHER_FIXED_CAPTION_TOP = `calc(${GATHER_VIEWPORT_CY_RATIO * 100}% + ${GATHER_CIRCLE_R}px + 40px)`;

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

// Palette-aware focus-screen colors. Selected by the same time-of-day band
// logic as the home screen, then locked for the duration of a focus session.
//   bg          – screen background behind the vessel
//   disc        – (reference) solid vessel color
//   domeCenter/domeEdge – inner radial gradient inside the vessel
//   waterStart/waterEnd – water fill, lerped by hold progress
//   pulse       – breathing idle halo (action color)
//   mote        – gather particles / release motes (action color)
//   bloom       – hold + completion radial brightening / sustained halo
//   ring        – vessel outline ring (brighter sibling of the disc)
//   serif       – resting-state text color
//   scDomeCenter – session-complete vessel inner gradient center (edge = disc)
//   scWater     – session-complete rising fill (single consistent color)
//   scInk       – session-complete text color (headline / step / close)
const FOCUS_PALETTES = {
  morning: {
    bg: [110, 145, 135],
    disc: [55, 90, 80],
    domeCenter: [78, 113, 103], domeEdge: [55, 90, 80],
    waterStart: [220, 110, 90], waterEnd: [240, 195, 165],
    pulse: [220, 110, 90],
    mote: [245, 165, 140],
    bloom: [250, 240, 230],
    ring: [140, 175, 160],
    vesselText: [250, 245, 235],
    serif: [42, 36, 56],
    hint: [245, 240, 230], hintAlpha: 0.75,
    scDomeCenter: [80, 115, 105], scWater: [240, 195, 165], scInk: [42, 36, 56],
  },
  afternoon: {
    bg: [88, 72, 138],
    disc: [40, 28, 80],
    domeCenter: [63, 51, 103], domeEdge: [40, 28, 80],
    waterStart: [195, 145, 170], waterEnd: [230, 195, 210],
    pulse: [195, 145, 170],
    mote: [225, 185, 205],
    bloom: [248, 245, 248],
    ring: [180, 160, 230],
    vesselText: [245, 240, 248],
    serif: [42, 38, 64],
    hint: [240, 232, 248], hintAlpha: 0.75,
    scDomeCenter: [70, 50, 120], scWater: [220, 175, 195], scInk: [245, 240, 248],
  },
  evening: {
    bg: [28, 22, 48],
    disc: [60, 50, 95],
    domeCenter: [85, 75, 130], domeEdge: [60, 50, 95],
    waterStart: [124, 111, 205], waterEnd: [170, 150, 215],
    pulse: [124, 111, 205],
    mote: [165, 155, 230],
    bloom: [95, 191, 155],
    ring: [150, 140, 220],
    vesselText: [237, 234, 228],
    serif: [237, 234, 228],
    hint: [220, 215, 230], hintAlpha: 0.70,
    scDomeCenter: [85, 75, 130], scWater: [170, 150, 215], scInk: [237, 234, 228],
  },
};

function focusPaletteForHour(h = homeFractionalHour()) {
  const lerpPal = (a, b, k) => {
    const out = {};
    for (const key in a) {
      out[key] = Array.isArray(a[key])
        ? homeLerpCol(a[key], b[key], k)
        : homeLerp(a[key], b[key], k);
    }
    return out;
  };
  const M = FOCUS_PALETTES.morning;
  const A = FOCUS_PALETTES.afternoon;
  const E = FOCUS_PALETTES.evening;
  if (h >= 5 && h < 11) return M;
  if (h >= 11 && h < 13) return lerpPal(M, A, (h - 11) / 2);
  if (h >= 13 && h < 17) return A;
  if (h >= 17 && h < 19) return lerpPal(A, E, (h - 17) / 2);
  if (h >= 19 || h < 3) return E;
  return lerpPal(E, M, (h - 3) / 2);
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

function GatherBloomCircle({ sessionId, stepText, loading, phase, onPhaseChange, onComplete, resourceLink, focusPalette, skipGatherIntro = false }) {
  const isDark = useContext(IsDarkContext);
  const theme = getGatherTheme(isDark);
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const fp = focusPalette || focusPaletteForHour();
  const fpRef = useRef(fp);
  fpRef.current = fp;
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

  const skipGatherIntroRef = useRef(skipGatherIntro);
  skipGatherIntroRef.current = skipGatherIntro;

  const resetGatherAnimation = useCallback(() => {
    if (skipGatherIntroRef.current) {
      phaseRef.current = "focus";
      phaseStart.current = performance.now();
      focusTriggered.current = true;
      completeFired.current = false;
      completeFiredSession.current = null;
      hold.current = { active: false, value: 0 };
      bloomers.current = [];
      colorMix.current = 0;
      circleAlpha.current = 1;
      gatherers.current = [];
      onPhaseChangeRef.current("focus");
      setRunId(r => r + 1);
      return;
    }
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

  const fireComplete = () => {
    if (completeFired.current) return;
    completeFired.current = true;
    onCompleteRef.current();
  };

  const spawnGather = () => {
    if (reduceMotion.current) { gatherers.current = []; return; }
    gatherers.current = spawnGatherers(false);
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
              fireComplete();
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
      const fp = fpRef.current;

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

      // Breathing pulse glow ring — idle halo in the palette's action color.
      {
        const [pr, pg, pb] = fp.pulse;
        const peak = (a.haloBase + breathe * a.haloBreathe) * haloGate;
        const maxGlowR = gatherGlowMaxR(cx, cy, W, H);
        const haloR = Math.min(R + 52, maxGlowR);
        if (haloR > R + 4) {
          const halo = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, haloR);
          halo.addColorStop(0, `rgba(${pr},${pg},${pb},${peak})`);
          halo.addColorStop(0.55, `rgba(${pr},${pg},${pb},${a.haloMid * haloGate})`);
          halo.addColorStop(0.82, `rgba(${pr},${pg},${pb},${a.haloMid * haloGate * 0.35})`);
          halo.addColorStop(1, "rgba(0,0,0,0)");
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
          ctx.arc(cx, cy, R, 0, Math.PI * 2, true);
          ctx.clip();
          ctx.beginPath();
          ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();
          ctx.restore();
        }
      }

      // Hold bloom + completion bloom — annulus on the same canvas coords as the vessel
      // so glow stays centered; radius capped so it fades before the canvas edge.
      {
        const [br, bgc, bb] = fp.bloom;
        const holdBloom = ph === "focus" ? hv * a.haloHold * 3.0 : 0;
        const completeWave = ph === "complete" ? Math.max(0, 1 - since / 1.4) : 0;
        const completeSteady = ph === "complete" ? 0.12 : 0;
        const maxGlowR = gatherGlowMaxR(cx, cy, W, H);
        const bloomR = Math.min(R + 52, maxGlowR);
        const peak = (holdBloom + completeWave * 0.55 + completeSteady) * haloGate;
        if (peak > 0.002 && bloomR > R + 4) {
          const g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, bloomR);
          g.addColorStop(0, `rgba(${br},${bgc},${bb},${peak})`);
          g.addColorStop(0.45, `rgba(${br},${bgc},${bb},${peak * 0.35})`);
          g.addColorStop(0.78, `rgba(${br},${bgc},${bb},${peak * 0.08})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, bloomR, 0, Math.PI * 2);
          ctx.arc(cx, cy, R, 0, Math.PI * 2, true);
          ctx.clip();
          ctx.beginPath();
          ctx.arc(cx, cy, bloomR, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.restore();
        }
      }

      let gatherCoverage = 0;
      if (ph === "loading" && gatherers.current.length) {
        const stillLoading = loadingRef.current;
        const landBoost = stillLoading
          ? Math.max(0.28, 0.72 / (1 + since * 0.18))
          : 1.85;
        const { coverage } = drawGatherMotes(ctx, gatherers.current, {
          moteSince: since,
          landBoost,
          fp,
          a,
          easeInOut,
          fadeArrived: false,
        });
        gatherCoverage = coverage;
        const target = stillLoading ? Math.min(coverage, 0.82) : coverage;
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

      if (ph === "loading" && gatherCoverage > 0.008) {
        drawAssemblingVessel(ctx, {
          cx, cy, R, fp,
          progress: Math.max(ca, gatherCoverage),
        });
      } else if (ca > 0.02) {
        // Vessel disc — opaque inner dome gradient (static; does not change with hold).
        const dome = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        dome.addColorStop(0, `rgba(${fp.domeCenter[0]},${fp.domeCenter[1]},${fp.domeCenter[2]},${ca})`);
        dome.addColorStop(1, `rgba(${fp.domeEdge[0]},${fp.domeEdge[1]},${fp.domeEdge[2]},${ca})`);
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = dome;
        ctx.fill();
        // Outline ring — brighter sibling of the vessel color.
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${fp.ring[0]},${fp.ring[1]},${fp.ring[2]},${ca})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const tideRgb = (holdMix) => mixCol(fp.waterStart, fp.waterEnd, holdMix);

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

      // Complete (resting): vessel filled 100% with waterEnd, calm single-sine
      // surface wave — no bubbles, no crest droplets.
      if (ph === "complete" && ca > 0.02) {
        const [wr, wg, wb] = fp.waterEnd;
        const [gr2, gg2, gb2] = fp.bloom;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = `rgba(${wr},${wg},${wb},${ca})`;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
        const sheen = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.1, cx, cy, R);
        sheen.addColorStop(0, `rgba(255,255,255,${0.16 * ca})`);
        sheen.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = sheen;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
        const surfaceY = cy - R + 12;
        const amp = reduceMotion.current ? 0 : 2.2;
        ctx.beginPath();
        for (let x = cx - R; x <= cx + R; x += 4) {
          const wy = surfaceY + Math.sin(x / 30 + t * 1.3) * amp;
          x === cx - R ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
        }
        ctx.strokeStyle = `rgba(${gr2},${gg2},${gb2},${0.4 * ca})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        // Outline ring on top of the water.
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${fp.ring[0]},${fp.ring[1]},${fp.ring[2]},${ca})`;
        ctx.lineWidth = 1;
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
          const c = fp.mote;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a.bloom * p.life})`;
          ctx.fill();
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
  const textTransition = skipGatherIntro
    ? "none"
    : showFocusText
    ? "opacity 600ms ease 300ms, transform 600ms ease 300ms"
    : "opacity 600ms ease, transform 600ms ease";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
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
        transition: textTransition,
      }}>
        <p style={{
          ...gatherTaskTextStyle(displayText, theme),
          color: `rgb(${fp.vesselText[0]}, ${fp.vesselText[1]}, ${fp.vesselText[2]})`,
          textShadow: DESCENT_TEXT_SHADOW,
        }}>{displayText}</p>
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

function InProgressScreen({ gatherPhase, onGatherPhaseChange, onDone, onPause, onTooMuch, onDefer, onMore, onDoneForNow, step, resourceLink, stepsLoading, focusPalette, skipGatherIntro = false }) {
  const isDark = useContext(IsDarkContext);
  const [showDeferInput, setShowDeferInput] = useState(false);
  const [deferDraft, setDeferDraft] = useState("");
  const [gatherSessionId] = useState(() => Math.random());
  const isComplete = gatherPhase === "complete";
  const fp = focusPalette || focusPaletteForHour();
  const serifRgb = `rgb(${fp.serif[0]}, ${fp.serif[1]}, ${fp.serif[2]})`;
  const serifMuted = `rgba(${fp.serif[0]}, ${fp.serif[1]}, ${fp.serif[2]}, 0.7)`;
  const hintCol = `rgba(${fp.hint[0]}, ${fp.hint[1]}, ${fp.hint[2]}, ${fp.hintAlpha})`;

  // Fade the resting copy + actions in during the last third of the bloom
  // (~600ms beginning ~900ms after the hold completes), so the bloom's
  // fade-out and the resting state read as one continuous moment.
  const [restReady, setRestReady] = useState(false);
  useEffect(() => {
    if (!isComplete) { setRestReady(false); return; }
    const id = setTimeout(() => setRestReady(true), 900);
    return () => clearTimeout(id);
  }, [isComplete]);

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
        <Label style={{ margin: 0 }}>{isComplete ? "" : "In Progress"}</Label>
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

      <div style={GATHER_SLOT_FIXED_STYLE}>
        <GatherBloomCircle
          sessionId={gatherSessionId}
          phase={gatherPhase}
          onPhaseChange={onGatherPhaseChange}
          stepText={step?.text}
          loading={stepsLoading}
          onComplete={onDone}
          resourceLink={resourceLink}
          focusPalette={fp}
          skipGatherIntro={skipGatherIntro}
        />
      </div>

      <div style={{
        position: "fixed",
        top: GATHER_FIXED_CAPTION_TOP,
        left: SCREEN_H_PAD,
        right: SCREEN_H_PAD,
        minHeight: FOCUS_CAPTION_MIN_H,
        zIndex: 2,
        pointerEvents: "none",
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
          transition: "opacity 300ms ease",
        }}>
          <div style={{
            ...T.small, color: hintCol, fontWeight: 600, marginBottom: 6,
          }}>
            Take your time. No rush.
          </div>
          <div style={{ ...T.hint, color: hintCol }}>Press and hold the circle to finish.</div>
        </div>
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          opacity: restReady ? 1 : 0,
          transition: "opacity 600ms ease",
        }}>
          <div style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 23,
            lineHeight: 1.2,
            color: serifRgb,
            marginBottom: 6,
          }}>
            Small step taken.
          </div>
          <div style={{ ...T.subtitle, color: serifMuted }}>That's real progress.</div>
        </div>
      </div>

      <div style={{
        position: "fixed",
        left: SCREEN_H_PAD,
        right: SCREEN_H_PAD,
        bottom: "max(40px, env(safe-area-inset-bottom))",
        maxWidth: GATHER_CANVAS_W,
        margin: "0 auto",
        zIndex: 2,
        minHeight: FOCUS_ACTIONS_H,
        boxSizing: "border-box",
      }}>
        <div style={{
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
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          opacity: restReady ? 1 : 0,
          pointerEvents: isComplete ? "auto" : "none",
          transition: "opacity 600ms ease",
        }}>
          <BtnPrimary onClick={onMore}>One more thing</BtnPrimary>
          <BtnSecondary onClick={onDoneForNow}>I'm done now</BtnSecondary>
        </div>
      </div>
    </>
  );
}

// ── ARRIVAL SCREEN ───────────────────────────────────────────────────────────
const ARRIVAL_LIGHT_MOTE = [255, 240, 214];
const ARRIVAL_VESSEL_BOX = 92;
const ARRIVAL_FADE_MS = 260;
const ARRIVAL_DELAY_MS = 120;
const ARRIVAL_TRAVEL_MS = 1000;
const ARRIVAL_GRACE_MS = 400;

const ARRIVAL_CARDS = [
  { id: "quick-low", size: 46, fill: 0.30, label: "A quick, gentle one", sub: "a few minutes", energy: "low", timeAvailable: "10 min" },
  { id: "quick-high", size: 46, fill: 0.86, label: "Quick and focused", sub: "a few minutes", energy: "high", timeAvailable: "15 min" },
  { id: "long-low", size: 80, fill: 0.30, label: "Settle in, slowly", sub: "a good while", energy: "low", timeAvailable: "40 min" },
  { id: "long-high", size: 80, fill: 0.86, label: "Settle in, focused", sub: "a good while", energy: "high", timeAvailable: "45 min" },
];

function arrivalSuggestedId(h = homeFractionalHour()) {
  if (h >= 19 || h < 3) return "long-low";
  return "quick-high";
}

function arrivalClamp(v, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, v));
}

function arrivalLerp(a, b, t) {
  return a + (b - a) * t;
}

function arrivalEaseInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function arrivalWaterColor(fp, fill) {
  return fp.waterStart.map((v, i) => Math.round(v + (fp.waterEnd[i] - v) * fill));
}

function drawArrivalVessel(ctx, cx, cy, r, fill, time, fp, extraAmp = 0) {
  const dome = ctx.createRadialGradient(cx, cy - r * 0.2, r * 0.1, cx, cy, r);
  dome.addColorStop(0, `rgb(${fp.domeCenter[0]},${fp.domeCenter[1]},${fp.domeCenter[2]})`);
  dome.addColorStop(1, `rgb(${fp.disc[0]},${fp.disc[1]},${fp.disc[2]})`);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = dome;
  ctx.fill();
  if (fill > 0) {
    const wc = arrivalWaterColor(fp, fill);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.clip();
    const waterTop = cy + r - fill * (r * 2);
    const waveAmp = 4.5 * (r / GATHER_CIRCLE_R) + extraAmp;
    const waveAt = (x) =>
      waterTop +
      Math.sin((x / 34) + time * 2.6) * waveAmp +
      Math.sin((x / 13) - time * 3.64) * waveAmp * 0.35;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy + r);
    for (let x = cx - r; x <= cx + r; x += 4) {
      ctx.lineTo(x, waveAt(x));
    }
    ctx.lineTo(cx + r, cy + r);
    ctx.closePath();
    ctx.fillStyle = `rgba(${wc[0]},${wc[1]},${wc[2]},0.92)`;
    ctx.fill();
    ctx.beginPath();
    for (let x = cx - r; x <= cx + r; x += 4) {
      x === cx - r ? ctx.moveTo(x, waveAt(x)) : ctx.lineTo(x, waveAt(x));
    }
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgb(${fp.ring[0]},${fp.ring[1]},${fp.ring[2]})`;
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function ArrivalCardVessel({ size, fill, fp, ripple, hidden, reducedMotion }) {
  const ref = useRef(null);
  const fpRef = useRef(fp);
  fpRef.current = fp;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const box = ARRIVAL_VESSEL_BOX;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = box * dpr;
    canvas.height = box * dpr;
    canvas.style.width = `${box}px`;
    canvas.style.height = `${box}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf;
    const draw = (now) => {
      const time = now * 0.001;
      ctx.clearRect(0, 0, box, box);
      if (!hidden) {
        const f = fpRef.current;
        const cx = box / 2;
        const cy = box / 2;
        const r = size / 2;
        let extraAmp = 0;
        if (ripple && !reducedMotion) {
          const age = now - ripple.t0;
          if (age < 700) extraAmp = (1 - age / 700) * r * 0.05;
        }
        drawArrivalVessel(ctx, cx, cy, r, fill, time, f, extraAmp);
        if (ripple && !reducedMotion) {
          const age = now - ripple.t0;
          if (age < 700) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
            ctx.clip();
            const prog = age / 700;
            for (let k = 0; k < 2; k++) {
              const pp = arrivalClamp(prog - k * 0.18);
              if (pp <= 0) continue;
              ctx.beginPath();
              ctx.arc(ripple.x, ripple.y, pp * r * 1.4, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(255,255,255,${(1 - pp) * 0.28})`;
              ctx.lineWidth = 1.2;
              ctx.stroke();
            }
            ctx.restore();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size, fill, ripple, hidden, reducedMotion]);

  return <canvas ref={ref} style={{ display: "block" }} aria-hidden />;
}

function ArrivalScreen({ stepsLoading, stepsReady, lastChoiceId, onChoose, onComplete }) {
  const frameRef = useRef(null);
  const overlayRef = useRef(null);
  const vesselRefs = useRef({});
  const startRef = useRef(null);
  const t0Ref = useRef(0);
  const motesRef = useRef([]);
  const pickTimeRef = useRef(0);
  const advancedRef = useRef(false);
  const fpRef = useRef(focusPaletteForHour());
  const paletteRef = useRef(homePaletteForHour());

  const [palette, setPalette] = useState(() => homePaletteForHour());
  paletteRef.current = palette;
  const fp = focusPaletteForHour();
  fpRef.current = fp;

  useEffect(() => {
    const tick = () => {
      const next = homePaletteForHour();
      paletteRef.current = next;
      setPalette(next);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const travelMs = reducedMotion ? 380 : ARRIVAL_TRAVEL_MS;

  const [picked, setPicked] = useState(null);
  const [ripple, setRipple] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [, setFrame] = useState(0);

  const suggestedId = lastChoiceId || arrivalSuggestedId();
  const skyInk = homeSkyInk(palette);
  const skyRgb = `rgb(${palette.sky[0]}, ${palette.sky[1]}, ${palette.sky[2]})`;
  const onDarkSky = homeRelLuminance(palette.sky) < 0.2;
  const primaryRgb = `rgb(${palette.serif[0]}, ${palette.serif[1]}, ${palette.serif[2]})`;
  const rgbaMuted = (a) => `rgba(${palette.muted[0]}, ${palette.muted[1]}, ${palette.muted[2]}, ${a})`;
  const rgbaAction = (a) => `rgba(${palette.action[0]}, ${palette.action[1]}, ${palette.action[2]}, ${a})`;
  const cardBg = onDarkSky
    ? "rgba(255, 248, 245, 0.10)"
    : `rgba(${palette.serif[0]}, ${palette.serif[1]}, ${palette.serif[2]}, 0.05)`;
  const cardBorder = (suggested) => suggested
    ? rgbaAction(0.42)
    : onDarkSky
    ? "rgba(255, 248, 245, 0.22)"
    : `rgba(${palette.serif[0]}, ${palette.serif[1]}, ${palette.serif[2]}, 0.12)`;
  const subAlpha = onDarkSky ? 0.78 : 0.5;
  const footAlpha = onDarkSky ? 0.58 : 0.4;

  const onPressVessel = (id, e) => {
    if (reducedMotion) return;
    const el = vesselRefs.current[id];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setRipple({
      id,
      x: arrivalClamp(e.clientX - rect.left, 0, ARRIVAL_VESSEL_BOX),
      y: arrivalClamp(e.clientY - rect.top, 0, ARRIVAL_VESSEL_BOX),
      t0: performance.now(),
    });
  };

  const onPick = (id) => {
    if (phase !== "idle") return;
    const card = ARRIVAL_CARDS.find((c) => c.id === id);
    if (!card) return;

    onChoose({ id: card.id, energy: card.energy, timeAvailable: card.timeAvailable });

    const frame = frameRef.current;
    const el = vesselRefs.current[id];
    let start = { x: 0, y: 0, r: GATHER_CIRCLE_R, fill: card.fill };
    if (frame) {
      const fRect = frame.getBoundingClientRect();
      const centerY = fRect.height * GATHER_VIEWPORT_CY_RATIO;
      start = {
        x: fRect.width / 2,
        y: centerY,
        r: GATHER_CIRCLE_R,
        fill: card.fill,
      };
      if (el && !reducedMotion) {
        const r = el.getBoundingClientRect();
        start = {
          x: r.left - fRect.left + r.width / 2,
          y: r.top - fRect.top + r.height / 2,
          r: card.size / 2,
          fill: card.fill,
        };
      }
    }

    const outer = 175;
    motesRef.current = Array.from({ length: reducedMotion ? 8 : 18 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: outer + Math.random() * 50,
      speed: reducedMotion ? 0 : 0.18 + Math.random() * 0.32,
      drift: (Math.random() - 0.5) * 0.004,
      size: 3 + Math.random() * 4,
      tw: Math.random() * Math.PI * 2,
    }));

    startRef.current = start;
    t0Ref.current = performance.now();
    pickTimeRef.current = performance.now();
    advancedRef.current = false;
    setPicked(id);
    setPhase(reducedMotion ? "gathering" : "transition");
  };

  useEffect(() => {
    if (phase !== "transition" && phase !== "gathering") return;
    const canvas = overlayRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = frame.clientWidth;
      const h = frame.clientHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const start = startRef.current;
    const outer = 200;
    let raf;

    const draw = (now) => {
      resize();
      const w = frame.clientWidth;
      const h = frame.clientHeight;
      const centerY = h * GATHER_VIEWPORT_CY_RATIO;
      const time = now * 0.001;
      const elapsed = now - t0Ref.current;
      const p = reducedMotion ? 1 : arrivalEaseInOut(arrivalClamp((elapsed - ARRIVAL_DELAY_MS) / travelMs));
      setFrame((n) => n + 1);

      ctx.clearRect(0, 0, w, h);

      const cx = arrivalLerp(start.x, w / 2, p);
      const cy = arrivalLerp(start.y, centerY, p);
      const rBase = arrivalLerp(start.r, GATHER_CIRCLE_R, p);
      const arrived = p >= 1;
      const r = arrived && !reducedMotion
        ? rBase * (1 + 0.025 * Math.sin(time * 1.6))
        : rBase;
      const innerR = rBase + 4;

      if (p > 0.1) {
        const halo = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.9);
        const ha = 0.18 * arrivalClamp((p - 0.1) / 0.9) * (reducedMotion ? 0.45 : 1);
        halo.addColorStop(0, `rgba(${ARRIVAL_LIGHT_MOTE[0]},${ARRIVAL_LIGHT_MOTE[1]},${ARRIVAL_LIGHT_MOTE[2]},${ha})`);
        halo.addColorStop(1, `rgba(${ARRIVAL_LIGHT_MOTE[0]},${ARRIVAL_LIGHT_MOTE[1]},${ARRIVAL_LIGHT_MOTE[2]},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.9, 0, Math.PI * 2);
        ctx.fill();
      }

      const motesA = arrivalClamp((p - 0.25) / 0.75) * (reducedMotion ? 0.35 : 1);
      if (motesA > 0) {
        for (const m of motesRef.current) {
          if (!reducedMotion) {
            m.radius -= m.speed;
            m.angle += m.drift;
            if (m.radius < innerR) {
              m.radius = outer + Math.random() * 40;
              m.angle = Math.random() * Math.PI * 2;
            }
          }
          const mx = cx + Math.cos(m.angle) * m.radius;
          const my = cy + Math.sin(m.angle) * m.radius;
          const band = arrivalClamp((m.radius - innerR) / (outer - innerR));
          const radial = Math.sin(band * Math.PI);
          const twinkle = reducedMotion ? 0.4 : 0.55 + 0.45 * Math.sin(time * 2 + m.tw);
          const a = motesA * radial * twinkle * 0.9;
          if (a <= 0.01) continue;
          const g = ctx.createRadialGradient(mx, my, 0, mx, my, m.size);
          g.addColorStop(0, `rgba(${ARRIVAL_LIGHT_MOTE[0]},${ARRIVAL_LIGHT_MOTE[1]},${ARRIVAL_LIGHT_MOTE[2]},${a})`);
          g.addColorStop(1, `rgba(${ARRIVAL_LIGHT_MOTE[0]},${ARRIVAL_LIGHT_MOTE[1]},${ARRIVAL_LIGHT_MOTE[2]},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(mx, my, m.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      drawArrivalVessel(ctx, cx, cy, r, start.fill, time, fpRef.current);

      if (arrived && phase === "transition") setPhase("gathering");
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(frame);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [phase, reducedMotion, travelMs]);

  useEffect(() => {
    if (phase !== "gathering" || advancedRef.current) return;
    if (stepsLoading || !stepsReady) return;

    const gatherDoneAt = ARRIVAL_DELAY_MS + travelMs;
    const elapsed = performance.now() - pickTimeRef.current;
    const remaining = Math.max(0, gatherDoneAt - elapsed) + ARRIVAL_GRACE_MS;

    const timer = setTimeout(() => {
      if (advancedRef.current) return;
      advancedRef.current = true;
      onComplete();
    }, remaining);

    return () => clearTimeout(timer);
  }, [phase, stepsLoading, stepsReady, travelMs, onComplete]);

  const elapsed = phase === "idle" ? 0 : performance.now() - t0Ref.current;
  const travelP = phase === "idle" ? 0 : arrivalEaseInOut(arrivalClamp((elapsed - ARRIVAL_DELAY_MS) / travelMs));
  const captionA = arrivalClamp((travelP - 0.8) / 0.2);

  return (
    <div
      ref={frameRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        fontFamily: "Inter, -apple-system, sans-serif",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundColor: skyRgb,
          pointerEvents: "none",
        }}
      />
      <style>{`
.arrival-card {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 1px solid;
  border-radius: 20px;
  padding: 8px 16px 8px 6px;
  cursor: pointer;
  font: inherit;
  color: inherit;
  transition: transform 120ms ease;
  -webkit-tap-highlight-color: transparent;
}
.arrival-card:active { transform: scale(0.975); }
`}</style>

      <div style={{
        position: "absolute",
        inset: 0,
        padding: "64px 26px max(40px, env(safe-area-inset-bottom))",
        display: "flex",
        flexDirection: "column",
        pointerEvents: phase === "idle" ? "auto" : "none",
        boxSizing: "border-box",
        zIndex: 1,
        color: primaryRgb,
      }}>
        <h1 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 38,
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          margin: "0 0 32px",
          color: primaryRgb,
          textShadow: skyInk.shadow,
          opacity: phase === "idle" ? 1 : arrivalClamp(1 - elapsed / ARRIVAL_FADE_MS),
          transform: phase === "idle" ? "none" : `translateY(${-6 * arrivalClamp(elapsed / ARRIVAL_FADE_MS)}px)`,
        }}>
          How are you<br />arriving?
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ARRIVAL_CARDS.map((card) => {
            const isChosen = card.id === picked;
            const isSuggested = card.id === suggestedId;
            let opacity = 1;
            let ty = 0;
            if (phase !== "idle") {
              if (isChosen) opacity = arrivalClamp(1 - elapsed / (ARRIVAL_FADE_MS * 0.7));
              else {
                opacity = arrivalClamp(1 - elapsed / ARRIVAL_FADE_MS);
                ty = 10 * arrivalClamp(elapsed / ARRIVAL_FADE_MS);
              }
            }
            return (
              <button
                key={card.id}
                type="button"
                className="arrival-card"
                onPointerDown={(e) => onPressVessel(card.id, e)}
                onClick={() => onPick(card.id)}
                style={{
                  opacity,
                  transform: `translateY(${ty}px)`,
                  background: cardBg,
                  borderColor: cardBorder(isSuggested),
                  boxShadow: isSuggested
                    ? `0 0 0 1px ${rgbaAction(0.18)}, 0 0 22px ${rgbaAction(0.14)}`
                    : "none",
                }}
              >
                <div
                  ref={(n) => { vesselRefs.current[card.id] = n; }}
                  style={{
                    width: ARRIVAL_VESSEL_BOX,
                    height: ARRIVAL_VESSEL_BOX,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrivalCardVessel
                    size={card.size}
                    fill={card.fill}
                    fp={fp}
                    ripple={ripple && ripple.id === card.id ? ripple : null}
                    hidden={isChosen && phase !== "idle"}
                    reducedMotion={reducedMotion}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
                  <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em", color: primaryRgb, textShadow: skyInk.shadow }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 400, color: rgbaMuted(subAlpha) }}>
                    {card.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 13,
          letterSpacing: "0.01em",
          color: rgbaMuted(footAlpha),
          opacity: phase === "idle" ? 1 : arrivalClamp(1 - elapsed / ARRIVAL_FADE_MS),
        }}>
          One tap begins your session.
        </div>
      </div>

      {(phase === "transition" || phase === "gathering") && (
        <canvas
          ref={overlayRef}
          aria-hidden
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}
        />
      )}

      {(phase === "transition" || phase === "gathering") && (
        <div style={{
          position: "absolute",
          top: GATHER_FIXED_CAPTION_TOP,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 17,
          fontStyle: "italic",
          letterSpacing: "0.01em",
          color: rgbaMuted(onDarkSky ? 0.62 : 0.45),
          opacity: captionA,
          pointerEvents: "none",
          zIndex: 3,
        }}>
          finding where to begin
        </div>
      )}
    </div>
  );
}

// Simplify screen — single misty fog zone per time-of-day band.
const SIMPLIFY_PALETTES = {
  morning: { fog: [183, 182, 168], serif: [42, 36, 56] },
  afternoon: { fog: [160, 147, 174], serif: [245, 240, 248] },
  evening: { fog: [60, 50, 90], serif: [237, 234, 228] },
};

function simplifyPaletteForHour(h = homeFractionalHour()) {
  const lerpPal = (a, b, k) => ({
    fog: homeLerpCol(a.fog, b.fog, k),
    serif: homeLerpCol(a.serif, b.serif, k),
  });
  const M = SIMPLIFY_PALETTES.morning;
  const A = SIMPLIFY_PALETTES.afternoon;
  const E = SIMPLIFY_PALETTES.evening;
  if (h >= 5 && h < 11) return M;
  if (h >= 11 && h < 13) return lerpPal(M, A, (h - 11) / 2);
  if (h >= 13 && h < 17) return A;
  if (h >= 17 && h < 19) return lerpPal(A, E, (h - 17) / 2);
  if (h >= 19 || h < 3) return E;
  return lerpPal(E, M, (h - 3) / 2);
}

function simplifyFogLift(fog, amount = 20) {
  return fog.map((v) => Math.min(255, v + amount));
}

function simplifyTextSize(text) {
  const len = (text || "").length;
  if (len <= 40) return 26;
  if (len <= 70) return 23;
  if (len <= 100) return 20;
  return 18;
}

const SIMPLIFY_DISSOLVE_MS = 1200;
const SIMPLIFY_DRIFT_HZ = 0.15;
const SIMPLIFY_DRIFT_AMP = 0.03;
const SIMPLIFY_SLOW_SPAWN_MS = 300;

function SimplifyScreen({ next, onStillTooMuch, step }) {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const originalRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const particlesRef = useRef([]);
  const startRef = useRef(0);
  const slowSpawnRef = useRef(0);
  const paletteRef = useRef(simplifyPaletteForHour());

  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const originalText = step?.text ?? "";
  const smallerText = step?.tooHard ?? "";
  const palette = simplifyPaletteForHour();
  paletteRef.current = palette;

  const action = homeActionColor();
  const serifRgb = `rgb(${palette.serif[0]}, ${palette.serif[1]}, ${palette.serif[2]})`;
  const serifGhost = `rgba(${palette.serif[0]}, ${palette.serif[1]}, ${palette.serif[2]}, 0.6)`;
  const serifBorder = `rgba(${palette.serif[0]}, ${palette.serif[1]}, ${palette.serif[2]}, 0.15)`;
  const origSize = simplifyTextSize(originalText);
  const newSize = simplifyTextSize(smallerText);

  useEffect(() => {
    particlesRef.current = [];
    slowSpawnRef.current = 0;
    startRef.current = performance.now();

    const container = containerRef.current;
    const particleCanvas = particleCanvasRef.current;
    const originalEl = originalRef.current;
    if (!container || !particleCanvas) return;

    const ctx = particleCanvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resizeParticleCanvas = () => {
      const wrap = originalEl?.parentElement;
      if (!wrap) return;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      particleCanvas.width = Math.max(1, w * DPR);
      particleCanvas.height = Math.max(1, h * DPR);
      particleCanvas.style.width = `${w}px`;
      particleCanvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const spawnFromText = () => {
      if (!originalEl) return;
      const rects = Array.from(originalEl.getClientRects());
      if (!rects.length) return;
      const wrapRect = originalEl.parentElement.getBoundingClientRect();
      const rect = rects[Math.floor(Math.random() * rects.length)];
      const x = rect.left - wrapRect.left + Math.random() * rect.width;
      const y = rect.top - wrapRect.top + Math.random() * rect.height;
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.55,
        vy: -(0.35 + Math.random() * 0.85),
        walk: Math.random() * Math.PI * 2,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        size: 2 + Math.random() * 2,
      });
    };

    let raf = 0;
    let lastNow = startRef.current;
    const tick = (now) => {
      const dt = now - lastNow;
      lastNow = now;
      const elapsed = now - startRef.current;
      const tSec = elapsed / 1000;
      const pal = paletteRef.current;
      const fog = pal.fog;
      const drift = Math.sin(tSec * SIMPLIFY_DRIFT_HZ * Math.PI * 2) * SIMPLIFY_DRIFT_AMP;
      const lum = 1 + drift;
      const drifted = fog.map((v) => Math.min(255, Math.round(v * lum)));
      if (bgRef.current) {
        bgRef.current.style.backgroundColor = `rgb(${drifted[0]}, ${drifted[1]}, ${drifted[2]})`;
      }

      const dissolveK = reducedMotion ? 1 : Math.min(1, elapsed / SIMPLIFY_DISSOLVE_MS);
      const origOpacity = reducedMotion ? 0.25 : 1 - dissolveK * 0.75;
      const origBlur = reducedMotion ? 1.5 : dissolveK * 1.5;
      if (originalEl) {
        originalEl.style.opacity = String(origOpacity);
        originalEl.style.filter = `blur(${origBlur}px)`;
      }

      resizeParticleCanvas();
      const pw = particleCanvas.width / DPR;
      const ph = particleCanvas.height / DPR;
      ctx.clearRect(0, 0, pw, ph);

      if (!reducedMotion) {
        if (elapsed < SIMPLIFY_DISSOLVE_MS) {
          const burst = 2 + Math.floor(dissolveK * 5);
          for (let i = 0; i < burst; i++) spawnFromText();
        } else {
          slowSpawnRef.current += dt;
          if (slowSpawnRef.current >= SIMPLIFY_SLOW_SPAWN_MS) {
            slowSpawnRef.current = 0;
            spawnFromText();
          }
        }
      }

      const lifted = simplifyFogLift(fog);
      const nextParticles = [];
      for (const p of particlesRef.current) {
        p.walk += 0.04;
        p.x += p.vx + Math.sin(p.walk) * 0.25;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) continue;
        nextParticles.push(p);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${lifted[0]},${lifted[1]},${lifted[2]},${p.life * 0.6})`;
        ctx.fill();
      }
      particlesRef.current = nextParticles;

      raf = requestAnimationFrame(tick);
    };

    resizeParticleCanvas();
    if (originalEl) {
      originalEl.style.opacity = reducedMotion ? "0.25" : "1";
      originalEl.style.filter = reducedMotion ? "blur(1.5px)" : "blur(0px)";
    }
    raf = requestAnimationFrame(tick);

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resizeParticleCanvas) : null;
    ro?.observe(container);
    window.addEventListener("resize", resizeParticleCanvas);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", resizeParticleCanvas);
    };
  }, [originalText, reducedMotion]);

  const shadowRest = `0 4px 16px rgba(${action[0]},${action[1]},${action[2]},0.35)`;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        ref={bgRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: `rgb(${palette.fog[0]}, ${palette.fog[1]}, ${palette.fog[2]})`,
        }}
      />

      <div style={{
        position: "relative",
        zIndex: 1,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "26px 28px max(32px, env(safe-area-inset-bottom))",
        boxSizing: "border-box",
        minHeight: 0,
      }}>
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: GATHER_CANVAS_W,
          margin: "0 auto",
          minHeight: 0,
        }}>
          <div style={{ position: "relative", width: "100%" }}>
            <p
              ref={originalRef}
              style={{
                margin: 0,
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: origSize,
                lineHeight: 1.35,
                fontWeight: 400,
                textAlign: "center",
                color: serifRgb,
                overflowWrap: "break-word",
              }}
            >
              {originalText}
            </p>
            <canvas
              ref={particleCanvasRef}
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                pointerEvents: "none",
              }}
            />
          </div>

          <div style={{ height: 40, flexShrink: 0 }} aria-hidden />

          <p style={{
            margin: 0,
            width: "100%",
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: newSize,
            lineHeight: 1.35,
            fontWeight: 400,
            textAlign: "center",
            color: serifRgb,
            overflowWrap: "break-word",
          }}>
            {smallerText}
          </p>
        </div>

        <div style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: GATHER_CANVAS_W,
          margin: "0 auto",
        }}>
          <button
            type="button"
            onClick={next}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 999,
              padding: "17px 20px",
              lineHeight: 1.4,
              fontFamily: "Inter, sans-serif",
              fontSize: 16.5,
              fontWeight: 700,
              cursor: "pointer",
              color: C.neutral50,
              background: `rgb(${action[0]}, ${action[1]}, ${action[2]})`,
              boxShadow: shadowRest,
            }}
          >
            Use this one
          </button>
          <button
            type="button"
            onClick={onStillTooMuch || next}
            style={{
              width: "100%",
              background: "transparent",
              border: `1px solid ${serifBorder}`,
              borderRadius: 999,
              padding: "14px 16px",
              lineHeight: 1.4,
              fontFamily: "Inter, sans-serif",
              fontSize: 15.5,
              fontWeight: 600,
              cursor: "pointer",
              color: serifGhost,
            }}
          >
            Smaller still
          </button>
        </div>
      </div>
    </div>
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
  const entries = Array.isArray(history) ? history : [];
  const sorted = [...entries].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
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
        {entries.length === 0 ? (
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
  if (!Array.isArray(c1) || !Array.isArray(c2)) return c1;
  return c1.map((v, i) => Math.round(homeLerp(v, c2[i], k)));
}

// Two-band palettes (sky / ocean). Action color drives all primary buttons
// and accent links; card tint is a deeper version of the ocean color.
const HOME_PALETTES = {
  morning: {
    sky: [255, 219, 200],
    ocean: [110, 145, 135],
    serif: [42, 36, 56],
    muted: [110, 100, 130],
    action: [220, 110, 90],
    card: [60, 90, 80, 0.14],
    starOpacity: 0,
  },
  afternoon: {
    sky: [232, 222, 210],
    ocean: [88, 72, 138],
    serif: [42, 38, 64],
    muted: [120, 110, 142],
    action: [195, 145, 170],
    card: [50, 35, 90, 0.14],
    starOpacity: 0,
  },
  evening: {
    sky: [40, 32, 72],
    ocean: [15, 12, 30],
    serif: [237, 234, 228],
    muted: [160, 152, 188],
    action: [124, 111, 205],
    card: [15, 12, 30, 0.40],
    starOpacity: 0.45,
  },
};

// Relative luminance (sRGB) used to keep sky-zone text readable across
// time-of-day transitions, where the background passes through mid tones.
function homeRelLuminance(c) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}

const HOME_DARK_INK = [42, 38, 60];
const HOME_LIGHT_INK = [240, 237, 231];
const HOME_DARK_MUTED = [96, 88, 116];
const HOME_LIGHT_MUTED = [190, 184, 205];

// Pick a fully dark or fully light ink for the sky-zone copy based on the
// sky luminance — never a mid-grey — plus an opposite-tone shadow so the
// brief transition windows stay legible.
function homeSkyInk(palette) {
  const light = homeRelLuminance(palette.sky) < 0.2;
  return {
    ink: light ? HOME_LIGHT_INK : HOME_DARK_INK,
    muted: light ? HOME_LIGHT_MUTED : HOME_DARK_MUTED,
    shadow: light ? "0 1px 14px rgba(0,0,0,0.40)" : "0 1px 10px rgba(255,255,255,0.20)",
  };
}

// Ocean-half resume card: pick ink from ocean luminance and a frosted surface
// that reads clearly against the bottom band (not the sky serif tokens).
function homeOceanInk(palette) {
  const light = homeRelLuminance(palette.ocean) < 0.18;
  return {
    ink: light ? HOME_LIGHT_INK : HOME_DARK_INK,
    muted: light ? HOME_LIGHT_MUTED : HOME_DARK_MUTED,
    shadow: light ? "0 1px 14px rgba(0,0,0,0.40)" : "0 1px 10px rgba(255,255,255,0.20)",
  };
}

function homeResumeCardStyle(palette) {
  const oceanInk = homeOceanInk(palette);
  const onDarkOcean = homeRelLuminance(palette.ocean) < 0.18;
  const rgbaInk = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
  const rgbInk = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  const action = (a) => rgbaInk(palette.action, a);

  if (onDarkOcean) {
    return {
      background: "rgba(255, 248, 245, 0.18)",
      borderColor: "rgba(255, 248, 245, 0.30)",
      label: rgbaInk(oceanInk.muted, 0.88),
      meta: rgbaInk(oceanInk.muted, 0.76),
      body: rgbInk(oceanInk.ink),
      note: rgbaInk(oceanInk.muted, 0.68),
      progress: action(0.92),
      link: action(0.95),
      textShadow: oceanInk.shadow,
    };
  }

  return {
    background: "rgba(255, 252, 248, 0.58)",
    borderColor: "rgba(42, 36, 56, 0.14)",
    label: rgbaInk(oceanInk.muted, 0.92),
    meta: rgbaInk(oceanInk.ink, 0.72),
    body: rgbInk(oceanInk.ink),
    note: rgbaInk(oceanInk.muted, 0.78),
    progress: action(0.88),
    link: action(0.9),
    textShadow: oceanInk.shadow,
  };
}

function homePaletteForHour(h = homeFractionalHour()) {
  const lerp4 = (a, b, k) => [
    Math.round(homeLerp(a[0], b[0], k)),
    Math.round(homeLerp(a[1], b[1], k)),
    Math.round(homeLerp(a[2], b[2], k)),
    homeLerp(a[3], b[3], k),
  ];
  const lerpPal = (a, b, k) => ({
    sky: homeLerpCol(a.sky, b.sky, k),
    ocean: homeLerpCol(a.ocean, b.ocean, k),
    serif: homeLerpCol(a.serif, b.serif, k),
    muted: homeLerpCol(a.muted, b.muted, k),
    action: homeLerpCol(a.action, b.action, k),
    card: lerp4(a.card, b.card, k),
    starOpacity: homeLerp(a.starOpacity, b.starOpacity, k),
  });

  if (h >= 5 && h < 11) return HOME_PALETTES.morning;
  if (h >= 11 && h < 13) return lerpPal(HOME_PALETTES.morning, HOME_PALETTES.afternoon, (h - 11) / 2);
  if (h >= 13 && h < 17) return HOME_PALETTES.afternoon;
  if (h >= 17 && h < 19) return lerpPal(HOME_PALETTES.afternoon, HOME_PALETTES.evening, (h - 17) / 2);
  if (h >= 19 || h < 3) return HOME_PALETTES.evening;
  return lerpPal(HOME_PALETTES.evening, HOME_PALETTES.morning, (h - 3) / 2);
}

// Current time-of-day action color, used by primary buttons app-wide.
function homeActionColor(date = new Date()) {
  return homePaletteForHour(homeFractionalHour(date)).action;
}

function homeFractionalHour(date = new Date()) {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

function homeGreeting(returning, reason) {
  if (reason === "paused") return { hint: "You were in the middle of something.", line1: "Welcome back.", line2: "What now?" };
  if (reason === "exit") return { hint: "That's okay.", line1: "Welcome back.", line2: "What now?" };
  if (reason === "done") return { hint: "Well done.", line1: "Welcome back.", line2: "What now?" };
  if (returning) return { hint: null, line1: "Welcome back.", line2: "What now?" };
  return { hint: null, line1: "What would you like", line2: "to work on?" };
}

function HomeScreen({ onResume, onContinueSession, inProgressSession, tasks, setTasks, onHistory, reason, pausedCard }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const draftRef = useRef(null);
  const paletteRef = useRef(homePaletteForHour(homeFractionalHour()));
  const [draft, setDraft] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
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

    const draw = (now) => {
      if (W <= 0 || H <= 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const pal = paletteRef.current;
      const t = (now - startTime) / 1000;

      // Static two-band gradient: solid sky (0–50%), soft blend (50–70%),
      // solid ocean (70–100%). No drift, no horizon glow.
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, rgb(pal.sky));
      grad.addColorStop(0.5, rgb(pal.sky));
      grad.addColorStop(0.7, rgb(pal.ocean));
      grad.addColorStop(1, rgb(pal.ocean));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Stars only in the sky band (upper 50%), evening only.
      if (pal.starOpacity > 0) {
        for (const s of stars) {
          if (s.yRatio >= 0.5) continue;
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
  }, []);

  useEffect(() => {
    paletteRef.current = palette;
  }, [palette]);

  const onDraftInput = (value) => {
    setDraft(value);
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
  const skyInk = homeSkyInk(palette);
  const resumeCard = homeResumeCardStyle(palette);

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
          flex: "0 0 50%",
          maxHeight: "50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "stretch",
          boxSizing: "border-box",
          minHeight: 0,
        }}>
          <div style={{ width: "100%" }}>
            {greeting.hint ? (
              <div
                className="home-rise"
                style={{
                  margin: "0 0 8px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: rgba(skyInk.muted, 0.9),
                  textShadow: skyInk.shadow,
                  opacity: 0,
                  animation: "homeRise 800ms 120ms cubic-bezier(.3,.9,.4,1) forwards",
                }}
              >
                {greeting.hint}
              </div>
            ) : null}
            <h1 style={{
              margin: 0,
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontWeight: 400,
              fontSize: 38,
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              color: rgb(skyInk.ink),
              textShadow: skyInk.shadow,
            }}>
              <span className="home-rise home-line1">{greeting.line1}</span>
              <br />
              <span className="home-rise home-line2">{greeting.line2}</span>
            </h1>

            <div style={{
              marginTop: 20,
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
                      ? rgb(palette.action)
                      : rgba(skyInk.ink, 0.32),
                  }}
                />
                <input
                  type="text"
                  readOnly
                  value={t}
                  onClick={() => setSelectedIndex(i)}
                  className="home-task-input"
                  style={{
                    color: rgb(skyInk.ink),
                    textShadow: skyInk.shadow,
                    borderColor: rgba(skyInk.ink, selectedIndex === i ? 0.45 : 0.2),
                    opacity: selectedIndex === i ? 1 : 0.88,
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
                    color: rgba(skyInk.muted, 0.8),
                    textShadow: skyInk.shadow,
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
                background: rgba(skyInk.ink, 0.2),
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
                  color: rgb(skyInk.ink),
                  textShadow: skyInk.shadow,
                  borderColor: rgba(skyInk.ink, 0.28),
                }}
              />
              {draft.trim() ? (
                <button
                  type="button"
                  className="home-add-btn"
                  onClick={addTask}
                  style={{ color: rgba(palette.action, 0.75) }}
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
              background: rgb(palette.action),
              boxShadow: `0 6px 24px ${rgba(palette.action, canStart ? 0.42 : 0.18)}`,
              opacity: canStart ? 1 : 0.45,
              cursor: canStart ? "pointer" : "default",
            }}
          >
            I'm ready
          </button>
          </div>
        </div>

        <div style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}>
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: 0,
          }}>
        {pausedCard ? (
          <div
            className="home-resume-card home-rise home-resume"
            style={{
              marginTop: 0,
              flexShrink: 0,
              background: resumeCard.background,
              borderColor: resumeCard.borderColor,
            }}
          >
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: resumeCard.label,
                textShadow: resumeCard.textShadow,
              }}>
                You were here
              </div>
              {pausedCard.task ? (
                <div style={{
                  margin: "8px 0 0",
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: resumeCard.meta,
                  textShadow: resumeCard.textShadow,
                }}>
                  {pausedCard.task}
                </div>
              ) : null}
              {pausedCard.pauseProgress ? (
                <div style={{
                  margin: "4px 0 0",
                  fontSize: 12.5,
                  fontWeight: 500,
                  lineHeight: 1.35,
                  color: resumeCard.progress,
                  textShadow: resumeCard.textShadow,
                }}>
                  {pausedCard.pauseProgress}
                </div>
              ) : null}
              <div style={{
                margin: pausedCard.note ? "10px 0 6px" : "10px 0 14px",
                fontSize: 15.5,
                fontWeight: 500,
                lineHeight: 1.35,
                color: resumeCard.body,
                textShadow: resumeCard.textShadow,
              }}>
                {pausedCard.step?.text || "Your step is loading…"}
              </div>
              {pausedCard.note ? (
                <div style={{
                  margin: "0 0 14px",
                  fontSize: 13,
                  fontWeight: 400,
                  fontStyle: "italic",
                  lineHeight: 1.5,
                  color: resumeCard.note,
                  textShadow: resumeCard.textShadow,
                }}>
                  {pausedCard.note}
                </div>
              ) : null}
              <button
                type="button"
                className="home-resume-btn"
                onClick={onContinueSession}
                style={{ color: resumeCard.link, textShadow: resumeCard.textShadow }}
              >
                Continue where you left off ›
              </button>
            </div>
          ) : inProgressSession ? (
            <div
              className="home-resume-card home-rise home-resume"
              style={{
                marginTop: 0,
                flexShrink: 0,
                background: resumeCard.background,
                borderColor: resumeCard.borderColor,
              }}
            >
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: resumeCard.label,
                textShadow: resumeCard.textShadow,
              }}>
                Where you left off
              </div>
              <div style={{
                margin: "8px 0 14px",
                fontSize: 15.5,
                fontWeight: 500,
                lineHeight: 1.35,
                color: resumeCard.body,
                textShadow: resumeCard.textShadow,
              }}>
                {inProgressSession.step?.text || "Your step is loading…"}
              </div>
              <button
                type="button"
                className="home-resume-btn"
                onClick={onContinueSession}
                style={{ color: resumeCard.link, textShadow: resumeCard.textShadow }}
              >
                Continue ›
              </button>
            </div>
          ) : null}
          </div>

        <button
          type="button"
          className="home-history-link home-rise home-history"
          onClick={onHistory}
          style={{
            color: rgba(palette.action, 0.55),
            marginTop: (pausedCard || inProgressSession) ? 16 : "auto",
            flexShrink: 0,
          }}
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

// Solid RGB targets for the cross-screen shell backdrop (always interpolatable).
const SHELL_BG_DARK = [26, 24, 40];
const SHELL_BG_LIGHT = [247, 246, 242];
const SHELL_BG_DONE_LIGHT = [240, 238, 245];

function homeShellBlendRgb(palette) {
  return palette.sky.map((v, i) => Math.round(v * 0.38 + palette.ocean[i] * 0.62));
}

function shellBgRgb(screen, focusPalette, isDark) {
  if (screen === "home" || screen === "return_paused") {
    return homeShellBlendRgb(homePaletteForHour());
  }
  if (screen === "arrival" || screen === "suggestion") {
    return homePaletteForHour().sky;
  }
  if (screen === "simplify") {
    return simplifyPaletteForHour().fog;
  }
  if (screen === "session_complete" || screen === "inprogress") {
    return focusPalette.bg;
  }
  if (screen === "done") {
    return isDark ? SHELL_BG_DARK : SHELL_BG_DONE_LIGHT;
  }
  return isDark ? SHELL_BG_DARK : SHELL_BG_LIGHT;
}

function shellBgCss(rgb) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

const SESSION_COMPLETE_HALO_R = GATHER_CIRCLE_R + 52;
// Resting opacity of the step text that sits inside the rising water.
const SC_STEP_TEXT_ALPHA = 0.85;

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

function SessionCompleteScreen({ stepCount, sessionSteps, fallbackSteps, focusPalette, onClose }) {
  const canvasRef = useRef(null);
  const captionOverlayRef = useRef(null);
  const stepCountRef = useRef(stepCount);
  const sessionStepsRef = useRef(sessionSteps);
  const fallbackStepsRef = useRef(fallbackSteps);
  const fp = focusPalette || focusPaletteForHour();
  const fpRef = useRef(fp);
  fpRef.current = fp;
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
      el.textContent = text;
      const { fontSize, lineHeight } = sessionCompleteCaptionStyle(text);
      el.style.fontSize = `${fontSize}px`;
      el.style.lineHeight = String(lineHeight);
      el.style.opacity = String(alpha * vesselAlpha * SC_STEP_TEXT_ALPHA);
      el.style.visibility = "visible";
      if (color) {
        el.style.color = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        const lum = (color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114) / 255;
        el.style.textShadow = lum > 0.5
          ? "0 1px 10px rgba(15, 13, 30, 0.45)"
          : "0 1px 8px rgba(255, 255, 255, 0.3)";
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
          captionStepColor = fpRef.current.scInk;
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
            captionStepColor = fpRef.current.scInk;
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
      const haloColor = fpRef.current.bloom;
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

        const fpc = fpRef.current;
        const rimCol = fpc.ring;

        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rimCol[0]},${rimCol[1]},${rimCol[2]},${0.4 + level * 0.45})`;
        ctx.lineWidth = 1.8 + level * 0.6;
        ctx.stroke();

        // Vessel disc — opaque inner dome gradient (center → edge); water fills on top.
        const dome = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
        dome.addColorStop(0, `rgb(${fpc.scDomeCenter[0]},${fpc.scDomeCenter[1]},${fpc.scDomeCenter[2]})`);
        dome.addColorStop(1, `rgb(${fpc.disc[0]},${fpc.disc[1]},${fpc.disc[2]})`);
        ctx.beginPath();
        ctx.arc(0, 0, R - 1, 0, Math.PI * 2);
        ctx.fillStyle = dome;
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R - 1, 0, Math.PI * 2);
        ctx.clip();

        const waterCol = fpRef.current.scWater;
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
        depthGrad.addColorStop(0, `rgb(${lightMint[0]},${lightMint[1]},${lightMint[2]})`);
        depthGrad.addColorStop(1, `rgb(${deepMint[0]},${deepMint[1]},${deepMint[2]})`);

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

  const ink = fp.scInk;
  const inkRgb = `rgb(${ink[0]}, ${ink[1]}, ${ink[2]})`;
  const eyebrowColor = `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, 0.55)`;
  const headlineColor = inkRgb;
  const timestampColor = `rgba(${fp.bloom[0]}, ${fp.bloom[1]}, ${fp.bloom[2]}, 0.7)`;
  const closeBorder = `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, 0.25)`;
  const closeColor = `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, 0.6)`;

  return (
    <>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: `rgb(${fp.bg[0]}, ${fp.bg[1]}, ${fp.bg[2]})`,
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
                color: inkRgb,
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

// Paused "welcome back" screen — reuses the redesigned home landscape with a
// palette-aware "You were here" card to resume the paused session.
function ReturnPausedScreen({ next, onPickTask, step, task, note, pauseProgress, tasks, setTasks, onHistory }) {
  return (
    <HomeScreen
      reason="paused"
      inProgressSession={null}
      onContinueSession={next}
      onResume={onPickTask}
      tasks={tasks}
      setTasks={setTasks}
      onHistory={onHistory}
      pausedCard={{ task, step, note, pauseProgress }}
    />
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
      completedSteps: (() => {
        try {
          const parsed = JSON.parse(localStorage.getItem("nudge_completed_steps"));
          return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
      })(),
      granularity: localStorage.getItem("nudge_granularity") || "balanced",
      completedHistory: (() => {
        if (!historyRaw) return [];
        try {
          const parsed = JSON.parse(historyRaw);
          return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
      })(),
      pausedStep: step ? JSON.parse(step) : null,
      pausedTaskName: taskName ? JSON.parse(taskName) : "",
      pausedNote: note ? JSON.parse(note) : "",
      pausedProgress: progress ? JSON.parse(progress) : "",
      inProgressSession,
      arrivalChoiceId: localStorage.getItem("nudge_arrival_choice") || "",
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
      arrivalChoiceId: "",
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
  const [breakdownEnabled, setBreakdownEnabled] = useState(true);
  const [arrivalChoiceId, setArrivalChoiceId] = useState("");
  // Time-of-day focus palette, locked when a focus session starts.
  const [focusPalette, setFocusPalette] = useState(() => focusPaletteForHour());

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
    setArrivalChoiceId(saved.arrivalChoiceId || "");
    setBreakdownEnabled(saved.screen !== "arrival");
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
  const { steps, loading: stepsLoading, stepsTask } = useTaskBreakdown(task, defaultEnergy, defaultTime, granularity, breakdownEnabled);
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

  const enterInProgress = ({ fromDescent = false, lockedFocusPalette = null } = {}) => {
    if (stepsBusy || !currentStep?.text) return;
    pinnedInProgressStep.current = currentStep;
    activeCompletionTask.current = task;
    setFocusPalette(lockedFocusPalette || focusPaletteForHour());
    if (fromDescent) {
      setGatherPhase("focus");
      setGatherEntryMode("fromDescent");
    } else {
      setGatherPhase("loading");
      setGatherEntryMode("normal");
    }
    go("inprogress");
  };

  const handleStartDescent = (payload) => {
    if (stepsBusy || !currentStep?.text) return;
    setDescent(payload);
  };

  const handleDescentComplete = (lockedFocusPalette) => {
    setDescent(null);
    enterInProgress({ fromDescent: true, lockedFocusPalette });
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
    setBreakdownEnabled(true);
    go("suggestion");
  };

  const beginArrival = (picked) => {
    clearInProgressSession();
    activeCompletionTask.current = picked;
    const wasPrimary = picked === tasks[0];
    setTasks([picked, ...tasks.filter(x => x !== picked)]);
    if (!wasPrimary) setStepIndex(0);
    setBreakdownEnabled(false);
    go("arrival");
  };

  const handleArrivalChoose = ({ id, energy, timeAvailable }) => {
    setDefaultEnergy(energy);
    setDefaultTime(timeAvailable);
    setArrivalChoiceId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("nudge_arrival_choice", id);
    }
    setBreakdownEnabled(true);
  };

  const completeArrival = () => {
    setBreakdownEnabled(true);
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
  const [gatherEntryMode, setGatherEntryMode] = useState("normal");
  const [shellBgOverride, setShellBgOverride] = useState(null);
  const [descent, setDescent] = useState(null);
  const resourceLink = stepLinks[stepIndex] || inProgressStep?.link || currentStep?.link || "";

  useEffect(() => {
    if (screen !== "inprogress") setGatherPhase("loading");
  }, [screen]);

  useEffect(() => {
    if (screen !== "inprogress") setGatherEntryMode("normal");
    if (screen !== "suggestion" && !descent) setShellBgOverride(null);
  }, [screen, descent]);

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
    } else { setIsLastStep(next >= taskSteps.length - 1); setStepIndex(next); if (c === 2) go("pattern"); /* else: stay on the in-progress step-complete resting state; its buttons drive the next move */ }
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
    ready: <ReadyScreen next={() => { setBreakdownEnabled(true); go("suggestion"); }} back={() => go("setup")} setGranularity={setGranularity} />,
    arrival: <ArrivalScreen
      stepsLoading={stepsLoading}
      stepsReady={stepsMatchTask && taskSteps.length > 0}
      lastChoiceId={arrivalChoiceId}
      onChoose={handleArrivalChoose}
      onComplete={completeArrival}
    />,
    suggestion: <SuggestionScreen onStartDescent={handleStartDescent} isDescentActive={!!descent} onTooHard={() => { if (!stepsBusy && currentStep) go("simplify"); }} onAnother={() => go("allsteps")} onSkip={() => setStepIndex(i => (taskSteps.length ? (i + 1) % taskSteps.length : 0))} onExit={() => goHome("exit")} task={task} stepIndex={stepIndex} steps={taskSteps} energy={defaultEnergy} loading={stepsBusy} deferredNote={deferredNote} onDismissDeferNote={() => setDeferredNote("")} sessionStepCount={sessionStepCount} />,
    allsteps: <AllStepsScreen back={() => go("suggestion")} steps={taskSteps} task={task} stepIndex={stepIndex} onPick={i => { setStepIndex(i); go("suggestion"); }} loading={stepsBusy} stepLinks={stepLinks} onSetStepLink={(i, url) => setStepLinks(p => ({ ...p, [i]: url }))} />,
    inprogress: <InProgressScreen gatherPhase={gatherPhase} onGatherPhaseChange={setGatherPhase} step={inProgressStep} resourceLink={resourceLink} stepsLoading={stepsBusy && !pinnedInProgressStep.current} onDone={handleDone} onPause={() => { setPausedStep(inProgressStep); go("pause"); }} onTooMuch={() => go("simplify")} onDefer={(note) => { setDeferredNote(note); go("suggestion"); }} onMore={() => go("suggestion")} onDoneForNow={openSessionComplete} focusPalette={focusPalette} skipGatherIntro={gatherEntryMode === "fromDescent"} />,
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
      onResume={beginArrival}
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
      focusPalette={focusPalette}
      onClose={finishSessionComplete}
    />,
    return_paused: <ReturnPausedScreen
      next={enterInProgress}
      onPickTask={(t) => { clearInProgressSession(); setTasks([t, ...tasks.filter(x => x !== t)]); setStepIndex(0); go("suggestion"); }}
      tasks={tasks}
      setTasks={setTasks}
      onHistory={() => go("history")}
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

  const isHome = screen === "home" || screen === "return_paused" || screen === "simplify" || screen === "arrival" || screen === "suggestion";
  const shellBg = shellBgCss(shellBgOverride ?? shellBgRgb(screen, focusPalette, isDark));
  const shellBgInstant = !!shellBgOverride || !!descent;

  return (
    <IsDarkContext.Provider value={isDark}>
    <div
      aria-hidden
      className="nudge-shell-backdrop"
      style={{
        backgroundColor: shellBg,
        transition: shellBgInstant ? "none" : undefined,
      }}
    />
    <div style={{
      flex: 1,
      minHeight: "100vh",
      width: "100%",
      maxWidth: "100%",
      display: "flex",
      flexDirection: "column",
      background: "transparent",
      fontFamily: "Inter, sans-serif",
      position: "relative",
      zIndex: 1,
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
  background: ${shellBg};
}
#__next {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: transparent;
}
.nudge-shell-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  transition: background-color 720ms cubic-bezier(0.42, 0, 0.18, 1);
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
  line-height: 1.4;
  font-weight: 700;
  box-shadow: 0 6px 24px rgba(124,111,205,0.42);
  transition: transform 150ms ease, background 150ms ease, opacity 250ms ease;
}
.home-primary-btn:hover:not(:disabled) { background: #6F61C4; transform: translateY(-1px); }
.home-primary-btn:active:not(:disabled) { transform: scale(0.99); }
.home-primary-btn:disabled { box-shadow: 0 6px 24px rgba(124,111,205,0.18); }
.home-resume-card {
  margin-top: 0;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
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
  .nudge-shell-backdrop { transition: none !important; }
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
        position: "relative",
      }}>
        {screens[screen] || screens.splash}
      </div>
      {descent ? (
        <DescentOverlay
          descent={descent}
          onComplete={handleDescentComplete}
          onShellBg={setShellBgOverride}
          isDark={isDark}
        />
      ) : null}
    </div>
    </IsDarkContext.Provider>
  );
}
