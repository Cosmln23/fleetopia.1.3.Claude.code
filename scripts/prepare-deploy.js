#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing Fleetopia for Railway deployment...\n');

// Files to remove before deployment
const filesToRemove = [
  'test-dynamic-fuel-pricing.js',
  'test-driver-personalization.js', 
  'test-historical-learning.js',
  'test-micro-optimization.js',
  'test-predictive-fuel-ai.js',
  'test-real-time-api.js',
  'test-vehicle-optimization.js',
  'test-dynamic-fuel-pricing-fixed.js',
  'server.log'
];

// Documentation files to remove
const docsToRemove = [
  'AGENT_JOURNAL.md',
  'AGENT_JOURNAL_V1.2.md',
  'AGENT_TESTING_PLAN.md',
  'API_TESTING_GUIDE.md',
  'CHANGELOG-16-06-2024.md',
  'CONTINUE_MAINE_18_IUNIE.md',
  'CONTINUE_TOMORROW.md',
  'DEVELOPMENT_LOG.md',
  'EtapaAgenti15-06.md',
  'FAZA_2_COMPLETE_LOG.md',
  'Jurnal_15-06-2024.md',
  'MAPS_TODO.md',
  'NEXT_CHAT_PROMPT.md',
  'NOTES.md',
  'SESSION_NOTES_MARKETPLACE_COMPLETION.md',
  'SESSION_NOTES_TOAST_FIX_AND_TRANSPORT_INTEGRATION.md',
  'Suspendari.temporare.15.06.md',
  'UNIVERSAL_API_BRIDGE_NOTES.md',
  'VS_CODE_SETUP.md',
  'plan claude code.txt',
  'ssl-fix.txt',
  'INSTALLATION_NOTES.pdf'
];

let removedCount = 0;

// Remove test files
console.log('🧹 Cleaning test files...');
filesToRemove.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Removed: ${file}`);
      removedCount++;
    } catch (error) {
      console.log(`   ❌ Failed to remove: ${file} - ${error.message}`);
    }
  }
});

// Remove documentation files
console.log('\n📚 Cleaning documentation files...');
docsToRemove.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Removed: ${file}`);
      removedCount++;
    } catch (error) {
      console.log(`   ❌ Failed to remove: ${file} - ${error.message}`);
    }
  }
});

console.log(`\n✨ Cleanup complete! Removed ${removedCount} files.`);
console.log('🚀 Application is ready for Railway deployment!');
console.log('\n📋 Next steps:');
console.log('   1. Commit your changes: git add . && git commit -m "Prepare for Railway deployment"');
console.log('   2. Push to Railway: git push');
console.log('   3. Set environment variables in Railway dashboard');
console.log('   4. Deploy! 🎉\n'); 