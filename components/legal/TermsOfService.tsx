import React from 'react';

export const TermsOfService: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8">Termos de Serviço</h1>

            <div className="prose prose-slate max-w-none">
                <p className="text-sm text-gray-500 mb-8">
                    <strong>Última atualização:</strong> 04 de fevereiro de 2026
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
                    <p>
                        Ao acessar e usar o Dentis OS ("Plataforma"), você concorda em cumprir estes Termos de Serviço.
                        Se você não concorda com qualquer parte destes termos, não deve usar a Plataforma.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
                    <p>
                        O Dentis OS é uma plataforma de gestão para clínicas odontológicas que oferece:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>Gestão de pacientes e prontuários eletrônicos</li>
                        <li>Agendamento de consultas</li>
                        <li>Controle financeiro e faturamento</li>
                        <li>Gestão de estoque e procedimentos</li>
                        <li>Assistente de IA para suporte clínico</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Cadastro e Conta</h2>
                    <p>
                        Para usar a Plataforma, você deve:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>Fornecer informações verdadeiras, precisas e completas</li>
                        <li>Manter a segurança de sua senha e conta</li>
                        <li>Notificar imediatamente sobre qualquer uso não autorizado</li>
                        <li>Ser responsável por todas as atividades em sua conta</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Uso Aceitável</h2>
                    <p>
                        Você concorda em NÃO:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>Violar qualquer lei ou regulamento aplicável</li>
                        <li>Compartilhar credenciais de acesso com terceiros não autorizados</li>
                        <li>Tentar acessar dados de outras organizações</li>
                        <li>Usar a Plataforma para fins fraudulentos ou maliciosos</li>
                        <li>Fazer engenharia reversa ou tentar extrair código-fonte</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Dados e Privacidade</h2>
                    <p>
                        O tratamento de dados pessoais é regido por nossa{' '}
                        <a href="/privacy" className="text-indigo-600 hover:underline">
                            Política de Privacidade
                        </a>
                        , em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                    </p>
                    <p className="mt-4">
                        <strong>Responsabilidades:</strong>
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>
                            <strong>Dentis OS (Operador):</strong> Processa dados conforme instruções da clínica
                        </li>
                        <li>
                            <strong>Clínica (Controlador):</strong> Define finalidades e meios de tratamento dos dados dos pacientes
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
                    <p>
                        Todo o conteúdo da Plataforma (código, design, textos, logos) é propriedade do Dentis OS
                        ou de seus licenciadores e está protegido por leis de direitos autorais.
                    </p>
                    <p className="mt-4">
                        <strong>Seus Dados:</strong> Você mantém todos os direitos sobre os dados que insere na Plataforma.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
                    <p>
                        A Plataforma é fornecida "como está". Não garantimos:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>Disponibilidade ininterrupta ou livre de erros</li>
                        <li>Resultados específicos do uso da Plataforma</li>
                        <li>Compatibilidade com todos os dispositivos</li>
                    </ul>
                    <p className="mt-4">
                        <strong>Importante:</strong> O Dentis OS não substitui o julgamento clínico profissional.
                        Decisões médicas são de responsabilidade exclusiva do profissional de saúde.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Rescisão</h2>
                    <p>
                        Podemos suspender ou encerrar sua conta se:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>Você violar estes Termos de Serviço</li>
                        <li>Houver atividade fraudulenta ou suspeita</li>
                        <li>Você solicitar o cancelamento</li>
                    </ul>
                    <p className="mt-4">
                        Após o encerramento, você terá 30 dias para exportar seus dados antes da exclusão permanente.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">9. Modificações</h2>
                    <p>
                        Reservamo-nos o direito de modificar estes termos a qualquer momento.
                        Notificaremos sobre mudanças significativas por e-mail ou através da Plataforma.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">10. Lei Aplicável</h2>
                    <p>
                        Estes termos são regidos pelas leis da República Federativa do Brasil.
                        Qualquer disputa será resolvida nos tribunais de [CIDADE], Brasil.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
                    <p>
                        Para dúvidas sobre estes Termos de Serviço:
                    </p>
                    <ul className="list-none mt-4">
                        <li><strong>E-mail:</strong> legal@dentis.com.br</li>
                        <li><strong>Endereço:</strong> [ENDEREÇO COMPLETO]</li>
                    </ul>
                </section>

                <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                        <strong>Nota Legal:</strong> Este documento é um modelo e deve ser revisado por um advogado
                        especializado em direito digital e LGPD antes do uso em produção.
                    </p>
                </div>
            </div>
        </div>
    );
};
