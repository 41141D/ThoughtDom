import type { Metadata } from "next";
import Reveal from "../../components/why/Reveal";
import PrincipleItem from "../../components/why/PrincipleItem";

export const metadata: Metadata = {
  title: "Why ThoughtDom Exists",
  description:
    "ThoughtDom exists because most online discussion rewards attention, identity, and speed more than understanding. This is what we're trying to change, and why.",
};

export default function WhyPage() {
  return (
    <article className="pb-8">
      {/* ---------- Hero ---------- */}
      <header className="hero-glow rounded-xl2 -mx-4 px-4 pt-14 pb-12 sm:pt-20 sm:pb-16 sm:mx-0 sm:px-8 text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-signal font-medium mb-5">
            Why ThoughtDom Exists
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-text max-w-xl mx-auto">
            Understand first.
          </h1>
          <p className="text-muted text-lg mt-4 max-w-md mx-auto leading-relaxed">
            Everything else on ThoughtDom follows from that one rule.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-8 font-display text-text/90 text-base max-w-lg mx-auto leading-relaxed italic">
            We built a place where disagreement has to earn its place &mdash; by proving,
            first, that it understood what it&apos;s disagreeing with.
          </p>
        </Reveal>
      </header>

      {/* ---------- Why ThoughtDom Exists ---------- */}
      <section aria-labelledby="why-heading" className="pt-16 sm:pt-20">
        <Reveal>
          <h2 id="why-heading" className="font-display text-2xl font-semibold mb-6">
            Why ThoughtDom exists
          </h2>
          <div className="space-y-4 text-text/85 leading-relaxed">
            <p>
              Most places to disagree online reward the wrong things. They reward speed
              over understanding &mdash; a reaction posted in ten seconds travels further
              than a considered reply written in ten minutes. They reward identity over
              ideas &mdash; an argument gets read differently depending on who is credited
              with making it, which means it is rarely judged on its own terms. And they
              reward performance over honesty: it is often more rewarding, in the moment,
              to look right in front of an audience than to actually be right, or to admit
              you might not be.
            </p>
            <p>
              None of this happened by accident. It happened because the platforms
              optimizing for it were optimizing for something else entirely &mdash; time
              spent, attention captured, engagement sustained. Understanding was never the
              goal there. At best, it was a side effect.
            </p>
            <p>ThoughtDom starts from a different goal. Not attention. Not identity. Understanding &mdash; as the actual point, not something we hope shows up on its own.</p>
          </div>
        </Reveal>
      </section>

      {/* ---------- What We Believe ---------- */}
      <section aria-labelledby="believe-heading" className="pt-16 sm:pt-20">
        <Reveal>
          <h2 id="believe-heading" className="font-display text-2xl font-semibold mb-6">
            What we believe
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <ul className="space-y-5">
            <PrincipleItem title="Curiosity over certainty.">
              Being certain feels good. Being curious is more useful. We&apos;d rather
              someone leave a conversation with a better question than a reinforced answer.
            </PrincipleItem>
            <PrincipleItem title="Understanding before disagreement.">
              You&apos;re always welcome to disagree. But the burden is on you to show,
              first, that you understood what you&apos;re disagreeing with. Understanding
              isn&apos;t surrender &mdash; it&apos;s the price of admission to a real argument.
            </PrincipleItem>
            <PrincipleItem title="Ideas over identity.">
              An idea should stand or fall on its own reasoning &mdash; not on who said
              it, how long they&apos;ve been here, or how many people already agree with
              them.
            </PrincipleItem>
            <PrincipleItem title="Privacy over surveillance.">
              We don&apos;t need to know who you are to know what you think. Your ideas
              don&apos;t require your identity attached to them in order to matter.
            </PrincipleItem>
            <PrincipleItem title="Respect over personal attacks.">
              Disagreeing with an idea is not the same as attacking the person who holds
              it. We intend to keep that distinction clear, even when it&apos;s inconvenient.
            </PrincipleItem>
            <PrincipleItem title="Long-term thinking over instant reactions.">
              Some of the best answers take longer than ten seconds to write. We&apos;d
              rather be a place people return to for a good conversation than a place
              they check out of habit.
            </PrincipleItem>
            <PrincipleItem title="Honest discussion over winning arguments.">
              A conversation that ends with someone actually changing their mind is worth
              more than one that ends with someone declared the winner. We&apos;re not
              building a scoreboard.
            </PrincipleItem>
          </ul>
        </Reveal>
      </section>

      {/* ---------- The Steel-Man Gate ---------- */}
      <section aria-labelledby="gate-heading" className="pt-16 sm:pt-20">
        <Reveal>
          <h2 id="gate-heading" className="font-display text-2xl font-semibold mb-6">
            The Steel-Man Gate
          </h2>
          <div className="space-y-4 text-text/85 leading-relaxed">
            <p>
              Most disagreements online skip a very basic step: proving you understood
              what you&apos;re disagreeing with.
            </p>
            <p>
              It&apos;s an old idea, older than the internet. Before you criticize a
              position, you should be able to state it back so clearly and so fairly that
              the person who holds it would recognize it &mdash; and agree that
              you&apos;ve represented it honestly. Only then have you earned the right to
              say why you think it&apos;s wrong. That&apos;s called steelmanning: the
              opposite of a strawman, which is easy to knock down because it was never
              real to begin with.
            </p>
            <p>
              ThoughtDom asks for that step before a challenge can be posted. Not because
              disagreement is unwelcome &mdash; disagreement is, in fact, the whole point
              of a place built for ideas. But because disagreement without understanding
              usually isn&apos;t disagreement at all. It&apos;s a reaction to a caricature,
              aimed at a person, that happens to be wearing their argument&apos;s clothes.
            </p>
            <p className="steelman-mirror text-text/90">
              This isn&apos;t a test you pass once. It&apos;s a habit the platform asks
              you to practice every time you want to push back. Some people will find
              that this slows them down. It&apos;s supposed to. The slowness isn&apos;t a
              flaw in the design &mdash; it&apos;s the design.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---------- What ThoughtDom Will Never Become ---------- */}
      <section aria-labelledby="never-heading" className="pt-16 sm:pt-20">
        <Reveal>
          <h2 id="never-heading" className="font-display text-2xl font-semibold mb-3">
            What ThoughtDom will never become
          </h2>
          <p className="text-muted leading-relaxed mb-6">
            Some of what came above is as much about what we&apos;re avoiding as what
            we&apos;re building toward. So we want to say it plainly now, while it&apos;s
            easy to promise &mdash; because promises like these tend to get harder to
            keep as a platform grows, not easier.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <ul className="space-y-5">
            <PrincipleItem title="An addiction machine." accent="danger">
              We&apos;re not going to design ThoughtDom to be hard to put down. If you
              finish reading something here and close the app, that&apos;s a fine
              outcome. That was never supposed to be a failure state.
            </PrincipleItem>
            <PrincipleItem title="A follower-count competition." accent="danger">
              We don&apos;t think a person&apos;s ideas should be weighed by how many
              people already follow them, so we&apos;re not going to build the mechanics
              that make that comparison feel important.
            </PrincipleItem>
            <PrincipleItem title="A place where popularity outweighs ideas." accent="danger">
              A quiet, well-reasoned point should be able to stand next to a popular one
              and be judged on its own terms &mdash; not buried beneath it by default.
            </PrincipleItem>
            <PrincipleItem title="A platform that rewards outrage for engagement." accent="danger">
              If being provocative ever becomes the fastest way to be seen here,
              that&apos;s a failure in the design, and it will need to be fixed &mdash;
              not left in place because it&apos;s working.
            </PrincipleItem>
            <PrincipleItem title="A surveillance-driven advertising platform." accent="danger">
              We don&apos;t think a place built around honest conversation should also
              be quietly building a profile of everyone having one. Those two things
              don&apos;t coexist well, so we&apos;re not going to try to make them.
            </PrincipleItem>
          </ul>
        </Reveal>
      </section>

      {/* ---------- Our Vision ---------- */}
      <section aria-labelledby="vision-heading" className="pt-16 sm:pt-20">
        <Reveal>
          <h2 id="vision-heading" className="font-display text-2xl font-semibold mb-6">
            Our vision
          </h2>
          <div className="space-y-4 text-text/85 leading-relaxed">
            <p>
              We are not trying to become the biggest place to talk on the internet. We
              don&apos;t think that&apos;s the same goal as becoming one of the best.
            </p>
            <p>
              Our measure of success isn&apos;t time spent, or accounts created, or how
              often people open the app. It&apos;s simpler, and harder to fake: did a
              conversation here help two people understand each other a little better
              than they did before it started? That&apos;s the only metric we actually
              care about. Everything else is a means, or a distraction.
            </p>
            <p>
              If ThoughtDom is still around in ten years, we&apos;d rather it be small
              and trusted than large and hollow &mdash; the place people point to and
              say &ldquo;that&apos;s where I actually understood the other side of
              something,&rdquo; rather than the place with the most users. That&apos;s a
              slower way to build something. We think it&apos;s the only way to build
              something worth keeping.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---------- Closing ---------- */}
      <footer className="pt-16 sm:pt-20 pb-4 text-center">
        <Reveal>
          <div className="h-px w-16 bg-line mx-auto mb-10" aria-hidden="true" />
          <p className="font-display text-xl sm:text-2xl font-semibold leading-snug max-w-lg mx-auto text-text">
            The internet has enough places to be heard. We built one more place to be
            understood.
          </p>
        </Reveal>
      </footer>
    </article>
  );
}
