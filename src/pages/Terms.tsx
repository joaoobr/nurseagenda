import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const Terms = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
        </Button>

        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-muted-foreground mb-8">Última atualização: 11 de abril de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao criar uma conta e utilizar o NurseAgenda, você declara que leu, compreendeu e
              concorda integralmente com estes Termos de Uso e com a nossa Política de Privacidade.
              Se não concordar, não utilize o aplicativo. O uso continuado constitui aceitação
              de quaisquer alterações futuras nestes termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Descrição do Serviço</h2>
            <p>
              O NurseAgenda é um aplicativo de organização e gestão pessoal para profissionais de enfermagem,
              oferecendo funcionalidades como:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gerenciamento de escalas e plantões.</li>
              <li>Cadastro e acompanhamento de pacientes.</li>
              <li>Controle de medicamentos e horários.</li>
              <li>Registro de sinais vitais e anotações de enfermagem.</li>
              <li>Checklists e calculadoras médicas auxiliares.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Elegibilidade</h2>
            <p>
              O NurseAgenda é destinado exclusivamente a profissionais de saúde maiores de 18 anos.
              Ao se registrar, você declara ser um profissional de saúde legalmente habilitado
              em sua jurisdição.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Conta do Usuário</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Você é responsável por manter a segurança da sua conta e senha.</li>
              <li>Não compartilhe suas credenciais de acesso com terceiros.</li>
              <li>Notifique-nos imediatamente sobre qualquer uso não autorizado.</li>
              <li>Podemos suspender contas que violem estes termos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Assinatura e Pagamentos</h2>
            <p>
              O NurseAgenda oferece um período de teste gratuito de 3 dias e planos de assinatura
              pagos processados via Stripe.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Os preços são exibidos antes da confirmação da compra.</li>
              <li>A renovação é automática, salvo cancelamento prévio.</li>
              <li>Cancelamentos podem ser feitos a qualquer momento pelo aplicativo.</li>
              <li>Não há reembolso para períodos já utilizados.</li>
              <li>O Stripe processa os pagamentos de forma segura, conforme suas próprias políticas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Uso Adequado</h2>
            <p>Você se compromete a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Usar o aplicativo apenas para fins profissionais legítimos.</li>
              <li>Não inserir dados falsos ou fraudulentos.</li>
              <li>Não tentar acessar dados de outros usuários.</li>
              <li>Não usar engenharia reversa ou tentar comprometer a segurança do sistema.</li>
              <li>Cumprir todas as leis e regulamentações aplicáveis à sua prática profissional.</li>
            </ul>
          </section>

          <section className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3 text-destructive">⚠️ 7. Dados Sensíveis de Saúde — Responsabilidades</h2>
            <p>
              <strong>O NurseAgenda trata dados sensíveis de saúde.</strong> Ao utilizar o aplicativo, você reconhece e concorda que:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Responsabilidade do profissional:</strong> Você é o único responsável pelos dados de pacientes
                inseridos no aplicativo, incluindo a obtenção de consentimento necessário.
              </li>
              <li>
                <strong>Conformidade regulatória:</strong> É sua responsabilidade garantir que o uso do aplicativo
                esteja em conformidade com a LGPD (Lei Geral de Proteção de Dados), HIPAA, GDPR e demais
                regulamentações aplicáveis à sua jurisdição.
              </li>
              <li>
                <strong>Minimização de dados:</strong> Insira apenas os dados estritamente necessários para
                sua organização profissional. Evite registrar informações identificáveis além do necessário.
              </li>
              <li>
                <strong>Não substitui prontuário oficial:</strong> O NurseAgenda é uma ferramenta de organização
                pessoal e <strong>NÃO constitui prontuário médico ou registro oficial de saúde</strong>.
              </li>
              <li>
                <strong>Sigilo profissional:</strong> Mantenha seus dispositivos protegidos por senha/biometria
                para evitar acesso não autorizado aos dados.
              </li>
            </ul>
          </section>

          <section className="bg-muted/50 border border-border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">8. Isenção de Responsabilidade Médica</h2>
            <p>
              O NurseAgenda <strong>NÃO é um dispositivo médico</strong>, não possui registro junto à ANVISA,
              FDA ou qualquer órgão regulador equivalente, e não se destina a diagnosticar, tratar ou
              substituir o julgamento clínico profissional.
            </p>
            <p className="mt-2">
              Calculadoras, checklists e ferramentas auxiliares fornecem resultados que devem ser
              <strong> sempre validados pelo profissional de saúde</strong>. Não nos responsabilizamos
              por decisões clínicas tomadas com base nas informações do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Segurança dos Dados</h2>
            <p>Implementamos medidas técnicas para proteger seus dados:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Criptografia em trânsito (TLS/SSL) e em repouso.</li>
              <li>Isolamento de dados por usuário via Row-Level Security (RLS).</li>
              <li>Autenticação segura com opção de login social (Google).</li>
              <li>Servidores hospedados em infraestrutura Supabase com certificações de segurança.</li>
            </ul>
            <p className="mt-2">
              Contudo, nenhum sistema é 100% seguro. Caso identifique vulnerabilidades,
              entre em contato imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Disponibilidade</h2>
            <p>
              Nos esforçamos para manter o aplicativo disponível 24/7, mas não garantimos
              disponibilidade ininterrupta. Podemos realizar manutenções programadas e
              atualizações que podem causar indisponibilidade temporária.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo, design, código e funcionalidades do NurseAgenda são de propriedade
              exclusiva da NurseAgenda. Você recebe uma licença limitada, não exclusiva e
              revogável para uso pessoal e profissional do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Rescisão e Exclusão de Dados</h2>
            <p>
              Podemos encerrar ou suspender sua conta caso haja violação destes termos.
              Você pode encerrar sua conta a qualquer momento entrando em contato conosco.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Após o encerramento, seus dados serão excluídos em até 30 dias.</li>
              <li>Dados de pacientes inseridos por você serão permanentemente removidos.</li>
              <li>Você pode solicitar a exclusão antecipada de todos os seus dados a qualquer momento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Lei Aplicável</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil.
              Fica eleito o foro da comarca de domicílio do usuário para dirimir quaisquer controvérsias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos de Uso ou para exercer seus direitos, entre em contato:
            </p>
            <p className="mt-1">
              <strong>Email:</strong> support@youhub.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;