/**
 * Initialize System Configuration Script
 * Run this to populate default system configurations
 */

import { systemConfigService } from '../lib/system-config-service';

async function initializeSystemConfig() {
  console.log('🚀 Initializing system configuration...');
  
  try {
    await systemConfigService.initializeDefaults();
    console.log('✅ System configuration initialized successfully!');
    
    // Verify configurations were created
    const configs = await systemConfigService.getByCategory('pricing');
    console.log(`📊 Created ${configs.length} pricing configurations`);
    
    const speedConfigs = await systemConfigService.getByCategory('routing');
    console.log(`🚗 Created ${speedConfigs.length} routing configurations`);
    
    console.log('\n📋 Configuration Summary:');
    const allCategories = ['pricing', 'routing', 'system', 'ai', 'notifications'];
    
    for (const category of allCategories) {
      const categoryConfigs = await systemConfigService.getByCategory(category);
      console.log(`  ${category}: ${categoryConfigs.length} settings`);
      
      for (const config of categoryConfigs) {
        console.log(`    - ${config.settingName}: ${config.settingValue} (${config.description})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize system configuration:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeSystemConfig()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { initializeSystemConfig };