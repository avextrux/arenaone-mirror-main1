import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Trophy, DollarSign, Calendar } from "lucide-react";

const dataGoals = [
  { name: 'Jan', goals: 4000 },
  { name: 'Fev', goals: 3000 },
  { name: 'Mar', goals: 2000 },
  { name: 'Abr', goals: 2780 },
  { name: 'Mai', goals: 1890 },
  { name: 'Jun', goals: 2390 },
  { name: 'Jul', goals: 3490 },
];

const dataPerformance = [
  { name: 'Velocidade', value: 85 },
  { name: 'Resistência', value: 90 },
  { name: 'Força', value: 75 },
  { name: 'Agilidade', value: 88 },
  { name: 'Técnica', value: 92 },
];

const dataMarketValue = [
  { name: '2022', value: 5000000 },
  { name: '2023', value: 7500000 },
  { name: '2024', value: 9000000 },
];

const COLORS = ['#0039FF', '#00C2FF', '#001A73', '#8884d8', '#82ca9d'];

const Stats = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Estatísticas e Análises
          </h1>
          <p className="text-muted-foreground">
            Visão aprofundada sobre performance, mercado e mais
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Gols por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataGoals}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-sm text-muted-foreground" />
                <YAxis className="text-sm text-muted-foreground" />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }} />
                <Legend />
                <Bar dataKey="goals" fill="hsl(var(--primary))" name="Gols" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Performance Física
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {dataPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Evolução do Valor de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dataMarketValue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-sm text-muted-foreground" />
                <YAxis tickFormatter={(value) => `€${value / 1000000}M`} className="text-sm text-muted-foreground" />
                <Tooltip cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" activeDot={{ r: 8 }} name="Valor de Mercado" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum evento agendado para os próximos dias.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats;