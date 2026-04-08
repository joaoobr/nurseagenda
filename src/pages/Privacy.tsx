import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-8">Última atualização: 8 de abril de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introdução</h2>
            <p>
              A NurseAgenda ("nós", "nosso" ou "aplicativo") valoriza a privacidade dos seus usuários.
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos
              suas informações pessoais ao utilizar nosso aplicativo de gestão para profissionais de enfermagem.
            </p>
            <p>Email de contato: <strong>support@youhub.app</strong></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Dados que Coletamos</h2>
            <p>Coletamos os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Dados de conta:</strong> nome, email, especialidade, número de registro profissional.</li>
              <li><strong>Dados de pacientes:</strong> nome, diagnóstico, quarto/leito, alergias, sinais vitais e anotações de enfermagem inseridos por você.</li>
              <li><strong>Dados de uso:</strong> informações sobre escalas, medicamentos e checklists que você cadastra.</li>
              <li><strong>Dados técnicos:</strong> tipo de dispositivo, sistema operacional e idioma preferido.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Como Usamos seus Dados</h2>
            <p>Utilizamos seus dados exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fornecer e manter o funcionamento do aplicativo.</li>
              <li>Personalizar sua experiência (idioma, preferências).</li>
              <li>Gerenciar sua assinatura e pagamentos via Stripe.</li>
              <li>Enviar comunicações essenciais sobre o serviço.</li>
              <li>Melhorar a qualidade e segurança do aplicativo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Armazenamento e Segurança</h2>
            <p>
              Seus dados são armazenados de forma segura utilizando Supabase, com criptografia em
              trânsito (TLS/SSL) e em repouso. Implementamos Row-Level Security (RLS) para garantir
              que cada usuário acesse apenas seus próprios dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Compartilhamento de Dados</h2>
            <p>
              <strong>Não vendemos, alugamos ou compartilhamos</strong> seus dados pessoais com terceiros,
              exceto:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Stripe:</strong> para processamento seguro de pagamentos.</li>
              <li><strong>Supabase:</strong> para hospedagem e armazenamento de dados.</li>
              <li><strong>Obrigação legal:</strong> quando exigido por lei ou ordem judicial.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Seus Direitos</h2>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Acessar, corrigir ou excluir seus dados pessoais.</li>
              <li>Exportar seus dados em formato portável.</li>
              <li>Revogar seu consentimento a qualquer momento.</li>
              <li>Solicitar a exclusão completa da sua conta.</li>
            </ul>
            <p>Para exercer esses direitos, entre em contato: <strong>support@youhub.app</strong></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Dados de Pacientes</h2>
            <p>
              Os dados de pacientes inseridos no aplicativo são de responsabilidade exclusiva do
              profissional de saúde. O NurseAgenda atua apenas como ferramenta de organização e
              não se responsabiliza pelo conteúdo inserido. Recomendamos que você siga as
              regulamentações locais de proteção de dados de saúde (LGPD, HIPAA, GDPR conforme aplicável).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cookies e Tecnologias</h2>
            <p>
              Utilizamos armazenamento local (localStorage) para manter sua sessão ativa e
              preferências de idioma. Não utilizamos cookies de rastreamento de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Menores de Idade</h2>
            <p>
              O NurseAgenda é destinado exclusivamente a profissionais de saúde. Não coletamos
              intencionalmente dados de menores de 18 anos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças
              significativas por meio do aplicativo. O uso continuado após as alterações
              constitui aceitação da política atualizada.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;