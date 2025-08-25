import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create or reuse demo user
  const user = await db.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      image: "https://i.pravatar.cc/150?img=3",
    },
  });

  // Create sample roadmap with nested modules + resources
  const roadmap = await db.roadmap.create({
    data: {
      userId: user.id,
      title: "Frontend Developer Roadmap",
      targetRole: "Frontend Developer",
      durationWks: 12,
      modules: {
        create: [
          {
            title: "HTML & CSS Basics",
            weekIndex: 1,
            description:
              "Learn HTML tags, CSS selectors, and layouts to build static pages.",
            checkpoint: "Build a simple responsive portfolio page",
            resources: {
              create: [
                {
                  kind: "article",
                  title: "MDN HTML Guide",
                  url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
                },
                {
                  kind: "video",
                  title: "CSS Crash Course (YouTube)",
                  url: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
                },
              ],
            },
          },
          {
            title: "JavaScript Fundamentals",
            weekIndex: 2,
            description:
              "Understand variables, functions, arrays, objects, and the DOM.",
            checkpoint: "Make your portfolio interactive with JS",
            resources: {
              create: [
                {
                  kind: "article",
                  title: "JavaScript.info Tutorial",
                  url: "https://javascript.info/",
                },
                {
                  kind: "video",
                  title: "JS Crash Course",
                  url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
                },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { resources: true } } },
  });

  console.log("✅ Seed complete.");
  console.log({
    demoUser: user.email,
    roadmapTitle: roadmap.title,
    modules: roadmap.modules.length,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
