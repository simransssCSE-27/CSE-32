import React, { useState, useEffect, useCallback } from "react";
import {
  Flame,
  Star,
  Trophy,
  Plus,
  X,
  LogOut,
  Sparkles,
  Sun,
  CalendarDays,
  Check,
  Scroll,
  Shield,
  Loader2,
  Chrome,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, db, googleProvider, isConfigured } from "./firebase";

const COLORS = {
  bgDeep: "#131024",
  bgDeep2: "#1A1638",
  panel: "#1F1A40",
  panelLight: "#2A2354",
  panelBorder: "#3B3270",
  gold: "#E8B923",
  goldSoft: "#F4D35E",
  teal: "#3FB8A0",
  coral: "#E8654F",
  parchment: "#F3EFE3",
  parchmentDim: "#B3ACD6",
  parchmentFaint: "#7A73A6",
};

const DIFFICULTY = {
  easy: { xp: 10, label: "Easy", color: COLORS.teal },
  medium: { xp: 20, label: "Medium", color: COLORS.gold },
  hard: { xp: 35, label: "Hard", color: COLORS.coral },
};

const WEEKDAYS = [
  { key: "mon", label: "Mon", full: "Monday" },
  { key: "tue", label: "Tue", full: "Tuesday" },
  { key: "wed", label: "Wed", full: "Wednesday" },
  { key: "thu", label: "Thu", full: "Thursday" },
  { key: "fri", label: "Fri", full: "Friday" },
  { key: "sat", label: "Sat", full: "Saturday" },
  { key: "sun", label: "Sun", full: "Sunday" },
];

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayStr() {
  return fmtDate(new Date());
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return fmtDate(d);
}
function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  return WEEKDAYS.map((w, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { ...w, dateStr: fmtDate(d), isToday: fmtDate(d) === todayStr(), dayNum: d.getDate() };
  });
}
function rankTitle(level) {
  if (level >= 15) return "Legend";
  if (level >= 10) return "Champion";
  if (level >= 6) return "Adventurer";
  if (level >= 3) return "Apprentice";
  return "Novice";
}
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const USER_COLLECTION = "tasklyUsers";

function defaultData() {
  return {
    profile: null,
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    totalCompleted: 0,
    dailyTasks: [],
    weeklyTasks: [],
  };
}

function normalizeData(savedData, signedInUser) {
  const safeData = savedData || {};
  return {
    ...defaultData(),
    ...safeData,
    xp: Number(safeData.xp) || 0,
    streak: Number(safeData.streak) || 0,
    totalCompleted: Number(safeData.totalCompleted) || 0,
    dailyTasks: Array.isArray(safeData.dailyTasks)
      ? safeData.dailyTasks.map((task) => ({ ...task, completedDates: Array.isArray(task.completedDates) ? task.completedDates : [] }))
      : [],
    weeklyTasks: Array.isArray(safeData.weeklyTasks)
      ? safeData.weeklyTasks.map((task) => ({ ...task, completed: Boolean(task.completed) }))
      : [],
    profile: {
      name: signedInUser.displayName || "Adventurer",
      email: signedInUser.email || "",
      photoURL: signedInUser.photoURL || "",
    },
  };
}

export default function App() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("daily");
  const [toast, setToast] = useState(null);
  const [levelUpInfo, setLevelUpInfo] = useState(null);
  const [newDailyTitle, setNewDailyTitle] = useState("");
  const [newDailyDiff, setNewDailyDiff] = useState("easy");
  const [newWeeklyTitle, setNewWeeklyTitle] = useState("");
  const [newWeeklyDiff, setNewWeeklyDiff] = useState("easy");
  const [newWeeklyDay, setNewWeeklyDay] = useState(WEEKDAYS[0].key);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!isConfigured || !auth || !db) {
      let localData = null;
      try {
        localData = JSON.parse(window.localStorage.getItem("tasklyGuestData"));
      } catch (error) {
        localData = null;
      }
      setData(localData || defaultData());
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (signedInUser) => {
      setUser(signedInUser);
      if (!signedInUser) {
        setData(defaultData());
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, USER_COLLECTION, signedInUser.uid));
        const savedData = snapshot.exists() ? snapshot.data() : defaultData();
        setData(normalizeData(savedData, signedInUser));
      } catch (error) {
        setAuthError("Could not load your saved data. Check your Firestore setup.");
        setData(defaultData());
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const persist = useCallback(async (next) => {
    if (!user || !db) return;
    setSaving(true);
    try {
      await setDoc(doc(db, USER_COLLECTION, user.uid), next, { merge: true });
    } catch (error) {
      setAuthError("Your changes could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [user]);

  const update = useCallback(
    (updater) => {
      setData((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persist(next);
        if (!user && next.profile) {
          window.localStorage.setItem("tasklyGuestData", JSON.stringify(next));
        }
        return next;
      });
    },
    [persist]
  );

  function showToast(msg) {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2200);
  }

  function applyXpChange(base, delta) {
    const prevLevel = Math.floor(base.xp / 100) + 1;
    const newXp = Math.max(0, base.xp + delta);
    const newLevel = Math.floor(newXp / 100) + 1;
    const next = { ...base, xp: newXp };
    if (delta > 0 && newLevel > prevLevel) {
      setLevelUpInfo({ level: newLevel, title: rankTitle(newLevel) });
    }
    return next;
  }

  function bumpStreakIfNeeded(base) {
    const today = todayStr();
    if (base.lastActiveDate === today) return base;
    const wasYesterday = base.lastActiveDate === yesterdayStr();
    return { ...base, streak: wasYesterday ? base.streak + 1 : 1, lastActiveDate: today };
  }

  async function handleLogin() {
    if (!auth) {
      setAuthError("Firebase is not configured. Check the .env file and restart the app.");
      return;
    }
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const messages = {
        "auth/popup-closed-by-user": "The Google sign-in window was closed before finishing.",
        "auth/popup-blocked": "Your browser blocked the sign-in window. Allow popups for this site and try again.",
        "auth/unauthorized-domain": "This website is not authorized in Firebase. Add its domain in Authentication > Settings > Authorized domains.",
        "auth/operation-not-allowed": "Google sign-in is disabled. Enable Google under Firebase Authentication > Sign-in providers.",
        "auth/network-request-failed": "Network connection failed. Check your internet connection and try again.",
      };
      setAuthError(messages[error.code] || `Google sign-in failed (${error.code || "unknown error"}).`);
    }
  }

  function handleGuestLogin() {
    setAuthError("");
    setData((prev) => ({
      ...prev,
      profile: { name: "Guest adventurer", email: "", photoURL: "" },
    }));
  }

  async function handleLogout() {
    if (auth) await signOut(auth);
    setData(defaultData());
  }

  function addDailyTask() {
    const title = newDailyTitle.trim();
    if (!title) return;
    const task = {
      id: uid(),
      title,
      difficulty: newDailyDiff,
      completedDates: [],
      createdAt: Date.now(),
    };
    update((prev) => ({ ...prev, dailyTasks: [task, ...prev.dailyTasks] }));
    setNewDailyTitle("");
  }

  function toggleDaily(id) {
    const today = todayStr();
    update((prev) => {
      let xpDelta = 0;
      let justCompleted = false;
      const dailyTasks = prev.dailyTasks.map((task) => {
        if (task.id !== id) return task;
        const isDone = task.completedDates.includes(today);
        const difficulty = DIFFICULTY[task.difficulty];
        if (isDone) {
          xpDelta = -difficulty.xp;
          return { ...task, completedDates: task.completedDates.filter((date) => date !== today) };
        }
        xpDelta = difficulty.xp;
        justCompleted = true;
        return { ...task, completedDates: [...task.completedDates, today] };
      });
      let next = { ...prev, dailyTasks };
      next = applyXpChange(next, xpDelta);
      next.totalCompleted = Math.max(0, prev.totalCompleted + (justCompleted ? 1 : -1));
      if (justCompleted) {
        next = bumpStreakIfNeeded(next);
        showToast(`+${DIFFICULTY[dailyTasks.find((task) => task.id === id).difficulty].xp} XP  Quest complete!`);
      }
      return next;
    });
  }

  function deleteDaily(id) {
    update((prev) => ({ ...prev, dailyTasks: prev.dailyTasks.filter((task) => task.id !== id) }));
  }

  function addWeeklyTask() {
    const title = newWeeklyTitle.trim();
    if (!title) return;
    const task = {
      id: uid(),
      title,
      difficulty: newWeeklyDiff,
      day: newWeeklyDay,
      completed: false,
      createdAt: Date.now(),
    };
    update((prev) => ({ ...prev, weeklyTasks: [task, ...prev.weeklyTasks] }));
    setNewWeeklyTitle("");
  }

  function toggleWeekly(id) {
    update((prev) => {
      let xpDelta = 0;
      let justCompleted = false;
      const weeklyTasks = prev.weeklyTasks.map((t) => {
        if (t.id !== id) return t;
        const diff = DIFFICULTY[t.difficulty];
        if (t.completed) {
          xpDelta = -diff.xp;
          return { ...t, completed: false };
        } else {
          xpDelta = diff.xp;
          justCompleted = true;
          return { ...t, completed: true };
        }
      });
      let next = { ...prev, weeklyTasks };
      next = applyXpChange(next, xpDelta);
      next.totalCompleted = Math.max(0, prev.totalCompleted + (justCompleted ? 1 : -1));
      if (justCompleted) {
        next = bumpStreakIfNeeded(next);
        showToast(`+${DIFFICULTY[weeklyTasks.find((t) => t.id === id).difficulty].xp} XP  Quest complete!`);
      }
      return next;
    });
  }

  function deleteWeekly(id) {
    update((prev) => ({ ...prev, weeklyTasks: prev.weeklyTasks.filter((t) => t.id !== id) }));
  }

  function resetWeek() {
    update((prev) => ({ ...prev, weeklyTasks: prev.weeklyTasks.map((t) => ({ ...t, completed: false })) }));
  }

  if (loading || !data) {
    return (
      <div
        style={{ background: COLORS.bgDeep, minHeight: "600px" }}
        className="w-full flex items-center justify-center p-8"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin" size={32} color={COLORS.gold} />
          <span style={{ color: COLORS.parchmentDim, fontFamily: "'Manrope', sans-serif" }} className="text-sm">
            Getting you sorted...
          </span>
        </div>
      </div>
    );
  }

  const fontImports = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
      .qy-font-display { font-family: 'Cinzel', serif; }
      .qy-font-body { font-family: 'Manrope', sans-serif; }
      .qy-font-mono { font-family: 'Space Mono', monospace; }
      @keyframes qy-pop { 0% { transform: scale(0.9); opacity: 0; } 60% { transform: scale(1.03); opacity: 1; } 100% { transform: scale(1); } }
      @keyframes qy-slidein { 0% { transform: translateY(-12px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      @keyframes qy-burst { 0% { transform: scale(0.4) rotate(0deg); opacity: 0; } 40% { opacity: 1; } 100% { transform: scale(1.6) rotate(20deg); opacity: 0; } }
      @keyframes qy-flame { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
      .qy-toast { animation: qy-slidein 0.25s ease-out; }
      .qy-levelup { animation: qy-pop 0.35s ease-out; }
      .qy-flame-anim { animation: qy-flame 1.6s ease-in-out infinite; }
      .qy-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
      .qy-scroll::-webkit-scrollbar-thumb { background: ${COLORS.panelBorder}; border-radius: 4px; }
      .qy-checkbox { transition: all 0.15s ease; }
      .qy-checkbox:active { transform: scale(0.9); }
      .qy-card { transition: border-color 0.15s ease, transform 0.1s ease; }
      .qy-card:hover { border-color: ${COLORS.gold}; }
      input::placeholder { color: ${COLORS.parchmentFaint}; }
    `}</style>
  );

  // ---------- LOGIN SCREEN ----------
  if (!data.profile) {
    return (
      <div
        style={{
          background: `radial-gradient(circle at 20% 20%, ${COLORS.bgDeep2} 0%, ${COLORS.bgDeep} 55%)`,
          minHeight: "640px",
        }}
        className="w-full flex items-center justify-center p-6"
      >
        {fontImports}
        <div
          style={{
            background: COLORS.panel,
            border: `1px solid ${COLORS.panelBorder}`,
            animation: "qy-pop 0.4s ease-out",
          }}
          className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center text-center"
        >
          <div
            style={{ background: COLORS.panelLight, border: `2px solid ${COLORS.gold}` }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          >
            <Shield size={30} color={COLORS.gold} />
          </div>
          <h1 className="qy-font-display" style={{ color: COLORS.gold, letterSpacing: "0.08em" }}>
            <span className="text-3xl">TASKLY</span>
          </h1>
          <p className="qy-font-body mt-2 text-sm" style={{ color: COLORS.parchmentDim }}>
            Stay Sorted.
          </p>

          <div className="w-full mt-8 flex flex-col gap-3">
            <button
              onClick={handleLogin}
              className="qy-font-display w-full rounded-lg py-3 text-sm tracking-wide flex items-center justify-center gap-2"
              style={{ background: COLORS.gold, color: COLORS.bgDeep, fontWeight: 700 }}
            >
              <Chrome size={16} />
              SIGN IN WITH GOOGLE
            </button>
            <button
              onClick={handleGuestLogin}
              className="qy-font-body w-full rounded-lg py-3 text-sm font-semibold"
              style={{ background: "transparent", color: COLORS.parchment, border: `1px solid ${COLORS.panelBorder}` }}
            >
              Continue as guest
            </button>
            {authError && <p className="qy-font-body text-xs" style={{ color: COLORS.coral }}>{authError}</p>}
            {!isConfigured && (
              <p className="qy-font-body text-xs" style={{ color: COLORS.coral }}>
                Add your Firebase settings to `.env` before signing in.
              </p>
            )}
          </div>

          <p className="qy-font-body mt-6 text-xs" style={{ color: COLORS.parchmentFaint }}>
            Your quests, XP and streak are saved automatically.
          </p>
        </div>
      </div>
    );
  }

  // ---------- DASHBOARD ----------
  const level = Math.floor(data.xp / 100) + 1;
  const xpIntoLevel = data.xp % 100;
  const title = rankTitle(level);
  const week = getWeekDates();
  const today = todayStr();

  const dailyDoneToday = data.dailyTasks.filter((t) => t.completedDates.includes(today)).length;
  const dailyTotal = data.dailyTasks.length;

  const perDayCounts = week.map((w) => {
    const dailyCount = data.dailyTasks.filter((t) => t.completedDates.includes(w.dateStr)).length;
    const weeklyCount = data.weeklyTasks.filter((t) => t.day === w.key && t.completed).length;
    return { ...w, count: dailyCount + weeklyCount };
  });
  const maxCount = Math.max(1, ...perDayCounts.map((d) => d.count));

  const initials = data.profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  return (
    <div style={{ background: COLORS.bgDeep, minHeight: "640px" }} className="w-full pb-10 relative">
      {fontImports}

      {toast && (
        <div
          className="qy-toast qy-font-body fixed sm:absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2"
          style={{ background: COLORS.gold, color: COLORS.bgDeep }}
        >
          <Star size={14} /> {toast}
        </div>
      )}

      {levelUpInfo && (
        <div
          className="fixed sm:absolute inset-0 z-40 flex items-center justify-center p-6"
          style={{ background: "rgba(10,8,25,0.75)" }}
          onClick={() => setLevelUpInfo(null)}
        >
          <div
            className="qy-levelup rounded-2xl p-8 text-center max-w-xs w-full relative overflow-hidden"
            style={{ background: COLORS.panel, border: `2px solid ${COLORS.gold}` }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ animation: "qy-burst 1s ease-out" }}
            >
              <Sparkles size={140} color={COLORS.gold} strokeWidth={1} />
            </div>
            <Trophy size={40} color={COLORS.gold} className="mx-auto mb-3" />
            <p className="qy-font-body text-xs tracking-widest uppercase" style={{ color: COLORS.parchmentDim }}>
              Level up
            </p>
            <h2 className="qy-font-display text-4xl mt-1" style={{ color: COLORS.goldSoft }}>
              {levelUpInfo.level}
            </h2>
            <p className="qy-font-body text-sm mt-2" style={{ color: COLORS.parchment }}>
              You are now a <span style={{ color: COLORS.gold, fontWeight: 700 }}>{levelUpInfo.title}</span>
            </p>
            <button
              onClick={() => setLevelUpInfo(null)}
              className="qy-font-body mt-6 px-5 py-2 rounded-lg text-xs font-semibold"
              style={{ background: COLORS.gold, color: COLORS.bgDeep }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }} className="px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Shield size={20} color={COLORS.gold} />
            <span className="qy-font-display text-lg" style={{ color: COLORS.gold, letterSpacing: "0.05em" }}>
              TASKLY
            </span>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end min-w-[260px]">
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <div
                style={{ background: COLORS.panelLight, border: `1px solid ${COLORS.gold}` }}
                className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center qy-font-display text-xs"
              >
                <span style={{ color: COLORS.gold }}>{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="qy-font-body text-xs font-semibold truncate" style={{ color: COLORS.parchment }}>
                    {data.profile.name}
                  </span>
                  <span className="qy-font-mono text-[10px] shrink-0" style={{ color: COLORS.parchmentDim }}>
                    Lv.{level} {xpIntoLevel}/100
                  </span>
                </div>
                <div
                  style={{ background: COLORS.bgDeep, border: `1px solid ${COLORS.panelBorder}` }}
                  className="w-full h-2 rounded-full mt-1 overflow-hidden"
                >
                  <div
                    style={{
                      width: `${xpIntoLevel}%`,
                      background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldSoft})`,
                      transition: "width 0.4s ease",
                    }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 qy-flame-anim">
              <Flame size={18} color={COLORS.coral} />
              <span className="qy-font-mono text-sm" style={{ color: COLORS.coral }}>
                {data.streak}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Switch adventurer"
              className="p-2 rounded-lg"
              style={{ border: `1px solid ${COLORS.panelBorder}` }}
            >
              <LogOut size={15} color={COLORS.parchmentDim} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Rank", value: title, icon: Trophy, color: COLORS.gold },
            { label: "Level", value: level, icon: Star, color: COLORS.goldSoft },
            { label: "Day streak", value: data.streak, icon: Flame, color: COLORS.coral },
            { label: "Quests done", value: data.totalCompleted, icon: Check, color: COLORS.teal },
          ].map((s) => (
            <div
              key={s.label}
              style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
              className="rounded-xl p-3 flex items-center gap-3"
            >
              <div
                style={{ background: COLORS.panelLight }}
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              >
                <s.icon size={16} color={s.color} />
              </div>
              <div className="min-w-0">
                <p className="qy-font-body text-[10px] uppercase tracking-wide truncate" style={{ color: COLORS.parchmentFaint }}>
                  {s.label}
                </p>
                <p className="qy-font-display text-base truncate" style={{ color: COLORS.parchment }}>
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
          className="inline-flex rounded-full p-1 mt-8 gap-1"
        >
          {[
            { key: "daily", label: "Daily quests", icon: Sun },
            { key: "weekly", label: "Weekly quests", icon: CalendarDays },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="qy-font-body text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2"
              style={{
                background: tab === t.key ? COLORS.gold : "transparent",
                color: tab === t.key ? COLORS.bgDeep : COLORS.parchmentDim,
              }}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Weekly progress mini chart (always visible under tabs) */}
        <div
          style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
          className="rounded-xl p-4 mt-4 flex items-end gap-2 sm:gap-4 h-28"
        >
          {perDayCounts.map((d) => (
            <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <span className="qy-font-mono text-[10px]" style={{ color: COLORS.parchmentFaint }}>
                {d.count > 0 ? d.count : ""}
              </span>
              <div
                style={{
                  height: `${Math.max(6, (d.count / maxCount) * 60)}px`,
                  width: "100%",
                  maxWidth: "22px",
                  background: d.isToday ? COLORS.gold : COLORS.panelLight,
                  border: d.isToday ? "none" : `1px solid ${COLORS.panelBorder}`,
                  transition: "height 0.3s ease",
                }}
                className="rounded-t-md"
              />
              <span
                className="qy-font-body text-[10px] uppercase"
                style={{ color: d.isToday ? COLORS.gold : COLORS.parchmentFaint, fontWeight: d.isToday ? 700 : 400 }}
              >
                {d.label}
              </span>
            </div>
          ))}
        </div>

        {/* DAILY TAB */}
        {tab === "daily" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="qy-font-body text-xs" style={{ color: COLORS.parchmentDim }}>
                {dailyDoneToday}/{dailyTotal} completed today
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                value={newDailyTitle}
                onChange={(e) => setNewDailyTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDailyTask()}
                placeholder="Add a daily quest, e.g. Drink 2L of water"
                className="qy-font-body flex-1 rounded-lg px-4 py-2.5 text-sm outline-none"
                style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.parchment }}
              />
              <select
                value={newDailyDiff}
                onChange={(e) => setNewDailyDiff(e.target.value)}
                className="qy-font-body rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.parchment }}
              >
                {Object.entries(DIFFICULTY).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label} (+{v.xp} XP)
                  </option>
                ))}
              </select>
              <button
                onClick={addDailyTask}
                className="qy-font-body rounded-lg px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-1 shrink-0"
                style={{ background: COLORS.gold, color: COLORS.bgDeep }}
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {data.dailyTasks.length === 0 ? (
              <EmptyState text="No daily quests yet. Add a small habit above and start your streak." />
            ) : (
              <div className="flex flex-col gap-2">
                {data.dailyTasks.map((t) => {
                  const done = t.completedDates.includes(today);
                  const diff = DIFFICULTY[t.difficulty];
                  return (
                    <QuestCard
                      key={t.id}
                      title={t.title}
                      done={done}
                      diff={diff}
                      onToggle={() => toggleDaily(t.id)}
                      onDelete={() => deleteDaily(t.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* WEEKLY TAB */}
        {tab === "weekly" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="qy-font-body text-xs" style={{ color: COLORS.parchmentDim }}>
                {data.weeklyTasks.filter((t) => t.completed).length}/{data.weeklyTasks.length} completed this week
              </p>
              <button
                onClick={resetWeek}
                className="qy-font-body text-xs px-3 py-1.5 rounded-lg"
                style={{ border: `1px solid ${COLORS.panelBorder}`, color: COLORS.parchmentDim }}
              >
                Reset week
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                value={newWeeklyTitle}
                onChange={(e) => setNewWeeklyTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWeeklyTask()}
                placeholder="Add a weekly quest, e.g. Finish project outline"
                className="qy-font-body flex-1 rounded-lg px-4 py-2.5 text-sm outline-none"
                style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.parchment }}
              />
              <select
                value={newWeeklyDay}
                onChange={(e) => setNewWeeklyDay(e.target.value)}
                className="qy-font-body rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.parchment }}
              >
                {WEEKDAYS.map((w) => (
                  <option key={w.key} value={w.key}>
                    {w.full}
                  </option>
                ))}
              </select>
              <select
                value={newWeeklyDiff}
                onChange={(e) => setNewWeeklyDiff(e.target.value)}
                className="qy-font-body rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.parchment }}
              >
                {Object.entries(DIFFICULTY).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label} (+{v.xp} XP)
                  </option>
                ))}
              </select>
              <button
                onClick={addWeeklyTask}
                className="qy-font-body rounded-lg px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-1 shrink-0"
                style={{ background: COLORS.gold, color: COLORS.bgDeep }}
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {data.weeklyTasks.length === 0 ? (
              <EmptyState text="No weekly quests yet. Plan out your week by adding tasks to each day." />
            ) : (
              <div className="flex overflow-x-auto qy-scroll gap-3 pb-2 md:grid md:grid-cols-7 md:overflow-visible">
                {week.map((w) => {
                  const dayTasks = data.weeklyTasks.filter((t) => t.day === w.key);
                  return (
                    <div key={w.key} className="min-w-[220px] md:min-w-0 flex flex-col gap-2">
                      <div
                        className="flex items-center justify-between px-1 py-1 rounded-md"
                        style={{
                          borderBottom: `2px solid ${w.isToday ? COLORS.gold : COLORS.panelBorder}`,
                        }}
                      >
                        <span
                          className="qy-font-body text-xs font-semibold"
                          style={{ color: w.isToday ? COLORS.gold : COLORS.parchmentDim }}
                        >
                          {w.full}
                        </span>
                        <span className="qy-font-mono text-[10px]" style={{ color: COLORS.parchmentFaint }}>
                          {w.dayNum}
                        </span>
                      </div>
                      {dayTasks.length === 0 ? (
                        <p className="qy-font-body text-[11px] italic px-1" style={{ color: COLORS.parchmentFaint }}>
                          No quests
                        </p>
                      ) : (
                        dayTasks.map((t) => (
                          <QuestCard
                            key={t.id}
                            compact
                            title={t.title}
                            done={t.completed}
                            diff={DIFFICULTY[t.difficulty]}
                            onToggle={() => toggleWeekly(t.id)}
                            onDelete={() => deleteWeekly(t.id)}
                          />
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="qy-font-mono text-[10px] text-center mt-10"
        style={{ color: COLORS.parchmentFaint, opacity: saving ? 1 : 0.4 }}
      >
        {saving ? "saving..." : "saved"}
      </div>
    </div>
  );
}

function QuestCard({ title, done, diff, onToggle, onDelete, compact }) {
  return (
    <div
      className="qy-card rounded-lg flex items-center gap-3 group"
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.panelBorder}`,
        padding: compact ? "8px 10px" : "12px 14px",
      }}
    >
      <button
        onClick={onToggle}
        className="qy-checkbox shrink-0 rounded-full flex items-center justify-center"
        style={{
          width: compact ? 20 : 24,
          height: compact ? 20 : 24,
          background: done ? COLORS.teal : "transparent",
          border: `2px solid ${done ? COLORS.teal : COLORS.panelBorder}`,
        }}
      >
        {done && <Check size={compact ? 12 : 14} color={COLORS.bgDeep} strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className="qy-font-body text-sm truncate"
          style={{
            color: done ? COLORS.parchmentFaint : COLORS.parchment,
            textDecoration: done ? "line-through" : "none",
          }}
        >
          {title}
        </p>
      </div>

      <span
        className="qy-font-mono text-[10px] shrink-0 px-2 py-0.5 rounded-full"
        style={{ background: COLORS.bgDeep, color: diff.color, border: `1px solid ${diff.color}` }}
      >
        +{diff.xp}
      </span>

      <button
        onClick={onDelete}
        className="shrink-0 opacity-40 hover:opacity-100"
        style={{ color: COLORS.parchmentFaint }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div
      className="rounded-xl p-8 flex flex-col items-center text-center gap-2"
      style={{ background: COLORS.panel, border: `1px dashed ${COLORS.panelBorder}` }}
    >
      <Scroll size={26} color={COLORS.parchmentFaint} />
      <p className="qy-font-body text-xs max-w-xs" style={{ color: COLORS.parchmentDim }}>
        {text}
      </p>
    </div>
  );
}
