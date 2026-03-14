import { Stack, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import logo from "../../assets/logo.png";

export default function Login({ setMode })  {
  const navigate = useNavigate();
  const theme = useTheme();
  const API_URL = useMemo(() => "http://localhost:8001/api/auth/token/", []);

  const [username, setUsername] = useState(localStorage.getItem("saved_user") || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(Boolean(localStorage.getItem("saved_user")));
  const [showPass, setShowPass] = useState(false);

  const [capsOn, setCapsOn] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // entry animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  // 3D tilt
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, sx: 1 });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);

      const rx = clamp(-10, 10, -dy * 8);
      const ry = clamp(-10, 10, dx * 8);
      setTilt({ rx, ry, sx: 1.01 });
    }
    function onLeave() {
      setTilt({ rx: 0, ry: 0, sx: 1 });
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  async function login() {
    setLoading(true);
    setError(null);

    try {
      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await r.text();
      let j = {};
      try {
        j = text ? JSON.parse(text) : {};
      } catch {
        j = {};
      }

      if (!r.ok) {
        setError(j?.detail || j?.error || text || `Login failed (HTTP ${r.status})`);
        return;
      }

      localStorage.setItem("access", j.access);
      localStorage.setItem("refresh", j.refresh);

      if (remember) localStorage.setItem("saved_user", username);
      else localStorage.removeItem("saved_user");

      setSuccess(true);

      // fancy delay then redirect
      setTimeout(() => navigate("/", { replace: true }), 900);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const disabled = !username || !password || loading || success;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#040816] text-white">
      <Stack
  direction="row"
  sx={{
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1000,
  }}
>
  {theme.palette.mode === "light" ? (
    <IconButton
      onClick={() => {
        localStorage.setItem(
          "currentMode",
          theme.palette.mode === "dark" ? "light" : "dark"
        );
        setMode((prevMode) =>
          prevMode === "light" ? "dark" : "light"
        );
      }}
      color="inherit"
    >
      <LightModeOutlinedIcon />
    </IconButton>
  ) : (
    <IconButton
      onClick={() => {
        localStorage.setItem(
          "currentMode",
          theme.palette.mode === "dark" ? "light" : "dark"
        );
        setMode((prevMode) =>
          prevMode === "light" ? "dark" : "light"
        );
      }}
      color="inherit"
    >
      <DarkModeOutlinedIcon />
    </IconButton>
  )}
</Stack>
      {/* Background: aurora */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-72 -left-72 h-[980px] w-[980px] rounded-full blur-3xl bg-cyan-500/18 animate-[pulse_7s_ease-in-out_infinite]" />
        <div className="absolute -bottom-80 -right-80 h-[980px] w-[980px] rounded-full blur-3xl bg-indigo-600/16 animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/4 -right-56 h-[680px] w-[680px] rounded-full blur-3xl bg-blue-600/16 animate-[pulse_9s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 -left-56 h-[680px] w-[680px] rounded-full blur-3xl bg-sky-500/14 animate-[pulse_10s_ease-in-out_infinite]" />
      </div>

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:56px_56px]" />

      {/* Noise */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><filter id=%22n%22 x=%220%22 y=%220%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/></filter><rect width=%22300%22 height=%22300%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')]" />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(4,8,22,0.35)_55%,rgba(4,8,22,0.95)_100%)]" />

      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[15%] h-28 w-28 rounded-full bg-cyan-400/10 blur-xl animate-[floaty_10s_ease-in-out_infinite]" />
        <div className="absolute right-[12%] top-[55%] h-36 w-36 rounded-full bg-indigo-400/10 blur-xl animate-[floaty_12s_ease-in-out_infinite]" />
        <div className="absolute left-[20%] bottom-[18%] h-44 w-44 rounded-full bg-blue-400/10 blur-2xl animate-[floaty_14s_ease-in-out_infinite]" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div
          className={[
            "w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          ].join(" ")}
          style={{ transition: "all 600ms cubic-bezier(.2,.8,.2,1)" }}
        >
          {/* LEFT HERO */}
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.85)]" />
                <span className="text-xs tracking-widest text-gray-200 uppercase">
                  ServoXis • LEONI IT Performance
                </span>
              </div>

              <h1 className="mt-6 text-5xl font-semibold leading-tight">
                Modern IT
                <span className="block bg-gradient-to-r from-cyan-200 via-blue-300 to-indigo-200 bg-clip-text text-transparent">
                  Performance Platform
                </span>
              </h1>

              <p className="mt-4 text-sm text-gray-300 leading-relaxed max-w-lg">
                Track incidents, requests, changes, and KPIs in one place — built for speed,
                clarity, and enterprise-level polish.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg">
                <Stat label="Security" value="JWT tokens" />
                <Stat label="Experience" value="SaaS-grade UI" />
                <Stat label="KPIs" value="Definitions + Values" />
                <Stat label="Ops" value="ITSM aligned" />
              </div>

              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
                <div className="text-xs tracking-widest text-gray-300 uppercase">Pro tip</div>
                <div className="mt-2 text-sm text-gray-200">
                  Use a strong password. We never store it — only JWT tokens are saved.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT LOGIN */}
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className="relative w-full max-w-md"
              style={{
                transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.sx})`,
                transition: "transform 140ms ease-out",
              }}
            >
              {/* Outer glow frame */}
              <div className="absolute -inset-[2px] rounded-[30px] blur-2xl bg-gradient-to-r from-cyan-500/30 via-blue-600/25 to-indigo-600/30" />

              <div className="relative rounded-[30px] border border-white/10 bg-white/7 backdrop-blur-2xl shadow-[0_45px_110px_rgba(0,0,0,0.65)] overflow-hidden">
                {/* Top gradient line */}
                <div className="h-[6px] bg-gradient-to-r from-cyan-400 via-blue-600 to-indigo-600" />

                {/* Shine */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rotate-12 bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-28 -right-28 h-72 w-72 rotate-12 bg-cyan-400/10 blur-3xl" />

                <div className="p-7 sm:p-8">
                  {/* Brand */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute -inset-2 rounded-2xl blur-xl bg-blue-600/25" />
                        <img
                          src={logo}
                          alt="SERVOXIS"
                          className="relative h-12 w-12 rounded-2xl object-cover border border-white/10 bg-white/5"
                        />
                      </div>
                      <div className="leading-tight">
                        <div className="text-lg font-semibold tracking-wide">SERVOXIS</div>
                        <div className="text-[11px] text-gray-300 tracking-widest uppercase">
                          LEONI IT PERFORMANCE
                        </div>
                      </div>
                    </div>

                    <Badge text="v1.0" />
                  </div>

                  <div className="mt-6">
                    <div className="text-2xl font-semibold">Sign in</div>
                    <div className="text-sm text-gray-300 mt-1">
                      Welcome back — continue to your workspace
                    </div>
                  </div>

                  {/* Error toast */}
                  {error && (
                    <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-red-200">Authentication error</div>
                          <div className="text-xs text-red-200/90 mt-1 break-words">{error}</div>
                        </div>
                        <button
                          onClick={() => setError(null)}
                          className="text-red-200/80 hover:text-red-100 text-sm"
                          title="Dismiss"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    <Field label="Username">
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. wael.benali"
                        autoComplete="username"
                        className="w-full rounded-2xl px-4 py-3 outline-none border border-white/12 bg-white/6 text-white placeholder-gray-400
                                   focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/30 transition
                                   hover:border-white/20"
                      />
                    </Field>

                    <Field
                      label="Password"
                      right={
                        <button
                          type="button"
                          onClick={() => setShowPass((s) => !s)}
                          className="text-xs text-gray-300 hover:text-white transition"
                        >
                          {showPass ? "Hide" : "Show"}
                        </button>
                      }
                    >
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        onKeyDown={(e) => {
                          setCapsOn(e.getModifierState && e.getModifierState("CapsLock"));
                          if (e.key === "Enter" && !disabled) login();
                        }}
                        onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}
                        className="w-full rounded-2xl px-4 py-3 outline-none border border-white/12 bg-white/6 text-white placeholder-gray-400
                                   focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/30 transition
                                   hover:border-white/20"
                      />
                    </Field>

                    {capsOn && (
                      <div className="rounded-2xl border border-yellow-300/20 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-200">
                        Caps Lock is ON
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-gray-300 select-none">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          className="h-4 w-4 rounded border-white/20 bg-white/10"
                        />
                        Remember me
                      </label>

                      <button
                        type="button"
                        onClick={() => alert("Forgot password flow: later 😉")}
                        className="text-sm text-cyan-300 hover:text-cyan-200 transition"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      disabled={disabled}
                      onClick={login}
                      className={[
                        "w-full rounded-2xl py-3 text-sm font-semibold transition shadow-lg flex items-center justify-center gap-2",
                        "active:scale-[0.99]",
                        disabled
                          ? "bg-white/10 text-gray-400 cursor-not-allowed shadow-none"
                          : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white shadow-blue-600/40",
                      ].join(" ")}
                    >
                      {loading ? (
                        <>
                          <Spinner />
                          Authenticating...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    <div className="text-[11px] text-center text-gray-400 leading-relaxed">
                      Internal system • password is never stored • actions can be audited
                    </div>
                  </div>
                </div>

                <div className="px-7 py-4 border-t border-white/10 text-xs text-gray-400 flex items-center justify-between">
                  <span>© {new Date().getFullYear()} SERVOXIS</span>
                  <span className="text-gray-300">LEONI • Internal</span>
                </div>

                {/* SUCCESS OVERLAY */}
                {success && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#040816]/40 backdrop-blur-xl">
                    <div className="text-center px-8">
                      <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_30px_90px_rgba(37,99,235,0.45)]">
                        <CheckIcon />
                      </div>
                      <div className="mt-5 text-xl font-semibold">Welcome back</div>
                      <div className="mt-1 text-sm text-gray-300">Redirecting to dashboard…</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: .85; } 50% { transform: scale(1.06); opacity: 1; } }
        @keyframes floaty { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
      `}</style>
    </div>
  );
}

function clamp(min, max, v) {
  return Math.max(min, Math.min(max, v));
}

function Field({ label, right, children }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-gray-300">{label}</label>
        {right}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
      <div className="text-xs text-gray-300 uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function Badge({ text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-200 tracking-widest uppercase">
      {text}
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
      style={{ animation: "spin 0.8s linear infinite" }}
    />
  );
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}