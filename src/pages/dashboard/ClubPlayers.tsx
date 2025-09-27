import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, User, MapPin, Calendar, Stethoscope, Calculator, FileText, Target, Shield, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  nationality: string;
  position: string;
  date_of_birth: string;
  height: number | null;
  weight: number | null;
  market_value: number | null;
  current_club_id: string | null;
  contract_start: string | null;
  contract_end: string | null;
  preferred_foot: string | null;
}

interface ClubMembership {
  club_id: string;
  department: string;
  permission_level: string;
  clubs: {
    name: string;
  };
}

const ClubPlayers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [clubMemberships, setClubMemberships] = useState<ClubMembership[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const [showFinancialInfo, setShowFinancialInfo] = useState(false);

  // Form states for different types of information
  const [medicalForm, setMedicalForm] = useState({
    blood_type: "",
    allergies: "",
    medical_history: "",
    last_medical_exam: "",
    fitness_level: 5
  });

  const [financialForm, setFinancialForm] = useState({
    salary: "",
    contract_value: "",
    agent_commission: "",
    bonuses: ""
  });

  const [technicalForm, setTechnicalForm] = useState({
    overall_rating: 5,
    technical_skills: "",
    strengths: "",
    weaknesses: "",
    notes: ""
  });

  useEffect(() => {
    if (user) {
      fetchClubMemberships();
    }
  }, [user]);

  useEffect(() => {
    if (clubMemberships.length > 0) {
      fetchPlayers();
    }
  }, [clubMemberships]);

  const fetchClubMemberships = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          club_id,
          department,
          permission_level,
          clubs (name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setClubMemberships(data || []);
    } catch (error) {
      console.error('Error fetching club memberships:', error);
    }
  };

  const fetchPlayers = async () => {
    if (clubMemberships.length === 0) return;

    try {
      const clubIds = clubMemberships.map(m => m.club_id);
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .in('current_club_id', clubIds)
        .order('first_name', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        title: "Erro ao carregar jogadores",
        description: "Não foi possível carregar a lista de jogadores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (department: string, minLevel: string = 'read') => {
    const membership = clubMemberships.find(m => m.department === department);
    if (!membership) return false;

    const levels = { read: 1, write: 2, admin: 3 };
    const userLevel = levels[membership.permission_level as keyof typeof levels] || 0;
    const requiredLevel = levels[minLevel as keyof typeof levels] || 1;

    return userLevel >= requiredLevel;
  };

  const canViewMedical = () => hasPermission('medical');
  const canEditMedical = () => hasPermission('medical', 'write');
  const canViewFinancial = () => hasPermission('financial');
  const canEditFinancial = () => hasPermission('financial', 'write');
  const canViewTechnical = () => hasPermission('technical') || hasPermission('scouting');
  const canEditTechnical = () => hasPermission('technical', 'write') || hasPermission('scouting', 'write');

  const handleSaveMedicalInfo = async () => {
    if (!selectedPlayer || !canEditMedical()) return;

    try {
      const { error } = await supabase
        .from('player_medical_info')
        .upsert({
          player_id: selectedPlayer.id,
          club_id: clubMemberships[0].club_id,
          blood_type: medicalForm.blood_type,
          allergies: medicalForm.allergies.split(',').map(a => a.trim()).filter(Boolean),
          medical_history: medicalForm.medical_history,
          last_medical_exam: medicalForm.last_medical_exam || null,
          fitness_level: medicalForm.fitness_level,
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Informações médicas salvas",
        description: "As informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving medical info:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as informações médicas.",
        variant: "destructive",
      });
    }
  };

  const handleSaveFinancialInfo = async () => {
    if (!selectedPlayer || !canEditFinancial()) return;

    try {
      const { error } = await supabase
        .from('player_financial_info')
        .upsert({
          player_id: selectedPlayer.id,
          club_id: clubMemberships[0].club_id,
          salary: financialForm.salary ? parseInt(financialForm.salary) * 100 : null, // Convert to cents
          contract_value: financialForm.contract_value ? parseInt(financialForm.contract_value) * 100 : null,
          agent_commission: financialForm.agent_commission ? parseFloat(financialForm.agent_commission) : null,
          bonuses: financialForm.bonuses ? { description: financialForm.bonuses } : null,
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Informações financeiras salvas",
        description: "As informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving financial info:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as informações financeiras.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTechnicalInfo = async () => {
    if (!selectedPlayer || !canEditTechnical()) return;

    try {
      const { error } = await supabase
        .from('player_technical_reports')
        .insert({
          player_id: selectedPlayer.id,
          club_id: clubMemberships[0].club_id,
          scout_id: user?.id,
          overall_rating: technicalForm.overall_rating,
          technical_skills: { description: technicalForm.technical_skills },
          strengths: technicalForm.strengths.split(',').map(s => s.trim()).filter(Boolean),
          weaknesses: technicalForm.weaknesses.split(',').map(w => w.trim()).filter(Boolean),
          detailed_notes: technicalForm.notes,
          recommendation: 'monitor'
        });

      if (error) throw error;

      toast({
        title: "Relatório técnico salvo",
        description: "O relatório foi criado com sucesso.",
      });

      // Reset form
      setTechnicalForm({
        overall_rating: 5,
        technical_skills: "",
        strengths: "",
        weaknesses: "",
        notes: ""
      });
    } catch (error) {
      console.error('Error saving technical info:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o relatório técnico.",
        variant: "destructive",
      });
    }
  };

  const filteredPlayers = players.filter(player => 
    `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPositionColor = (position: string) => {
    const colors = {
      'Goleiro': 'bg-yellow-100 text-yellow-800',
      'Zagueiro': 'bg-blue-100 text-blue-800',
      'Lateral': 'bg-green-100 text-green-800',
      'Volante': 'bg-purple-100 text-purple-800',
      'Meio-campo': 'bg-orange-100 text-orange-800',
      'Atacante': 'bg-red-100 text-red-800'
    };
    return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando jogadores...</p>
        </div>
      </div>
    );
  }

  if (clubMemberships.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground">
            Você precisa estar vinculado a um clube para acessar informações de jogadores.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Jogadores do Clube
          </h1>
          <p className="text-muted-foreground">
            Gerencie informações dos jogadores - {clubMemberships[0]?.clubs.name}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Jogador
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar jogadores por nome, nacionalidade ou posição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Players Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <Badge className={getPositionColor(player.position)}>
                  {player.position}
                </Badge>
              </div>
              <CardTitle className="text-lg font-heading">
                {player.first_name} {player.last_name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                {player.nationality}
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                {calculateAge(player.date_of_birth)} anos
              </div>

              {player.height && player.weight && (
                <div className="text-sm text-muted-foreground">
                  {player.height}cm • {player.weight}kg
                </div>
              )}

              {player.market_value && (
                <div className="text-sm font-semibold text-primary">
                  Valor: {formatCurrency(player.market_value)}
                </div>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    onClick={() => setSelectedPlayer(player)}
                  >
                    Ver Detalhes
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {player.first_name} {player.last_name}
                    </DialogTitle>
                    <DialogDescription>
                      Informações completas do jogador
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Básico</TabsTrigger>
                      <TabsTrigger value="medical" disabled={!canViewMedical()}>
                        <Stethoscope className="w-4 h-4 mr-1" />
                        Médico
                      </TabsTrigger>
                      <TabsTrigger value="financial" disabled={!canViewFinancial()}>
                        <Calculator className="w-4 h-4 mr-1" />
                        Financeiro
                      </TabsTrigger>
                      <TabsTrigger value="technical" disabled={!canViewTechnical()}>
                        <Target className="w-4 h-4 mr-1" />
                        Técnico
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nome Completo</Label>
                          <p className="text-sm text-muted-foreground">{player.first_name} {player.last_name}</p>
                        </div>
                        <div>
                          <Label>Posição</Label>
                          <Badge className={getPositionColor(player.position)}>
                            {player.position}
                          </Badge>
                        </div>
                        <div>
                          <Label>Nacionalidade</Label>
                          <p className="text-sm text-muted-foreground">{player.nationality}</p>
                        </div>
                        <div>
                          <Label>Idade</Label>
                          <p className="text-sm text-muted-foreground">{calculateAge(player.date_of_birth)} anos</p>
                        </div>
                        {player.height && (
                          <div>
                            <Label>Altura</Label>
                            <p className="text-sm text-muted-foreground">{player.height} cm</p>
                          </div>
                        )}
                        {player.weight && (
                          <div>
                            <Label>Peso</Label>
                            <p className="text-sm text-muted-foreground">{player.weight} kg</p>
                          </div>
                        )}
                        {player.preferred_foot && (
                          <div>
                            <Label>Pé Preferido</Label>
                            <p className="text-sm text-muted-foreground">{player.preferred_foot}</p>
                          </div>
                        )}
                        {player.market_value && (
                          <div>
                            <Label>Valor de Mercado</Label>
                            <p className="text-sm font-semibold text-primary">{formatCurrency(player.market_value)}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="medical" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          Informações Médicas
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMedicalInfo(!showMedicalInfo)}
                          >
                            {showMedicalInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          {canEditMedical() && (
                            <Button size="sm" onClick={handleSaveMedicalInfo}>
                              Salvar
                            </Button>
                          )}
                        </div>
                      </div>

                      {showMedicalInfo && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tipo Sanguíneo</Label>
                            <Select 
                              value={medicalForm.blood_type} 
                              onValueChange={(value) => setMedicalForm(prev => ({ ...prev, blood_type: value }))}
                              disabled={!canEditMedical()}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Último Exame Médico</Label>
                            <Input
                              type="date"
                              value={medicalForm.last_medical_exam}
                              onChange={(e) => setMedicalForm(prev => ({ ...prev, last_medical_exam: e.target.value }))}
                              disabled={!canEditMedical()}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Alergias</Label>
                            <Input
                              placeholder="Separar por vírgulas"
                              value={medicalForm.allergies}
                              onChange={(e) => setMedicalForm(prev => ({ ...prev, allergies: e.target.value }))}
                              disabled={!canEditMedical()}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Nível de Condicionamento (1-10)</Label>
                            <Select 
                              value={medicalForm.fitness_level.toString()} 
                              onValueChange={(value) => setMedicalForm(prev => ({ ...prev, fitness_level: parseInt(value) }))}
                              disabled={!canEditMedical()}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(10)].map((_, i) => (
                                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <Label>Histórico Médico</Label>
                            <Textarea
                              placeholder="Histórico de lesões, cirurgias, etc..."
                              value={medicalForm.medical_history}
                              onChange={(e) => setMedicalForm(prev => ({ ...prev, medical_history: e.target.value }))}
                              disabled={!canEditMedical()}
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      )}

                      {!showMedicalInfo && (
                        <div className="text-center py-8">
                          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Informações médicas protegidas</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Calculator className="w-4 h-4" />
                          Informações Financeiras
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFinancialInfo(!showFinancialInfo)}
                          >
                            {showFinancialInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          {canEditFinancial() && (
                            <Button size="sm" onClick={handleSaveFinancialInfo}>
                              Salvar
                            </Button>
                          )}
                        </div>
                      </div>

                      {showFinancialInfo && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Salário Mensal (€)</Label>
                            <Input
                              type="number"
                              placeholder="50000"
                              value={financialForm.salary}
                              onChange={(e) => setFinancialForm(prev => ({ ...prev, salary: e.target.value }))}
                              disabled={!canEditFinancial()}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Valor do Contrato (€)</Label>
                            <Input
                              type="number"
                              placeholder="5000000"
                              value={financialForm.contract_value}
                              onChange={(e) => setFinancialForm(prev => ({ ...prev, contract_value: e.target.value }))}
                              disabled={!canEditFinancial()}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Comissão do Agente (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="10.0"
                              value={financialForm.agent_commission}
                              onChange={(e) => setFinancialForm(prev => ({ ...prev, agent_commission: e.target.value }))}
                              disabled={!canEditFinancial()}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Bônus e Premiações</Label>
                            <Input
                              placeholder="Descrição dos bônus"
                              value={financialForm.bonuses}
                              onChange={(e) => setFinancialForm(prev => ({ ...prev, bonuses: e.target.value }))}
                              disabled={!canEditFinancial()}
                            />
                          </div>
                        </div>
                      )}

                      {!showFinancialInfo && (
                        <div className="text-center py-8">
                          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Informações financeiras protegidas</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="technical" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Avaliação Técnica
                        </h3>
                        {canEditTechnical() && (
                          <Button size="sm" onClick={handleSaveTechnicalInfo}>
                            Salvar Relatório
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Avaliação Geral (1-10)</Label>
                          <Select 
                            value={technicalForm.overall_rating.toString()} 
                            onValueChange={(value) => setTechnicalForm(prev => ({ ...prev, overall_rating: parseInt(value) }))}
                            disabled={!canEditTechnical()}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[...Array(10)].map((_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Habilidades Técnicas</Label>
                          <Input
                            placeholder="Descrição das habilidades"
                            value={technicalForm.technical_skills}
                            onChange={(e) => setTechnicalForm(prev => ({ ...prev, technical_skills: e.target.value }))}
                            disabled={!canEditTechnical()}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Pontos Fortes</Label>
                          <Input
                            placeholder="Separar por vírgulas"
                            value={technicalForm.strengths}
                            onChange={(e) => setTechnicalForm(prev => ({ ...prev, strengths: e.target.value }))}
                            disabled={!canEditTechnical()}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Pontos a Melhorar</Label>
                          <Input
                            placeholder="Separar por vírgulas"
                            value={technicalForm.weaknesses}
                            onChange={(e) => setTechnicalForm(prev => ({ ...prev, weaknesses: e.target.value }))}
                            disabled={!canEditTechnical()}
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <Label>Observações</Label>
                          <Textarea
                            placeholder="Observações detalhadas sobre o jogador..."
                            value={technicalForm.notes}
                            onChange={(e) => setTechnicalForm(prev => ({ ...prev, notes: e.target.value }))}
                            disabled={!canEditTechnical()}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {searchTerm ? "Nenhum jogador encontrado" : "Nenhum jogador cadastrado"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Tente alterar os termos de busca." 
                : "Comece adicionando jogadores ao clube."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClubPlayers;