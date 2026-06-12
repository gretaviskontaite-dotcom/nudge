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
  const cache = useRef({});

  useEffect(() => {
    if (!task) {
      setLoading(false);
      return;
    }
    const key = `${task}__${energy}__${timeAvailable}__${granularity}`;
    if (cache.current[key]) {
      setSteps(cache.current[key]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSteps([]);

    fetchTaskSteps(task, energy, timeAvailable, granularity)
      .then(result => {
        cache.current[key] = result;
        setSteps(result);
        setLoading(false);
      })
      .catch(err => {
        console.error("AI step generation failed:", err);
        setError(err.message);
        setSteps(FALLBACK_STEPS);
        setLoading(false);
      });
  }, [task, energy, timeAvailable, granularity]);

  return { steps, loading, error };
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

function LoadingStepCard() {
  const line = (extra = {}) => (
    <div style={{
      height: 14, borderRadius: 7, background: C.neutral200,
      animation: "ghostPulse 1.4s ease-in-out infinite",
      ...extra,
    }} />
  );
  return (
    <Card style={{ marginBottom: 28 }}>
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

function SuggestionScreen({ next, onTooHard, onAnother, onSkip, onExit, task, stepIndex, steps, energy, loading, deferredNote, onDismissDeferNote }) {
  const isDark = useContext(IsDarkContext);
  const step = steps[stepIndex] || steps[0];
  const total = steps.length || 1;
  const pct = loading ? 0 : ((stepIndex + 1) / total) * 100;
  const taskLabel = task.length > 18 ? task.slice(0, 16) + "…" : task.toUpperCase();
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
        {loading ? (
          <LoadingStepCard />
        ) : (
          <Card style={{
            marginBottom: 28,
            background: isDark ? "#2D2A45" : "linear-gradient(145deg, #FDFCF9 0%, #F5F0FF 60%, #FDF8F0 100%)",
            transition: "background 0.8s ease",
            boxShadow: "0 2px 8px rgba(100,90,180,0.08), 0 16px 48px rgba(100,90,180,0.08)",
            border: isDark ? "1px solid rgba(124,111,205,0.2)" : "1px solid rgba(124,111,205,0.12)",
          }}>
            {/* Tags row */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
              <span style={{ ...T.label, color: C.accent500 }}>{taskLabel}</span>
              <span style={{ color: C.accent200 }}>•</span>
              <span style={{ ...T.label, color: C.accent500 }}>{step.mins} MIN</span>
              <span style={{ color: C.accent200 }}>•</span>
              <span style={{ ...T.label, color: C.accent500 }}>{energy.toUpperCase()} ENERGY</span>
            </div>

            <div style={{ ...T.subtitle, color: "var(--n9)", fontWeight: 700, marginBottom: 20 }}>{step.text}</div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {step.tags.map((t, i) => <Tag key={t} label={t} green={i === 1 || t === "no prep needed"} />)}
            </div>
          </Card>
        )}

        {/* Progress bar + step counter */}
        {!loading && (
          <>
            <div style={{ marginBottom: 6 }}>
              <div style={{ height: 4, borderRadius: 4, background: C.neutral200, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: C.accent500, borderRadius: 4, transition: "width 0.4s ease" }} />
              </div>
            </div>
            <div style={{ ...T.hint, fontSize: 14, textAlign: "right", marginBottom: 28 }}>
              step {stepIndex + 1} of {total}
            </div>
          </>
        )}

        {loading && (
          <div style={{ ...T.hint, textAlign: "center", marginBottom: 28 }}>Finding your first step…</div>
        )}

        {/* See all steps */}
        <button onClick={onAnother} disabled={loading} style={{
          background: "none", border: "none", color: loading ? C.neutral300 : C.accent500,
          ...T.hint, fontSize: 14, cursor: loading ? "default" : "pointer",
          fontFamily: "Inter", textDecoration: loading ? "none" : "underline",
          marginBottom: 24, padding: 0, display: "flex", alignItems: "center",
          justifyContent: "center", gap: 6, width: "100%",
          opacity: loading ? 0.5 : 1,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="12" height="3" rx="1" fill={loading ? C.neutral300 : C.accent500} fillOpacity="0.4"/>
            <rect x="1" y="5.5" width="12" height="3" rx="1" fill={loading ? C.neutral300 : C.accent500} fillOpacity="0.7"/>
            <rect x="1" y="10" width="12" height="3" rx="1" fill={loading ? C.neutral300 : C.accent500}/>
          </svg>
          see all steps
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <BtnPrimary onClick={loading ? undefined : next} disabled={loading}>I can do that</BtnPrimary>
          <div style={{ display: "flex", gap: 10 }}>
            <BtnAccent onClick={loading ? undefined : onTooHard}>Too hard</BtnAccent>
            <BtnAccent onClick={loading ? undefined : onAnother}>Another</BtnAccent>
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
const GATHER_CIRCLE_CY = GATHER_CANVAS_H / 2;
const GATHER_CIRCLE_R = 130;
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
      completeGlowInner: 0.12,
      completeGlowMid: 0.04,
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

function GatherBloomCircle({ sessionId, stepText, loading, onComplete, resourceLink }) {
  const isDark = useContext(IsDarkContext);
  const theme = getGatherTheme(isDark);
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const displayText = stepText || "Your step is loading…";
  const [phase, setPhase] = useState("loading");
  const [runId, setRunId] = useState(0);
  const canvasRef = useRef(null);
  const phaseRef = useRef("loading");
  const phaseStart = useRef(performance.now());
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

  loadingRef.current = loading;
  stepTextRef.current = stepText;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (window.matchMedia) {
      reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }, []);

  const resetGatherAnimation = useCallback(() => {
    setPhase("loading");
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
        tx: W / 2 + Math.cos(targetAngle) * GATHER_CIRCLE_R,
        ty: H / 2 + Math.sin(targetAngle) * GATHER_CIRCLE_R,
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
    const cx = GATHER_CANVAS_W / 2, cy = GATHER_CIRCLE_CY, R = GATHER_CIRCLE_R + 4;
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
    const cx = W / 2, cy = GATHER_CIRCLE_CY;
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
            setPhase("complete");
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
      const haloR = R + 52;
      const halo = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, haloR);
      halo.addColorStop(0, `rgba(${cr},${cg},${cb},${(a.haloBase + breathe * a.haloBreathe + hv * a.haloHold) * haloGate})`);
      halo.addColorStop(0.55, `rgba(${cr},${cg},${cb},${a.haloMid * haloGate})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

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
          setPhase("focus");
        }
      } else if (ph !== "loading") {
        circleAlpha.current = lerp(circleAlpha.current, 1, 0.08);
      }
      const ca = circleAlpha.current;

      if (ca > 0.02) {
        if (ph === "complete" && th.interior) {
          const [ir, ig, ib] = th.interior;
          const [mr, mg, mb] = th.mint;
          const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
          fg.addColorStop(0, `rgba(${mr},${mg},${mb},${a.completeGlowInner * ca})`);
          fg.addColorStop(0.38, `rgba(${mr},${mg},${mb},${a.completeGlowMid * ca})`);
          fg.addColorStop(0.62, `rgba(${ir},${ig},${ib},${0.55 * ca})`);
          fg.addColorStop(0.88, `rgba(${ir},${ig},${ib},${0.92 * ca})`);
          fg.addColorStop(1, `rgba(${ir},${ig},${ib},${0.96 * ca})`);
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI * 2);
          ctx.fillStyle = fg;
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

function InProgressScreen({ onDone, onPause, onTooMuch, onDefer, step, resourceLink, stepsLoading }) {
  const isDark = useContext(IsDarkContext);
  const [showDeferInput, setShowDeferInput] = useState(false);
  const [deferDraft, setDeferDraft] = useState("");
  const [gatherSessionId] = useState(() => Math.random());

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Label style={{ margin: 0 }}>In Progress</Label>
        <button onClick={onPause} style={{
          background: "none", border: "none", color: C.neutral500,
          ...T.small, fontWeight: 600, cursor: "pointer", fontFamily: "Inter",
          display: "flex", alignItems: "center", gap: 6,
        }}>‖ Pause</button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, width: "100%" }}>
        <div style={{ flex: 1, minHeight: 0 }} />
        <div style={{ width: "100%", flexShrink: 0, display: "flex", justifyContent: "center" }}>
          <GatherBloomCircle
            sessionId={gatherSessionId}
            stepText={step?.text}
            loading={stepsLoading}
            onComplete={onDone}
            resourceLink={resourceLink}
          />
        </div>
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          width: "100%",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              ...T.small, color: C.accent500, fontWeight: 600, marginBottom: 6,
            }}>
              Take your time. No rush.
            </div>
            <div style={{ ...T.hint }}>Focus on just this one thing.</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
    </>
  );
}

function SimplifyScreen({ next, onStillTooMuch, step }) {
  const isDark = useContext(IsDarkContext);
  return (
    <>
      <Label color={C.warning500}>Let's Simplify</Label>
      <div style={{ ...T.heading, color: "var(--n9)", marginBottom: 8 }}>That one felt like too much?</div>
      <div style={{ ...T.small, color: "var(--n7)", marginBottom: 0 }}>No problem. Here's something smaller.</div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
        {/* Original — struck through */}
        <Card style={{ background: isDark ? "#3A2D1A" : C.warning100, marginBottom: 16 }}>
          <div style={{ ...T.label, color: C.warning500, marginBottom: 10 }}>Original</div>
          <div style={{ ...T.small, color: "var(--n9)", textDecoration: "line-through", lineHeight: 1.5 }}>{step?.text ?? ""}</div>
        </Card>

        {/* Smaller version */}
        <Card style={{ background: isDark ? "#1A2D24" : C.success100, marginBottom: 40 }}>
          <div style={{ ...T.label, color: C.success500, marginBottom: 10 }}>Smaller Version</div>
          <div style={{ ...T.subtitle, color: "var(--n9)", lineHeight: 1.4 }}>{step?.tooHard ?? ""}</div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BtnPrimary onClick={next}>I can do that</BtnPrimary>
          <BtnSecondary onClick={onStillTooMuch || next}>Still too much</BtnSecondary>
        </div>
      </div>
    </>
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
        {[
          { label: "Started it", icon: ICONS.arcEmpty },
          { label: "Got halfway", icon: ICONS.arcHalf },
          { label: "Barely started", icon: ICONS.arcFull },
        ].map(o => (
          <button key={o.label} onClick={() => setSelected(o.label)} style={{
            padding: "14px 18px", borderRadius: BTN_RADIUS,
            border: pillBorder(isDark, selected === o.label),
            background: pillBackground(isDark, selected === o.label),
            color: pillTextColor(isDark, selected === o.label),
            ...BTN_FONT, cursor: "pointer", fontFamily: "Inter",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            {o.icon(selected === o.label ? C.accent500 : pillHintColor(isDark, false))}
            {o.label}
          </button>
        ))}
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

function HomeScreen({ onResume, tasks, setTasks, onHistory, reason }) {
  const [input, setInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isExit = reason === "exit";
  const isDone = reason === "done";
  const isList = !isExit && !isDone;

  useEffect(() => {
    setTasks(p => {
      setSelectedIndex(i => (p.length === 0 ? 0 : Math.min(i, p.length - 1)));
      return p;
    });
  }, [tasks.length]);

  const addTask = () => { if (input.trim()) { setTasks(p => [...p, input.trim()]); setInput(""); } };
  const removeTask = (i) => {
    setTasks(p => p.filter((_, idx) => idx !== i));
    setSelectedIndex(prev => {
      if (i < prev) return prev - 1;
      if (i === prev) return Math.max(0, prev - 1);
      return prev;
    });
  };

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        {isExit && <div style={{ ...T.hint, marginBottom: 4 }}>{"That's okay."}</div>}
        {isDone && <div style={{ ...T.hint, marginBottom: 4 }}>{"Well done."}</div>}
        <div style={{ ...T.heading, color: "var(--n9)", marginBottom: 4 }}>Your list</div>
        <div style={{ ...T.small, color: "var(--n7)" }}>
          {isList ? "What would you like to work on?" : "Come back whenever you're ready."}
        </div>
        {tasks.length > 1 && (
          <div style={{ ...T.hint, marginTop: 8 }}>Tap a task to select it</div>
        )}
      </div>

      {/* Editable task list */}
      <Card style={{ marginBottom: 12, gap: 0, padding: 0, overflow: "hidden" }}>
        {tasks.length === 0 && (
          <div style={{
            padding: "32px 20px", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 12, textAlign: "center",
          }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26" fill={C.accent100}/>
              <path d="M28 40V28" stroke={C.accent500} strokeWidth="2" strokeLinecap="round"/>
              <path d="M28 32 C23 29 18 31 18 25 C23 25 28 29 28 32Z" fill={C.accent300}/>
              <path d="M28 37 C33 34 38 36 38 30 C33 30 28 34 28 37Z" fill={C.accent500}/>
            </svg>
            <div style={{ ...T.subtitle, color: "var(--n7)", lineHeight: 1.6 }}>
              {"Your list is clear."}<br/>
              <span style={{ ...T.hint }}>Add something when you're ready.</span>
            </div>
          </div>
        )}
        <div style={{
          maxHeight: tasks.length >= 5 ? 240 : "none",
          overflowY: tasks.length >= 5 ? "auto" : "visible",
          padding: `0 ${CARD_PAD}px`,
        }}>
          {tasks.map((t, i) => (
            <div key={i}>
              <div
                onClick={() => setSelectedIndex(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0", cursor: "pointer",
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: selectedIndex === i ? C.accent500 : C.accent300,
                }} />
                <span style={{ ...T.body, color: "var(--n9)", flex: 1 }}>{t}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeTask(i); }}
                  style={{
                    background: "none", border: "none", color: C.neutral300,
                    fontSize: 16, cursor: "pointer", padding: "0 4px", lineHeight: 1,
                  }}
                >✕</button>
              </div>
              <Divider />
            </div>
          ))}
        </div>

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
        </div>
      </Card>

      <BtnPrimary
        onClick={() => tasks[selectedIndex] && onResume(tasks[selectedIndex])}
        disabled={tasks.length === 0}
      >{"I'm ready now"}</BtnPrimary>
      <button onClick={onHistory} style={{
        background: "none", border: "none", width: "100%",
        marginTop: 12, padding: "8px 0", cursor: "pointer", fontFamily: "Inter",
        ...T.hint, fontSize: 14, color: C.neutral300, textDecoration: "underline",
      }}>History</button>
    </>
  );
}

function doneShellBackground(isDark) {
  return isDark
    ? "radial-gradient(ellipse at 50% 20%, #1A2D24 0%, #1A1828 60%)"
    : "radial-gradient(ellipse at 50% 20%, #E8FFF4 0%, #F0EEF5 60%)";
}

function DoneScreen({ next, onMore, isLast }) {
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
        <BtnPrimary onClick={isLast ? next : onMore}>{isLast ? "See what's next" : "One more thing"}</BtnPrimary>
        <BtnSecondary onClick={next}>I'm done now</BtnSecondary>
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

function resolveInitialScreen(tasks, savedScreen) {
  const hasTasks = Array.isArray(tasks) && tasks.length > 0;
  if (!hasTasks) return "onboarding";
  if (!savedScreen || savedScreen === "splash" || savedScreen === "onboarding") return "suggestion";
  return savedScreen;
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

    return {
      tasks: Array.isArray(tasks) ? tasks : [],
      screen: resolveInitialScreen(tasks, savedScreen),
      defaultEnergy: localStorage.getItem("nudge_energy") || "low",
      defaultTime: localStorage.getItem("nudge_time") || "10 min",
      stepIndex: Number.isInteger(stepIndexRaw) ? stepIndexRaw : 0,
      sessionCount: Number.isInteger(sessionCountRaw) ? sessionCountRaw : 0,
      completedSteps: JSON.parse(localStorage.getItem("nudge_completed_steps")) || [],
      granularity: localStorage.getItem("nudge_granularity") || "balanced",
      completedHistory: historyRaw ? JSON.parse(historyRaw) : [],
      pausedStep: step ? JSON.parse(step) : null,
      pausedTaskName: taskName ? JSON.parse(taskName) : "",
      pausedNote: note ? JSON.parse(note) : "",
      pausedProgress: progress ? JSON.parse(progress) : "",
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
    setHydrated(true);
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
  const handleDoneGuard = useRef("");
  const go = s => { prevScreen.current = screen; setScreen(s); };
  const goHome = (reason = "list") => { setHomeReason(reason); go("home"); };
  const task = tasks[0] || "Work on portfolio";
  const { steps, loading: stepsLoading } = useTaskBreakdown(task, defaultEnergy, defaultTime, granularity);
  const { recordSession, getInsights } = usePatternLearning();
  const currentStep = steps[stepIndex] || steps[0];

  useEffect(() => {
    if (screen === "inprogress" && lastScreen.current !== "inprogress") {
      activeCompletionTask.current = tasks[0] || "Work on portfolio";
      handleDoneGuard.current = "";
    }
    lastScreen.current = screen;
  }, [screen, tasks]);

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
  const resourceLink = stepLinks[stepIndex] || currentStep?.link || "";

  const handleDone = () => {
    if (!currentStep?.text) return;
    const taskId = activeCompletionTask.current || tasks[0] || "Work on portfolio";
    const guardKey = `${taskId}::${stepIndex}::${currentStep.text}`;
    if (handleDoneGuard.current === guardKey) return;
    handleDoneGuard.current = guardKey;

    setCompletedSteps(p => (p.includes(currentStep.text) ? p : [...p, currentStep.text]));
    setCompletedHistory(h => {
      const entry = {
        taskId,
        task: taskId,
        step: currentStep.text,
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
    recordSession(taskId, defaultEnergy, stepIndex, steps.length, defaultTime);
    const next = stepIndex + 1;
    const c = sessionCount + 1;
    setSessionCount(c);
    if (next >= steps.length) { setIsLastStep(true); setStepIndex(0); go("momentum"); }
    else { setIsLastStep(next >= steps.length - 1); setStepIndex(next); if (c === 2) go("pattern"); else go("done"); }
  };

  const screens = {
    splash: <SplashScreen next={() => go("onboarding")} />,
    onboarding: <OnboardingScreen next={() => go("setup")} tasks={tasks} setTasks={setTasks} />,
    setup: <SetupScreen next={() => go("ready")} back={() => go("onboarding")} setDefaultEnergy={setDefaultEnergy} setDefaultTime={setDefaultTime} />,
    ready: <ReadyScreen next={() => go("suggestion")} back={() => go("setup")} setGranularity={setGranularity} />,
    suggestion: <SuggestionScreen next={() => { if (currentStep) go("inprogress"); }} onTooHard={() => { if (currentStep) go("simplify"); }} onAnother={() => go("allsteps")} onSkip={() => setStepIndex(i => (steps.length ? (i + 1) % steps.length : 0))} onExit={() => goHome("exit")} task={task} stepIndex={stepIndex} steps={steps} energy={defaultEnergy} loading={stepsLoading} deferredNote={deferredNote} onDismissDeferNote={() => setDeferredNote("")} />,
    allsteps: <AllStepsScreen back={() => go("suggestion")} steps={steps} task={task} stepIndex={stepIndex} onPick={i => { setStepIndex(i); go("suggestion"); }} loading={stepsLoading} stepLinks={stepLinks} onSetStepLink={(i, url) => setStepLinks(p => ({ ...p, [i]: url }))} />,
    inprogress: <InProgressScreen step={currentStep} resourceLink={resourceLink} stepsLoading={stepsLoading} onDone={handleDone} onPause={() => { setPausedStep(currentStep); go("pause"); }} onTooMuch={() => go("simplify")} onDefer={(note) => { setDeferredNote(note); go("suggestion"); }} />,
    simplify: <SimplifyScreen next={() => go("inprogress")} onStillTooMuch={() => go("suggestion")} step={currentStep} />,
    pause: <PauseScreen
      onSaveAndPause={(data) => { savePauseState(data); go("return_paused"); }}
      onComeBackLater={(data) => { savePauseState(data); go("return_paused"); }}
      onResume={() => go("inprogress")}
    />,
    home: <HomeScreen
      reason={homeReason}
      onResume={(picked) => { setTasks([picked, ...tasks.filter(x => x !== picked)]); setStepIndex(0); go("suggestion"); }}
      tasks={tasks}
      setTasks={setTasks}
      onHistory={() => go("history")}
    />,
    history: <HistoryScreen history={completedHistory} onBack={() => goHome("list")} />,
    paused_confirm: <PausedConfirmScreen next={() => goHome("done")} />,
    done: <DoneScreen next={() => goHome("done")} onMore={() => go("suggestion")} isLast={isLastStep} />,
    return_paused: <ReturnPausedScreen
      next={() => go("inprogress")}
      onFresh={() => go("switch_task")}
      onPickTask={(t) => { setTasks([t, ...tasks.filter(x => x !== t)]); setStepIndex(0); go("suggestion"); }}
      tasks={tasks}
      step={pausedStep || currentStep}
      task={pausedTaskName || task}
      note={pausedNote}
      pauseProgress={pausedProgress}
    />,
    switch_task: <SwitchTaskScreen tasks={tasks.length ? tasks : ["Work on portfolio", "Clean kitchen", "Baby sleep schedule"]} onPick={t => { setTasks([t, ...tasks.filter(x => x !== t)]); setStepIndex(0); go("suggestion"); }} onAdd={t => { setTasks(p => [t, ...p]); setStepIndex(0); go("suggestion"); }} onBack={() => { const dest = prevScreen.current || "home"; if (dest === "home") setHomeReason("list"); go(dest); }} />,
    return_short: <ReturnShortScreen next={() => go("suggestion")} onExit={() => goHome("list")} />,
    return_long: <ReturnLongScreen next={() => go("switch_task")} />,
    pattern: <PatternScreen next={() => go("suggestion")} onExit={() => goHome("done")} completedCount={sessionCount} topEnergy={defaultEnergy} insights={getInsights()} />,
    momentum: <MomentumScreen
      next={() => go("suggestion")}
      onExit={() => goHome("done")}
      completedSteps={completedSteps}
      task={task}
      onMarkDone={() => { setTasks(t => t.slice(1)); goHome("done"); }}
    />,
  };

  const shellBackground = screen === "inprogress"
    ? inProgressShellBackground(isDark)
    : screen === "done"
      ? doneShellBackground(isDark)
      : (isDark ? "#1A1828" : C.neutral100);

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
`}</style>
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: `16px ${SCREEN_H_PAD}px 40px`,
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
