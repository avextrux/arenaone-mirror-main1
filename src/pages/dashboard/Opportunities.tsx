import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Briefcase, Search, Filter, MessageCircle, Eye, Plus, Calendar, MapPin, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunity_type: string;
  location?: string;
  salary_range?: string;
  deadline?: string;
  poster_id: string;
  status: string;
  profiles: {
    full_name: string;
    user_type: string;
    avatar_url?: string;
  };
}

const Opportunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myOpportunities, setMyOpportunities] = useState<Opportunity[]>([]);
  const [appliedOpportunities, setAppliedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showCreateOpportunity, setShowCreateOpportunity] = useState(false);

  const [opportunityForm, setOpportunityForm] = useState({
    title: "",
    description: "",
    opportunity_type: "",
    location: "",
    salary_range: "",
    deadline: ""
  });

  useEffect(() => {
    if (user) {
      fetchMyOpportunities();
      fetchAppliedOpportunities();
    }
  }, [user]);

  const fetchMyOpportunities = async () => {
    if (!user) return;
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
        .eq('poster_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching my opportunities:', error);
      toast({
        title: "Erro ao carregar suas oportunidades",
        description: "Não foi possível carregar suas oportunidades publicadas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedOpportunities = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('opportunity_applications')
        .select(`
          opportunities (
            *,
            profiles (
              full_name,
              user_type,
              avatar_url
            )
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppliedOpportunities(data?.map(item => item.opportunities) || []);
    } catch (error) {
      console.error('Error fetching applied opportunities:', error);
      toast({
        title: "Erro ao carregar candidaturas",
        description: "Não foi possível carregar as oportunidades que você se candidatou.",
        variant: "destructive",
      });
    }
  };

  const handleCreateOpportunity = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('opportunities')
        .insert([{
          ...opportunityForm,
          poster_id: user.id,
          status: 'open'
        }]);

      if (error) throw error;

      setShowCreateOpportunity(false);
      setOpportunityForm({
        title: "",
        description: "",
        opportunity_type: "",
        location: "",
        salary_range: "",
        deadline: ""
      });
      
      await fetchMyOpportunities();
      
      toast({
        title: "Oportunidade criada!",
        description: "Sua oportunidade foi publicada com sucesso.",
      });
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast({
        title: "Erro ao criar oportunidade",
        description: "Ocorreu um erro ao publicar a oportunidade.",
        variant: "destructive",
      });
    }
  };

  const getUserTypeColor = (userType: string) => {
    const colors = {
      player: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      club: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      agent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      coach: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      scout: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      journalist: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      fan: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[userType as keyof typeof colors] || colors.fan;
  };

  const getUserTypeLabel = (userType: string) => {
    const labels = {
      player: "Jogador",
      club: "Clube", 
      agent: "Agente",
      coach: "Técnico",
      scout: "Olheiro",
      journalist: "Jornalista",
      fan: "Torcedor"
    };
    return labels[userType as keyof typeof labels] || "Usuário";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredMyOpportunities = myOpportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || opportunity.opportunity_type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredAppliedOpportunities = appliedOpportunities.filter(opportunity => {
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
          <p className="text-muted-foreground">Carregando oportunidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Minhas Oportunidades
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas oportunidades publicadas e candidaturas
          </p>
        </div>
        
        <Dialog open={showCreateOpportunity} onOpenChange={setShowCreateOpportunity}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-hover">
              <Plus className="w-4 h-4 mr-2" />
              Publicar Nova Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Oportunidade</DialogTitle>
              <DialogDescription>
                Publique uma oportunidade para conectar talentos e organizações
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Meio-campo para clube europeu"
                    value={opportunityForm.title}
                    onChange={(e) => setOpportunityForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opportunity_type">Tipo</Label>
                  <Select value={opportunityForm.opportunity_type} onValueChange={(value) => setOpportunityForm(prev => ({ ...prev, opportunity_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer">Transferência</SelectItem>
                      <SelectItem value="loan">Empréstimo</SelectItem>
                      <SelectItem value="trial">Teste/Peneira</SelectItem>
                      <SelectItem value="staff">Vaga Técnica</SelectItem>
                      <SelectItem value="partnership">Parceria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os detalhes da oportunidade..."
                  value={opportunityForm.description}
                  onChange={(e) => setOpportunityForm(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Madrid, Espanha"
                    value={opportunityForm.location}
                    onChange={(e) => setOpportunityForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_range">Faixa Salarial</Label>
                  <Input
                    id="salary_range"
                    placeholder="Ex: €50k - €100k"
                    value={opportunityForm.salary_range}
                    onChange={(e) => setOpportunityForm(prev => ({ ...prev, salary_range: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={opportunityForm.deadline}
                    onChange={(e) => setOpportunityForm(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateOpportunity(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateOpportunity}>
                  Publicar Oportunidade
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou descrição..."
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
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="loan">Empréstimo</SelectItem>
                <SelectItem value="trial">Teste/Peneira</SelectItem>
                <SelectItem value="staff">Vaga Técnica</SelectItem>
                <SelectItem value="partnership">Parceria</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="my-opportunities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-opportunities">Publicadas por Mim</TabsTrigger>
          <TabsTrigger value="applied-opportunities">Candidaturas</TabsTrigger>
        </TabsList>

        <TabsContent value="my-opportunities" className="space-y-4">
          {filteredMyOpportunities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMyOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={opportunity.profiles.avatar_url} />
                          <AvatarFallback>
                            {opportunity.profiles.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-sm">{opportunity.profiles.full_name}</h4>
                          <Badge className={`text-xs ${getUserTypeColor(opportunity.profiles.user_type)}`}>
                            {getUserTypeLabel(opportunity.profiles.user_type)}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {opportunity.opportunity_type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{opportunity.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {opportunity.description}
                    </p>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {opportunity.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {opportunity.location}
                        </div>
                      )}
                      {opportunity.salary_range && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {opportunity.salary_range}
                        </div>
                      )}
                      {opportunity.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Deadline: {formatDate(opportunity.deadline)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ver Candidaturas
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhuma oportunidade publicada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece a publicar oportunidades para encontrar talentos!
                </p>
                <Button onClick={() => setShowCreateOpportunity(true)}>
                  Publicar Oportunidade
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="applied-opportunities" className="space-y-4">
          {filteredAppliedOpportunities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAppliedOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={opportunity.profiles.avatar_url} />
                          <AvatarFallback>
                            {opportunity.profiles.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-sm">{opportunity.profiles.full_name}</h4>
                          <Badge className={`text-xs ${getUserTypeColor(opportunity.profiles.user_type)}`}>
                            {getUserTypeLabel(opportunity.profiles.user_type)}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {opportunity.opportunity_type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{opportunity.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {opportunity.description}
                    </p>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {opportunity.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {opportunity.location}
                        </div>
                      )}
                      {opportunity.salary_range && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {opportunity.salary_range}
                        </div>
                      )}
                      {opportunity.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Deadline: {formatDate(opportunity.deadline)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhuma candidatura encontrada</h3>
                <p className="text-muted-foreground">
                  Explore o mercado para encontrar oportunidades e se candidatar!
                </p>
                <Button onClick={() => { /* Navigate to market page */ }}>
                  Explorar Mercado
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Opportunities;