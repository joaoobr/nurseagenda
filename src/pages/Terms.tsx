import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-muted-foreground mb-8">Última atualização: 8 de abril de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao criar uma conta e utilizar o NurseAgenda, você concorda com estes Termos de Uso.
              Se não concordar, não utilize o aplicativo. O uso continuado constitui aceitação
              de quaisquer alterações futuras nestes termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Descrição do Serviço</h2>
            <p>
              O NurseAgenda é um aplicativo de organização e gestão para profissionais de enfermagem,
              oferecendo funcionalidades como:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gerenciamento de escalas e plantões.</li>
              <li>Cadastro e acompanhamento de pacientes.</li>
              <li>Controle de medicamentos e horários.</li>
              <li>Registro de sinais vitais e anotações de enfermagem.</li>
              <li>Checklists e calculadoras médicas.</li>
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
              O NurseAgenda oferece planos de assinatura pagos processados via Stripe.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Os preços são exibidos antes da confirmação da compra.</li>
              <li>A renovação é automática, salvo cancelamento prévio.</li>
              <li>Cancelamentos podem ser feitos a qualquer momento pelo aplicativo.</li>
              <li>Não há reembolso para períodos já utilizados.</li>
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

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Dados de Pacientes</h2>
            <p>
              <strong>Importante:</strong> O NurseAgenda é uma ferramenta de organização pessoal.
              A responsabilidade pelo conteúdo inserido, incluindo dados de pacientes, é
              exclusivamente do profissional de saúde. Você deve:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Garantir que possui autorização para registrar dados de pacientes.</li>
              <li>Cumprir regulamentações de proteção de dados de saúde (LGPD, HIPAA, GDPR).</li>
              <li>Não inserir dados desnecessários ou excessivos de pacientes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Isenção de Responsabilidade Médica</h2>
            <p>
              O NurseAgenda <strong>não é um dispositivo médico</strong> e não substitui o julgamento
              clínico profissional. Calculadoras e ferramentas são auxiliares e os resultados devem
              ser sempre validados pelo profissional. Não nos responsabilizamos por decisões
              clínicas tomadas com base nas informações do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Disponibilidade</h2>
            <p>
              Nos esforçamos para manter o aplicativo disponível 24/7, mas não garantimos
              disponibilidade ininterrupta. Podemos realizar manutenções programadas e
              atualizações que podem causar indisponibilidade temporária.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo, design, código e funcionalidades do NurseAgenda são de propriedade
              exclusiva da NurseAgenda. Você recebe uma licença limitada, não exclusiva e
              revogável para uso pessoal e profissional do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Rescisão</h2>
            <p>
              Podemos encerrar ou suspender sua conta caso haja violação destes termos.
              Você pode encerrar sua conta a qualquer momento entrando em contato conosco.
              Após o encerramento, seus dados serão excluídos conforme nossa Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos de Uso, entre em contato:
              <strong> support@youhub.app</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;