import { useRef, useEffect, useState, memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { BrandMark } from "@/components/shared/BrandMark";

/* ─────────────────────────────────────────────
   Isolated perpetual animation components
   (memoized to prevent parent re-renders)
   ───────────────────────────────────────────── */

const TypewriterLoop = memo(function TypewriterLoop() {
  const prompts = [
    "Apply to Staff Engineer at Stripe",
    "Tailor resume for Goldman Sachs SWE",
    "Network with Meta recruiters on LinkedIn",
    "Generate referral message for Airbnb PM",
  ];
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = prompts[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 60);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 30);
    } else {
      setIsDeleting(false);
      setIndex((i) => (i + 1) % prompts.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, index, prompts]);

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-border bg-card px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
            <ArrowRight className="size-3.5" />
          </div>
          <span className="text-sm text-foreground font-medium">
            {displayed}
            <span className="ml-0.5 inline-block h-4 w-[2px] bg-foreground/60 animate-pulse" />
          </span>
        </div>
      </div>
    </div>
  );
});

const FloatingPill = memo(function FloatingPill({
  label,
  delay,
  className,
}: {
  label: string;
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm ${className ?? ""}`}
    >
      {label}
    </motion.div>
  );
});

/* ─────────────────────────────────────────────
   Section wrapper with viewport entry animation
   ───────────────────────────────────────────── */

function FadeInSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main Landing Page
   ───────────────────────────────────────────── */

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.97]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-5 md:px-10 bg-background/80 backdrop-blur-xl border-b border-transparent [&:not(:hover)]:border-transparent hover:border-border transition-colors duration-300">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-sm font-semibold tracking-tight">ApplyAI</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="group flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.97]"
          >
            Get Started
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pt-24"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 text-sm font-medium text-muted-foreground"
          >
            For engineers who would rather build than apply
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl font-bold tracking-tighter leading-[1.05] sm:text-5xl md:text-6xl lg:text-[4.25rem]"
          >
            Your job search, <br className="hidden sm:block" />
            on autopilot.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg"
          >
            ApplyAI writes targeted LaTeX resumes, sends personalized LinkedIn referral
            requests, and tracks your entire pipeline. You focus on interviews.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link
              to="/register"
              className="group flex h-12 items-center gap-3 rounded-full bg-foreground pl-6 pr-2 text-sm font-semibold text-background shadow-lg shadow-foreground/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-xl active:scale-[0.97]"
            >
              Start Automating
              <div className="flex size-8 items-center justify-center rounded-full bg-background text-foreground transition-transform duration-500 group-hover:-rotate-45">
                <ArrowRight className="size-3.5" />
              </div>
            </Link>
            <a
              href="https://github.com/tomar-ayush/applyai-assistant"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              View on GitHub →
            </a>
          </motion.div>
        </div>

        {/* Typewriter Command Bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 w-full max-w-2xl"
        >
          <TypewriterLoop />
        </motion.div>
      </motion.section>

      {/* ── How It Works ── */}
      <section className="relative px-6 py-32 md:py-40">
        <div className="mx-auto max-w-5xl">
          <FadeInSection>
            <p className="text-sm font-medium text-muted-foreground mb-4">How it works</p>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl leading-[1.1] max-w-2xl">
              Three systems, one workspace.
            </h2>
          </FadeInSection>

          <div className="mt-20 grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-10">
            {/* Step 1 */}
            <FadeInSection className="md:col-span-7" delay={0.1}>
              <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background text-sm font-bold">
                    1
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight">Add a target company</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed max-w-lg">
                  Paste a job URL or enter a company name. ApplyAI extracts the role details,
                  identifies the right employees to contact, and queues everything for automation.
                </p>
              </div>
            </FadeInSection>

            {/* Step 2 */}
            <FadeInSection className="md:col-span-5" delay={0.2}>
              <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm h-full">
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background text-sm font-bold">
                    2
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight">Resume compiles</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Our engine rewrites and compiles a LaTeX resume targeted to the specific role,
                  with a real-time visual diff of what changed.
                </p>
              </div>
            </FadeInSection>

            {/* Step 3 */}
            <FadeInSection className="md:col-span-5" delay={0.15}>
              <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm h-full">
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background text-sm font-bold">
                    3
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight">Extension networks</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The Chrome extension sends personalized referral messages on LinkedIn using your
                  active session. No API keys, no intermediary servers.
                </p>
              </div>
            </FadeInSection>

            {/* Pipeline */}
            <FadeInSection className="md:col-span-7" delay={0.25}>
              <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background text-sm font-bold">
                    ∞
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight">Pipeline tracks itself</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed max-w-lg">
                  Every application, referral, and follow-up is tracked in a single dashboard.
                  You always know where you stand across every company.
                </p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="px-6 py-32 md:py-40 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <FadeInSection>
            <p className="text-sm font-medium text-muted-foreground mb-4">Capabilities</p>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl leading-[1.1] max-w-3xl">
              Everything between "I found a role" and "I got the interview."
            </h2>
          </FadeInSection>

          <div className="mt-20 space-y-0 divide-y divide-border">
            {[
              {
                title: "LaTeX Resume Engine",
                desc: "Compiles a role-specific PDF from your master resume. Visual diffs show exactly what changed. No Word docs, no formatting fights.",
              },
              {
                title: "LinkedIn Referral Autopilot",
                desc: "Our Chrome extension sends personalized connection requests and messages through your own browser session. Fully authenticated, fully yours.",
              },
              {
                title: "Job Pipeline Dashboard",
                desc: "Kanban-style tracking from 'Applied' to 'Offer.' See referral status, resume versions, and automation insights at a glance.",
              },
              {
                title: "LLM-Powered Personalization",
                desc: "Bring your own API key or use our defaults. Every message and resume variant is generated with context about you and the target role.",
              },
            ].map((item, i) => (
              <FadeInSection key={item.title} delay={i * 0.08}>
                <div className="group flex flex-col gap-2 py-8 md:flex-row md:items-start md:gap-16 md:py-10 cursor-default">
                  <h3 className="text-lg font-semibold tracking-tight md:w-72 md:shrink-0 transition-colors duration-200 group-hover:text-foreground/70">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xl">{item.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof Pills ── */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl flex flex-col items-center text-center">
          <FadeInSection>
            <p className="text-sm font-medium text-muted-foreground mb-6">Built with</p>
          </FadeInSection>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["React", "FastAPI", "LaTeX", "Chrome Extension", "OpenRouter", "Gemini", "GPT-4o"].map(
              (tech, i) => (
                <FloatingPill key={tech} label={tech} delay={0.3 + i * 0.06} />
              )
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-32 md:py-40 border-t border-border">
        <div className="mx-auto max-w-3xl flex flex-col items-center text-center">
          <FadeInSection>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl leading-[1.1]">
              Stop applying manually.
            </h2>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed md:text-lg max-w-xl mx-auto">
              Create a free account, upload your resume, and let the engine handle
              the rest. No credit card required.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.15}>
            <Link
              to="/register"
              className="group mt-12 flex h-14 items-center gap-4 rounded-full bg-foreground pl-8 pr-2 text-sm font-bold text-background shadow-lg shadow-foreground/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-xl active:scale-[0.97]"
            >
              Create Free Account
              <div className="flex size-10 items-center justify-center rounded-full bg-background text-foreground transition-transform duration-500 group-hover:-rotate-45">
                <ArrowRight className="size-4" />
              </div>
            </Link>
          </FadeInSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark className="size-6 rounded-md" />
            <span className="text-xs font-medium text-muted-foreground">ApplyAI</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a
              href="https://github.com/tomar-ayush/applyai-assistant"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-foreground"
            >
              GitHub
            </a>
            <Link to="/register" className="transition-colors duration-200 hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
