const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('👥 Starting user seeding...');
  
  try {
    // Load users from JSON file
    const usersFilePath = path.join(__dirname, 'data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    
    console.log(`📄 Loaded ${usersData.length} users from users.json`);
    
    if (usersData.length !== 56) {
      throw new Error(`Expected 56 users, but found ${usersData.length}`);
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const user of usersData) {
      const result = await prisma.users.upsert({
        where: { user_id: user.user_id },
        update: { 
          name: user.name,
          team_id: user.team_id
        },
        create: {
          user_id: user.user_id,
          name: user.name,
          team_id: user.team_id
        }
      });

      if (result.created_at === result.updated_at) {
        createdCount++;
        console.log(`✓ Created: ${user.user_id} - ${user.name} (${user.team_id})`);
      } else {
        updatedCount++;
        console.log(`↻ Updated: ${user.user_id} - ${user.name} (${user.team_id})`);
      }
    }

    console.log('\n✅ User seeding completed!');
    console.log(`   Created: ${createdCount}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Total users: ${usersData.length}`);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

