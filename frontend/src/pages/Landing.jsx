import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  animate,
} from 'framer-motion';
import useAuth from '../hooks/useAuth';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  bg: '#0A0A0A',
  panel: '#111111',
  border: '#1E1E1E',
  heading: '#F5F5F5',
  body: '#B8B8B8',
  muted: '#6B6B6B',
  accent: '#FF3B30',
  success: '#22C55E',
  warning: '#EAB308',
};

/* ─────────────────────────────────────────────
   CRT SCANLINES
───────────────────────────────────────────── */
function CRTOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{
        background:
          'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.009) 3px,rgba(255,255,255,0.009) 4px)',
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   TACTICAL GRID (parallax-aware)
───────────────────────────────────────────── */
function TacticalGrid({ yOffset }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ y: yOffset ?? 0 }}
    >
      <svg className="absolute inset-0 h-[120%] w-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="g-sm" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0L0 0 0 48" fill="none" stroke={T.accent} strokeWidth="0.4" />
          </pattern>
          <pattern id="g-lg" width="240" height="240" patternUnits="userSpaceOnUse">
            <rect width="240" height="240" fill="url(#g-sm)" />
            <path d="M240 0L0 0 0 240" fill="none" stroke={T.accent} strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g-lg)" />
      </svg>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   ANIMATED TELEMETRY DOTS
───────────────────────────────────────────── */
function TelemetryDots() {
  const positions = [
    { x: '12%', y: '22%' }, { x: '78%', y: '18%' }, { x: '55%', y: '65%' },
    { x: '30%', y: '78%' }, { x: '88%', y: '55%' }, { x: '20%', y: '45%' },
    { x: '65%', y: '85%' }, { x: '42%', y: '35%' },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {positions.map((p, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full"
          style={{ left: p.x, top: p.y, background: T.accent }}
          animate={{ opacity: [0.1, 0.6, 0.1], scale: [1, 1.8, 1] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RADAR SWEEP
───────────────────────────────────────────── */
function RadarSweep({ className = '' }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden>
      <div className="relative h-28 w-28 opacity-[0.18]">
        <svg viewBox="0 0 128 128" className="absolute inset-0">
          <circle cx="64" cy="64" r="60" stroke={T.accent} strokeWidth="0.6" fill="none" />
          <circle cx="64" cy="64" r="40" stroke={T.accent} strokeWidth="0.4" fill="none" />
          <circle cx="64" cy="64" r="20" stroke={T.accent} strokeWidth="0.4" fill="none" />
          <line x1="64" y1="4" x2="64" y2="124" stroke={T.accent} strokeWidth="0.3" />
          <line x1="4" y1="64" x2="124" y2="64" stroke={T.accent} strokeWidth="0.3" />
        </svg>
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 128 128">
            <defs>
              <linearGradient id="sweep-g" x1="64" y1="64" x2="64" y2="4" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={T.accent} stopOpacity="0.55" />
                <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M64,64 L64,4 A60,60 0 0,1 94,17 Z" fill="url(#sweep-g)" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CROSSHAIR
───────────────────────────────────────────── */
function Crosshair({ style = {}, size = 22, delay = 0 }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute"
      style={style}
      animate={{ opacity: [0.08, 0.4, 0.08] }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" stroke={T.accent} strokeWidth="0.8" />
        <line x1="12" y1="0" x2="12" y2="7" stroke={T.accent} strokeWidth="0.8" />
        <line x1="12" y1="17" x2="12" y2="24" stroke={T.accent} strokeWidth="0.8" />
        <line x1="0" y1="12" x2="7" y2="12" stroke={T.accent} strokeWidth="0.8" />
        <line x1="17" y1="12" x2="24" y2="12" stroke={T.accent} strokeWidth="0.8" />
      </svg>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────────── */
function SectionLabel({ index, text }) {
  return (
    <motion.div
      className="mb-6 flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="h-px w-6" style={{ background: T.accent }} />
      <span className="font-mono text-[10px] uppercase tracking-[0.45em]" style={{ color: T.accent }}>
        {String(index).padStart(2, '0')} / {text}
      </span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   INLINE ICON
───────────────────────────────────────────── */
function Icon({ name, size = 20, color = T.accent }) {
  const d = {
    register: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    schedule: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    execute: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    monitor: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    terminal: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  };
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
      {(d[name] || '').split(' M').map((seg, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" d={(i === 0 ? '' : 'M') + seg} />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 1 — HERO (scroll-driven parallax + scale)
═══════════════════════════════════════════════════════════ */
function HeroSection({ scrollY, onGetStarted }) {
  const gridY = useTransform(scrollY, [0, 800], [0, 80]);
  const textY = useTransform(scrollY, [0, 700], [0, -90]);
  const textScale = useTransform(scrollY, [0, 700], [1, 0.88]);
  const ctaOp = useTransform(scrollY, [0, 500], [1, 0]);
  const crossY1 = useTransform(scrollY, [0, 700], [0, -40]);
  const crossY2 = useTransform(scrollY, [0, 700], [0, 30]);

  const sTextY = useSpring(textY, { stiffness: 60, damping: 20 });
  const sTextScale = useSpring(textScale, { stiffness: 60, damping: 20 });

  return (
    <section className="relative flex h-screen flex-col overflow-hidden" style={{ background: T.bg }}>
      <TacticalGrid yOffset={gridY} />
      <TelemetryDots />

      {/* moving crosshairs */}
      <motion.div style={{ y: crossY1 }} className="absolute inset-0 pointer-events-none">
        <Crosshair style={{ left: '14%', top: '28%' }} delay={0} />
        <Crosshair style={{ left: '72%', top: '20%' }} size={30} delay={1.1} />
      </motion.div>
      <motion.div style={{ y: crossY2 }} className="absolute inset-0 pointer-events-none">
        <Crosshair style={{ left: '58%', top: '68%' }} size={16} delay={0.5} />
        <Crosshair style={{ left: '28%', top: '72%' }} size={20} delay={1.6} />
      </motion.div>

      <RadarSweep className="absolute bottom-10 right-10 z-10" />

      {/* NAV */}
      <nav className="relative z-20 flex items-center justify-between px-8 pt-7 lg:px-16">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-2 w-2 rounded-full"
            style={{ background: T.accent }}
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.35em]" style={{ color: T.heading }}>
            ScriptFlow
          </span>
        </div>
        <div className="flex items-center gap-6">

          <button onClick={onGetStarted}
            className="border px-5 py-2 font-mono text-[10px] uppercase tracking-[0.3em] transition-all"
            style={{ borderColor: T.accent, color: T.accent }}
            onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.accent; }}
          >Sign In</button>
        </div>
      </nav>

      {/* HERO CONTENT — scroll-driven */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-8 lg:px-16">
        <motion.div style={{ y: sTextY, scale: sTextScale, opacity: ctaOp }}>
          <motion.div className="mb-8 flex items-center gap-3"
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <span className="border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.4em]"
              style={{ borderColor: T.border, color: T.muted }}>
              Backend Automation Dashboard
            </span>
          </motion.div>

          <div className="overflow-hidden">
            <motion.h1
              className="max-w-5xl text-[clamp(3.2rem,8.5vw,9rem)] font-black leading-[0.88] tracking-[-0.03em]"
              style={{ color: T.heading }}
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
              Run Python scripts.<br />
              <span style={{ color: T.accent }}>Without</span> a terminal.
            </motion.h1>
          </div>

          <motion.p className="mt-8 max-w-xl border-l-2 pl-5 font-mono text-[15px] leading-8"
            style={{ borderColor: '#2a2a2a', color: T.body }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>
            Schedule, execute, and monitor Python automation scripts from a
            web dashboard — no SSH, no crontab, no DevOps overhead.
          </motion.p>

          <motion.div className="mt-10 flex flex-wrap items-center gap-5"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}>
            <motion.button onClick={onGetStarted}
              className="px-10 py-4 font-mono text-sm font-bold uppercase tracking-[0.25em] text-black"
              style={{ background: T.accent }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}>
              Get Started Free
            </motion.button>

          </motion.div>

          <motion.div className="mt-14 flex flex-wrap gap-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65 }}>
            {['Script Registry', 'Cron Scheduler', 'Live Logs', 'Run History', 'Google Auth'].map(t => (
              <span key={t} className="border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ borderColor: T.border, color: T.muted }}>{t}</span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 2 — WHAT IS IT (split layout)
═══════════════════════════════════════════════════════════ */
function WhatIsSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const yLeft = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const yRight = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const sYLeft = useSpring(yLeft, { stiffness: 50, damping: 20 });
  const sYRight = useSpring(yRight, { stiffness: 50, damping: 20 });

  return (
    <section ref={ref} className="relative px-8 py-32 lg:px-16 overflow-hidden" style={{ background: T.bg }}>
      <TacticalGrid yOffset={gridY} />
      <div className="relative z-10 mx-auto max-w-6xl grid gap-20 lg:grid-cols-2 lg:gap-32 items-center">
        <motion.div
          style={{ y: sYLeft }}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-80px' }}>
          <SectionLabel index={1} text="What Is ScriptFlow" />
          <h2 className="text-[clamp(2rem,4vw,4.5rem)] font-black leading-[0.92] tracking-tight"
            style={{ color: T.heading }}>
            A dashboard for engineers who hate cron jobs.
          </h2>
        </motion.div>

        <motion.div className="flex flex-col gap-7"
          style={{ y: sYRight }}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-80px' }}>
          <p className="font-mono text-[15px] leading-8" style={{ color: T.body }}>
            Managing Python automation scripts traditionally requires SSH access,
            crontab editing, and manual log inspection. ScriptFlow replaces
            all of that with a single web dashboard.
          </p>
          <p className="font-mono text-[15px] leading-8" style={{ color: T.body }}>
            Register your scripts, create schedules using a visual form, trigger
            runs instantly, watch logs in real time, and review every past
            execution — all without touching a terminal.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {['No terminal required', 'Visual schedule builder', 'Real-time log streaming', 'Full execution history'].map(item => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: T.accent }} />
                <span className="font-mono text-sm leading-6" style={{ color: T.body }}>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 3 — WORKFLOW (sequential steps + drawing line)
═══════════════════════════════════════════════════════════ */
const WORKFLOW = [
  { icon: 'register', step: '01', title: 'Register Script', desc: 'Add your Python script by name and file path. The registry stores and manages it.' },
  { icon: 'schedule', step: '02', title: 'Create Schedule', desc: 'Set frequency with a visual form — hourly, daily, weekly or custom. No cron syntax.' },
  { icon: 'execute', step: '03', title: 'Execute Automatically', desc: 'ScriptFlow runs the script on schedule in an isolated environment. Trigger instantly too.' },
  { icon: 'monitor', step: '04', title: 'Monitor in Real Time', desc: 'Live log stream as your script runs. See status, output and errors as they happen.' },
  { icon: 'history', step: '05', title: 'Review History', desc: 'Every run logged with duration, status, output and metadata. Filterable and searchable.' },
];

function WorkflowSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.4'] });
  const lineH = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const sLineH = useSpring(lineH, { stiffness: 40, damping: 18 });

  return (
    <section ref={ref} className="relative px-8 py-32 lg:px-16" style={{ background: '#080808' }}>
      <TacticalGrid />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionLabel index={2} text="How It Works" />
        <motion.h2
          className="mb-24 text-[clamp(2rem,4vw,4.5rem)] font-black leading-[0.92] tracking-tight"
          style={{ color: T.heading }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}>
          Automation Workflow
        </motion.h2>

        <div className="relative flex gap-0">
          {/* Vertical timeline line */}
          <div className="relative mr-12 flex flex-col items-center lg:mr-16">
            <div className="absolute top-0 h-full w-px" style={{ background: T.border }} />
            <motion.div className="absolute top-0 w-px" style={{ height: sLineH, background: T.accent }} />
          </div>

          {/* Steps */}
          <div className="flex flex-1 flex-col gap-0">
            {WORKFLOW.map((step, i) => (
              <motion.div key={step.step}
                className="relative border-b pb-14 pt-0"
                style={{ borderColor: T.border }}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-40px' }}>

                {/* dot on timeline */}
                <motion.div
                  className="absolute -left-[52px] top-0 h-4 w-4 rounded-full border-2 lg:-left-[64px]"
                  style={{ borderColor: T.accent, background: T.bg }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: i * 0.09 + 0.1 }}
                  viewport={{ once: true }} />

                <div className="flex items-start gap-8 pt-0 lg:gap-16">
                  <div className="flex-shrink-0 flex flex-col items-start">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.45em]"
                      style={{ color: T.accent }}>{step.step}</span>
                    <div className="mt-4 flex h-12 w-12 items-center justify-center border"
                      style={{ borderColor: T.border }}>
                      <Icon name={step.icon} size={20} color={T.accent} />
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-xl font-black tracking-tight" style={{ color: T.heading }}>
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-lg font-mono text-sm leading-7" style={{ color: T.body }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 4 — 3D DASHBOARD REVEAL
═══════════════════════════════════════════════════════════ */
function DashboardReveal() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });

  const rotateX = useTransform(scrollYProgress, [0, 1], [32, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.82, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const shadowOp = useTransform(scrollYProgress, [0, 1], [0, 0.14]);

  const sRX = useSpring(rotateX, { stiffness: 45, damping: 18 });
  const sRY = useSpring(rotateY, { stiffness: 45, damping: 18 });
  const sS = useSpring(scale, { stiffness: 45, damping: 18 });

  return (
    <section ref={ref} className="relative px-8 py-32 lg:px-16" style={{ background: T.bg }}>
      <TacticalGrid />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionLabel index={3} text="Dashboard Preview" />

        <div className="mb-20 grid gap-12 lg:grid-cols-2 items-end">
          <motion.h2
            className="text-[clamp(2rem,4vw,4.5rem)] font-black leading-[0.92] tracking-tight"
            style={{ color: T.heading }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}>
            The control<br />center.
          </motion.h2>
          <motion.p className="font-mono text-[15px] leading-8 lg:pb-2"
            style={{ color: T.body }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            viewport={{ once: true }}>
            Everything you need to manage your automation scripts lives in one
            responsive dashboard. Accessible from any browser, zero config required.
          </motion.p>
        </div>

        <motion.div style={{ opacity, perspective: 1600 }}>
          <motion.div
            style={{
              rotateX: sRX, rotateY: sRY, scale: sS,
              transformStyle: 'preserve-3d',
              boxShadow: '0 60px 160px rgba(255,59,48,0.1)',
            }}
            className="w-full overflow-hidden border"
            css={{ borderColor: T.border }}>

            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b px-5 py-3"
              style={{ background: T.panel, borderColor: T.border }}>
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: T.accent }} />
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: T.warning }} />
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: T.success }} />
              <div className="ml-4 flex-1 rounded px-3 py-1 font-mono text-[9px]"
                style={{ background: '#080808', color: T.muted }}>
                scriptflow.app/dashboard
              </div>
            </div>

            {/* App layout */}
            <div className="grid" style={{ gridTemplateColumns: '200px 1fr', background: T.bg }}>
              {/* Sidebar */}
              <div className="border-r p-4" style={{ borderColor: T.border }}>
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-5 w-5 rounded-sm" style={{ background: T.accent }} />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: T.heading }}>
                    ScriptFlow
                  </span>
                </div>
                {['Dashboard', 'Scripts', 'Scheduler', 'History', 'Logs'].map((item, i) => (
                  <div key={item} className="mb-1 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em]"
                    style={{
                      color: i === 0 ? T.heading : T.muted, background: i === 0 ? '#1a1a1a' : 'transparent',
                      borderLeft: `2px solid ${i === 0 ? T.accent : 'transparent'}`
                    }}>
                    {item}
                  </div>
                ))}
              </div>

              {/* Main */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[{ l: 'Total Scripts', v: '8', c: T.heading }, { l: 'Jobs Today', v: '14', c: T.heading }, { l: 'Successful', v: '11', c: T.success }, { l: 'Failed', v: '3', c: '#EF4444' }].map(m => (
                    <div key={m.l} className="border p-4" style={{ borderColor: T.border, background: T.panel }}>
                      <div className="font-mono text-[7px] uppercase tracking-[0.3em]" style={{ color: T.muted }}>{m.l}</div>
                      <div className="mt-2 font-mono text-xl font-black" style={{ color: m.c }}>{m.v}</div>
                    </div>
                  ))}
                </div>
                <div className="border" style={{ borderColor: T.border, background: T.panel }}>
                  <div className="border-b px-4 py-3" style={{ borderColor: T.border }}>
                    <span className="font-mono text-[8px] uppercase tracking-[0.35em]" style={{ color: T.muted }}>Active Scripts</span>
                  </div>
                  {[{ name: 'backup_processor.py', status: 'Running', c: T.warning }, { name: 'sales_report.py', status: 'Idle', c: T.muted }, { name: 'email_digest.py', status: 'Completed', c: T.success }].map(row => (
                    <div key={row.name} className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: T.border }}>
                      <span className="font-mono text-[9px]" style={{ color: T.body }}>{row.name}</span>
                      <span className="rounded px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em]"
                        style={{ color: row.c, background: row.c + '18' }}>{row.status}</span>
                    </div>
                  ))}
                </div>
                <div className="border p-4 font-mono text-[9px] leading-6"
                  style={{ borderColor: T.border, background: '#050505', color: T.muted }}>
                  <div style={{ color: T.heading }}>[09:12:23] Starting backup_processor.py...</div>
                  <div>[09:12:31] Connecting to storage endpoint...</div>
                  <div style={{ color: T.success }}>[09:12:48] Upload complete. Exit code: 0</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 5 — STICKY STACKING FEATURE PANELS
═══════════════════════════════════════════════════════════ */
const STACK_CARDS = [
  {
    tag: 'Script Registry',
    icon: 'register',
    headline: 'Central script management',
    desc: 'Store and manage every Python automation script in one place. Register by name and file path, view status, and trigger runs instantly — no SSH required.',
    visual: (
      <div className="w-full border font-mono text-[10px] overflow-hidden" style={{ borderColor: T.border }}>
        <div className="border-b px-4 py-3 flex items-center justify-between" style={{ borderColor: T.border, background: T.panel }}>
          <span className="uppercase tracking-[0.3em]" style={{ color: T.muted }}>Script Registry</span>
          <span className="border px-2 py-0.5" style={{ borderColor: T.accent, color: T.accent }}>+ Register</span>
        </div>
        {[{ n: 'backup_processor.py', s: 'Running', c: '#EAB308' }, { n: 'sales_report.py', s: 'Idle', c: T.muted }, { n: 'email_digest.py', s: 'Completed', c: '#22C55E' }, { n: 'data_sync.py', s: 'Failed', c: '#EF4444' }].map(r => (
          <div key={r.n} className="flex items-center justify-between border-b px-4 py-3 hover:bg-[#111] transition-colors" style={{ borderColor: T.border }}>
            <span style={{ color: T.body }}>{r.n}</span>
            <span style={{ color: r.c }}>{r.s}</span>
          </div>
        ))}
      </div>
    ),
    accent: T.accent,
    bg: '#0C0C0C',
  },
  {
    tag: 'Scheduling',
    icon: 'schedule',
    headline: 'Visual schedule builder',
    desc: 'Create hourly, daily, weekly, or fully custom schedules using a simple dropdown form. No cron syntax needed. Toggle any schedule on or off at any time.',
    visual: (
      <div className="w-full border font-mono text-[10px]" style={{ borderColor: T.border }}>
        <div className="border-b px-4 py-3" style={{ borderColor: T.border, background: T.panel }}>
          <span className="uppercase tracking-[0.3em]" style={{ color: T.muted }}>Active Schedules</span>
        </div>
        {[{ n: 'Backup Processor', f: 'Daily @ 02:00', e: true }, { n: 'Sales Report', f: 'Weekdays @ 08:00', e: true }, { n: 'Email Digest', f: 'Daily @ 18:00', e: false }].map(r => (
          <div key={r.n} className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: T.border }}>
            <div>
              <div style={{ color: T.body }}>{r.n}</div>
              <div className="mt-1" style={{ color: T.muted }}>{r.f}</div>
            </div>
            <div className="rounded-full px-3 py-1 text-[8px] uppercase tracking-[0.25em]"
              style={{ background: r.e ? '#22C55E18' : '#ffffff08', color: r.e ? '#22C55E' : T.muted }}>
              {r.e ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        ))}
      </div>
    ),
    accent: '#22C55E',
    bg: '#0A0E0A',
  },
  {
    tag: 'Live Monitoring',
    icon: 'monitor',
    headline: 'Real-time execution visibility',
    desc: 'Watch active script runs with live log streaming, progress indicators, and runtime counters. Instant view of what is running, what finished, and what failed.',
    visual: (
      <div className="w-full border font-mono text-[10px]" style={{ borderColor: T.border, background: '#050505' }}>
        <div className="border-b px-4 py-3 flex items-center gap-2" style={{ borderColor: T.border, background: T.panel }}>
          <motion.div className="h-1.5 w-1.5 rounded-full" style={{ background: '#22C55E' }}
            animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          <span className="uppercase tracking-[0.3em]" style={{ color: T.muted }}>Live Log Stream</span>
        </div>
        <div className="p-4 leading-7 space-y-0.5">
          {['[09:12:23] Starting backup_processor.py...', '[09:12:31] Connecting to storage...', '[09:12:44] Uploading... 64%'].map((l, i) => (
            <div key={i} style={{ color: i === 0 ? T.heading : T.muted }}>{l}</div>
          ))}
          <div style={{ color: '#22C55E' }}>[09:12:51] Upload complete. Exit code: 0</div>
          <div className="flex items-center gap-1 pt-1">
            <span style={{ color: T.muted }}>{'>'}</span>
            <motion.span className="inline-block h-3 w-1.5" style={{ background: T.accent }}
              animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
          </div>
        </div>
      </div>
    ),
    accent: '#EAB308',
    bg: '#0C0C09',
  },
  {
    tag: 'Run History',
    icon: 'history',
    headline: 'Complete execution database',
    desc: 'Every run stored with timestamp, duration, status, full log output, and metadata. Filter by script, status, or date. Expand any row to inspect errors inline.',
    visual: (
      <div className="w-full border font-mono text-[10px]" style={{ borderColor: T.border }}>
        <div className="border-b px-4 py-3 grid grid-cols-4 gap-2 uppercase tracking-[0.28em]" style={{ borderColor: T.border, background: T.panel, color: T.muted }}>
          <span>Script</span><span>Time</span><span>Duration</span><span>Status</span>
        </div>
        {[{ n: 'backup_processor', t: '09:12', d: '00:02:14', s: 'Success', c: '#22C55E' }, { n: 'email_digest', t: '08:40', d: '00:00:54', s: 'Failed', c: '#EF4444' }, { n: 'sales_report', t: '07:00', d: '00:01:02', s: 'Success', c: '#22C55E' }].map((r, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 border-b px-4 py-3 items-center hover:bg-[#111] transition-colors" style={{ borderColor: T.border }}>
            <span style={{ color: T.body }}>{r.n}</span>
            <span style={{ color: T.muted }}>{r.t}</span>
            <span style={{ color: T.muted }}>{r.d}</span>
            <span className="rounded px-2 py-0.5 text-[8px]" style={{ color: r.c, background: r.c + '15' }}>{r.s}</span>
          </div>
        ))}
      </div>
    ),
    accent: '#B8B8B8',
    bg: '#0C0C0C',
  },
];

function StickyCard({ card, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.85, 1], [0, 1, 1, 0.4]);
  const sY = useSpring(y, { stiffness: 50, damping: 20 });

  // alternating layout: even = text left visual right, odd = visual left text right
  const isEven = index % 2 === 0;

  return (
    <div ref={ref}
      className="sticky top-0 min-h-screen flex items-center px-8 py-20 lg:px-16 overflow-hidden"
      style={{ background: card.bg, zIndex: 10 + index }}>

      <TacticalGrid />

      <motion.div style={{ y: sY, opacity }} className="relative z-10 mx-auto w-full max-w-6xl">
        <div className={`grid items-center gap-16 lg:grid-cols-2 lg:gap-24 ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}>

          {/* TEXT */}
          <div className={!isEven ? 'lg:col-start-2' : ''}>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-6" style={{ background: card.accent }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.45em]" style={{ color: card.accent }}>
                {String(index + 1).padStart(2, '0')} / {card.tag}
              </span>
            </div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center border"
              style={{ borderColor: T.border }}>
              <Icon name={card.icon} size={20} color={card.accent} />
            </div>
            <h3 className="text-[clamp(1.8rem,3.5vw,3.5rem)] font-black leading-[0.95] tracking-tight"
              style={{ color: T.heading }}>
              {card.headline}
            </h3>
            <p className="mt-6 max-w-md font-mono text-[15px] leading-8" style={{ color: T.body }}>
              {card.desc}
            </p>
          </div>

          {/* VISUAL */}
          <div className={!isEven ? 'lg:col-start-1' : ''}>
            {card.visual}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StickySection() {
  return (
    <div className="relative">
      {STACK_CARDS.map((card, i) => (
        <StickyCard key={card.tag} card={card} index={i} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 6 — LIVE TERMINAL
═══════════════════════════════════════════════════════════ */
const TERM_LINES = [
  { t: 300, text: '$ scriptflow start', color: T.heading },
  { t: 1000, text: '✓ Loading registered scripts...', color: T.success },
  { t: 1600, text: '✓ Scheduler engine started', color: T.success },
  { t: 2200, text: '✓ Log stream active', color: T.success },
  { t: 3000, text: '', color: '' },
  { t: 3200, text: '[TRIGGER] Running backup_processor.py', color: T.heading },
  { t: 3900, text: '  [09:12:23] Starting script...', color: T.body },
  { t: 4600, text: '  [09:12:31] Connecting to storage...', color: T.body },
  { t: 5300, text: '  [09:12:44] Uploading archive... 64%', color: T.body },
  { t: 6000, text: '  [09:12:51] Upload complete.', color: T.body },
  { t: 6700, text: '  [09:12:51] Completed. Exit code: 0', color: T.success },
  { t: 7400, text: '', color: '' },
  { t: 7600, text: '[STATUS] All systems nominal.', color: T.heading },
];

function TerminalSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const yText = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const yTerm = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const sYText = useSpring(yText, { stiffness: 50, damping: 20 });
  const sYTerm = useSpring(yTerm, { stiffness: 50, damping: 20 });

  const containerRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [lines, setLines] = useState([]);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    if (!isInView) return;
    const timers = TERM_LINES.map(({ t, text, color }) =>
      setTimeout(() => setLines(prev => [...prev, { text, color }]), t)
    );
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  useEffect(() => {
    if (containerRef.current)
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [lines]);

  useEffect(() => {
    const id = setInterval(() => setCursor(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={ref} className="relative px-8 py-32 lg:px-16 overflow-hidden" style={{ background: T.bg }}>
      <TacticalGrid yOffset={gridY} />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionLabel index={5} text="Live Terminal" />

        <motion.div style={{ y: sYText }} className="grid gap-16 lg:grid-cols-2 items-center mb-16">
          <motion.h2
            className="text-[clamp(2rem,4vw,4.5rem)] font-black leading-[0.92] tracking-tight"
            style={{ color: T.heading }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}>
            Watch scripts run live.
          </motion.h2>
          <motion.p className="font-mono text-[15px] leading-8" style={{ color: T.body }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            viewport={{ once: true }}>
            The built-in terminal viewer streams log output from every running
            script in real time. Pause, resume, or clear the stream at any time.
            No SSH. No tail -f. Just a browser.
          </motion.p>
        </motion.div>

        <motion.div className="w-full overflow-hidden border"
          style={{ borderColor: T.border, boxShadow: '0 0 80px rgba(255,59,48,0.05)', y: sYTerm }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}>

          <div className="flex items-center justify-between border-b px-6 py-4"
            style={{ background: T.panel, borderColor: T.border }}>
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: T.accent }} />
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: T.warning }} />
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: T.success }} />
              <span className="ml-3 font-mono text-[9px] uppercase tracking-[0.4em]" style={{ color: T.muted }}>
                scriptflow — log stream — backup_processor.py
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div className="h-1.5 w-1.5 rounded-full" style={{ background: T.success }}
                animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.35em]" style={{ color: T.success }}>Running</span>
            </div>
          </div>

          <div ref={containerRef} className="h-80 overflow-y-auto p-6" style={{ background: '#050505' }}>
            {lines.map((line, i) =>
              line.text === '' ? (
                <div key={i} className="h-4" />
              ) : (
                <motion.div key={i}
                  className="font-mono text-sm leading-7"
                  style={{ color: line.color || T.body }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}>
                  {line.text}
                </motion.div>
              )
            )}
            <span className="inline-block h-4 w-2"
              style={{ background: T.accent, opacity: cursor ? 1 : 0 }} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 7 — FINAL CTA
═══════════════════════════════════════════════════════════ */
function FinalCTA({ onGetStarted }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const yLeft = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const yRight = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const sYLeft = useSpring(yLeft, { stiffness: 50, damping: 20 });
  const sYRight = useSpring(yRight, { stiffness: 50, damping: 20 });

  return (
    <section ref={ref} className="relative overflow-hidden px-8 py-32 lg:px-16" style={{ background: '#080808' }}>
      <TacticalGrid yOffset={gridY} />
      <TelemetryDots />
      <RadarSweep className="absolute top-12 right-12" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-32 items-center">
          <motion.div
            style={{ y: sYLeft }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}>
            <SectionLabel index={6} text="Get Started" />
            <h2 className="text-[clamp(2.5rem,6vw,7rem)] font-black leading-[0.88] tracking-tight"
              style={{ color: T.heading }}>
              Ready to automate?
            </h2>
            <p className="mt-6 max-w-md font-mono text-[15px] leading-8" style={{ color: T.body }}>
              Sign in with Google and get your first script registered in under
              two minutes. No setup. No config files.
            </p>
          </motion.div>

          <motion.div className="flex flex-col gap-4"
            style={{ y: sYRight }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            viewport={{ once: true }}>
            <motion.button onClick={onGetStarted}
              className="w-full py-5 font-mono text-sm font-bold uppercase tracking-[0.3em] text-black"
              style={{ background: T.accent }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}>
              Sign In with Google
            </motion.button>

          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-24 border-t pt-8"
          style={{ borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <motion.div className="h-2 w-2 rounded-full" style={{ background: T.accent }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
            <span className="font-mono text-[9px] uppercase tracking-[0.4em]" style={{ color: T.muted }}>
              ScriptFlow // Backend Automation Dashboard
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const { scrollY } = useScroll();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div style={{ background: T.bg }}>
      <CRTOverlay />
      <HeroSection scrollY={scrollY} onGetStarted={handleGetStarted} />
      <WhatIsSection />
      <WorkflowSection />
      <DashboardReveal />
      <StickySection />
      <TerminalSection />
      <FinalCTA onGetStarted={handleGetStarted} />
    </div>
  );
}
