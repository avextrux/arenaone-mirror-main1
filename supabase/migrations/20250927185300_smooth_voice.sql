/*
  # Sistema de Gestão de Clubes - MVP

  1. Novas Tabelas
    - `clubs` - Informações básicas dos clubes
    - `club_members` - Membros do clube com departamentos e permissões
    - `player_medical_info` - Informações médicas privadas dos jogadores
    - `player_financial_info` - Informações financeiras privadas dos jogadores  
    - `player_technical_reports` - Relatórios técnicos e de scouting
    - `player_technical_evaluations` - Avaliações da comissão técnica
    - `club_privacy_settings` - Configurações de compartilhamento

  2. Enums
    - `user_type` - Tipos de usuários expandidos
    - `club_department` - Departamentos do clube
    - `permission_level` - Níveis de permissão

  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em departamentos e permissões
    - Funções para verificar acesso

  4. Funcionalidades
    - Sistema de convites para clubes
    - Controle granular de acesso por departamento
    - Informações privadas por tipo de staff
    - Configurações de compartilhamento entre clubes
*/

-- Atualizar enum de tipos de usuário
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE user_type AS ENUM (
      'player',
      'club', 
      'agent',
      'coach',
      'scout',
      'journalist',
      'fan',
      'referee',
      'medical_staff',
      'financial_staff',
      'technical_staff'
    );
  END IF;
END $$;

-- Criar enum para departamentos do clube
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'club_department') THEN
    CREATE TYPE club_department AS ENUM (
      'medical',      -- Departamento médico
      'scouting',     -- Scouting/Observação
      'technical',    -- Comissão técnica
      'financial',    -- Financeiro
      'management',   -- Diretoria
      'admin'         -- Administração geral
    );
  END IF;
END $$;

-- Criar enum para níveis de permissão
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_level') THEN
    CREATE TYPE permission_level AS ENUM (
      'read',         -- Apenas visualizar
      'write',        -- Visualizar e editar
      'admin'         -- Controle total do setor
    );
  END IF;
END $$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabela de clubes
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  league TEXT,
  stadium TEXT,
  founded_year INTEGER,
  logo_url TEXT,
  manager_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para membros do clube (sistema de convites)
CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department club_department NOT NULL,
  permission_level permission_level NOT NULL DEFAULT 'read',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id, department)
);

-- Atualizar tabela de jogadores
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE players ADD COLUMN profile_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Informações médicas dos jogadores (privadas ao clube)
CREATE TABLE IF NOT EXISTS player_medical_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  blood_type TEXT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  medical_history TEXT,
  last_medical_exam DATE,
  fitness_level INTEGER CHECK (fitness_level BETWEEN 1 AND 10),
  injuries_history JSONB,
  vaccination_record JSONB,
  emergency_contact JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, club_id)
);

-- Informações financeiras dos jogadores (privadas ao clube)
CREATE TABLE IF NOT EXISTS player_financial_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  salary INTEGER, -- Salário em centavos
  contract_value INTEGER, -- Valor do contrato em centavos
  bonuses JSONB,
  agent_commission NUMERIC(5,2),
  transfer_history JSONB,
  insurance_value INTEGER,
  payment_schedule JSONB,
  tax_information JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, club_id)
);

-- Relatórios de observação técnica (scouting)
CREATE TABLE IF NOT EXISTS player_technical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  scout_id UUID NOT NULL REFERENCES auth.users(id),
  match_observed TEXT,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 10),
  technical_skills JSONB,
  physical_attributes JSONB,
  mental_attributes JSONB,
  tactical_understanding JSONB,
  strengths TEXT[],
  weaknesses TEXT[],
  potential_rating INTEGER CHECK (potential_rating BETWEEN 1 AND 10),
  recommendation TEXT CHECK (recommendation IN ('sign', 'monitor', 'reject')),
  detailed_notes TEXT,
  video_analysis_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avaliações da comissão técnica
CREATE TABLE IF NOT EXISTS player_technical_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES auth.users(id),
  evaluation_period TEXT,
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
  tactical_flexibility JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurações de privacidade/compartilhamento do clube
CREATE TABLE IF NOT EXISTS club_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  share_medical_info BOOLEAN DEFAULT FALSE,
  share_financial_info BOOLEAN DEFAULT FALSE,
  share_technical_reports BOOLEAN DEFAULT FALSE,
  share_with_clubs UUID[],
  share_with_agents BOOLEAN DEFAULT FALSE,
  public_player_stats BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id)
);

-- Enable RLS em todas as tabelas
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_medical_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_financial_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_technical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_technical_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário é membro do clube
CREATE OR REPLACE FUNCTION is_club_member(user_id UUID, club_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM club_members 
    WHERE club_members.user_id = is_club_member.user_id 
    AND club_members.club_id = is_club_member.club_id 
    AND status = 'accepted'
  );
$$;

-- Função para verificar permissão por departamento
CREATE OR REPLACE FUNCTION has_department_permission(
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
    SELECT 1 FROM club_members 
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

-- Políticas RLS para clubs
CREATE POLICY "Todos podem ver clubes públicos" ON clubs FOR SELECT USING (true);
CREATE POLICY "Apenas admins podem criar clubes" ON clubs FOR INSERT WITH CHECK (auth.uid() = manager_id);
CREATE POLICY "Apenas manager pode atualizar clube" ON clubs FOR UPDATE USING (auth.uid() = manager_id);

-- Políticas RLS para club_members
CREATE POLICY "Usuários podem ver convites para si mesmos" ON club_members 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Membros admin podem ver todos os membros do clube" ON club_members 
FOR SELECT USING (has_department_permission(auth.uid(), club_id, 'admin'));

CREATE POLICY "Admins podem convidar membros" ON club_members 
FOR INSERT WITH CHECK (has_department_permission(auth.uid(), club_id, 'admin', 'admin'));

CREATE POLICY "Usuários podem aceitar/rejeitar próprios convites" ON club_members 
FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins podem atualizar membros" ON club_members 
FOR UPDATE USING (has_department_permission(auth.uid(), club_id, 'admin', 'admin'));

-- Políticas RLS para informações médicas
CREATE POLICY "Equipe médica pode ver informações médicas do clube" ON player_medical_info 
FOR SELECT USING (has_department_permission(auth.uid(), club_id, 'medical'));

CREATE POLICY "Equipe médica pode criar informações médicas" ON player_medical_info 
FOR INSERT WITH CHECK (has_department_permission(auth.uid(), club_id, 'medical', 'write'));

CREATE POLICY "Equipe médica pode atualizar informações médicas" ON player_medical_info 
FOR UPDATE USING (has_department_permission(auth.uid(), club_id, 'medical', 'write'));

-- Políticas RLS para informações financeiras
CREATE POLICY "Equipe financeira pode ver informações financeiras" ON player_financial_info 
FOR SELECT USING (has_department_permission(auth.uid(), club_id, 'financial'));

CREATE POLICY "Equipe financeira pode criar informações financeiras" ON player_financial_info 
FOR INSERT WITH CHECK (has_department_permission(auth.uid(), club_id, 'financial', 'write'));

CREATE POLICY "Equipe financeira pode atualizar informações financeiras" ON player_financial_info 
FOR UPDATE USING (has_department_permission(auth.uid(), club_id, 'financial', 'write'));

-- Políticas RLS para relatórios técnicos
CREATE POLICY "Scouting pode ver próprios relatórios e do clube" ON player_technical_reports 
FOR SELECT USING (
  auth.uid() = scout_id OR 
  has_department_permission(auth.uid(), club_id, 'scouting') OR
  has_department_permission(auth.uid(), club_id, 'technical')
);

CREATE POLICY "Scouts podem criar relatórios" ON player_technical_reports 
FOR INSERT WITH CHECK (
  has_department_permission(auth.uid(), club_id, 'scouting', 'write') OR
  has_department_permission(auth.uid(), club_id, 'technical', 'write')
);

CREATE POLICY "Scouts podem atualizar próprios relatórios" ON player_technical_reports 
FOR UPDATE USING (auth.uid() = scout_id);

-- Políticas RLS para avaliações técnicas
CREATE POLICY "Comissão técnica pode ver avaliações do clube" ON player_technical_evaluations 
FOR SELECT USING (has_department_permission(auth.uid(), club_id, 'technical'));

CREATE POLICY "Comissão técnica pode criar avaliações" ON player_technical_evaluations 
FOR INSERT WITH CHECK (has_department_permission(auth.uid(), club_id, 'technical', 'write'));

CREATE POLICY "Comissão técnica pode atualizar avaliações" ON player_technical_evaluations 
FOR UPDATE USING (has_department_permission(auth.uid(), club_id, 'technical', 'write'));

-- Políticas RLS para configurações de privacidade
CREATE POLICY "Admins podem ver configurações de privacidade do clube" ON club_privacy_settings 
FOR SELECT USING (has_department_permission(auth.uid(), club_id, 'admin'));

CREATE POLICY "Admins podem gerenciar configurações de privacidade" ON club_privacy_settings 
FOR ALL USING (has_department_permission(auth.uid(), club_id, 'admin', 'admin'));

-- Triggers para updated_at
CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_members_updated_at
  BEFORE UPDATE ON club_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_medical_info_updated_at
  BEFORE UPDATE ON player_medical_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_financial_info_updated_at
  BEFORE UPDATE ON player_financial_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_technical_reports_updated_at
  BEFORE UPDATE ON player_technical_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_technical_evaluations_updated_at
  BEFORE UPDATE ON player_technical_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_privacy_settings_updated_at
  BEFORE UPDATE ON club_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns clubes de exemplo
INSERT INTO clubs (name, country, league, stadium, founded_year) VALUES
('Real Madrid CF', 'Espanha', 'La Liga', 'Santiago Bernabéu', 1902),
('FC Barcelona', 'Espanha', 'La Liga', 'Camp Nou', 1899),
('Manchester United FC', 'Inglaterra', 'Premier League', 'Old Trafford', 1878),
('Bayern Munich', 'Alemanha', 'Bundesliga', 'Allianz Arena', 1900),
('Paris Saint-Germain', 'França', 'Ligue 1', 'Parc des Princes', 1970),
('Flamengo', 'Brasil', 'Brasileirão', 'Maracanã', 1895),
('Palmeiras', 'Brasil', 'Brasileirão', 'Allianz Parque', 1914),
('São Paulo FC', 'Brasil', 'Brasileirão', 'Morumbi', 1930)
ON CONFLICT DO NOTHING;

-- Inserir alguns jogadores de exemplo
INSERT INTO players (first_name, last_name, nationality, position, date_of_birth, height, weight, market_value, current_club_id) 
SELECT 
  'João', 'Silva', 'Brasil', 'Meio-campo', '1995-03-15', 175, 70, 5000000, c.id
FROM clubs c WHERE c.name = 'Flamengo'
UNION ALL
SELECT 
  'Carlos', 'Santos', 'Brasil', 'Atacante', '1998-07-22', 180, 75, 8000000, c.id
FROM clubs c WHERE c.name = 'Palmeiras'
UNION ALL
SELECT 
  'Pedro', 'Oliveira', 'Brasil', 'Zagueiro', '1992-11-08', 185, 80, 3000000, c.id
FROM clubs c WHERE c.name = 'São Paulo FC'
ON CONFLICT DO NOTHING;