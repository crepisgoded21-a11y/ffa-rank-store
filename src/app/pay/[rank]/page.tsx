import Link from "next/link";
import Reveal from "../../../components/Reveal";

const rankData: Record<string, { title: string; price: string; description: string; paypal?: string; perks: string[] }> = {
  vip: {
    title: "VIP",
    price: "$4.99",
    description: "VIP rank with priority queue, custom tag, and extra kit slot.",
    paypal: "https://paypal.me/Hassaan323/4.99",
    perks: ["Priority queue", "Custom rank tag", "Extra kit slot"],
  },
  ultimate: {
    title: "Ultimate",
    price: "$19.99",
    description: "Ultimate rank: all VIP perks plus cosmetics and elite events.",
    paypal: "https://paypal.me/Hassaan323/19.99",
    perks: ["All VIP perks", "Exclusive cosmetics", "Elite-only events"],
  },
};

export default async function PayPage({ params }: PageProps<"/pay/[rank]">) {
  const { rank: rankParam } = await params;
  const key = rankParam?.toLowerCase() ?? "vip";
  const rank = rankData[key] ?? rankData["vip"];

  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-2xl space-y-8 px-6">
        <Reveal>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <span aria-hidden>←</span> Back to store
          </Link>
        </Reveal>

        <Reveal delay={100}>
          <div className="glass glow-border relative overflow-hidden rounded-[2rem] p-9">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Confirm Purchase</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{rank.title} Rank</h2>
            <p className="mt-4 text-slate-400">{rank.description}</p>

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

            <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-white/10 pt-8">
              <div className="rounded-full bg-white/5 px-5 py-2.5 text-xl font-bold text-white">
                {rank.price}
              </div>
              <a
                href={rank.paypal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/40"
              >
                Proceed to PayPal
                <span aria-hidden>→</span>
              </a>
            </div>
            <p className="mt-5 text-sm text-slate-500">
              After payment, send your Minecraft username to an admin to receive the rank in-game.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
