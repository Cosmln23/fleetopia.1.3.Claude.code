import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  let user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found, creating a new one...');
    user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@fleetopia.co',
        role: 'admin',
      },
    });
    console.log(`Created user with id: ${user.id}`);
  }

  let fleet = await prisma.fleet.findFirst({ where: { owner: { id: user.id } } });
  if (!fleet) {
    console.log('No fleet found for this user, creating a new one...');
    fleet = await prisma.fleet.create({
      data: {
        name: 'My First Fleet',
        status: 'active',
        owner: {
          connect: { id: user.id },
        },
      },
    });
    console.log(`Created fleet with id: ${fleet.id}`);
  } else {
    console.log(`Using existing fleet with id: ${fleet.id}`);
  }
  
  const fleetId = fleet.id;

  const vehiclesData = [
    {
      licensePlate: 'B 123 ABC',
      name: 'Mercedes-Benz Actros',
      type: 'Truck',
      status: 'active',
      driverName: 'John Smith',
      currentRoute: 'Berlin → Hamburg',
      lat: 52.5200,
      lng: 13.4050,
      fleetId: fleetId,
    },
    {
      licensePlate: 'W 456 DEF',
      name: 'Volvo FH',
      type: 'Truck',
      status: 'idle',
      driverName: 'Maria Garcia',
      currentRoute: 'Munich → Frankfurt',
      lat: 48.1351,
      lng: 11.5820,
      fleetId: fleetId,
    },
    {
      licensePlate: 'P 789 GHI',
      name: 'Scania R-series',
      type: 'Truck',
      status: 'maintenance',
      driverName: 'Andrei Popov',
      currentRoute: 'Prague → Brno',
      lat: 50.0755,
      lng: 14.4378,
      fleetId: fleetId,
    },
  ];
  
  console.log('Upserting vehicles...');
  for (const v of vehiclesData) {
    await prisma.vehicle.upsert({
      where: { licensePlate: v.licensePlate },
      update: {},
      create: v,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 