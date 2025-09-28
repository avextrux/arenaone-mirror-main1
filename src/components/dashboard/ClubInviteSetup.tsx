import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building, Mail, Users, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; // For generating invite codes
import { getUserTypeLabel, getDepartmentLabel, mapDepartmentToUserType } from "@/lib/userUtils"; // Importando a função de utilitário e mapDepartmentToUserType
import { AppClubMembership } from "@/types/app"; // Importar AppClubMembership
import { ClubDepartment, PermissionLevel, Constants, TablesInsert, UserType } from "@/integrations/supabase/types"; // Importar Constants e TablesInsert

interface ClubInviteSetupProps {
  onComplete: (clubData: any) => Promise<void>;
  userType: UserType; // Alterado para UserType
}

const ClubInviteSetup = ({ onComplete, userType }: ClubInviteSetupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [inviteCode, setInviteCode] = useState("");
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [department, setDepartment] = useState<ClubDepartment>(ClubDepartment.Technical); // Usar enum
  const [loading, setLoading] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<AppClubMembership[]>([]); // Usar AppClubMembership

  const isPlayerOrAgent = userType === UserType.Player || userType === UserType.Agent;

  useEffect(() => {
    fetchClubs();
    fetchPendingInvites();
  }, [user]);

  const fetchClubs = async () => {
    const { data } = await supabase
      .from('clubs')
      .select('*')
      .order('name');
    
    setClubs(data || []);
  };

  const fetchPendingInvites = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('club_members')
      .select(`
        *,
        clubs (name, logo_url)
      `)
      .eq('user_id', user.id)
      .eq('status', 'pending');

    setPendingInvites(data as AppClubMembership[] || []); // Cast para AppClubMembership[]
  };

  const handleAcceptInvite = async (inviteId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('club_members')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          user_id: user?.id, // Ensure user_id is set if it was null initially
          used: true, // Mark as used
        })
        .eq('id', inviteId);

      if (error) throw error;

      // Update user's profile with the user_type from the accepted invite
      const acceptedInvite = pendingInvites.find(invite => invite.id === inviteId);
      if (acceptedInvite && user) { // Removed !user.user_metadata.user_type check as it's handled by onboarding flow
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ user_type: mapDepartmentToUserType(acceptedInvite.department) }) // Usando mapDepartmentToUserType
          .eq('id', user.id);
        if (profileError) console.error('Error updating user_type in profile:', profileError);
      }

      toast({
        title: "Convite aceito!",
        description: "Você agora faz parte da organização.",
      });

      await onComplete({}); // Trigger re-fetch in Dashboard
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o convite.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('club_members')
        .update({ status: 'rejected', used: true }) // Mark as rejected and used
        .eq('id', inviteId);

      if (error) throw error;

      await fetchPendingInvites();
      
      toast({
        title: "Convite rejeitado",
        description: "O convite foi rejeitado.",
      });
    } catch (error) {
      console.error('Error rejecting invite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('club_members')
        .select('*')
        .eq('invite_code', inviteCode.trim())
        .eq('status', 'pending')
        .is('user_id', null)
        .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
        .eq('used', false)
        .single();

      if (error || !data) {
        throw new Error("Código de convite inválido, expirado ou já utilizado.");
      }

      const { error: updateError } = await supabase
        .from('club_members')
        .update({ 
          user_id: user.id,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          used: true,
        })
        .eq('id', data.id);

      if (updateError) throw updateError;

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ user_type: mapDepartmentToUserType(data.department) })
          .eq('id', user.id);
        if (profileError) console.error('Error updating user_type in profile:', profileError);
      }

      toast({
        title: "Convite aceito!",
        description: "Você agora faz parte da organização.",
      });

      await onComplete({});
    } catch (error: any) {
      console.error('Error joining with code:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível ingressar com o código.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!selectedClub || !department || !user) return;

    setLoading(true);
    try {
      // Generate a unique invite code for this request
      const newInviteCode = uuidv4();

      const payload: TablesInsert<'club_members'> = {
        club_id: selectedClub,
        user_id: user.id, // User is requesting, so user_id is known
        department: department,
        permission_level: PermissionLevel.Read, // Default for requests
        status: 'pending',
        invite_code: newInviteCode, // Store the generated code
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        expires_at: null, // No expiration for requests, admin will handle
        used: false,
      };

      const { error } = await supabase
        .from('club_members')
        .insert([payload]); // Pass as an array of one object

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação foi enviada para análise do clube.",
      });

      setStep(1);
      setDepartment(ClubDepartment.Management); // Reset to default enum value
      setSelectedClub("");
      await fetchPendingInvites();
    } catch (error) {
      console.error('Error requesting access:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentOptions = (userType: UserType) => {
    const options: Record<UserType, { value: ClubDepartment; label: string }[]> = {
      [UserType.MedicalStaff]: [{ value: ClubDepartment.Medical, label: "Departamento Médico" }],
      [UserType.FinancialStaff]: [{ value: ClubDepartment.Financial, label: "Departamento Financeiro" }],
      [UserType.TechnicalStaff]: [{ value: ClubDepartment.Technical, label: "Comissão Técnica" }],
      [UserType.Scout]: [{ value: ClubDepartment.Scouting, label: "Departamento de Scouting" }],
      [UserType.Coach]: [{ value: ClubDepartment.Technical, label: "Comissão Técnica" }],
      [UserType.Player]: [], // Players don't have a specific department in this context
      [UserType.Agent]: [], // Agents don't have a specific department in this context
      [UserType.Journalist]: [],
      [UserType.Fan]: [],
      [UserType.Admin]: [],
      [UserType.Club]: [],
    };
    
    return options[userType] || [
      { value: ClubDepartment.Management, label: "Diretoria" },
      { value: ClubDepartment.Admin, label: "Administração" },
      { value: ClubDepartment.Medical, label: "Departamento Médico" },
      { value: ClubDepartment.Scouting, label: "Departamento de Scouting" },
      { value: ClubDepartment.Technical, label: "Comissão Técnica" },
      { value: ClubDepartment.Financial, label: "Departamento Financeiro" },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading">Acesso ao Clube</CardTitle>
          <CardDescription>
            Para acessar informações de jogadores, você precisa estar vinculado a um clube
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Convites Pendentes
              </h3>
              {pendingInvites.map((invite) => (
                <Card key={invite.id} className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{invite.clubs.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getDepartmentLabel(invite.department)} • {invite.permission_level}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRejectInvite(invite.id)}
                          disabled={loading}
                        >
                          Rejeitar
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptInvite(invite.id)}
                          disabled={loading}
                        >
                          Aceitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Join Options */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStep(2)}>
                <CardContent className="p-6 text-center">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Código de Convite</h3>
                  <p className="text-sm text-muted-foreground">
                    Use um código fornecido pelo clube
                  </p>
                </CardContent>
              </Card>

              {!isPlayerOrAgent && ( // Hide "Solicitar Acesso" for Player/Agent
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStep(3)}>
                  <CardContent className="p-6 text-center">
                    <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Solicitar Acesso</h3>
                    <p className="text-sm text-muted-foreground">
                      Solicite acesso a um clube específico
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Step 2: Invite Code */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  ←
                </Button>
                <h3 className="font-semibold">Código de Convite</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Código do Convite</Label>
                <Input
                  id="inviteCode"
                  placeholder="Digite o código fornecido pelo clube"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <Button 
                onClick={handleJoinWithCode}
                disabled={!inviteCode.trim() || loading}
                className="w-full"
              >
                {loading ? "Verificando..." : "Ingressar no Clube"}
              </Button>
            </div>
          )}

          {/* Step 3: Request Access */}
          {step === 3 && !isPlayerOrAgent && ( // Hide "Request Access" for Player/Agent
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  ←
                </Button>
                <h3 className="font-semibold">Solicitar Acesso</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="club">Clube</Label>
                  <Select value={selectedClub} onValueChange={setSelectedClub}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um clube" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select value={department} onValueChange={(value) => setDepartment(value as ClubDepartment)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDepartmentOptions(userType).map((deptOption) => (
                        <SelectItem key={deptOption.value} value={deptOption.value}>
                          {deptOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleRequestAccess}
                disabled={!selectedClub || !department || loading}
                className="w-full"
              >
                {loading ? "Enviando..." : "Solicitar Acesso"}
              </Button>
            </div>
          )}

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Informação Importante</p>
                  <p className="text-blue-700">
                    Como {getUserTypeLabel(userType)}, você precisa estar vinculado a um clube para acessar 
                    informações de jogadores e utilizar todas as funcionalidades da plataforma.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubInviteSetup;