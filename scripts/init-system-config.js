/**
 * Initialize System Configuration Script
 * Run this to populate default system configurations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultConfigs = [
  {
    settingName: 'fuel_price_per_liter',
    settingValue: '1.50',
    description: 'Fuel price in EUR per liter',
    category: 'pricing',
    dataType: 'number'
  },
  {
    settingName: 'driver_cost_per_hour',
    settingValue: '25.00',
    description: 'Driver cost in EUR per hour',
    category: 'pricing',
    dataType: 'number'
  },
  {
    settingName: 'average_speed_city',
    settingValue: '30',
    description: 'Average city speed in km/h',
    category: 'routing',
    dataType: 'number'
  },
  {
    settingName: 'average_speed_highway',
    settingValue: '80',
    description: 'Average highway speed in km/h',
    category: 'routing',
    dataType: 'number'
  },
  {
    settingName: 'profit_margin_min',
    settingValue: '15',
    description: 'Minimum profit margin percentage',
    category: 'pricing',
    dataType: 'number'
  },
  {
    settingName: 'default_currency',
    settingValue: 'EUR',
    description: 'Default currency for the system',
    category: 'system',
    dataType: 'string'
  },
  {
    settingName: 'distance_unit',
    settingValue: 'km',
    description: 'Default distance unit',
    category: 'system',
    dataType: 'string'
  },
  {
    settingName: 'fuel_unit',
    settingValue: 'liters',
    description: 'Default fuel unit',
    category: 'system',
    dataType: 'string'
  },
  {
    settingName: 'ai_confidence_threshold',
    settingValue: '70',
    description: 'Minimum AI confidence threshold percentage',
    category: 'ai',
    dataType: 'number'
  },
  {
    settingName: 'ai_max_suggestions',
    settingValue: '5',
    description: 'Maximum AI suggestions to generate',
    category: 'ai',
    dataType: 'number'
  },
  {
    settingName: 'enable_email_notifications',
    settingValue: 'true',
    description: 'Enable email notifications',
    category: 'notifications',
    dataType: 'boolean'
  },
  {
    settingName: 'enable_sms_notifications',
    settingValue: 'false',
    description: 'Enable SMS notifications',
    category: 'notifications',
    dataType: 'boolean'
  }
];

async function initializeSystemConfig() {
  console.log('🚀 Initializing system configuration...');
  
  try {
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const config of defaultConfigs) {
      const existing = await prisma.systemConfig.findUnique({
        where: { settingName: config.settingName }
      });
      
      if (existing) {
        console.log(`⚠️  Configuration '${config.settingName}' already exists, skipping...`);
        updatedCount++;
      } else {
        await prisma.systemConfig.create({
          data: {
            settingName: config.settingName,
            settingValue: config.settingValue,
            description: config.description,
            category: config.category,
            dataType: config.dataType,
            isEditable: true
          }
        });
        console.log(`✅ Created configuration: ${config.settingName} = ${config.settingValue}`);
        createdCount++;
      }
    }
    
    console.log(`\n📊 Configuration Summary:`);
    console.log(`  - Created: ${createdCount} new configurations`);
    console.log(`  - Existing: ${updatedCount} configurations`);
    console.log(`  - Total: ${defaultConfigs.length} configurations`);
    
    // Show final state
    console.log('\n📋 Current System Configuration:');
    const allConfigs = await prisma.systemConfig.findMany({
      orderBy: [
        { category: 'asc' },
        { settingName: 'asc' }
      ]
    });
    
    const categories = {};
    allConfigs.forEach(config => {
      if (!categories[config.category]) {
        categories[config.category] = [];
      }
      categories[config.category].push(config);
    });
    
    for (const [category, configs] of Object.entries(categories)) {
      console.log(`\n  📁 ${category.toUpperCase()}: ${configs.length} settings`);
      configs.forEach(config => {
        console.log(`    - ${config.settingName}: ${config.settingValue} EUR (${config.description})`);
      });
    }
    
    console.log('\n✅ System configuration initialization complete!');
    
  } catch (error) {
    console.error('❌ Failed to initialize system configuration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
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

module.exports = { initializeSystemConfig };