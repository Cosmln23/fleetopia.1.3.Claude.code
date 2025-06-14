"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CloudRain, TrafficCone, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const alertIcons = {
    weather: <CloudRain className="w-4 h-4" />,
    traffic: <TrafficCone className="w-4 h-4" />,
    system: <Siren className="w-4 h-4" />,
};

const alertColors = {
    weather: "bg-blue-500",
    traffic: "bg-orange-500",
    system: "bg-red-500",
};

type AlertType = 'weather' | 'traffic' | 'system';

const mockAlerts: { id: number; type: AlertType; message: string }[] = [
    { id: 1, type: 'weather', message: 'Heavy rain advisory for Route 7.' },
    { id: 2, type: 'traffic', message: 'Accident on I-95, expect delays.' },
    { id: 3, type: 'system', message: 'Vehicle #102 offline.' },
];

function AlertCard({ alert }: { alert: { id: number; type: AlertType; message: string } }) {
    return (
        <div className="flex items-start space-x-3 p-2 rounded-lg bg-secondary">
            <div className={`p-1.5 rounded-full ${alertColors[alert.type]}`}>
                {alertIcons[alert.type]}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium">{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</p>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
            </div>
        </div>
    );
}

export function LiveAlerts() {
    // In the future, this data will come from an API
    const alerts = mockAlerts;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                    Live Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 