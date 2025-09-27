import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4 md:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-heading font-bold text-center">Política de Privacidade</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6">
            <p>
              Sua privacidade é de extrema importância para a ArenaOne. Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais ao usar nossa plataforma.
            </p>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">1. Informações que Coletamos</h2>
            <p>Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Informações Pessoais:</strong> Nome, endereço de e-mail, data de nascimento, nacionalidade, tipo de usuário (jogador, clube, agente, etc.), informações de perfil (bio, localização, website, especialização, experiência, conquistas).</li>
              <li><strong>Dados de Uso:</strong> Informações sobre como você acessa e usa a plataforma, como seu endereço IP, tipo de navegador, páginas visitadas, tempo gasto nas páginas, cliques e outras estatísticas de uso.</li>
              <li><strong>Dados de Desempenho (para usuários de clubes/jogadores):</strong> Estatísticas de jogo, dados de treinamento, relatórios médicos, informações financeiras relacionadas a contratos e transferências.</li>
            </ul>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">2. Como Usamos Suas Informações</h2>
            <p>Usamos as informações coletadas para diversas finalidades:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Para fornecer e manter nossa plataforma.</li>
              <li>Para personalizar sua experiência e fornecer conteúdo relevante.</li>
              <li>Para melhorar, operar e expandir nossos serviços.</li>
              <li>Para processar transações e enviar notificações relacionadas.</li>
              <li>Para comunicação, incluindo atualizações, alertas de segurança e mensagens de suporte.</li>
              <li>Para fins de pesquisa e análise, a fim de entender e melhorar o uso da plataforma.</li>
              <li>Para detectar, prevenir e resolver problemas técnicos e de segurança.</li>
            </ul>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">3. Compartilhamento de Informações</h2>
            <p>
              Não vendemos suas informações pessoais. Podemos compartilhar suas informações com terceiros nas seguintes situações:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Com seu consentimento:</strong> Podemos compartilhar suas informações com seu consentimento explícito.</li>
              <li><strong>Com provedores de serviços:</strong> Podemos empregar empresas e indivíduos terceirizados para facilitar nosso serviço (por exemplo, manutenção, análise, marketing).</li>
              <li><strong>Para conformidade legal:</strong> Podemos divulgar suas informações quando exigido por lei ou em resposta a solicitações válidas de autoridades públicas.</li>
              <li><strong>Transferências de negócios:</strong> Em caso de fusão, aquisição ou venda de ativos, suas informações pessoais podem ser transferidas.</li>
            </ul>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">4. Segurança dos Dados</h2>
            <p>
              A segurança de seus dados é importante para nós, mas lembre-se de que nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro. Embora nos esforcemos para usar meios comercialmente aceitáveis para proteger suas informações pessoais, não podemos garantir sua segurança absoluta.
            </p>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">5. Seus Direitos de Privacidade</h2>
            <p>
              Você tem o direito de acessar, corrigir, atualizar ou solicitar a exclusão de suas informações pessoais. Você também pode ter o direito de se opor ao processamento de seus dados ou de solicitar a restrição do processamento. Para exercer esses direitos, entre em contato conosco.
            </p>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">6. Links para Outros Sites</h2>
            <p>
              Nossa plataforma pode conter links para outros sites que não são operados por nós. Se você clicar em um link de terceiros, será direcionado para o site desse terceiro. Aconselhamos vivamente que você revise a Política de Privacidade de cada site que visitar. Não temos controle e não assumimos responsabilidade pelo conteúdo, políticas de privacidade ou práticas de quaisquer sites ou serviços de terceiros.
            </p>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">7. Privacidade de Crianças</h2>
            <p>
              Nossa plataforma não se destina a menores de 13 anos. Não coletamos intencionalmente informações de identificação pessoal de menores de 13 anos. Se você é pai/mãe ou responsável e sabe que seu filho nos forneceu dados pessoais, entre em contato conosco.
            </p>

            <p className="text-sm text-muted-foreground mt-12">
              Última atualização: 20 de Julho de 2024
            </p>

            <div className="text-center mt-8">
              <Button asChild>
                <Link to="/">Voltar para a Página Inicial</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;