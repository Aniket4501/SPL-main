const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const teams = [
  { team_id: "T001", team_name: "Finance Super Strikers" },
  { team_id: "T002", team_name: "Prod United" },
  { team_id: "T003", team_name: "Tech Rangers" },
  { team_id: "T004", team_name: "Care Plan Warriors" },
  { team_id: "T005", team_name: "HR Legends" },
  { team_id: "T006", team_name: "Analytics Avengers" },
  { team_id: "T007", team_name: "Ops Titans" },
  { team_id: "T008", team_name: "MedEx Chargers" }
];

async function seedTeams() {
  console.log('🏏 Starting team seeding...');
  
  try {
    let createdCount = 0;
    let updatedCount = 0;

    for (const team of teams) {
      const result = await prisma.teams.upsert({
        where: { team_id: team.team_id },
        update: { team_name: team.team_name },
        create: {
          team_id: team.team_id,
          team_name: team.team_name
        }
      });

      if (result.created_at === result.updated_at) {
        createdCount++;
        console.log(`✓ Created: ${team.team_id} - ${team.team_name}`);
      } else {
        updatedCount++;
        console.log(`↻ Updated: ${team.team_id} - ${team.team_name}`);
      }
    }

    console.log('\n✅ Team seeding completed!');
    console.log(`   Created: ${createdCount}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Total teams: ${teams.length}`);
  } catch (error) {
    console.error('❌ Error seeding teams:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTeams()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

