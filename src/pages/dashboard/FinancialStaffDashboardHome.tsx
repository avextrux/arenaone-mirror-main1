import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, DollarSign, FileText, Calculator, Building, Users, TrendingUp } from "lucide-react";
import { Profile } from "@/pages/Dashboard";

interface FinancialStaffDashboardHomeProps {
  profile: Profile | null;
}

const FinancialStaffDashboardHome = ({ profile }: FinancialStaffDashboardHomeProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Dashboard do Staff Financeiro
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo, {profile?.full_name || "Staff Financeiro"}! Gerencie as finanças do clube.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Mensal</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ 2.5M</div>
            <p className="text-xs text-muted-foreground">Ver detalhes do orçamento</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Jogadores e Staff</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas (Mês)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ 3.1M</div>
            <p className="text-xs text-muted-foreground">Vendas, patrocínios, etc.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ 2.8M</div>
            <p className="text-xs text-muted-foreground">Salários, manutenção, etc.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Pagamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ 1.2M</div>
            <p className="text-xs text-muted-foreground">Até 05/01/2025</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for more detailed sections */}
      <Card>
        <CardContent className="p-12 text-center">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Gestão Financeira do Clube</h3>
          <p className="text-muted-foreground">
            Aqui você terá uma visão completa das finanças e contratos do clube.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialStaffDashboardHome;