# 🤖 PLAN COMPLET TESTARE AGENȚI AI
*Plan detaliat pentru sistemul de testare cu control manual - Ready for tomorrow*

## 📋 **OBIECTIVUL PRINCIPAL**
Sistem unde:
- **TU modifici manual** datele prin interface
- **AGENȚII extrag** datele la 10 minute prin API
- **SISTEM urmărește** deciziile și performanța

---

## 🗄️ **PASUL 1: DATABASE SCHEMA**

### **1.1 Tabele Noi de Adăugat în Prisma**

```prisma
// prisma/schema.prisma - Adaugă acestea

model AgentTestData {
  id            Int      @id @default(autoincrement())
  scenarioName  String   @map("scenario_name")
  dataType      DataType @map("data_type")
  dataContent   Json     @map("data_content")
  lastUpdated   DateTime @default(now()) @map("last_updated")
  isActive      Boolean  @default(true) @map("is_active")
  createdBy     String   @default("manual") @map("created_by")

  @@map("agent_test_data")
}

model AgentDecision {
  id              Int      @id @default(autoincrement())
  agentName       String   @map("agent_name")
  decisionTime    DateTime @default(now()) @map("decision_time")
  inputData       Json     @map("input_data")
  decisionMade    Json     @map("decision_made")
  reasoning       String?
  performanceScore Decimal? @map("performance_score") @db.Decimal(5,2)
  executionTime   Int?     @map("execution_time") // milliseconds
  
  @@map("agent_decisions")
}

model AgentSchedule {
  id        Int             @id @default(autoincrement())
  agentName String          @unique @map("agent_name")
  lastRun   DateTime?       @map("last_run")
  nextRun   DateTime?       @map("next_run")
  status    AgentStatus     @default(IDLE)
  errorLog  String?         @map("error_log")

  @@map("agent_schedule")
}

enum DataType {
  VEHICLES
  ROUTES
  TRAFFIC
  INCIDENTS
  WEATHER
  FUEL_PRICES
  CLIENTS
}

enum AgentStatus {
  RUNNING
  IDLE
  ERROR
  PAUSED
}
```

### **1.2 Comenzi de Executare**
```bash
# 1. Adaugă schema în prisma/schema.prisma
# 2. Generează migrarea
npx prisma db push

# 3. Verifică că totul merge
npx prisma studio
```

---

## 🔌 **PASUL 2: API ENDPOINTS**

### **2.1 API pentru Agenți (Extrag Date)**

#### **File: `app/api/agent-test/data/route.ts`**
```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Agenții iau datele de test
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type');
    const scenarioName = searchParams.get('scenario');

    const whereClause: any = { isActive: true };
    if (dataType) whereClause.dataType = dataType.toUpperCase();
    if (scenarioName) whereClause.scenarioName = scenarioName;

    const testData = await prisma.agentTestData.findMany({
      where: whereClause,
      orderBy: { lastUpdated: 'desc' }
    });

    return Response.json({
      success: true,
      data: testData,
      timestamp: new Date().toISOString(),
      count: testData.length
    });

  } catch (error) {
    console.error('Agent data fetch error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch test data' },
      { status: 500 }
    );
  }
}
```

#### **File: `app/api/agent-test/decisions/route.ts`**
```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Agenții salvează deciziile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const decision = await prisma.agentDecision.create({
      data: {
        agentName: body.agent_name,
        inputData: body.input_data,
        decisionMade: body.decision_made,
        reasoning: body.reasoning,
        performanceScore: body.performance_score,
        executionTime: body.execution_time
      }
    });

    // Update agent schedule
    await prisma.agentSchedule.upsert({
      where: { agentName: body.agent_name },
      update: { 
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 10 * 60 * 1000), // +10 min
        status: 'IDLE'
      },
      create: {
        agentName: body.agent_name,
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 10 * 60 * 1000),
        status: 'IDLE'
      }
    });

    return Response.json({ success: true, decision_id: decision.id });

  } catch (error) {
    console.error('Agent decision save error:', error);
    return Response.json(
      { success: false, error: 'Failed to save decision' },
      { status: 500 }
    );
  }
}

// GET - Vezi istoricul deciziilor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agent');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause: any = {};
    if (agentName) whereClause.agentName = agentName;

    const decisions = await prisma.agentDecision.findMany({
      where: whereClause,
      orderBy: { decisionTime: 'desc' },
      take: limit
    });

    return Response.json({ success: true, decisions });

  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to fetch decisions' },
      { status: 500 }
    );
  }
}
```

#### **File: `app/api/agent-test/control/route.ts`**
```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - TU modifici datele manual
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const testData = await prisma.agentTestData.create({
      data: {
        scenarioName: body.scenario_name,
        dataType: body.data_type.toUpperCase(),
        dataContent: body.data_content,
        createdBy: 'manual'
      }
    });

    return Response.json({ success: true, data_id: testData.id });

  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to save test data' },
      { status: 500 }
    );
  }
}

// PUT - Actualizează date existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const updatedData = await prisma.agentTestData.update({
      where: { id: body.id },
      data: {
        dataContent: body.data_content,
        lastUpdated: new Date()
      }
    });

    return Response.json({ success: true, updated: updatedData });

  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to update test data' },
      { status: 500 }
    );
  }
}

// DELETE - Șterge/dezactivează date
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');

    await prisma.agentTestData.update({
      where: { id },
      data: { isActive: false }
    });

    return Response.json({ success: true });

  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to delete test data' },
      { status: 500 }
    );
  }
}
```

---

## 🎛️ **PASUL 3: INTERFACE MANUAL**

### **3.1 Dashboard Principal**

#### **File: `app/agent-test/page.tsx`**
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Database,
  Bot,
  Settings
} from 'lucide-react';

import { VehicleTestControl } from '@/components/agent-test/VehicleTestControl';
import { TrafficTestControl } from '@/components/agent-test/TrafficTestControl';
import { AgentDecisionMonitor } from '@/components/agent-test/AgentDecisionMonitor';
import { AgentScheduleManager } from '@/components/agent-test/AgentScheduleManager';

export default function AgentTestDashboard() {
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [agentStats, setAgentStats] = useState({
    total_decisions: 0,
    active_agents: 0,
    avg_response_time: 0
  });

  useEffect(() => {
    // Load initial stats
    fetchAgentStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAgentStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgentStats = async () => {
    try {
      const response = await fetch('/api/agent-test/stats');
      const data = await response.json();
      if (data.success) {
        setAgentStats(data.stats);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch agent stats:', error);
    }
  };

  const handleSystemToggle = () => {
    setIsSystemActive(!isSystemActive);
    // TODO: Implementează start/stop system
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header cu Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🤖 Agent Testing Lab</h1>
          <p className="text-muted-foreground">
            Control manual data • Monitor agent decisions • Analyze performance
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">System Status</div>
            <Badge variant={isSystemActive ? "default" : "secondary"}>
              {isSystemActive ? "🟢 Active" : "🔴 Paused"}
            </Badge>
          </div>
          
          <Button
            onClick={handleSystemToggle}
            variant={isSystemActive ? "destructive" : "default"}
          >
            {isSystemActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isSystemActive ? "Pause System" : "Start System"}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{agentStats.active_agents}</div>
                <div className="text-sm text-muted-foreground">Active Agents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{agentStats.total_decisions}</div>
                <div className="text-sm text-muted-foreground">Total Decisions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{agentStats.avg_response_time}ms</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--'}
                </div>
                <div className="text-sm text-muted-foreground">Last Update</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="control" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="control">🎛️ Manual Control</TabsTrigger>
          <TabsTrigger value="monitor">📊 Agent Monitor</TabsTrigger>
          <TabsTrigger value="schedule">⏰ Schedule</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🚛 Vehicle Test Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VehicleTestControl />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🚦 Traffic & Routes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TrafficTestControl />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <AgentDecisionMonitor />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <AgentScheduleManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* TODO: Analytics components */}
          <Card>
            <CardHeader>
              <CardTitle>📈 Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### **3.2 Componente de Control Manual**

#### **File: `components/agent-test/VehicleTestControl.tsx`**
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Save, Trash2 } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  fuel: number;
  speed: number;
  status: 'active' | 'idle' | 'maintenance';
  driver: string;
  route: string;
}

export function VehicleTestControl() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'V001',
      name: 'Truck Alpha',
      location: { lat: 45.7489, lng: 21.2087 },
      fuel: 75,
      speed: 0,
      status: 'idle',
      driver: 'John Doe',
      route: 'Route A'
    }
  ]);

  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    fuel: 100,
    speed: 0,
    status: 'idle'
  });

  const addVehicle = () => {
    if (newVehicle.name && newVehicle.driver) {
      const vehicle: Vehicle = {
        id: `V${String(vehicles.length + 1).padStart(3, '0')}`,
        name: newVehicle.name,
        location: newVehicle.location || { lat: 45.7489, lng: 21.2087 },
        fuel: newVehicle.fuel || 100,
        speed: newVehicle.speed || 0,
        status: newVehicle.status as any || 'idle',
        driver: newVehicle.driver || '',
        route: newVehicle.route || 'Default Route'
      };
      setVehicles([...vehicles, vehicle]);
      setNewVehicle({ fuel: 100, speed: 0, status: 'idle' });
    }
  };

  const updateVehicle = (index: number, field: keyof Vehicle, value: any) => {
    const updated = [...vehicles];
    updated[index] = { ...updated[index], [field]: value };
    setVehicles(updated);
  };

  const saveToDatabase = async () => {
    try {
      const response = await fetch('/api/agent-test/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_name: 'Current Vehicle Setup',
          data_type: 'VEHICLES',
          data_content: vehicles
        })
      });

      if (response.ok) {
        alert('✅ Vehicle data saved successfully!');
      } else {
        alert('❌ Failed to save vehicle data');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Error saving data');
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Vehicles */}
      <div className="space-y-3">
        {vehicles.map((vehicle, index) => (
          <Card key={vehicle.id} className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <Label>Name</Label>
                <Input 
                  value={vehicle.name}
                  onChange={(e) => updateVehicle(index, 'name', e.target.value)}
                />
              </div>
              <div>
                <Label>Fuel %</Label>
                <Input 
                  type="number"
                  min="0" 
                  max="100"
                  value={vehicle.fuel}
                  onChange={(e) => updateVehicle(index, 'fuel', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Speed</Label>
                <Input 
                  type="number"
                  min="0"
                  value={vehicle.speed}
                  onChange={(e) => updateVehicle(index, 'speed', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={vehicle.status}
                  onValueChange={(value) => updateVehicle(index, 'status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="idle">Idle</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Vehicle */}
      <Card className="p-3 border-dashed">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <Label>Vehicle Name</Label>
            <Input 
              placeholder="e.g. Truck Beta"
              value={newVehicle.name || ''}
              onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
            />
          </div>
          <div>
            <Label>Driver</Label>
            <Input 
              placeholder="Driver name"
              value={newVehicle.driver || ''}
              onChange={(e) => setNewVehicle({...newVehicle, driver: e.target.value})}
            />
          </div>
          <div>
            <Label>Route</Label>
            <Input 
              placeholder="Route name"
              value={newVehicle.route || ''}
              onChange={(e) => setNewVehicle({...newVehicle, route: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addVehicle} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveToDatabase}>
          <Save className="w-4 h-4 mr-2" />
          Save to Database
        </Button>
      </div>
    </div>
  );
}
```

---

## ⚡ **PASUL 4: AGENT SCHEDULER (10 minute)**

#### **File: `lib/agent-scheduler.ts`**
```typescript
import { prisma } from '@/lib/prisma';

export interface Agent {
  name: string;
  makeDecision(data: any): Promise<any>;
  getReasoningSteps(): string[];
}

export class AgentScheduler {
  private agents: Agent[] = [];
  private interval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor() {
    // Register your existing agents here
    // this.registerAgent(new RouteOptimizerAgent());
    // this.registerAgent(new FuelManagerAgent());
    // this.registerAgent(new LoadBalancerAgent());
  }

  registerAgent(agent: Agent) {
    this.agents.push(agent);
    console.log(`🤖 Agent registered: ${agent.name}`);
  }

  async startScheduler() {
    if (this.isRunning) {
      console.log('⚠️ Scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Agent scheduler started - 10 minute intervals');
    
    // Run immediately, then every 10 minutes
    await this.runAllAgents();
    
    this.interval = setInterval(async () => {
      await this.runAllAgents();
    }, 10 * 60 * 1000); // 10 minutes
  }

  async stopScheduler() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('🛑 Agent scheduler stopped');
  }

  async runAllAgents() {
    console.log(`🤖 Running ${this.agents.length} agents...`);
    
    for (const agent of this.agents) {
      try {
        await this.runSingleAgent(agent);
      } catch (error) {
        console.error(`❌ Agent ${agent.name} failed:`, error);
        
        // Log error in database
        await prisma.agentSchedule.upsert({
          where: { agentName: agent.name },
          update: { 
            status: 'ERROR',
            errorLog: error instanceof Error ? error.message : 'Unknown error'
          },
          create: {
            agentName: agent.name,
            status: 'ERROR',
            errorLog: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }
  }

  async runSingleAgent(agent: Agent) {
    const startTime = Date.now();
    
    // Update status to RUNNING
    await prisma.agentSchedule.upsert({
      where: { agentName: agent.name },
      update: { status: 'RUNNING' },
      create: {
        agentName: agent.name,
        status: 'RUNNING'
      }
    });

    try {
      // 1. Agent fetches test data
      const testData = await this.fetchTestData();
      
      // 2. Agent makes decision
      const decision = await agent.makeDecision(testData);
      
      // 3. Calculate performance
      const executionTime = Date.now() - startTime;
      const performanceScore = this.calculatePerformanceScore(decision, executionTime);
      
      // 4. Save decision to database
      await prisma.agentDecision.create({
        data: {
          agentName: agent.name,
          inputData: testData,
          decisionMade: decision,
          reasoning: agent.getReasoningSteps().join(' → '),
          performanceScore: performanceScore,
          executionTime: executionTime
        }
      });

      // 5. Update schedule
      await prisma.agentSchedule.update({
        where: { agentName: agent.name },
        data: {
          lastRun: new Date(),
          nextRun: new Date(Date.now() + 10 * 60 * 1000),
          status: 'IDLE',
          errorLog: null
        }
      });

      console.log(`✅ ${agent.name} completed in ${executionTime}ms`);
      
    } catch (error) {
      throw error; // Re-throw to be caught by runAllAgents
    }
  }

  private async fetchTestData() {
    try {
      const response = await fetch('http://localhost:3003/api/agent-test/data');
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to fetch test data:', error);
      return [];
    }
  }

  private calculatePerformanceScore(decision: any, executionTime: number): number {
    // Simple scoring algorithm - customize based on your needs
    let score = 100;
    
    // Penalize slow decisions
    if (executionTime > 5000) score -= 20; // >5 seconds
    else if (executionTime > 2000) score -= 10; // >2 seconds
    
    // Reward decision complexity
    if (decision && typeof decision === 'object') {
      const complexity = Object.keys(decision).length;
      score += Math.min(complexity * 5, 25); // Max +25 for complexity
    }
    
    return Math.max(0, Math.min(100, score));
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      agentCount: this.agents.length,
      nextRun: this.interval ? new Date(Date.now() + 10 * 60 * 1000) : null
    };
  }
}

// Global scheduler instance
export const globalAgentScheduler = new AgentScheduler();
```

---

## 📅 **PLANUL DE IMPLEMENTARE PENTRU MÂINE**

### **Ordinea de Lucru:**

#### **🌅 Dimineața (9:00 - 12:00)**
1. **Database Setup** (30 min)
   - Adaugă schema în `prisma/schema.prisma`
   - Rulează `npx prisma db push`
   - Testează cu `npx prisma studio`

2. **API Endpoints** (1.5 ore)
   - Creează toate 3 API routes
   - Testează cu Postman/Thunder Client
   - Verifică că salvează/extrage datele

#### **🌤️ Prânz (13:00 - 17:00)**
3. **Interface Manual** (2 ore)
   - Dashboard principal (`/agent-test`)
   - Componentele de control vehicule
   - Testează salvarea datelor

4. **Agent Scheduler** (1.5 ore)
   - Implementează sistemul de 10 minute
   - Conectează cu agenții existenți
   - Testează ciclul complet

#### **🌆 Seara (18:00 - 20:00)**
5. **Testing & Integration** (2 ore)
   - Test end-to-end: modifici manual → agenții extrag → iei decizie
   - Debug issues
   - Documentează flow-ul final

---

## 🎯 **SUCCESS CRITERIA**
La final să avem:
- ✅ **Interface** unde modifici manual datele
- ✅ **Agenții** extrag datele la 10 minute
- ✅ **Dashboard** cu deciziile luate
- ✅ **Ciclul complet** funcțional

---

**🚀 Ready to implement tomorrow! Plan complet salvat.** 