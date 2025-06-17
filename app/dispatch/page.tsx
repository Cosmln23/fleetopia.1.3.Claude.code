'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Truck,
  Loader,
  ServerCrash,
} from 'lucide-react';
import Link from 'next/link';

// Define the type for a Job based on the expected API response
interface Job {
  id: string;
  title: string;
  status: 'NEW' | 'TAKEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  fromAddress: string;
  toAddress: string;
  fromCountry: string;
  toCountry: string;
  // Vehicle info will be added in a future step
}

export default function DispatchPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      
      let statusQuery = '';
      if (filter === 'active') {
        statusQuery = 'TAKEN,IN_PROGRESS';
      } else if (filter === 'completed') {
        statusQuery = 'COMPLETED';
      } else if (filter === 'canceled') {
        statusQuery = 'CANCELED';
      }

      try {
        const response = await fetch(`/api/dispatch/jobs?status=${statusQuery}`);
        if (!response.ok) {
          throw new Error('Failed to fetch jobs from the server.');
        }
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
      case 'TAKEN':
        return <Badge variant="secondary">Assigned</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'CANCELED':
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-12 h-12 animate-spin text-blue-400" />
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col justify-center items-center h-64 text-red-400">
          <ServerCrash className="w-12 h-12 mb-4" />
          <p className="text-lg">Error loading data</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }
    
    if (jobs.length === 0) {
      return (
         <div className="flex justify-center items-center h-64">
          <p className="text-lg text-slate-400">No jobs found for this filter.</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white">Job Title</TableHead>
            <TableHead className="text-white">Route</TableHead>
            <TableHead className="text-white">Assigned Vehicle</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>{job.title}</TableCell>
              <TableCell>{`${job.fromAddress}, ${job.fromCountry} -> ${job.toAddress}, ${job.toCountry}`}</TableCell>
              <TableCell className="flex items-center text-slate-500 italic">
                <Truck className="w-4 h-4 mr-2"/>
                (Not assigned)
              </TableCell>
              <TableCell>{getStatusBadge(job.status)}</TableCell>
              <TableCell>
                <Link href={`/dispatch/${job.id}`} passHref>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl flex items-center">
            <ClipboardList className="w-10 h-10 mr-4" />
            Dispatch Center
          </h1>
          <p className="mt-2 text-lg text-blue-200">
            Monitor and manage all active, completed, and canceled jobs.
          </p>
        </div>
      </header>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-white">Job Overview</CardTitle>
            <div className="space-x-2">
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                onClick={() => setFilter('active')}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Loader className="w-4 h-4 mr-2"/>
                Active Jobs
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
                 className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2"/>
                Completed
              </Button>
               <Button
                variant={filter === 'canceled' ? 'default' : 'outline'}
                onClick={() => setFilter('canceled')}
                 className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <XCircle className="w-4 h-4 mr-2"/>
                Canceled
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
} 