-- Atualizar enum de tipos de usuário para incluir mais profissionais
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'medical_staff';
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'financial_staff';
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'technical_staff';

-- Criar enum para departamentos/setores do clube
CREATE TYPE club_department AS ENUM (
  'medical',      -- Departamento médico
  'scouting',     -- Scouting/Observação
  'technical',    -- Comissão técnica
  'financial',    -- Financeiro
  'management',   -- Diretoria
  'admin'         -- Administração geral
);

-- Criar enum para níveis de permissão
CREATE TYPE permission_level AS ENUM (
  'read',         -- Apenas visualizar
  'write',        -- Visualizar e editar
  'admin'         -- Controle total do setor
);

-- Tabela para membros do clube (sistema de convites)
CREATE TABLE public.club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department club_department NOT NULL,
  permission_level permission_level NOT NULL DEFAULT 'read',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, user_id, department)
);

-- Informações médicas dos jogadores (privadas ao clube)
CREATE TABLE public.player_medical_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  blood_type TEXT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  medical_history TEXT,
  last_medical_exam DATE,
  fitness_level INTEGER CHECK (fitness_level BETWEEN 1 AND 10),
  injuries_history JSONB, -- Array de lesões com datas, tipos, etc
  vaccination_record JSONB,
  emergency_contact JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, club_id)
);

-- Informações financeiras dos jogadores (privadas ao clube)
CREATE TABLE public.player_financial_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  salary INTEGER, -- Salário em centavos
  contract_value INTEGER, -- Valor do contrato em centavos
  bonuses JSONB, -- Bônus e premiações
  agent_commission NUMERIC(5,2), -- Porcentagem da comissão do agente
  transfer_history JSONB, -- Histórico de transferências com valores
  insurance_value INTEGER, -- Valor do seguro
  payment_schedule JSONB, -- Cronograma de pagamentos
  tax_information JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, club_id)
);

-- Relatórios de observação técnica (scouting)
CREATE TABLE public.player_technical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  scout_id UUID NOT NULL REFERENCES auth.users(id),
  match_observed TEXT, -- Partida observada
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 10),
  technical_skills JSONB, -- Habilidades técnicas detalhadas
  physical_attributes JSONB, -- Atributos físicos
  mental_attributes JSONB, -- Atributos mentais
  tactical_understanding JSONB, -- Compreensão tática
  strengths TEXT[],
  weaknesses TEXT[],
  potential_rating INTEGER CHECK (potential_rating BETWEEN 1 AND 10),
  recommendation TEXT CHECK (recommendation IN ('sign', 'monitor', 'reject')),
  detailed_notes TEXT,
  video_analysis_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avaliações da comissão técnica
CREATE TABLE public.player_technical_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES auth.users(id),
  evaluation_period TEXT, -- Ex: "2024-Q1", "Pré-temporada", etc
  performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 10),
  training_attitude INTEGER CHECK (training_attitude BETWEEN 1 AND 10),
  discipline INTEGER CHECK (discipline BETWEEN 1 AND 10),
  leadership INTEGER CHECK (leadership BETWEEN 1 AND 10),
  team_chemistry INTEGER CHECK (team_chemistry BETWEEN 1 AND 10),
  improvement_areas TEXT[],
  development_plan TEXT,
  minutes_played INTEGER DEFAULT 0,
  goals_contribution INTEGER DEFAULT 0,
  assists_contribution INTEGER DEFAULT 0,
  tactical_flexibility JSONB, -- Posições que pode jogar
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações de privacidade/compartilhamento do clube
CREATE TABLE public.club_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  share_medical_info BOOLEAN DEFAULT FALSE,
  share_financial_info BOOLEAN DEFAULT FALSE,
  share_technical_reports BOOLEAN DEFAULT FALSE,
  share_with_clubs UUID[], -- IDs de clubes com quem compartilhar
  share_with_agents BOOLEAN DEFAULT FALSE,
  public_player_stats BOOLEAN DEFAULT TRUE, -- Stats básicos públicos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id)
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_medical_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_financial_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_technical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_technical_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário é membro do clube
CREATE OR REPLACE FUNCTION public.is_club_member(user_id UUID, club_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_members 
    WHERE club_members.user_id = is_club_member.user_id 
    AND club_members.club_id = is_club_member.club_id 
    AND status = 'accepted'
  );
$$;

-- Função para verificar permissão por departamento
CREATE OR REPLACE FUNCTION public.has_department_permission(
  user_id UUID, 
  club_id UUID, 
  department club_department,
  min_permission permission_level DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_members 
    WHERE club_members.user_id = has_department_permission.user_id 
    AND club_members.club_id = has_department_permission.club_id 
    AND club_members.department = has_department_permission.department
    AND status = 'accepted'
    AND (
      (min_permission = 'read' AND permission_level IN ('read', 'write', 'admin')) OR
      (min_permission = 'write' AND permission_level IN ('write', 'admin')) OR
      (min_permission = 'admin' AND permission_level = 'admin')
    )
  );
$$;

-- Políticas RLS para club_members
CREATE POLICY "Usuários podem ver convites para si mesmos"
ON public.club_members FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Membros admin podem ver todos os membros do clube"
ON public.club_members FOR SELECT
USING (public.has_department_permission(auth.uid(), club_id, 'admin'));

CREATE POLICY "Admins podem convidar membros"
ON public.club_members FOR INSERT
WITH CHECK (public.has_department_permission(auth.uid(), club_id, 'admin', 'admin'));

CREATE POLICY "Usuários podem aceitar/rejeitar próprios convites"
ON public.club_members FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins podem atualizar membros"
ON public.club_members FOR UPDATE
USING (public.has_department_permission(auth.uid(), club_id, 'admin', 'admin'));

-- Políticas RLS para informações médicas
CREATE POLICY "Equipe médica pode ver informações médicas do clube"
ON public.player_medical_info FOR SELECT
USING (public.has_department_permission(auth.uid(), club_id, 'medical'));

CREATE POLICY "Equipe médica pode criar informações médicas"
ON public.player_medical_info FOR INSERT
WITH CHECK (public.has_department_permission(auth.uid(), club_id, 'medical', 'write'));

CREATE POLICY "Equipe médica pode atualizar informações médicas"
ON public.player_medical_info FOR UPDATE
USING (public.has_department_permission(auth.uid(), club_id, 'medical', 'write'));

-- Políticas RLS para informações financeiras
CREATE POLICY "Equipe financeira pode ver informações financeiras"
ON public.player_financial_info FOR SELECT
USING (public.has_department_permission(auth.uid(), club_id, 'financial'));

CREATE POLICY "Equipe financeira pode criar informações financeiras"
ON public.player_financial_info FOR INSERT
WITH CHECK (public.has_department_permission(auth.uid(), club_id, 'financial', 'write'));

CREATE POLICY "Equipe financeira pode atualizar informações financeiras"
ON public.player_financial_info FOR UPDATE
USING (public.has_department_permission(auth.uid(), club_id, 'financial', 'write'));

-- Políticas RLS para relatórios técnicos
CREATE POLICY "Scouting pode ver próprios relatórios e do clube"
ON public.player_technical_reports FOR SELECT
USING (auth.uid() = scout_id OR public.has_department_permission(auth.uid(), club_id, 'scouting'));

CREATE POLICY "Scouts podem criar relatórios"
ON public.player_technical_reports FOR INSERT
WITH CHECK (public.has_department_permission(auth.uid(), club_id, 'scouting', 'write'));

CREATE POLICY "Scouts podem atualizar próprios relatórios"
ON public.player_technical_reports FOR UPDATE
USING (auth.uid() = scout_id);

-- Políticas RLS para avaliações técnicas
CREATE POLICY "Comissão técnica pode ver avaliações do clube"
ON public.player_technical_evaluations FOR SELECT
USING (public.has_department_permission(auth.uid(), club_id, 'technical'));

CREATE POLICY "Comissão técnica pode criar avaliações"
ON public.player_technical_evaluations FOR INSERT
WITH CHECK (public.has_department_permission(auth.uid(), club_id, 'technical', 'write'));

CREATE POLICY "Comissão técnica pode atualizar avaliações"
ON public.player_technical_evaluations FOR UPDATE
USING (public.has_department_permission(auth.uid(), club_id, 'technical', 'write'));

-- Políticas RLS para configurações de privacidade
CREATE POLICY "Admins podem ver configurações de privacidade do clube"
ON public.club_privacy_settings FOR SELECT
USING (public.has_department_permission(auth.uid(), club_id, 'admin'));

CREATE POLICY "Admins podem gerenciar configurações de privacidade"
ON public.club_privacy_settings FOR ALL
USING (public.has_department_permission(auth.uid(), club_id, 'admin', 'admin'));

-- Triggers para updated_at
CREATE TRIGGER update_club_members_updated_at
  BEFORE UPDATE ON public.club_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_medical_info_updated_at
  BEFORE UPDATE ON public.player_medical_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_financial_info_updated_at
  BEFORE UPDATE ON public.player_financial_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_technical_reports_updated_at
  BEFORE UPDATE ON public.player_technical_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_technical_evaluations_updated_at
  BEFORE UPDATE ON public.player_technical_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_club_privacy_settings_updated_at
  BEFORE UPDATE ON public.club_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();