import { useEffect, useState, useCallback } from "react";
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
import { Search, Plus, User, MapPin, Calendar, Stethoscope, Calculator, FileText, Target, Shield, Eye, EyeOff, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ClubDepartment, PermissionLevel } from "@/integrations/supabase/types"; // Import types
import { ClubMembership as DashboardClubMembership } from "@/pages/Dashboard"; // Import ClubMembership from Dashboard

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

interface PlayerMedicalInfo {
  id?: string;
  blood_type: string | null;
  allergies: string[] | null;
  medical_history: string | null;
  last_medical_exam: string | null;
  fitness_level: number | null;
}

interface PlayerFinancialInfo {
  id?: string;
  salary: number | null;
  contract_value: number | null;
  agent_commission: number | null;
  bonuses: any | null; // JSON type
}

interface PlayerTechnicalReport {
  id?: string;
  overall_rating: number | null;
  technical_skills: any | null; // JSON type
  strengths: string[] | null;
  weaknesses: string[] | null;
  detailed_notes: string | null;
}

interface ClubPlayersProps {
  clubMemberships: DashboardClubMembership[]; // Use the imported type
}

const ClubPlayers = ({ clubMemberships }: ClubPlayersProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);

  // Form states for different types of information
  const [medicalForm, setMedicalForm] = useState<PlayerMedicalInfo>({
    blood_type: "",
    allergies: [],
    medical_history: "",
    last_medical_exam: "",
    fitness_level: 5
  });

  const [financialForm, setFinancialForm] = useState<PlayerFinancialInfo>({
    salary: null,
    contract_value: null,
    agent_commission: null,
    bonuses: null
  });

  const [technicalForm, setTechnicalForm] = useState<PlayerTechnicalReport>({
    overall_rating: 5,
    technical_skills: null,
    strengths: [],
    weaknesses: [],
    detailed_notes: ""
  });

  useEffect(() => {
    if (clubMemberships.length > 0) {
      fetchPlayers();
    } else {
      setPlayers([]); // Clear players if no club membership
      setLoading(false);
    }
  }, [clubMemberships]); // Depend on clubMemberships prop

  useEffect(() => {
    if (selectedPlayer) {
      fetchPlayerDetails(selectedPlayer.id);
    } else {
      // Reset forms when no player is selected or dialog closes
      resetForms();
    }
  }, [selectedPlayer]);

  const resetForms = () => {
    setMedicalForm({
      blood_type: "",
      allergies: [],
      medical_history: "",
      last_medical_exam: "",
      fitness_level: 5
    });
    setFinancialForm({
      salary: null,
      contract_value: null,
      agent_commission: null,
      bonuses: null
    });
    setTechnicalForm({
      overall_rating: 5,
      technical_skills: null,
      strengths: [],
      weaknesses: [],
      detailed_notes: ""
    });
  };

  const fetchPlayers = async () => {
    if (clubMemberships.length === 0) {
      setPlayers([]);
      setLoading(false);
      return;
    }

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

  const fetchPlayerDetails = async (playerId: string) => {
    if (!user) return;

    // Fetch Medical Info
    if (canViewMedical()) {
      const { data: medicalData, error: medicalError } = await supabase
        .from('player_medical_info')
        .select('*')
        .eq('player_id', playerId)
        .single();
      if (medicalError && medicalError.code !== 'PGRST116') console.error('Error fetching medical info:', medicalError); // PGRST116 means no rows found
      if (medicalData) {
        setMedicalForm({
          id: medicalData.id,
          blood_type: medicalData.blood_type,
          allergies: medicalData.allergies || [],
          medical_history: medicalData.medical_history,
          last_medical_exam: medicalData.last_medical_exam,
          fitness_level: medicalData.fitness_level || 5
        });
      } else {
        setMedicalForm(prev => ({ ...prev, id: undefined })); // Reset ID if no data
      }
    }

    // Fetch Financial Info
    if (canViewFinancial()) {
      const { data: financialData, error: financialError } = await supabase
        .from('player_financial_info')
        .select('*')
        .eq('player_id', playerId)
        .single();
      if (financialError && financialError.code !== 'PGRST116') console.error('Error fetching financial info:', financialError);
      if (financialData) {
        setFinancialForm({
          id: financialData.id,
          salary: financialData.salary,
          contract_value: financialData.contract_value,
          agent_commission: financialData.agent_commission,
          bonuses: financialData.bonuses
        });
      } else {
        setFinancialForm(prev => ({ ...prev, id: undefined })); // Reset ID if no data
      }
    }

    // Fetch Technical Reports (latest one)
    if (canViewTechnical()) {
      const { data: technicalData, error: technicalError } = await supabase
        .from('player_technical_reports')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (technicalError && technicalError.code !== 'PGRST116') console.error('Error fetching technical report:', technicalError);
      if (technicalData) {
        setTechnicalForm({
          id: technicalData.id,
          overall_rating: technicalData.overall_rating || 5,
          technical_skills: technicalData.technical_skills,
          strengths: technicalData.strengths || [],
          weaknesses: technicalData.weaknesses || [],
          detailed_notes: technicalData.detailed_notes || ""
        });
      } else {
        setTechnicalForm(prev => ({ ...prev, id: undefined })); // Reset ID if no data
      }
    }
  };

  const hasPermission = (department: ClubDepartment, minLevel: PermissionLevel = 'read') => {
    const membership = clubMemberships.find(m => m.department === department);
    if (!membership) return false;

    const levels: Record<PermissionLevel, number> = { read: 1, write: 2, admin: 3 };
    const userLevel = levels[membership.permission_level] || 0;
    const requiredLevel = levels[minLevel] || 1;

    return userLevel >= requiredLevel;
  };

  const canViewMedical = () => hasPermission('medical');
  const canEditMedical = () => hasPermission('medical', 'write');
  const canViewFinancial = () => hasPermission('financial');
  const canEditFinancial = () => hasPermission('financial', 'write');
  const canViewTechnical = () => hasPermission('technical') || hasPermission('scouting');
  const canEditTechnical = () => hasPermission('technical', 'write') || hasPermission('scouting', 'write');

  const handleSaveMedicalInfo = async () => {
    if (!selectedPlayer || !canEditMedical() || clubMemberships.length === 0) return;

    setIsSaving(true);
    try {
      const payload = {
        player_id: selectedPlayer.id,
        club_id: clubMemberships[0].club_id,
        blood_type: medicalForm.blood_type,
        allergies: medicalForm.allergies,
        medical_history: medicalForm.medical_history,
        last_medical_exam: medicalForm.last_medical_exam || null,
        fitness_level: medicalForm.fitness_level,
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('player_medical_info')
        .upsert(medicalForm.id ? { ...payload, id: medicalForm.id } : payload, { onConflict: 'player_id' });

      if (error) throw error;

      toast({
        title: "Informações médicas salvas",
        description: "As informações foram atualizadas com sucesso.",
      });
      fetchPlayerDetails(selectedPlayer.id); // Re-fetch to update ID if it was an insert
    } catch (error) {
      console.error('Error saving medical info:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as informações médicas.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFinancialInfo = async () => {
    if (!selectedPlayer || !canEditFinancial() || clubMemberships.length === 0) return;

    setIsSaving(true);
    try {
      const payload = {
        player_id: selectedPlayer.id,
        club_id: clubMemberships[0].club_id,
        salary: financialForm.salary,
        contract_value: financialForm.contract_value,
        agent_commission: financialForm.agent_commission,
        bonuses: financialForm.bonuses,
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('player_financial_info')
        .upsert(financialForm.id ? { ...payload, id: financialForm.id } : payload, { onConflict: 'player_id' });

      if (error) throw error;

      toast({
        title: "Informações financeiras salvas",
        description: "As informações foram atualizadas com sucesso.",
      });
      fetchPlayerDetails(selectedPlayer.id); // Re-fetch to update ID if it was an insert
    } catch (error) {
      console.error('Error saving financial info:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as informações financeiras.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTechnicalInfo = async () => {
    if (!selectedPlayer || !canEditTechnical() || clubMemberships.length === 0) return;

    setIsSaving(true);
    try {
      const payload = {
        player_id: selectedPlayer.id,
        club_id: clubMemberships[0].club_id,
        scout_id: user?.id, // Assuming the current user is the scout/evaluator
        overall_rating: technicalForm.overall_rating,
        technical_skills: technicalForm.technical_skills,
        strengths: technicalForm.strengths,
        weaknesses: technicalForm.weaknesses,
        detailed_notes: technicalForm.detailed_notes,
        recommendation: 'monitor', // Default recommendation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // For technical reports, we usually insert a new one rather than upserting an existing one,
      // as each report is a new evaluation.
      const { error } = await supabase
        .from('player_technical_reports')
        .insert([payload]);

      if (error) throw error;

      toast({
        title: "Relatório técnico salvo",
        description: "O relatório foi criado com sucesso.",
      });

      // Reset form for new report
      setTechnicalForm({
        overall_rating: 5,
        technical_skills: null,
        strengths: [],
        weaknesses: [],
        detailed_notes: ""
      });
      fetchPlayerDetails(selectedPlayer.id); // Re-fetch to show the new report if needed
    } catch (error) {
      console.error('Error saving technical info:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o relatório técnico.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
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

              <Dialog onOpenChange={(open) => !open && setSelectedPlayer(null)}>
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
                      {selectedPlayer?.first_name} {selectedPlayer?.last_name}
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
                          <p className="text-sm text-muted-foreground">{selectedPlayer?.first_name} {selectedPlayer?.last_name}</p>
                        </div>
                        <div>
                          <Label>Posição</Label>
                          <Badge className={getPositionColor(selectedPlayer?.position || '')}>
                            {selectedPlayer?.position}
                          </Badge>
                        </div>
                        <div>
                          <Label>Nacionalidade</Label>
                          <p className="text-sm text-muted-foreground">{selectedPlayer?.nationality}</p>
                        </div>
                        <div>
                          <Label>Idade</Label>
                          <p className="text-sm text-muted-foreground">{calculateAge(selectedPlayer?.date_of_birth || '')} anos</p>
                        </div>
                        {selectedPlayer?.height && (
                          <div>
                            <Label>Altura</Label>
                            <p className="text-sm text-muted-foreground">{selectedPlayer?.height} cm</p>
                          </div>
                        )}
                        {selectedPlayer?.weight && (
                          <div>
                            <Label>Peso</Label>
                            <p className="text-sm text-muted-foreground">{selectedPlayer?.weight} kg</p>
                          </div>
                        )}
                        {selectedPlayer?.preferred_foot && (
                          <div>
                            <Label>Pé Preferido</Label>
                            <p className="text-sm text-muted-foreground">{selectedPlayer?.preferred_foot}</p>
                          </div>
                        )}
                        {selectedPlayer?.market_value && (
                          <div>
                            <Label>Valor de Mercado</Label>
                            <p className="text-sm font-semibold text-primary">{formatCurrency(selectedPlayer?.market_value)}</p>
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
                          {canEditMedical() && (
                            <Button size="sm" onClick={handleSaveMedicalInfo} disabled={isSaving}>
                              {isSaving ? "Salvando..." : "Salvar"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {canViewMedical() ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tipo Sanguíneo</Label>
                            <Select 
                              value={medicalForm.blood_type || ""} 
                              onValueChange={(value) => setMedicalForm(prev => ({ ...prev, blood_type: value }))}
                              disabled={!canEditMedical() || isSaving}
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
                              value={medicalForm.last_medical_exam || ""}
                              onChange={(e) => setMedicalForm(prev => ({ ...prev, last_medical_exam: e.target.value }))}
                              disabled={!canEditMedical() || isSaving}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Alergias</Label>
                            <Input
                              placeholder="Separar por vírgulas"
                              value={medicalForm.allergies?.join(', ') || ""}
                              onChange={(e) => setMedicalForm(prev => ({ ...prev, allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean) }))}
                              disabled={!canEditMedical() || isSaving}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Nível de Condicionamento (1-10)</Label>
                            <Select 
                              value={medicalForm.fitness_level?.toString() || "5"} 
                              onValueChange={(value) => setMedicalForm(prev => ({ ...prev, fitness_level: parseInt(value) }))}
                              disabled={!canEditMedical() || isSaving}
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
                              value={medicalForm.medical_history || ""}
                              onChange={(e) => setMedicalForm(prev => ({ ...prev, medical_history: e.target.value }))}
                              disabled={!canEditMedical() || isSaving}
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Você não tem permissão para visualizar informações médicas.</p>
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
                          {canEditFinancial() && (
                            <Button size="sm" onClick={handleSaveFinancialInfo} disabled={isSaving}>
                              {isSaving ? "Salvando..." : "Salvar"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {canViewFinancial() ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Salário Mensal (€)</Label>
                            <Input
                              type="number"
                              placeholder="50000"
                              value={financialForm.salary !== null ? financialForm.salary.toString() : ""}
                              onChange={(e) => setFinancialForm(prev => ({ ...prev, salary: e.target.value ? parseInt(e.target.value) : null }))}
                              disabled={!canEditFinancial() || isSaving}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Valor do Contrato (€)</Label>
                            <Input
                              type="number"
                              placeholder="5000000"
                              value={financialForm.contract_value !== null ? financialForm.contract_value.toString() : ""}
                              onChange={(e) => setFinancialForm(prev => ({ ...prev, contract_value: e.target.value ? parseInt(e.target.value) : null }))}
                              disabled={!canEditFinancial() || isSaving}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Comissão do Agente (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="10.0"
                              value={financialForm.agent_commission !== null ? financialForm.agent_commission.toString() : ""}
                              onChange={(e) => setFinancialForm(prev => ({ ...prev, agent_commission: e.target.value ? parseFloat(e.target.value) : null }))}
                              disabled={!canEditFinancial() || isSaving}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Bônus e Premiações</Label>
                            <Input
                              placeholder="Descrição dos bônus"
                              value={financialForm.bonuses?.description || ""}
                              onChange={(e) => setFinancialForm(prev => ({ ...prev, bonuses: { description: e.target.value } }))}
                              disabled={!canEditFinancial() || isSaving}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Você não tem permissão para visualizar informações financeiras.</p>
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
                          <Button size="sm" onClick={handleSaveTechnicalInfo} disabled={isSaving}>
                            {isSaving ? "Salvando..." : "Salvar Relatório"}
                          </Button>
                        )}
                      </div>

                      {canViewTechnical() ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Avaliação Geral (1-10)</Label>
                            <Select 
                              value={technicalForm.overall_rating?.toString() || "5"} 
                              onValueChange={(value) => setTechnicalForm(prev => ({ ...prev, overall_rating: parseInt(value) }))}
                              disabled={!canEditTechnical() || isSaving}
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
                              value={technicalForm.technical_skills?.description || ""}
                              onChange={(e) => setTechnicalForm(prev => ({ ...prev, technical_skills: { description: e.target.value } }))}
                              disabled={!canEditTechnical() || isSaving}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Pontos Fortes</Label>
                            <Input
                              placeholder="Separar por vírgulas"
                              value={technicalForm.strengths?.join(', ') || ""}
                              onChange={(e) => setTechnicalForm(prev => ({ ...prev, strengths: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                              disabled={!canEditTechnical() || isSaving}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Pontos a Melhorar</Label>
                            <Input
                              placeholder="Separar por vírgulas"
                              value={technicalForm.weaknesses?.join(', ') || ""}
                              onChange={(e) => setTechnicalForm(prev => ({ ...prev, weaknesses: e.target.value.split(',').map(w => w.trim()).filter(Boolean) }))}
                              disabled={!canEditTechnical() || isSaving}
                            />
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <Label>Observações</Label>
                            <Textarea
                              placeholder="Observações detalhadas sobre o jogador..."
                              value={technicalForm.detailed_notes || ""}
                              onChange={(e) => setTechnicalForm(prev => ({ ...prev, detailed_notes: e.target.value }))}
                              disabled={!canEditTechnical() || isSaving}
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Você não tem permissão para visualizar relatórios técnicos.</p>
                        </div>
                      )}
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