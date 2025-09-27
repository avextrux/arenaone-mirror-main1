import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4 md:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-heading font-bold text-center">Termos de Serviço</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6">
            <p>
              Bem-vindo à ArenaOne. Ao acessar ou usar nossa plataforma, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Por favor, leia-os atentamente.
            </p>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao criar uma conta, acessar ou usar qualquer parte da plataforma ArenaOne, você concorda com estes Termos de Serviço e com nossa Política de Privacidade. Se você não concordar com todos os termos e condições deste acordo, então você não poderá acessar o site ou usar quaisquer serviços.
            </p>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">2. Modificações dos Termos</h2>
            <p>
              A ArenaOne reserva-se o direito, a seu exclusivo critério, de atualizar, alterar ou substituir qualquer parte destes Termos de Serviço a qualquer momento. É sua responsabilidade verificar esta página periodicamente para quaisquer alterações. Seu uso continuado ou acesso ao site após a publicação de quaisquer alterações constitui aceitação dessas alterações.
            </p>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">3. Registro de Conta</h2>
            <p>
              Para acessar certas funcionalidades da plataforma, você precisará se registrar para uma conta. Você concorda em fornecer informações precisas, completas e atualizadas durante o processo de registro e em manter essas informações atualizadas. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta.
            </p>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">4. Conduta do Usuário</h2>
            <p>Você concorda em não:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Usar a plataforma para qualquer finalidade ilegal ou não autorizada.</li>
              <li>Violar quaisquer leis em sua jurisdição (incluindo, mas não se limitando a leis de direitos autorais).</li>
              <li>Publicar conteúdo que seja difamatório, obsceno, ofensivo, ameaçador ou que viole os direitos de terceiros.</li>
              <li>Tentar interferir no funcionamento adequado da plataforma.</li>
            </ul>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">5. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo e materiais disponíveis na ArenaOne, incluindo, mas não se limitando a textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais, compilações de dados e software, são propriedade da ArenaOne ou de seus fornecedores de conteúdo e são protegidos por leis de direitos autorais e outras leis de propriedade intelectual.
            </p>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">6. Limitação de Responsabilidade</h2>
            <p>
              Em nenhuma circunstância a ArenaOne, seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes de (i) seu acesso ou uso ou incapacidade de acessar ou usar a plataforma; (ii) qualquer conduta ou conteúdo de terceiros na plataforma; (iii) qualquer conteúdo obtido da plataforma; e (iv) acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo, seja com base em garantia, contrato, delito (incluindo negligência) ou qualquer outra teoria legal, tenhamos ou não sido informados da possibilidade de tais danos.
            </p>

            <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">7. Lei Aplicável</h2>
            <p>
              Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem levar em consideração seus conflitos de disposições legais.
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

export default TermsOfService;