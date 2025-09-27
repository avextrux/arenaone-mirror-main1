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
import { getUserTypeLabel } from "@/lib/userUtils"; // Importando a função de utilitário

interface ClubInviteSetupProps {
  onComplete: (clubData: any) => Promise<void>;
  userType: string;
}

const ClubInviteSetup = ({ onComplete, userType }: ClubInviteSetupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [inviteCode, setInviteCode] = useState("");
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

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

    setPendingInvites(data || []);
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
          // Also update user_type in profiles if it's not set yet
          // This assumes the invite has a department that maps to a user_type
        })
        .eq('id', inviteId);

      if (error) throw error;

      // Update user's profile with the user_type from the accepted invite
      const acceptedInvite = pendingInvites.find(invite => invite.id === inviteId);
      if (acceptedInvite && user && !user.user_metadata.user_type) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ user_type: acceptedInvite.department as any }) // Assuming department can map to user_type
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
        .update({ status: 'rejected' })
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
      // Check if an invite with this code exists and is pending
      const { data, error } = await supabase
        .from('club_members')
        .select('*')
        .eq('invite_code', inviteCode.trim())
        .eq('status', 'pending')
        .is('user_id', null) // Ensure it's an unassigned invite
        .single();

      if (error || !data) {
        throw new Error("Código de convite inválido ou já utilizado.");
      }

      // Update the invite to link to the current user and set status to accepted
      const { error: updateError } = await supabase
        .from('club_members')
        .update({ 
          user_id: user.id,
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (updateError) throw updateError;

      // Update user's profile with the user_type from the accepted invite
      if (user && !user.user_metadata.user_type) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ user_type: data.department as any }) // Assuming department can map to user_type
          .eq('id', user.id);
        if (profileError) console.error('Error updating user_type in profile:', profileError);
      }

      toast({
        title: "Convite aceito!",
        description: "Você agora faz parte da organização.",
      });

      await onComplete({}); // Trigger re-fetch in Dashboard
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

      const { error } = await supabase
        .from('club_members')
        .insert([{
          club_id: selectedClub,
          user_id: user.id, // User is requesting, so user_id is known
          department: department as any,
          permission_level: 'read', // Default for requests
          status: 'pending',
          invite_code: newInviteCode, // Store the generated code
          invited_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação foi enviada para análise do clube.",
      });

      setStep(1);
      setDepartment("");
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

  const getDepartmentOptions = (userType: string) => {
    const options = {
      medical_staff: [{ value: "medical", label: "Departamento Médico" }],
      financial_staff: [{ value: "financial", label: "Departamento Financeiro" }],
      technical_staff: [{ value: "technical", label: "Comissão Técnica" }],
      scout: [{ value: "scouting", label: "Departamento de Scouting" }],
      coach: [{ value: "technical", label: "Comissão Técnica" }]
    };
    
    return options[userType as keyof typeof options] || [
      { value: "management", label: "Diretoria" },
      { value: "admin", label: "Administração" },
      { value: "medical", label: "Departamento Médico" },
      { value: "scouting", label: "Departamento de Scouting" },
      { value: "technical", label: "Comissão Técnica" },
      { value: "financial", label: "Departamento Financeiro" },
    ];
  };

  const getDepartmentLabel = (dept: string) => {
    const labels = {
      medical: "Médico",
      financial: "Financeiro", 
      technical: "Técnico",
      scouting: "Scouting",
      management: "Diretoria",
      admin: "Admin"
    };
    return labels[dept as keyof typeof labels] || dept;
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

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStep(3)}>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Solicitar Acesso</h3>
                  <p className="text-sm text-muted-foreground">
                    Solicite acesso a um clube específico
                  </p>
                </CardContent>
              </Card>
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
          {step === 3 && (
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
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDepartmentOptions(userType).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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