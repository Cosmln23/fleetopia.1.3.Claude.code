'use client';

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Box, Weight, Truck, User, Building, FileText, Printer } from 'lucide-react';
import { CargoOffer, Vehicle, User as UserType } from '@prisma/client'; // Assuming types are available

// We need to define the type for the props, including relations
type JobDetailsProps = {
  job: CargoOffer & { user: UserType | null };
  assignedVehicle: Vehicle | null;
};

const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-blue-500 text-white">In Progress</Badge>;
      case 'TAKEN':
        return <Badge variant="secondary">Assigned</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-600 text-white">Completed</Badge>;
      case 'CANCELED':
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
};

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start space-x-4 print:space-x-2">
      <Icon className="w-6 h-6 text-slate-400 mt-1 print:w-5 print:h-5 print:text-gray-500" />
      <div>
        <p className="font-semibold text-slate-300 print:text-sm print:text-gray-700">{label}</p>
        <p className="text-white print:text-sm print:text-gray-600">{value}</p>
      </div>
    </div>
);

export const JobDetailsClient = ({ job, assignedVehicle }: JobDetailsProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 sm:p-6 lg:p-8 print:p-0 print:bg-white print:text-black">
            <div ref={printRef} className="max-w-6xl mx-auto print:max-w-full">
                <div className="flex justify-between items-center mb-6 print:mb-4">
                    <h1 className="text-3xl font-bold text-white print:text-2xl print:text-black">
                        Order Details <span className="text-blue-400 print:text-blue-600">#{job.id.substring(0, 8)}</span>
                    </h1>
                    <div className="print:hidden">
                        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                            <Printer className="mr-2 h-4 w-4" />
                            Print / Download PDF
                        </Button>
                    </div>
                    <div className="hidden print:block">{getStatusBadge(job.status)}</div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
                    {/* Main Details Column */}
                    <div className="lg:col-span-2 print:col-span-2">
                        <Card className="bg-[--card] print:shadow-none print:border print:bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center text-white print:text-lg print:text-black"><FileText className="mr-2" /> Job Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 print:space-y-3">
                               <DetailItem icon={FileText} label="Job Title" value={job.title} />
                               <DetailItem icon={Building} label="Company" value={job.companyName} />
                               <DetailItem 
                                 icon={User} 
                                 label="Posted By" 
                                 value={job.user ? job.user.name : 'System/Deleted User'} 
                               />
                            </CardContent>
                        </Card>

                         <Card className="mt-6 bg-[--card] print:mt-4 print:shadow-none print:border print:bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center text-white print:text-lg print:text-black"><MapPin className="mr-2" /> Route Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2 text-green-400 print:text-base print:text-green-600">Origin</h3>
                                    <DetailItem icon={MapPin} label="Address" value={`${job.fromAddress}, ${job.fromPostalCode}`} />
                                    <DetailItem icon={MapPin} label="Country" value={job.fromCountry} />
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-lg mb-2 text-red-400 print:text-base print:text-red-600">Destination</h3>
                                    <DetailItem icon={MapPin} label="Address" value={`${job.toAddress}, ${job.toPostalCode}`} />
                                    <DetailItem icon={MapPin} label="Country" value={job.toCountry} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side Column */}
                    <div className="print:col-span-1">
                         <Card className="bg-[--card] print:shadow-none print:border print:bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center text-white print:text-lg print:text-black"><Box className="mr-2" /> Cargo Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 print:space-y-2">
                                <DetailItem icon={Box} label="Cargo Type" value={job.cargoType} />
                                <DetailItem icon={Weight} label="Weight" value={`${job.weight} kg`} />
                                <DetailItem icon={Box} label="Volume" value={`${job.volume} m³`} />
                            </CardContent>
                        </Card>

                         <Card className="mt-6 bg-[--card] print:mt-4 print:shadow-none print:border print:bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center text-white print:text-lg print:text-black"><Calendar className="mr-2" /> Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 print:space-y-2">
                               <DetailItem icon={Calendar} label="Loading Date" value={new Date(job.loadingDate).toLocaleDateString()} />
                               <DetailItem icon={Calendar} label="Delivery Date" value={new Date(job.deliveryDate).toLocaleDateString()} />
                            </CardContent>
                        </Card>

                         {assignedVehicle && (
                            <Card className="mt-6 bg-[--card] print:mt-4 print:shadow-none print:border print:bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-white print:text-lg print:text-black"><Truck className="mr-2" /> Assigned Vehicle</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 print:space-y-2">
                                   <DetailItem icon={Truck} label="Vehicle Name" value={assignedVehicle.name} />
                                   <DetailItem icon={FileText} label="License Plate" value={assignedVehicle.licensePlate} />
                                   <DetailItem icon={User} label="Driver" value={assignedVehicle.driverName} />
                                </CardContent>
                            </Card>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
}; 