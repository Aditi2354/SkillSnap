export default function LandingPage() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-bold">SkillSnap</h1>
      <p className="mt-4 text-muted-foreground">
        AI-powered, personalized career roadmaps. Learn smarter, faster.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <a className="px-5 py-3 rounded-xl bg-brand text-white" href="/signin">Get Started</a>
        <a className="px-5 py-3 rounded-xl border" href="/dashboard">Open Dashboard</a>
      </div>
    </section>
  );
}