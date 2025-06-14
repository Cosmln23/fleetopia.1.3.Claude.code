"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function IntegrationStatusCard() {
    const [integrationStatus, setIntegrationStatus] = useState({
        gps_api: false,
        weather_service: false,
        traffic_data: false,
        database_sync: false,
    });

    useEffect(() => {
        // Simulate checking services
        const interval = setInterval(() => {
            setIntegrationStatus({
                gps_api: Math.random() > 0.1, // 90% uptime
                weather_service: Math.random() > 0.05, // 95% uptime
                traffic_data: Math.random() > 0.2, // 80% uptime
                database_sync: true, // Always connected
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-400" />
                    System Integration Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(integrationStatus).map(([key, status]) => (
                        <div key={key} className="flex items-center justify-between p-2 rounded bg-secondary">
                            <span className="capitalize text-muted-foreground">{key.replace('_', ' ')}</span>
                            <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 