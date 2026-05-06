import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/storify-logo.png";

interface Guest {
  id: string;
  name: string;
  created_at: string;
}

const DISPLAY_DELAY = 60_000; // 60 seconds before a name appears
const DISPLAY_DURATION = 10_000; // 10 seconds visible on screen

const Display = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [now, setNow] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const cursorTimer = useRef<number | null>(null);
  // Map of guest id -> timestamp when first shown on screen
  const [shownAt, setShownAt] = useState<Map<string, number>>(new Map());

  // Title
  useEffect(() => {
    document.title = "STORIFY — Live Display";
  }, []);

  // Tick frequently for smooth independent timers
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  // Initial load + realtime
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("guests")
        .select("id, name, created_at")
        .order("created_at", { ascending: true });
      if (data) setGuests(data);
    };
    load();

    const channel = supabase
      .channel("guests-display")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guests" },
        (payload) => {
          const g = payload.new as Guest;
          setGuests((prev) =>
            prev.some((p) => p.id === g.id) ? prev : [...prev, g]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Promote eligible guests (past delay gate) into shownAt map.
  // Each guest gets its own independent timer starting when first shown.
  useEffect(() => {
    setShownAt((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const g of guests) {
        if (next.has(g.id)) continue;
        const created = new Date(g.created_at).getTime();
        if (now - created >= DISPLAY_DELAY) {
          next.set(g.id, now);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [guests, now]);

  // Active = shown AND not yet expired
  const activeGuests = useMemo(() => {
    return guests.filter((g) => {
      const t = shownAt.get(g.id);
      if (!t) return false;
      return now - t < DISPLAY_DURATION;
    });
  }, [guests, shownAt, now]);

  // Fullscreen handling
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // ignored
    }
  };

  // Cursor auto-hide
  useEffect(() => {
    const reset = () => {
      setCursorVisible(true);
      if (cursorTimer.current) window.clearTimeout(cursorTimer.current);
      cursorTimer.current = window.setTimeout(() => setCursorVisible(false), 3000);
    };
    reset();
    window.addEventListener("mousemove", reset);
    return () => {
      window.removeEventListener("mousemove", reset);
      if (cursorTimer.current) window.clearTimeout(cursorTimer.current);
    };
  }, []);

  return (
    <main
      className={`min-h-screen bg-background relative overflow-hidden flex flex-col items-center ${
        cursorVisible ? "" : "cursor-hidden"
      }`}
    >
      {/* Background glows */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Fullscreen button */}
      {!isFullscreen && (
        <button
          onClick={enterFullscreen}
          className="absolute top-6 right-6 z-20 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold uppercase tracking-widest px-5 py-2.5 rounded-md shadow-[0_0_25px_hsl(var(--primary)/0.5)] transition"
        >
          Full Screen
        </button>
      )}

      {/* Logo */}
      <div className="relative z-10 pt-10 md:pt-14">
        <img
          src={logo}
          alt="STORIFY"
          className="h-32 md:h-44 lg:h-56 w-auto logo-glow select-none"
          draggable={false}
        />
      </div>

      {/* Live now */}
      <div className="relative z-10 mt-6 flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-dot shadow-[0_0_12px_hsl(var(--primary))]" />
        <span className="text-xs md:text-sm uppercase tracking-[0.5em] text-foreground/80">
          Live Now
        </span>
      </div>

      {/* Main heading */}
      <h1 className="relative z-10 mt-10 md:mt-14 text-center font-black tracking-tight text-foreground text-glow-soft text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.95]">
        <span className="block">WELCOME TO</span>
        <span className="block text-primary text-glow-red">THE SHOW</span>
      </h1>

      {/* Welcome note */}
      <p className="relative z-10 mt-6 md:mt-8 text-center text-base md:text-2xl lg:text-3xl text-foreground/70 italic font-light max-w-4xl px-6">
        We are honored to have you here tonight
      </p>

      {/* Names — live flowing guest wall */}
      <section className="relative z-10 mt-auto mb-16 md:mb-24 w-full min-h-[180px] flex flex-col items-center justify-end">
        {activeGuests.length > 0 && (
          <div className="text-xs md:text-sm uppercase tracking-[0.5em] text-primary/90 mb-6 text-glow-red">
            Welcome
          </div>
        )}
        <div className="w-full px-12 md:px-24 lg:px-32 bg-transparent">
          <motion.div
            layout
            className="flex flex-nowrap items-center justify-center gap-x-12 md:gap-x-16 lg:gap-x-20 whitespace-nowrap mx-auto bg-transparent"
            transition={{ layout: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {activeGuests.map((g) => (
                <motion.span
                  key={g.id}
                  layout
                  initial={{ opacity: 0, y: 24, filter: "blur(10px)", scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, y: -16, filter: "blur(12px)", scale: 0.97 }}
                  transition={{
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                    layout: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                  }}
                  className="inline-block text-2xl md:text-4xl lg:text-5xl font-bold text-foreground text-glow-soft will-change-transform"
                >
                  {g.name}
                </motion.span>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Display;
