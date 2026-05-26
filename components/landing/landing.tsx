import Link from "next/link";
import {
  Lock,
  Database,
  CalendarClock,
  Clock,
  ArrowRight,
  Github,
} from "lucide-react";

const GITHUB_URL = "https://github.com/emkwambe/opslocker";

export function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0b0e] text-slate-100 antialiased flex flex-col">
      <header className="border-b border-[#1e2028]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-slate-100 text-sm">
              OpsLocker
            </span>
          </div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-slate-100 transition-colors inline-flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" /> GitHub
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-20 sm:py-24">
        <section className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1e2028] bg-[#111318] px-3 py-1 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Local-first · v0.1
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-100 mt-6 tracking-tight leading-[1.1]">
            Stop losing track of your infrastructure.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 mt-5 leading-relaxed max-w-2xl mx-auto">
            OpsLocker is a local-first operational memory system for builders who run
            too many things at once. Registry, timeline, renewals, and dependency
            graph — all in one place, all on your machine.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 transition-colors"
            >
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-[#1e2028] bg-[#111318] hover:bg-[#13161d] hover:border-[#2a2d38] text-slate-200 text-sm font-medium px-4 py-2.5 transition-colors"
            >
              <Github className="w-3.5 h-3.5" /> View on GitHub
            </a>
          </div>
          <p className="text-xs text-slate-500 mt-6">
            Free, open, and runs entirely on your machine. No account required.
          </p>
        </section>

        <section className="mt-20 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureBlock
            icon={Database}
            title="Infrastructure Registry"
            description="Every vendor, API, subscription, and database your stack depends on — tracked, owned, governed."
          />
          <FeatureBlock
            icon={CalendarClock}
            title="Renewal Governance"
            description="Know what renews before it auto-charges. Flag trials, deprecated services, and unowned vendors."
          />
          <FeatureBlock
            icon={Clock}
            title="Operational Memory"
            description="A timeline of every change, every decision, every ownership transfer. Your infrastructure has a history — preserve it."
          />
        </section>

        <section className="mt-20 rounded-2xl border border-[#1e2028] bg-[#111318] px-6 py-8 sm:px-10 sm:py-10 text-center">
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Your data lives in a SQLite file on your machine. Nothing is uploaded.
            Export to JSON or CSV anytime. No vendor lock-in.
          </p>
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 mt-5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Create your first workspace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-[#1e2028]">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-slate-500">
            Built local-first · Your data stays on your machine
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Made by Mpingo Systems</span>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <Github className="w-3 h-3" /> github
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureBlock({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#1e2028] bg-[#111318] p-5 hover:border-[#2a2d38] transition-colors">
      <div className="w-10 h-10 rounded-md bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-100 mt-4">{title}</h3>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{description}</p>
    </div>
  );
}
