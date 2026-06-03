import { useState, useEffect, useRef } from "react";
import React from "react";

// ── DESIGN TOKENS (from Figma inspect) ───────────────────────────────
// Font: Inter throughout
// Screen: 390×844, margin 24px left/right
// Grid: 4 col, margin 24, gutter 16

// Color palette — approximated from Figma color styles
const C = {
  // Accent
  accent900: "#2D2361",
  accent700: "#4D3DB5",
  accent500: "#7C6FCD", // primary purple — buttons, labels
  accent300: "#A89FDE",
  accent200: "#C8C0E8",
  accent100: "#EEE9FF", // soft bg — small buttons, cards
  // Neutral
  neutral900: "#111111", // headings
  neutral700: "#3D3D3D", // subtitle
  neutral500: "#6B6B6B",
  neutral300: "#AAAAAA", // hints, placeholders
  neutral200: "#DDDDDD", // ghost button border
  neutral100: "#F2F1F6", // card bg (Neutral/50 ≈ white, Neutral/100 ≈ off-white bg)
  neutral50:  "#FFFFFF", // card bg, button text on primary
  // Success
  success500: "#6BBF9A",
  success100: "#E6F7F0",
  // Warning
  warning100: "#FFF8EC",
  warning500: "#C9A24A",
};

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
  btnSecondary: { fontFamily: "Inter", fontWeight: 500, fontSize: 18, color: C.neutral700 },
};

// Spacing
const SCREEN_H_PAD = 24; // 24px margin each side
const CARD_RADIUS = 22;
const CARD_PAD = 16;
const BTN_RADIUS = 94;
const BTN_H = 51;
const BTN_FONT = { fontFamily: "Inter", fontWeight: 600, fontSize: 18 };

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
    <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
      <path d="M3 15L15 27L37 3" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 60, strokeDashoffset: 0,
          animation: "drawCheck 0.5s ease-out forwards" }}/>
    </svg>
  ),
};


// ── MOCK DATA ─────────────────────────────────────────────────────────
const TASK_STEPS = {
  "Work on portfolio": [
    { text: "Write 3 bullet points about a project you're proud of.", tags: ["tiny step", "no prep needed"], mins: 5, energy: "low", tooHard: "Write the name of one project you're proud of. Just the name." },
    { text: "Add one screenshot to a case study.", tags: ["10 min", "focused"], mins: 10, energy: "medium", tooHard: "Open the case study doc. Just open it." },
    { text: "Write a 2-sentence project summary.", tags: ["10 min"], mins: 10, energy: "medium", tooHard: "Write one sentence. Any sentence about the project." },
    { text: "Update your about page with recent work.", tags: ["15 min"], mins: 15, energy: "medium", tooHard: "Open your about page. Read it once." },
    { text: "Send the link to one person for feedback.", tags: ["5 min", "tiny step"], mins: 5, energy: "low", tooHard: "Copy the link. Just that." },
  ],
  "Clean kitchen": [
    { text: "Wipe down the stovetop. Just that.", tags: ["tiny step", "5 min"], mins: 5, energy: "low", tooHard: "Put the cloth on the counter next to the stove." },
    { text: "Clear the counter and wipe surfaces.", tags: ["10 min"], mins: 10, energy: "medium", tooHard: "Move three items off the counter." },
    { text: "Do the dishes.", tags: ["15 min"], mins: 15, energy: "medium", tooHard: "Rinse one cup." },
    { text: "Sweep the floor.", tags: ["10 min"], mins: 10, energy: "medium", tooHard: "Find the broom." },
  ],
  "Email tax accountant": [
    { text: "Find the accountant's email address. That's it.", tags: ["tiny step", "2 min"], mins: 2, energy: "low", tooHard: "Search your contacts for 'accountant'." },
    { text: "Write the subject line and one sentence.", tags: ["5 min", "tiny step"], mins: 5, energy: "low", tooHard: "Open a new email draft. Leave it blank for now." },
    { text: "Draft the full email — don't send yet.", tags: ["10 min"], mins: 10, energy: "medium", tooHard: "Write two sentences of what you need." },
    { text: "Read it back and send.", tags: ["5 min"], mins: 5, energy: "low", tooHard: "Read just the subject line." },
  ],
  "Figure out baby sleep schedule": [
    { text: "Write down one thing that worked last night.", tags: ["tiny step", "2 min"], mins: 2, energy: "low", tooHard: "Open notes and type 'sleep' as a title." },
    { text: "Read one article on wake windows.", tags: ["15 min"], mins: 15, energy: "medium", tooHard: "Search 'wake windows' and read just the first result title." },
    { text: "Draft a rough schedule to try this week.", tags: ["20 min"], mins: 20, energy: "medium", tooHard: "Write down your baby's current wake time." },
  ],
  "Fix bathroom shelf": [
    { text: "Find the screwdriver. Put it next to the shelf.", tags: ["tiny step", "2 min"], mins: 2, energy: "low", tooHard: "Walk to the shelf and look at it." },
    { text: "Tighten the shelf bracket.", tags: ["10 min"], mins: 10, energy: "medium", tooHard: "Find the screwdriver." },
    { text: "Re-organise what goes on the shelf.", tags: ["10 min"], mins: 10, energy: "low", tooHard: "Remove one item from the shelf." },
  ],
};
const DEFAULT_STEPS = [
  { text: "Write down exactly what's blocking you.", tags: ["tiny step", "2 min"], mins: 2, energy: "low", tooHard: "Open a notes app." },
  { text: "Do the very first physical action for this task.", tags: ["5 min"], mins: 5, energy: "low", tooHard: "Describe the first action in one word." },
];
const getSteps = (task) => TASK_STEPS[task] || DEFAULT_STEPS;

// ── BASE COMPONENTS ───────────────────────────────────────────────────

// Phone shell — 390px wide, Neutral/100 bg
function Phone({ children }) {
  return (
    <div style={{
      width: 390, minHeight: 780,
      background: C.neutral100,
      borderRadius: 44,
      boxShadow: "0 32px 80px rgba(44,35,97,0.16), 0 2px 8px rgba(0,0,0,0.06)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      fontFamily: "Inter, sans-serif",
      position: "relative",
    }}>
      {/* Status bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 28px 0",
        ...T.small, fontWeight: 600, color: C.neutral900,
      }}>
        <span>19:02</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <svg width="17" height="12" viewBox="0 0 17 12"><rect x="0" y="4" width="3" height="8" rx="1" fill={C.neutral900}/><rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill={C.neutral900}/><rect x="9" y="0.5" width="3" height="11.5" rx="1" fill={C.neutral900}/><rect x="13.5" y="0" width="3" height="12" rx="1" fill={C.neutral900}/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.5C10.5 2.5 12.7 3.6 14.2 5.3L15.5 4C13.6 1.9 11 .5 8 .5S2.4 1.9.5 4l1.3 1.3C3.3 3.6 5.5 2.5 8 2.5z" fill={C.neutral900}/><path d="M8 5.5c1.6 0 3 .7 4 1.8L13.3 6C12 4.6 10.1 3.7 8 3.7S4 4.6 2.7 6L4 7.3c1-1.1 2.4-1.8 4-1.8z" fill={C.neutral900}/><circle cx="8" cy="10" r="1.5" fill={C.neutral900}/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0" y="1" width="22" height="10" rx="2.5" stroke={C.neutral900} strokeWidth="1" fill="none"/><rect x="1.5" y="2.5" width="17" height="7" rx="1.5" fill={C.neutral900}/><path d="M23 4v4a2 2 0 000-4z" fill={C.neutral900}/></svg>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: `16px ${SCREEN_H_PAD}px 40px` }}>
        {children}
      </div>
    </div>
  );
}

// Screen label (WELCOME, QUICK SETUP, etc.)
function Label({ children, color = C.accent500 }) {
  return <div style={{ ...T.label, color, marginBottom: 8 }}>{children}</div>;
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
function BtnPrimary({ children, onClick, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      width: "100%", height: BTN_H, borderRadius: BTN_RADIUS,
      background: disabled ? C.accent300 : C.accent500,
      border: "none", cursor: disabled ? "default" : "pointer",
      ...BTN_FONT, color: C.neutral50,
      transition: "opacity 0.15s",
    }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = "0.88")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >{children}</button>
  );
}

// Secondary button — no fill, Neutral/200 stroke, Neutral/700 text
function BtnSecondary({ children, onClick, small }) {
  return (
    <button onClick={onClick} style={{
      width: small ? undefined : "100%",
      flex: small ? 1 : undefined,
      height: BTN_H, borderRadius: BTN_RADIUS,
      background: "transparent",
      border: `1px solid ${C.neutral200}`,
      cursor: "pointer",
      ...BTN_FONT, color: C.neutral700,
      transition: "opacity 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >{children}</button>
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
  return (
    <div style={{
      background: C.neutral50,
      borderRadius: CARD_RADIUS,
      padding: CARD_PAD,
      ...style,
    }}>{children}</div>
  );
}

// Tag pill
function Tag({ label, green }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      ...T.hint, fontSize: 15,
      color: green ? C.success500 : C.neutral300,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
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
    <Phone>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, background: C.accent500,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 8px 32px ${C.accent500}55`,
          color: C.neutral50, fontSize: 36, fontWeight: 700,
        }}>›</div>
        <div style={{ ...T.heading, fontSize: 32, color: C.neutral900 }}>Nudge</div>
        <div style={{ ...T.hint }}>one small step at a time</div>
      </div>
    </Phone>
  );
}

function OnboardingScreen({ next, tasks, setTasks }) {
  const [input, setInput] = useState("");
  const addTask = () => { if (input.trim()) { setTasks(p => [...p, input.trim()]); setInput(""); } };
  const remove = (i) => setTasks(tasks.filter((_, idx) => idx !== i));
  return (
    <Phone>
      <Dots total={3} active={0} />
      <Label>Welcome</Label>
      <div style={{ ...T.heading, color: C.neutral900, marginBottom: 8 }}>What's weighing on you right now?</div>
      <div style={{ ...T.small, color: C.neutral700, marginBottom: 20 }}>Press enter after each one.</div>

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
                <span style={{ ...T.body, color: C.neutral900, flex: 1 }}>{t}</span>
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
                ...T.body, color: C.neutral900,
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
        {tasks.length >= 4 && (
          <div style={{ ...T.hint, textAlign: "center", marginTop: 12 }}>
            That's already a lot — no need to add more
          </div>
        )}
      </div>
    </Phone>
  );
}

function SetupScreen({ next, back, setDefaultEnergy, setDefaultTime }) {
  const [slot, setSlot] = useState(null);
  const [duration, setDuration] = useState(null);
  const [energy, setEnergy] = useState(null);
  const ready = slot && duration && energy;
  const slots = ["Morning", "Lunch", "Evening", "Random"];
  const durations = ["5 min", "10 min", "15 min", "20 min"];
  const energies = ["low", "medium", "high"];
  return (
    <Phone>
      <Dots total={3} active={1} />
      <Back onClick={back} />
      <Label>Quick Setup</Label>
      <div style={{ ...T.heading, color: C.neutral900, marginBottom: 24 }}>When do you usually have a few minutes?</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {slots.map(s => (
          <button key={s} onClick={() => setSlot(s)} style={{
            padding: "14px", borderRadius: BTN_RADIUS,
            border: `1px solid ${slot === s ? C.accent500 : C.neutral200}`,
            background: slot === s ? C.accent100 : C.neutral50,
            color: slot === s ? C.accent500 : C.neutral700,
            ...BTN_FONT, fontSize: 16, cursor: "pointer", fontFamily: "Inter",
          }}>{s}</button>
        ))}
      </div>

      <div style={{ height: 1, background: C.neutral200, marginBottom: 20 }} />

      <div style={{ ...T.small, color: C.neutral700, marginBottom: 12 }}>How long are your typical pockets?</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {durations.map(d => (
          <button key={d} onClick={() => { setDuration(d); setDefaultTime(d); }} style={{
            flex: 1, padding: "10px 0", borderRadius: BTN_RADIUS,
            border: `1px solid ${duration === d ? C.accent500 : C.neutral200}`,
            background: duration === d ? C.accent100 : C.neutral50,
            color: duration === d ? C.accent500 : C.neutral700,
            ...BTN_FONT, fontSize: 16, cursor: "pointer", fontFamily: "Inter",
          }}>{d}</button>
        ))}
      </div>

      <div style={{ height: 1, background: C.neutral200, marginBottom: 20 }} />

      <div style={{ ...T.small, color: C.neutral700, marginBottom: 12 }}>Your usual energy level?</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { key: "low", label: "Low", icon: ICONS.batteryLow },
          { key: "medium", label: "Medium", icon: ICONS.batteryMedium },
          { key: "high", label: "High", icon: ICONS.batteryHigh },
        ].map(e => (
          <button key={e.key} onClick={() => { setEnergy(e.key); setDefaultEnergy(e.key); }} style={{
            flex: 1, padding: "8px 0", borderRadius: BTN_RADIUS,
            border: `1px solid ${energy === e.key ? C.accent500 : C.neutral200}`,
            background: energy === e.key ? C.accent100 : C.neutral50,
            color: energy === e.key ? C.accent500 : C.neutral700,
            cursor: "pointer", fontFamily: "Inter",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {e.icon(energy === e.key ? C.accent500 : C.neutral300)}
            <span style={{ ...BTN_FONT, fontSize: 16 }}>{e.label}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={ready ? next : undefined} disabled={!ready}>Almost there</BtnPrimary>
      </div>
    </Phone>
  );
}

function ReadyScreen({ next, back, setGranularity }) {
  const [selected, setSelected] = useState("balanced");
  return (
    <Phone>
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

        <div style={{ ...T.heading, color: C.neutral900, textAlign: "center", marginBottom: 10 }}>{"You're all set"}</div>
        <div style={{ ...T.subtitle, color: C.neutral700, textAlign: "center", lineHeight: 1.5, marginBottom: 28 }}>
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
                border: `1.5px solid ${selected === o.key ? C.accent500 : C.neutral200}`,
                background: selected === o.key ? C.accent100 : C.neutral50,
                cursor: "pointer", fontFamily: "Inter",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              }}>
                {o.illustration(selected === o.key)}
                <span style={{ ...T.small, color: selected === o.key ? C.accent500 : C.neutral900, fontWeight: 600, fontSize: 14 }}>{o.label}</span>
                <span style={{ ...T.hint, fontSize: 11, color: selected === o.key ? C.accent500 : C.neutral300 }}>{o.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: C.accent100, borderRadius: 20,
          padding: "20px 24px", width: "100%",
          textAlign: "center", boxSizing: "border-box",
        }}>
          <div style={{ ...T.subtitle, color: C.accent500, fontWeight: 600 }}>Your first suggestion is ready</div>
        </div>
      </div>

      <BtnPrimary onClick={next}>Show me</BtnPrimary>
    </Phone>
  );
}

function SuggestionScreen({ next, onTooHard, onAnother, onSkip, onExit, task, stepIndex, steps, energy }) {
  const step = steps[stepIndex] || steps[0];
  const total = steps.length;
  const pct = ((stepIndex + 1) / total) * 100;
  const taskLabel = task.length > 18 ? task.slice(0, 16) + "…" : task.toUpperCase();
  return (
    <Phone>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <Label style={{ margin: 0 }}>Your One Thing</Label>
        <button onClick={onExit} style={{
          background: "none", border: "none", cursor: "pointer",
          color: C.neutral300, padding: 4, lineHeight: 1,
          fontSize: 20, fontFamily: "Inter",
        }}>✕</button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
        <Card style={{ marginBottom: 28 }}>
          {/* Tags row */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
            <span style={{ ...T.label, color: C.accent500 }}>{taskLabel}</span>
            <span style={{ color: C.accent200 }}>•</span>
            <span style={{ ...T.label, color: C.accent500 }}>{step.mins} MIN</span>
            <span style={{ color: C.accent200 }}>•</span>
            <span style={{ ...T.label, color: C.accent500 }}>{energy.toUpperCase()} ENERGY</span>
          </div>

          <div style={{ ...T.subtitle, color: C.neutral900, fontWeight: 700, marginBottom: 20 }}>{step.text}</div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {step.tags.map((t, i) => <Tag key={t} label={t} green={i === 1 || t === "no prep needed"} />)}
          </div>
        </Card>

        {/* Progress bar + step counter */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ height: 4, borderRadius: 4, background: C.neutral200, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: C.accent500, borderRadius: 4, transition: "width 0.4s ease" }} />
          </div>
        </div>
        <div style={{ ...T.hint, fontSize: 14, textAlign: "right", marginBottom: 28 }}>
          step {stepIndex + 1} of {total}
        </div>

        {/* See all steps */}
        <button onClick={onAnother} style={{
          background: "none", border: "none", color: C.accent500,
          ...T.hint, fontSize: 14, cursor: "pointer",
          fontFamily: "Inter", textDecoration: "underline",
          marginBottom: 24, padding: 0, display: "flex", alignItems: "center",
          justifyContent: "center", gap: 6, width: "100%",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="12" height="3" rx="1" fill={C.accent500} fillOpacity="0.4"/>
            <rect x="1" y="5.5" width="12" height="3" rx="1" fill={C.accent500} fillOpacity="0.7"/>
            <rect x="1" y="10" width="12" height="3" rx="1" fill={C.accent500}/>
          </svg>
          see all steps
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <BtnPrimary onClick={next}>I can do that</BtnPrimary>
          <div style={{ display: "flex", gap: 10 }}>
            <BtnAccent onClick={onTooHard}>Too hard</BtnAccent>
            <BtnAccent onClick={onAnother}>Another</BtnAccent>
          </div>
        </div>
      </div>
    </Phone>
  );
}

function AllStepsScreen({ back, steps, stepIndex, onPick, task }) {
  return (
    <Phone>
      <Back onClick={back} />
      <Label>All Steps</Label>
      <div style={{ ...T.subtitle, color: C.neutral900, marginBottom: 20 }}>{task}</div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 4 }}>
            {/* Spine */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
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
            {/* Card */}
            <div onClick={() => onPick(i)} style={{
              flex: 1, background: i === stepIndex ? C.accent100 : C.neutral50,
              border: `1px solid ${i === stepIndex ? C.accent500 : C.neutral200}`,
              borderRadius: CARD_RADIUS, padding: "14px 16px",
              cursor: "pointer", opacity: i < stepIndex ? 0.5 : 1,
              marginBottom: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ ...T.small, color: C.neutral900, flex: 1, textDecoration: i < stepIndex ? "line-through" : "none" }}>{s.text}</div>
                {i === stepIndex && <span style={{ ...T.label, color: C.accent500, fontSize: 10 }}>NOW</span>}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                {s.tags.map((t, j) => <Tag key={t} label={t} green={j === 1} />)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Phone>
  );
}

function InProgressScreen({ onDone, onPause, onTooMuch, step }) {
  const [expand, setExpand] = useState(false);
  useEffect(() => {
    setExpand(true);
    const t = setInterval(() => {
      setExpand(e => !e);
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <Phone>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <Label style={{ margin: 0 }}>In Progress</Label>
        <button onClick={onPause} style={{
          background: "none", border: "none", color: C.neutral500,
          ...T.small, fontWeight: 600, cursor: "pointer", fontFamily: "Inter",
          display: "flex", alignItems: "center", gap: 6,
        }}>‖ Pause</button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
        {/* Breathing circle */}
        <div style={{
          width: expand ? 240 : 216, height: expand ? 240 : 216,
          borderRadius: "50%",
          background: C.accent100,
          border: `2px solid ${C.accent200}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: expand
            ? `0 0 0 18px ${C.accent100}88, 0 0 0 34px ${C.accent100}44`
            : `0 0 0 0px ${C.accent100}`,
          transition: "all 4s ease-in-out",
          padding: 28, textAlign: "center",
          boxSizing: "border-box",
        }}>
          <div style={{ ...T.subtitle, color: C.neutral900, lineHeight: 1.4 }}>{step.text}</div>
        </div>

        <div style={{ textAlign: "center", minHeight: 44 }}>
          <div style={{
            ...T.small, color: C.accent500, fontWeight: 600, marginBottom: 6,
          }}>
            Take your time. No rush.
          </div>
          <div style={{ ...T.hint }}>Focus on just this one thing.</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={onDone}>Done</BtnPrimary>
        <BtnSecondary onClick={onTooMuch}>Too much?</BtnSecondary>
      </div>
    </Phone>
  );
}

function SimplifyScreen({ next, onStillTooMuch, step }) {
  return (
    <Phone>
      <Label color={C.warning500}>Let's Simplify</Label>
      <div style={{ ...T.heading, color: C.neutral900, marginBottom: 8 }}>That one felt like too much?</div>
      <div style={{ ...T.small, color: C.neutral700, marginBottom: 0 }}>No problem. Here's something smaller.</div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
        {/* Original — struck through */}
        <Card style={{ background: C.warning100, marginBottom: 16 }}>
          <div style={{ ...T.label, color: C.warning500, marginBottom: 10 }}>Original</div>
          <div style={{ ...T.small, color: C.neutral300, textDecoration: "line-through", lineHeight: 1.5 }}>{step.text}</div>
        </Card>

        {/* Smaller version */}
        <Card style={{ background: C.success100, marginBottom: 40 }}>
          <div style={{ ...T.label, color: C.success500, marginBottom: 10 }}>Smaller Version</div>
          <div style={{ ...T.subtitle, color: C.neutral900, lineHeight: 1.4 }}>{step.tooHard}</div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BtnPrimary onClick={next}>I can do that</BtnPrimary>
          <BtnSecondary onClick={onStillTooMuch || next}>Still too much</BtnSecondary>
        </div>
      </div>
    </Phone>
  );
}

function PauseScreen({ next, onResume }) {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const opts = ["Started it", "Got halfway", "Barely started"];
  return (
    <Phone>
      <Label>Pause</Label>
      <div style={{ ...T.heading, color: C.neutral900, marginBottom: 4 }}>Life happened.</div>
      <div style={{ ...T.small, color: C.neutral700, marginBottom: 24 }}>{"That's okay. Where did you get to?"}</div>

      <div style={{ ...T.small, color: C.neutral700, marginBottom: 12 }}>What did you manage?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Started it", icon: ICONS.arcEmpty },
          { label: "Got halfway", icon: ICONS.arcHalf },
          { label: "Barely started", icon: ICONS.arcFull },
        ].map(o => (
          <button key={o.label} onClick={() => setSelected(o.label)} style={{
            padding: "14px 18px", borderRadius: BTN_RADIUS,
            border: `1px solid ${selected === o.label ? C.accent500 : C.neutral200}`,
            background: selected === o.label ? C.accent100 : C.neutral50,
            color: selected === o.label ? C.accent500 : C.neutral700,
            ...BTN_FONT, cursor: "pointer", fontFamily: "Inter",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            {o.icon(selected === o.label ? C.accent500 : C.neutral300)}
            {o.label}
          </button>
        ))}
      </div>

      <div style={{ ...T.small, color: C.neutral700, marginBottom: 8 }}>Next step? (optional)</div>
      <Card style={{ marginBottom: 28 }}>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Open the doc and read what I wrote"
          style={{
            border: "none", outline: "none", width: "100%",
            ...T.body, fontFamily: "Inter", background: "transparent",
            color: C.neutral900,
          }}
        />
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={next}>Save & pause</BtnPrimary>
        <BtnSecondary onClick={next}>I'll come back later</BtnSecondary>
      </div>
    </Phone>
  );
}

function HomeScreen({ onResume, tasks, setTasks }) {
  const [input, setInput] = useState("");
  const addTask = () => { if (input.trim()) { setTasks(p => [...p, input.trim()]); setInput(""); } };
  const removeTask = (i) => setTasks(tasks.filter((_, idx) => idx !== i));

  return (
    <Phone>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ ...T.hint, marginBottom: 4 }}>{"That's okay."}</div>
        <div style={{ ...T.heading, color: C.neutral900, marginBottom: 4 }}>Your list</div>
        <div style={{ ...T.small, color: C.neutral700 }}>{"Come back whenever you're ready."}</div>
      </div>

      {/* Editable task list */}
      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
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
            <div style={{ ...T.subtitle, color: C.neutral700, lineHeight: 1.6 }}>
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
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 0",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent300, flexShrink: 0 }} />
                <span style={{ ...T.body, color: C.neutral900, flex: 1 }}>{t}</span>
                <button onClick={() => removeTask(i)} style={{
                  background: "none", border: "none", color: C.neutral300,
                  fontSize: 16, cursor: "pointer", padding: "0 4px", lineHeight: 1,
                }}>✕</button>
              </div>
              <Divider />
            </div>
          ))}
        </div>

        {/* Inline add field */}
        <div style={{ padding: `0 ${CARD_PAD}px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.neutral200, flexShrink: 0 }} />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder="Add something…"
              style={{
                border: "none", outline: "none", flex: 1,
                ...T.body, color: C.neutral900,
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

      <BtnPrimary onClick={onResume} disabled={tasks.length === 0}>{"I'm ready now"}</BtnPrimary>
    </Phone>
  );
}

function DoneScreen({ next, onMore, isLast }) {
  return (
    <Phone>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center" }}>
        <div style={{
          width: 88, height: 88, borderRadius: "50%", background: C.success100,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8,
        }}>
          {ICONS.checkAnimated(C.success500)}
        </div>
        <div style={{ ...T.heading, color: C.neutral900 }}>Small step taken.</div>
        <div style={{ ...T.subtitle, color: C.neutral700 }}>That's real progress.</div>
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
    </Phone>
  );
}


function PausedConfirmScreen({ next }) {
  return (
    <Phone>
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
        <div style={{ ...T.heading, color: C.neutral900 }}>Saved for later.</div>
        <div style={{ ...T.small, color: C.neutral700, lineHeight: 1.7, maxWidth: 260 }}>
          {"Come back whenever you're ready. It'll be right here."}
        </div>
      </div>
      <BtnPrimary onClick={next}>Done for now</BtnPrimary>
    </Phone>
  );
}

function SwitchTaskScreen({ tasks, onPick, onAdd, onBack }) {
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState("");
  const [newTasks, setNewTasks] = useState([]);
  const inputRef = React.useRef(null);

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
    <Phone>
      <Back onClick={onBack} />
      <Label>Switch Task</Label>
      <div style={{ ...T.heading, color: C.neutral900, marginBottom: 8 }}>What would you like to work on?</div>
      <div style={{ ...T.small, color: C.neutral700, marginBottom: 28 }}>Pick from your list or add something new.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {tasks.map((t, i) => (
          <button key={i} onClick={() => onPick(t)} style={{
            padding: "16px 18px", borderRadius: CARD_RADIUS,
            border: `1px solid ${C.neutral200}`, background: C.neutral50,
            display: "flex", alignItems: "center", gap: 12,
            cursor: "pointer", fontFamily: "Inter", textAlign: "left",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent300, flexShrink: 0 }} />
            <span style={{ ...T.small, color: C.neutral900 }}>{t}</span>
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
            border: `1.5px solid ${C.accent500}`, background: C.neutral50,
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
                ...T.small, color: C.neutral900,
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
    </Phone>
  );
}

function ReturnPausedScreen({ next, onFresh, onSwitch, step }) {
  return (
    <Phone>
      <Label color={C.accent500}>Good Morning</Label>
      <div style={{ ...T.heading, color: C.neutral900, marginBottom: 8 }}>Welcome back</div>
      <div style={{ ...T.hint, marginBottom: 28 }}>You were in the middle of something.</div>

      <Card style={{ background: C.accent100, marginBottom: 24, borderRadius: 20 }}>
        <div style={{ ...T.label, color: C.accent500, marginBottom: 6 }}>You were here</div>
        <div style={{ ...T.small, color: C.accent700, marginBottom: 4 }}>Writing about portfolio project</div>
        <div style={{ ...T.subtitle, color: C.neutral900, marginBottom: 16, fontWeight: 700 }}>{step?.text || "Pick one bullet and expand it"}</div>
        <BtnPrimary onClick={next}>Continue where you left off</BtnPrimary>
      </Card>

      <div style={{ ...T.label, color: C.neutral300, textAlign: "center", marginBottom: 16 }}>Or start something new</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["Kitchen", "Baby sleep", "+ Add"].map(t => (
          <button key={t} onClick={t === "+ Add" ? onFresh : onSwitch} style={{
            padding: "10px 18px", borderRadius: BTN_RADIUS,
            border: `1px solid ${C.neutral200}`, background: C.neutral50,
            color: C.neutral700, ...BTN_FONT, fontSize: 16,
            cursor: "pointer", fontFamily: "Inter",
          }}>{t}</button>
        ))}
      </div>
    </Phone>
  );
}

function ReturnShortScreen({ next, onExit }) {
  return (
    <Phone>
      <Label color={C.accent500}>Good Morning</Label>
      <div style={{ ...T.heading, color: C.neutral900, marginBottom: 8 }}>Welcome back</div>
      <div style={{ ...T.subtitle, color: C.neutral700, marginBottom: 24, lineHeight: 1.5 }}>
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
      <Card style={{ background: C.success100, borderRadius: 16, marginBottom: 32 }}>
        <div style={{ ...T.label, color: C.success500, marginBottom: 6 }}>Earlier today</div>
        <div style={{ ...T.subtitle, color: C.neutral900, fontWeight: 700, marginBottom: 4 }}>Finished everything on your list</div>
        <div style={{ ...T.hint }}>3 things done</div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={next}>What's next?</BtnPrimary>
        <BtnSecondary onClick={onExit}>{"I'm good for now"}</BtnSecondary>
      </div>
    </Phone>
  );
}

function ReturnLongScreen({ next }) {
  return (
    <Phone>
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

        <div style={{ ...T.heading, color: C.neutral900, marginBottom: 16 }}>
          {"It's been a while."}
        </div>
        <div style={{ ...T.subtitle, color: C.neutral700, lineHeight: 1.8, marginBottom: 12 }}>
          No pressure. Life gets busy.
        </div>
        <div style={{ ...T.subtitle, color: C.neutral700, lineHeight: 1.8, marginBottom: 48 }}>
          {"What's weighing on you today?"}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={next}>{"Let's go"}</BtnPrimary>
        <BtnSecondary onClick={next}>{"I'm good for now"}</BtnSecondary>
      </div>
    </Phone>
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

function PatternScreen({ next, onExit, completedCount, topEnergy, insights }) {
  // Rotate through insight library — in production, pick based on real data
  const [insightIndex] = useState(() => Math.floor(Math.random() * INSIGHT_LIBRARY.length));
  const insight = INSIGHT_LIBRARY[insightIndex];

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
    <Phone>
      <Label color={C.success500}>Something I've noticed</Label>
      <div style={{ ...T.heading, color: C.neutral900, lineHeight: 1.3, marginBottom: 8 }}>
        {insight.headline}
      </div>
      <div style={{ ...T.small, color: C.neutral700, marginBottom: 24, lineHeight: 1.6 }}>
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
              <div style={{ ...T.hint, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</div>
              <div style={{ ...T.small, color: C.neutral900, fontWeight: 600 }}>{item.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination dots showing there are more insights */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
        {INSIGHT_LIBRARY.map((_, i) => (
          <div key={i} style={{
            width: i === insightIndex ? 16 : 6, height: 6, borderRadius: 6,
            background: i === insightIndex ? C.accent500 : C.neutral200,
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      <div style={{ ...T.hint, textAlign: "center", marginBottom: 20, lineHeight: 1.5 }}>
        {"I'll use this to suggest better-fitting tasks."}
      </div>
      <BtnPrimary onClick={next}>Got it</BtnPrimary>
      <div style={{ height: 12 }} />
      <BtnSecondary onClick={onExit}>Done for now</BtnSecondary>
    </Phone>
  );
}

function MomentumScreen({ next, onExit, completedSteps }) {
  const steps = completedSteps?.length > 0 ? completedSteps : [
    "Wrote 3 bullet points", "Added a screenshot", "Updated case study", "Wrote project summary",
  ];
  return (
    <Phone>
      <Label>Building up</Label>
      <div style={{ ...T.heading, color: C.neutral900, marginBottom: 8 }}>Look at what's adding up.</div>
      <div style={{ ...T.small, color: C.neutral700, marginBottom: 20, lineHeight: 1.6 }}>Each small step connects to something bigger.</div>

      <Card style={{ background: C.accent100, marginBottom: 14 }}>
        <div style={{ ...T.label, color: C.accent500, marginBottom: 12 }}>Portfolio project</div>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.accent500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ ...T.small, color: C.neutral900 }}>{s}</span>
          </div>
        ))}
        <Divider />
        <div style={{ ...T.small, color: C.accent500, fontWeight: 600, marginTop: 12 }}>→ Portfolio essentially done.</div>
      </Card>

      <Card style={{ background: C.warning100, border: `1px solid #F0E0B0`, marginBottom: 28 }}>
        <div style={{ ...T.label, color: C.warning500, marginBottom: 6 }}>Still circling</div>
        <div style={{ ...T.small, color: C.neutral900 }}>Email tax accountant — 2 attempts. Want to break it down smaller?</div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary onClick={next}>One more thing</BtnPrimary>
        <BtnSecondary onClick={onExit || next}>I'm done for now</BtnSecondary>
      </div>
    </Phone>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════

const NAV = {
  splash: "Splash",
  onboarding: "Onboarding",
  setup: "Setup",
  ready: "Ready ✓",
  suggestion: "Suggestion",
  allsteps: "All Steps",
  inprogress: "In Progress",
  simplify: "Simplify",
  pause: "Pause",
  done: "Done ✓",
  home: "Home",
  paused_confirm: "Paused ✓",
  switch_task: "Switch Task",
  return_paused: "↩ Return (paused)",
  return_short: "↩ Return (done)",
  return_long: "↩ Return (long gap)",
  pattern: "★ Pattern",
  momentum: "★ Momentum",
};

export default function NudgeApp() {
  const [screen, setScreen] = useState("splash");
  const [tasks, setTasks] = useState([]);
  const [defaultEnergy, setDefaultEnergy] = useState("low");
  const [defaultTime, setDefaultTime] = useState("10 min");
  const [stepIndex, setStepIndex] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [granularity, setGranularity] = useState("balanced");
  const [pausedStep, setPausedStep] = useState(null);

  const prevScreen = React.useRef(null);
  const go = s => { prevScreen.current = screen; setScreen(s); };
  const task = tasks[0] || "Work on portfolio";
  const steps = getSteps(task);
  const currentStep = steps[stepIndex] || steps[0];

  const [isLastStep, setIsLastStep] = React.useState(false);
  const handleDone = () => {
    setCompletedSteps(p => [...p, currentStep.text]);
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
    suggestion: <SuggestionScreen next={() => go("inprogress")} onTooHard={() => go("simplify")} onAnother={() => go("allsteps")} onSkip={() => setStepIndex(i => (i + 1) % steps.length)} onExit={() => go("home")} task={task} stepIndex={stepIndex} steps={steps} energy={defaultEnergy} />,
    allsteps: <AllStepsScreen back={() => go("suggestion")} steps={steps} task={task} stepIndex={stepIndex} onPick={i => { setStepIndex(i); go("suggestion"); }} />,
    inprogress: <InProgressScreen step={currentStep} onDone={handleDone} onPause={() => { setPausedStep(currentStep); go("pause"); }} onTooMuch={() => go("simplify")} />,
    simplify: <SimplifyScreen next={() => go("inprogress")} onStillTooMuch={() => go("suggestion")} step={currentStep} />,
    pause: <PauseScreen next={() => go("paused_confirm")} onResume={() => go("inprogress")} />,
    home: <HomeScreen onResume={() => go("suggestion")} tasks={tasks} setTasks={setTasks} />,
    paused_confirm: <PausedConfirmScreen next={() => go("home")} />,
    done: <DoneScreen next={() => go("home")} onMore={() => go("suggestion")} isLast={isLastStep} />,
    return_paused: <ReturnPausedScreen next={() => go("inprogress")} onFresh={() => go("switch_task")} onSwitch={() => go("switch_task")} step={pausedStep || currentStep} />,
    switch_task: <SwitchTaskScreen tasks={tasks.length ? tasks : ["Work on portfolio", "Clean kitchen", "Baby sleep schedule"]} onPick={t => { setTasks([t, ...tasks.filter(x => x !== t)]); setStepIndex(0); go("suggestion"); }} onAdd={t => { setTasks(p => [t, ...p]); setStepIndex(0); go("suggestion"); }} onBack={() => go(prevScreen.current || "home")} />,
    return_short: <ReturnShortScreen next={() => go("suggestion")} onExit={() => go("home")} />,
    return_long: <ReturnLongScreen next={() => go("switch_task")} />,
    pattern: <PatternScreen next={() => go("suggestion")} onExit={() => go("home")} completedCount={sessionCount} topEnergy={defaultEnergy} />,
    momentum: <MomentumScreen next={() => go("suggestion")} onExit={() => go("home")} completedSteps={completedSteps} />,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#E0DDF0", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 20px", fontFamily: "Inter, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`@keyframes drawCheck { from { stroke-dashoffset: 60; } to { stroke-dashoffset: 0; } }`}</style>

      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.neutral900, marginBottom: 4 }}>Nudge — Prototype</div>
        <div style={{ fontSize: 12, color: C.neutral500 }}>★ = new screens · ↩ = return states</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24, justifyContent: "center", maxWidth: 680 }}>
        {Object.entries(NAV).map(([s, label]) => (
          <button key={s} onClick={() => go(s)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            border: `1.5px solid ${screen === s ? C.accent500 : C.neutral200}`,
            background: screen === s ? C.accent500 : C.neutral50,
            color: screen === s ? C.neutral50 : label.startsWith("★") || label.startsWith("↩") ? C.accent500 : C.neutral700,
            cursor: "pointer", fontFamily: "Inter", transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      {screens[screen] || screens.splash}

      <div style={{ marginTop: 20, fontSize: 12, color: C.neutral500, textAlign: "center", maxWidth: 440, lineHeight: 1.8 }}>
        <strong>First time:</strong> Splash → Onboarding → Setup → Ready → Suggestion → In Progress → Done<br />
        <strong>Return paused:</strong> ↩ Return (paused) → In Progress<br />
        <strong>Return done:</strong> ↩ Return (done) or ↩ Return (long gap)
      </div>
    </div>
  );
}
