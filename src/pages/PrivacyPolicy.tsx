import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-8">
      <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg shadow-lg">
        <Button
          variant="ghost"
          className="mb-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-4xl font-heading font-bold mb-6 text-primary">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-8">Última atualização: 20 de Julho de 2024</p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <p>
            Na ArenaOne, valorizamos a sua privacidade e estamos comprometidos em proteger suas informações pessoais. Esta Política de Privacidade descreve como coletamos, usamos, processamos e compartilhamos suas informações quando você utiliza nossa plataforma.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">1. Informações que Coletamos</h2>
          <p>
            Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li>
              <strong>Informações de Cadastro:</strong> Nome completo, endereço de e-mail, tipo de usuário (jogador, clube, agente, etc.), data de nascimento, nacionalidade.
            </li>
            <li>
              <strong>Dados de Perfil:</strong> Foto de perfil, biografia, localização, website, especializações, experiência, conquistas.
            </li>
            <li>
              <strong>Dados de Uso:</strong> Informações sobre como você interage com a plataforma, incluindo páginas visitadas, recursos utilizados, tempo gasto e padrões de navegação.
            </li>
            <li>
              <strong>Dados de Comunicação:</strong> Conteúdo de mensagens trocadas com outros usuários e com o suporte da ArenaOne.
            </li>
            <li>
              <strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional, identificadores de dispositivo e dados de log.
            </li>
            <li>
              <strong>Informações Específicas do Usuário (se aplicável):</strong> Para jogadores, dados de performance, histórico médico, informações financeiras (salário, contrato); para clubes, dados de gestão, elenco, finanças.
            </li>
          </ul>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">2. Como Usamos Suas Informações</h2>
          <p>
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li>Fornecer, operar e manter nossa plataforma.</li>
            <li>Personalizar sua experiência e o conteúdo exibido.</li>
            <li>Melhorar, otimizar e desenvolver novos recursos e serviços.</li>
            <li>Comunicar-nos com você sobre sua conta, atualizações e ofertas.</li>
            <li>Processar transações e gerenciar contratos (se aplicável).</li>
            <li>Detectar, prevenir e resolver fraudes e problemas de segurança.</li>
            <li>Cumprir obrigações legais e regulatórias.</li>
          </ul>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">3. Compartilhamento de Informações</h2>
          <p>
            Podemos compartilhar suas informações com:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li>
              <strong>Outros Usuários:</strong> Informações de perfil público, posts e mensagens são visíveis para outros usuários da plataforma.
            </li>
            <li>
              <strong>Clubes e Agentes (com seu consentimento):</strong> Dados de jogadores podem ser compartilhados com clubes e agentes para oportunidades de transferência ou gestão de carreira, mediante sua permissão.
            </li>
            <li>
              <strong>Provedores de Serviço:</strong> Terceiros que nos ajudam a operar a plataforma (hospedagem, análise de dados, suporte ao cliente).
            </li>
            <li>
              <strong>Autoridades Legais:</strong> Quando exigido por lei ou para proteger nossos direitos.
            </li>
          </ul>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">4. Seus Direitos de Privacidade</h2>
          <p>
            Você tem o direito de acessar, corrigir, atualizar ou solicitar a exclusão de suas informações pessoais. Para exercer esses direitos, entre em contato conosco através dos canais de suporte.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">5. Segurança dos Dados</h2>
          <p>
            Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">6. Alterações a Esta Política</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações significativas publicando a nova política em nossa plataforma.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">7. Contato</h2>
          <p>
            Se tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em <a href="mailto:suporte@arenaone.com" className="text-primary hover:underline">suporte@arenaone.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;