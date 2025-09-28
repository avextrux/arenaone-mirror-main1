import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs imports
import { TrendingUp, Search, Filter, Trophy, Globe } from "lucide-react"; // Added Globe import
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Import new modular components
import CreateOpportunityDialog from "@/components/dashboard/CreateOpportunityDialog";
import OpportunityCard from "@/components/dashboard/OpportunityCard";
import TransferCard from "@/components/dashboard/TransferCard";
import { AppOpportunity, AppTransfer } from "@/types/app"; // Importar tipos centralizados

// Define types based on Supabase schema
interface Transfer extends AppTransfer {} // Usar AppTransfer
interface Opportunity extends AppOpportunity {} // Usar AppOpportunity

const Market = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("opportunities"); // Default to opportunities
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchTransfers();
    fetchOpportunities();
  }, []);

  const fetchTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching transfers:', error);
        return;
      }

      setTransfers(data as Transfer[] || []); // Cast para Transfer[]
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          profiles (
            full_name,
            user_type,
            avatar_url
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching opportunities:', error);
        return;
      }

      setOpportunities(data as Opportunity[] || []); // Cast para Opportunity[]
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = transfers.filter(transfer =>
    transfer.player_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || opportunity.opportunity_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando mercado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Mercado de Transferências
          </h1>
          <p className="text-muted-foreground">
            Explore oportunidades, transferências e conecte-se com o mercado global
          </p>
        </div>
        
        <CreateOpportunityDialog onOpportunityCreated={fetchOpportunities} />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por jogador, clube ou oportunidade..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="transfer">Transferências</SelectItem>
                <SelectItem value="loan">Empréstimos</SelectItem>
                <SelectItem value="trial">Testes</SelectItem>
                <SelectItem value="staff">Vagas Técnicas</SelectItem>
                <SelectItem value="partnership">Parcerias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="opportunities" value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="transfers">Transferências</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {filteredOpportunities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhuma oportunidade encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Seja o primeiro a publicar uma oportunidade!
                </p>
                <CreateOpportunityDialog onOpportunityCreated={fetchOpportunities} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          {filteredTransfers.length > 0 ? (
            <div className="space-y-3">
              {filteredTransfers.map((transfer) => (
                <TransferCard key={transfer.id} transfer={transfer} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhuma transferência encontrada</h3>
                <p className="text-muted-foreground">
                  As transferências aparecerão aqui conforme são registradas no sistema.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Market;