import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const Privacy = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
        </Button>

        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-8">Última atualização: 11 de abril de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">📋 Resumo</h2>
            <p>
              O NurseAgenda coleta e processa dados pessoais e dados sensíveis de saúde.
              Seus dados são criptografados, isolados por usuário e nunca compartilhados
              com terceiros para fins comerciais. Você tem direito de acessar, corrigir,
              excluir e portar seus dados a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Controlador dos Dados</h2>
            <p>
              A NurseAgenda ("nós", "nosso" ou "aplicativo") é a controladora dos dados pessoais
              coletados através deste aplicativo, nos termos da Lei Geral de Proteção de Dados
              (LGPD — Lei nº 13.709/2018).
            </p>
            <p className="mt-2">
              <strong>Encarregado de Proteção de Dados (DPO):</strong> support@youhub.app
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Dados que Coletamos</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">2.1 Dados Pessoais do Profissional</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome completo, email e senha (criptografada).</li>
              <li>Especialidade e número de registro profissional (COREN/CRM).</li>
              <li>Foto de perfil (opcional).</li>
              <li>Preferência de idioma.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2.2 Dados Sensíveis de Saúde (inseridos por você)</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dados de pacientes: nome, diagnóstico, quarto/leito, alergias, tipo sanguíneo.</li>
              <li>Sinais vitais: pressão arterial, temperatura, frequência cardíaca, saturação de oxigênio, glicemia.</li>
              <li>Anotações de enfermagem e evoluções.</li>
              <li>Medicamentos: nome, dose, via, frequência, horários.</li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>Base legal (LGPD Art. 11):</strong> Tratamento de dados sensíveis mediante
              consentimento explícito do titular (Art. 11, I) e para tutela da saúde por
              profissional de saúde (Art. 11, II, f).
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">2.3 Dados de Uso</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Escalas e plantões cadastrados.</li>
              <li>Checklists e templates criados.</li>
              <li>Dados técnicos: tipo de dispositivo, sistema operacional.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Finalidade do Tratamento</h2>
            <p>Utilizamos seus dados exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fornecer e manter o funcionamento do aplicativo.</li>
              <li>Personalizar sua experiência (idioma, preferências).</li>
              <li>Gerenciar sua assinatura e pagamentos via Stripe.</li>
              <li>Enviar comunicações essenciais sobre o serviço.</li>
              <li>Melhorar a qualidade e segurança do aplicativo.</li>
            </ul>
            <p className="mt-2 font-semibold">
              ❌ NÃO utilizamos seus dados para publicidade, marketing direcionado, venda a
              terceiros ou qualquer finalidade não descrita acima.
            </p>
          </section>

          <section className="bg-muted/50 border border-border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🔒 4. Segurança e Proteção dos Dados</h2>
            <p>Implementamos as seguintes medidas técnicas e organizacionais:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Criptografia em trânsito:</strong> Todas as comunicações utilizam TLS/SSL.</li>
              <li><strong>Criptografia em repouso:</strong> Dados armazenados de forma criptografada.</li>
              <li><strong>Isolamento de dados:</strong> Row-Level Security (RLS) garante que cada
                usuário acesse exclusivamente seus próprios dados.</li>
              <li><strong>Autenticação segura:</strong> Senhas com hash bcrypt, suporte a login social (Google).</li>
              <li><strong>Infraestrutura:</strong> Dados hospedados na Supabase com certificações SOC 2 Type II.</li>
              <li><strong>Backups:</strong> Backups automáticos com retenção conforme políticas da infraestrutura.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Compartilhamento de Dados</h2>
            <p>
              <strong>Não vendemos, alugamos ou compartilhamos</strong> seus dados pessoais com terceiros,
              exceto com os seguintes processadores de dados que atuam sob nosso controle:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Stripe:</strong> Processamento seguro de pagamentos (recebe apenas email e dados de pagamento).</li>
              <li><strong>Supabase:</strong> Hospedagem e armazenamento de dados (processador de dados).</li>
              <li><strong>Obrigação legal:</strong> Quando exigido por lei ou ordem judicial.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Retenção de Dados</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dados da conta: mantidos enquanto a conta estiver ativa.</li>
              <li>Dados de pacientes: mantidos enquanto a conta estiver ativa.</li>
              <li>Após exclusão da conta: todos os dados são permanentemente removidos em até 30 dias.</li>
              <li>Dados de pagamento: retidos conforme obrigações fiscais (até 5 anos).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Seus Direitos (LGPD Art. 18)</h2>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Acesso:</strong> Solicitar uma cópia de todos os dados que possuímos sobre você.</li>
              <li><strong>Correção:</strong> Corrigir dados incompletos ou incorretos.</li>
              <li><strong>Exclusão:</strong> Solicitar a exclusão completa dos seus dados.</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado e portável.</li>
              <li><strong>Revogação:</strong> Revogar seu consentimento a qualquer momento.</li>
              <li><strong>Oposição:</strong> Opor-se ao tratamento dos dados em determinadas circunstâncias.</li>
              <li><strong>Informação:</strong> Saber com quem seus dados são compartilhados.</li>
            </ul>
            <p className="mt-2">Para exercer esses direitos, entre em contato: <strong>support@youhub.app</strong></p>
            <p className="text-sm text-muted-foreground mt-1">
              Responderemos às solicitações em até 15 dias úteis, conforme previsto na LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Transferência Internacional</h2>
            <p>
              Seus dados podem ser processados em servidores localizados fora do Brasil (infraestrutura
              Supabase e Stripe). Garantimos que essas transferências seguem padrões adequados de
              proteção conforme exigido pela LGPD (Art. 33).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Cookies e Tecnologias</h2>
            <p>
              Utilizamos armazenamento local (localStorage) exclusivamente para manter sua sessão ativa e
              preferências de idioma. <strong>Não utilizamos cookies de rastreamento de terceiros,
              analytics comportamental ou pixels de tracking.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Menores de Idade</h2>
            <p>
              O NurseAgenda é destinado exclusivamente a profissionais de saúde. Não coletamos
              intencionalmente dados de menores de 18 anos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Incidentes de Segurança</h2>
            <p>
              Em caso de incidente de segurança envolvendo dados pessoais, notificaremos a
              Autoridade Nacional de Proteção de Dados (ANPD) e os titulares afetados conforme
              previsto na LGPD (Art. 48), em prazo razoável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças
              significativas por meio do aplicativo. O uso continuado após as alterações
              constitui aceitação da política atualizada.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contato e Reclamações</h2>
            <p>Para dúvidas, solicitações ou reclamações sobre privacidade:</p>
            <p className="mt-1"><strong>Email:</strong> support@youhub.app</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Você também pode registrar reclamação junto à Autoridade Nacional de Proteção de Dados (ANPD):
              <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
                www.gov.br/anpd
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;