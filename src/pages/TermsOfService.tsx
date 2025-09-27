import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
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

        <h1 className="text-4xl font-heading font-bold mb-6 text-primary">Termos de Serviço</h1>
        <p className="text-muted-foreground mb-8">Última atualização: 20 de Julho de 2024</p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <p>
            Bem-vindo à ArenaOne! Estes Termos de Serviço ("Termos") regem seu acesso e uso da plataforma ArenaOne, incluindo nosso website, aplicativos móveis e outros serviços online (coletivamente, a "Plataforma"). Ao acessar ou usar a Plataforma, você concorda em estar vinculado a estes Termos.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p>
            Ao criar uma conta, acessar ou usar a Plataforma, você declara que leu, entendeu e concorda em cumprir estes Termos, bem como nossa Política de Privacidade. Se você não concordar com estes Termos, não poderá acessar ou usar a Plataforma.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">2. Elegibilidade</h2>
          <p>
            Você deve ter pelo menos 18 anos de idade para usar a Plataforma. Ao usar a Plataforma, você declara e garante que tem idade legal para formar um contrato vinculativo e que não está impedido de usar os serviços sob as leis aplicáveis.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">3. Sua Conta</h2>
          <p>
            Você é responsável por manter a confidencialidade de suas credenciais de login e por todas as atividades que ocorrem em sua conta. Você concorda em nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">4. Conteúdo do Usuário</h2>
          <p>
            Você é o único responsável pelo conteúdo que publica, envia ou exibe na Plataforma ("Conteúdo do Usuário"). Você concede à ArenaOne uma licença mundial, não exclusiva, livre de royalties para usar, reproduzir, modificar, adaptar, publicar, traduzir, criar trabalhos derivados, distribuir e exibir seu Conteúdo do Usuário em conexão com a operação da Plataforma.
          </p>
          <p>
            Você concorda em não publicar Conteúdo do Usuário que seja ilegal, difamatório, obsceno, ameaçador, invasivo da privacidade, que viole direitos de propriedade intelectual ou que seja de outra forma censurável.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">5. Conduta Proibida</h2>
          <p>
            Você concorda em não:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li>Usar a Plataforma para qualquer finalidade ilegal ou não autorizada.</li>
            <li>Interferir ou interromper a Plataforma ou os servidores e redes conectados à Plataforma.</li>
            <li>Tentar obter acesso não autorizado a outras contas, sistemas de computador ou redes conectadas à Plataforma.</li>
            <li>Realizar engenharia reversa, descompilar ou desmontar qualquer parte da Plataforma.</li>
            <li>Usar qualquer robô, spider, scraper ou outros meios automatizados para acessar a Plataforma para qualquer finalidade sem nossa permissão expressa por escrito.</li>
          </ul>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">6. Rescisão</h2>
          <p>
            Podemos rescindir ou suspender seu acesso à Plataforma imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar estes Termos.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">7. Isenção de Garantias</h2>
          <p>
            A Plataforma é fornecida "como está" e "conforme disponível", sem garantias de qualquer tipo, expressas ou implícitas. A ArenaOne não garante que a Plataforma será ininterrupta, segura ou livre de erros.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">8. Limitação de Responsabilidade</h2>
          <p>
            Em nenhuma circunstância a ArenaOne será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes de (i) seu acesso ou uso ou incapacidade de acessar ou usar a Plataforma; (ii) qualquer conduta ou conteúdo de terceiros na Plataforma; (iii) qualquer conteúdo obtido da Plataforma; e (iv) acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo, seja com base em garantia, contrato, delito (incluindo negligência) ou qualquer outra teoria legal, quer tenhamos sido informados ou não da possibilidade de tais danos.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">9. Lei Aplicável</h2>
          <p>
            Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar seus conflitos de princípios legais.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">10. Contato</h2>
          <p>
            Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em <a href="mailto:suporte@arenaone.com" className="text-primary hover:underline">suporte@arenaone.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;