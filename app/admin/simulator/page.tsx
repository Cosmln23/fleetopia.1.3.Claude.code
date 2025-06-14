import { prisma } from "@/lib/prisma";
import { SimulatorCard } from "@/components/simulator/simulator-card";
import { Separator } from "@/components/ui/separator";

export const revalidate = 10; // Re-fetch data at most every 10 seconds

async function getVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return vehicles;
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    return [];
  }
}

export default async function SimulatorPage() {
  const vehicles = await getVehicles();

  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicle Simulator</h1>
          <p className="text-muted-foreground">
            Manually update vehicle status and location to test real-time system reactions.
          </p>
        </div>
        <Separator />

        {vehicles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((vehicle) => (
              <SimulatorCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">No Vehicles Found</h2>
            <p className="text-muted-foreground mt-2">
              The database does not contain any vehicles. You might need to seed the database first.
            </p>
          </div>
        )}
      </div>
    </main>
  );
} 