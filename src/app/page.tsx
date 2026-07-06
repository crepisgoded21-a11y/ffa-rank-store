import CopyIP from "../components/CopyIP";
import Reveal from "../components/Reveal";

const serverIp = "mc.effectsffa.xyz";

const ranks = [
  {
    title: "VIP",
    price: "$10",
    description: "VIP rank with priority queue, custom tag, and extra kit slot.",
    perks: ["Priority queue", "Custom rank tag", "Extra kit slot"],
    href: "/pay/vip",
    badge: "★",
  },
  {
    title: "Ultimate",
    price: "$30",
    description: "Ultimate rank: all VIP perks plus cosmetics and elite events.",
    perks: ["All VIP perks", "Exclusive cosmetics", "Elite-only events"],
    href: "/pay/ultimate",
    badge: "◆",
    popular: true,
  },
];

const features = [
  {
    title: "Fast-paced combat",
    description: "Jump straight into free-for-all fights with tuned PvP mechanics and quick respawns.",
    icon: "⚔",
  },
  {
    title: "Instant rank delivery",
    description: "Purchase a rank and get it applied in-game as soon as an admin confirms your payment.",
    icon: "⚡",
  },
  {
    title: "Active community",
    description: "Join a growing player base with regular events and a friendly, moderated environment.",
    icon: "◎",
  },
];

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Why Us" },
  { href: "#store", label: "Store" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070d]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
              FFA
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">Minecraft Server</p>
              <h1 className="text-lg font-semibold tracking-tight text-white">FFA Rank Shop</h1>
            </div>
          </div>
          <nav className="hidden gap-8 text-sm text-slate-300 sm:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="#store"
            className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/40"
          >
            Join Now
          </a>
        </div>
      </header>

      <main>
        <section id="home" className="mx-auto max-w-7xl px-6 pb-24 pt-20 sm:pt-28">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <Reveal>
              <div className="space-y-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Fast-paced FFA with purchasable ranks
                </span>
                <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl">
                  Join our{" "}
                  <span className="gradient-text animate-shimmer">Minecraft FFA</span>{" "}
                  server and unlock ranked perks.
                </h2>
                <p className="max-w-xl text-lg text-slate-400">
                  Connect to the server, compete in free-for-all battles, and upgrade your experience
                  with purchasable ranks. Each rank gives you in-game benefits, priority access, and a
                  special tag.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <a
                    href="#store"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/40"
                  >
                    View Ranks
                    <span aria-hidden>→</span>
                  </a>
                  <CopyIP ip={serverIp} />
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="glass glow-border animate-floatY relative overflow-hidden rounded-[2rem] p-8 shadow-2xl shadow-black/40">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Server Info</p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-sm text-slate-400">Status</span>
                    <span className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-sm text-slate-400">Gamemode</span>
                    <span className="text-sm font-medium text-white">Free-For-All</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-sm text-slate-400">Edition</span>
                    <span className="text-sm font-medium text-white">Java</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Address</span>
                    <span className="font-mono text-sm font-medium text-white">{serverIp}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Why Play Here</p>
            <h3 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Built for the grind</h3>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 120}>
                <div className="glass-card glow-border relative h-full overflow-hidden rounded-2xl p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-xl">
                    {feature.icon}
                  </div>
                  <h4 className="mt-5 text-lg font-semibold text-white">{feature.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="store" className="mx-auto max-w-7xl px-6 py-20">
          <Reveal className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Rank Store</p>
            <h3 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Choose your rank</h3>
            <p className="mt-4 text-slate-400">
              Purchase the rank you want — payments go to{" "}
              <a
                className="text-indigo-300 underline decoration-indigo-300/40 underline-offset-4 hover:text-indigo-200"
                href="https://paypal.me/Hassaan323"
                target="_blank"
                rel="noreferrer"
              >
                paypal.me/Hassaan323
              </a>
              .
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {ranks.map((rank, i) => (
              <Reveal key={rank.title} delay={i * 150}>
                <article className="glass-card glow-border relative h-full overflow-hidden rounded-[2rem] p-8">
                  {rank.popular && (
                    <span className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-xl text-indigo-200">
                      {rank.badge}
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{rank.title}</p>
                      <h4 className="text-3xl font-bold text-white">{rank.price}</h4>
                    </div>
                  </div>
                  <p className="mt-6 text-slate-400">{rank.description}</p>
                  <ul className="mt-6 space-y-3">
                    {rank.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-3 text-sm text-slate-300">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                          ✓
                        </span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={rank.href}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/40"
                  >
                    Buy {rank.title}
                    <span aria-hidden>→</span>
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 FFA Rank Shop. All rights reserved.</p>
          <div className="flex gap-6">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-slate-300">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
