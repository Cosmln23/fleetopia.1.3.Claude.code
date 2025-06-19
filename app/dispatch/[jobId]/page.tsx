import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { JobDetailsClient } from './job-details-client';

const JobDetailsPage = async (props: { params: Promise<{ jobId: string }> }) => {
  const params = await props.params;
  const { jobId } = params;

  const job = await prisma.cargoOffer.findUnique({
    where: { id: jobId },
    include: {
      user: true, // Assuming a relation exists for the creator
    },
  });

  if (!job) {
    notFound();
  }

  // Find the associated route and vehicle
  const route = await prisma.route.findFirst({
      where: { cargoOfferId: job.id },
      include: {
          vehicle: true,
      }
  });

  const assignedVehicle = route?.vehicle || null;

  return <JobDetailsClient job={job} assignedVehicle={assignedVehicle} />;
};

export default JobDetailsPage; 