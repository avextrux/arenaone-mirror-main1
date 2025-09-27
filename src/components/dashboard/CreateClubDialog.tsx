import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Flag, Calendar, Globe, Upload, FileText, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names

interface CreateClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClubCreated: () => void;
}

const CreateClubDialog = ({ open, onOpenChange, onClubCreated }: CreateClubDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: "",
    country: "",
    founded_year: "",
    league: "",
    stadium: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem (JPG, PNG, GIF, SVG, WEBP) ou um arquivo PDF.",
          variant: "destructive",
        });
        setLogoFile(null);
        setLogoPreview(null);
        return;
      }

      setLogoFile(file);
      if (file.type.startsWith('image/')) {
        setLogoPreview(URL.createObjectURL(file));
      } else {
        setLogoPreview(null); // No preview for PDF, just show file icon
      }
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const uploadLogo = async (file: File) => {
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para fazer upload de arquivos.",
        variant: "destructive",
      });
      throw new Error("Usuário não autenticado.");
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `club_logos/${user.id}/${fileName}`; // Store under user's ID

    console.log("Attempting to upload file:", filePath);

    const { data, error } = await supabase.storage
      .from('club-logos') // Ensure you have a bucket named 'club-logos' in Supabase
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage Upload Error:", error);
      toast({
        title: "Erro no Upload da Logo",
        description: `Não foi possível fazer upload da logo: ${error.message}. Verifique as políticas de RLS do seu bucket 'club-logos'.`,
        variant: "destructive",
      });
      throw new Error(`Erro ao fazer upload da logo: ${error.message}`);
    }

    console.log("Upload successful, data:", data);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('club-logos')
      .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
      console.error("Supabase Public URL Error: No public URL returned.");
      toast({
        title: "Erro ao obter URL",
        description: "O upload foi feito, mas não foi possível obter a URL pública da logo.",
        variant: "destructive",
      });
      throw new Error("Não foi possível obter a URL pública da logo.");
    }

    console.log("Public URL obtained:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  };

  const handleCreateClub = async () => {
    if (!user || !clubForm.name || !clubForm.country || !clubForm.founded_year) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios (Nome, País, Ano de Fundação).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    let logoUrl: string | null = null;

    try {
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const { data, error } = await supabase
        .from('clubs')
        .insert([{
          name: clubForm.name,
          country: clubForm.country,
          founded_year: parseInt(clubForm.founded_year),
          league: clubForm.league || null,
          stadium: clubForm.stadium || null,
          logo_url: logoUrl, // Use the uploaded logo URL
          manager_id: user.id // The user creating the club becomes its manager
        }])
        .select()
        .single();

      if (error) throw error;

      // Also create a club_member entry for the manager
      const { error: memberError } = await supabase
        .from('club_members')
        .insert([{
          club_id: data.id,
          user_id: user.id,
          department: 'management', // Manager is part of management
          permission_level: 'admin', // Manager has admin permissions
          status: 'accepted',
          invited_at: new Date().toISOString(),
          accepted_at: new Date().toISOString(),
        }]);

      if (memberError) console.error('Error creating club member for manager:', memberError);

      // Removed toast here, it will be handled by Dashboard.tsx
      onClubCreated();
      onOpenChange(false); // Close dialog
      setClubForm({
        name: "",
        country: "",
        founded_year: "",
        league: "",
        stadium: "",
      });
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error: any) {
      console.error('Error creating club:', error);
      toast({
        title: "Erro ao criar clube",
        description: error.message || "Não foi possível criar o perfil do clube.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 150 }, (_, i) => currentYear - i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Criar Perfil do Clube
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para registrar seu clube na ArenaOne.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Clube *</Label>
              <Input
                id="name"
                placeholder="Ex: ArenaOne FC"
                value={clubForm.name}
                onChange={(e) => setClubForm(prev => ({ ...prev, name: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País *</Label>
              <Input
                id="country"
                placeholder="Ex: Brasil"
                value={clubForm.country}
                onChange={(e) => setClubForm(prev => ({ ...prev, country: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="founded_year">Ano de Fundação *</Label>
              <Select
                value={clubForm.founded_year}
                onValueChange={(value) => setClubForm(prev => ({ ...prev, founded_year: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="league">Liga/Campeonato</Label>
              <Input
                id="league"
                placeholder="Ex: Série A"
                value={clubForm.league}
                onChange={(e) => setClubForm(prev => ({ ...prev, league: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stadium">Estádio</Label>
            <Input
              id="stadium"
              placeholder="Ex: ArenaOne Stadium"
              value={clubForm.stadium}
              onChange={(e) => setClubForm(prev => ({ ...prev, stadium: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_upload">Logo do Clube (Imagem ou PDF)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="logo_upload"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="flex-1"
                disabled={isSubmitting}
              />
              {logoPreview && (
                <div className="w-16 h-16 flex-shrink-0 border rounded-md flex items-center justify-center overflow-hidden">
                  {logoFile?.type.startsWith('image/') ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              )}
              {!logoFile && (
                <div className="w-16 h-16 flex-shrink-0 border rounded-md flex items-center justify-center bg-muted">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            {logoFile && (
              <p className="text-xs text-muted-foreground mt-1">Arquivo selecionado: {logoFile.name}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClub} disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Clube"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClubDialog;