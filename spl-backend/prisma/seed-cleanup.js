const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

/**
 * Clean up testing data from database
 * TRUNCATES all uploads, steps_raw, leaderboard_individual, and leaderboard_team rows
 * Does NOT touch users or teams tables
 * Also cleans up uploaded files from uploads directory
 */
async function cleanupTestData() {
  console.log('🧹 Starting SPL test data reset...');
  console.log('⚠️  This will TRUNCATE ALL uploads and leaderboard data.');
  console.log('✅ Users and Teams tables will NOT be touched.\n');

  try {
    // Use TRUNCATE CASCADE to handle foreign key constraints
    console.log('📊 Truncating leaderboard_team table...');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE leaderboard_team CASCADE');
    console.log('   ✓ leaderboard_team cleared');

    console.log('📊 Truncating leaderboard_individual table...');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE leaderboard_individual CASCADE');
    console.log('   ✓ leaderboard_individual cleared');

    console.log('📋 Truncating steps_raw table...');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE steps_raw CASCADE');
    console.log('   ✓ steps_raw cleared');

    console.log('📁 Truncating uploads table...');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE uploads CASCADE');
    console.log('   ✓ uploads cleared');

    // Clean up uploaded files
    console.log('\n🗑️  Cleaning up uploaded files...');
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let deletedCount = 0;
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile() && (file.endsWith('.xlsx') || file.endsWith('.xls') || file.endsWith('.json'))) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        } catch (err) {
          console.warn(`   ⚠️  Could not delete ${file}:`, err.message);
        }
      }
      console.log(`   ✓ Deleted ${deletedCount} uploaded files`);
    } else {
      console.log('   ℹ️  uploads directory does not exist (nothing to clean)');
    }

    // Verify reset
    console.log('\n🔍 Verifying reset...');
    const uploadsCount = await prisma.uploads.count();
    const stepsCount = await prisma.steps_raw.count();
    const individualCount = await prisma.leaderboard_individual.count();
    const teamCount = await prisma.leaderboard_team.count();
    
    console.log(`   - uploads: ${uploadsCount} rows`);
    console.log(`   - steps_raw: ${stepsCount} rows`);
    console.log(`   - leaderboard_individual: ${individualCount} rows`);
    console.log(`   - leaderboard_team: ${teamCount} rows`);

    if (uploadsCount === 0 && stepsCount === 0 && individualCount === 0 && teamCount === 0) {
      console.log('   ✅ All tables cleared successfully!');
    } else {
      console.warn('   ⚠️  Some tables still contain data. Please check manually.');
    }

    // Verify users and teams are still intact
    const usersCount = await prisma.users.count();
    const teamsCount = await prisma.teams.count();
    console.log(`\n✅ Users table: ${usersCount} rows (preserved)`);
    console.log(`✅ Teams table: ${teamsCount} rows (preserved)`);

    console.log('\n🧹 SPL Test Reset Completed — All step data cleared.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup
cleanupTestData()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

