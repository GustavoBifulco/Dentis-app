import React from 'react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

            <div className="prose prose-slate max-w-none">
                <p className="text-sm text-gray-500 mb-8">
                    <strong>Última atualização:</strong> 04 de fevereiro de 2026
                </p>

                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 mb-8">
                    <p className="font-semibold text-indigo-900">
                        Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)
                    </p>
                </div>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Controlador e Operador de Dados</h2>
                    <p>
                        <strong>Controlador:</strong> A clínica odontológica que utiliza o Dentis OS é o controlador dos dados dos pacientes,
                        definindo as finalidades e meios de tratamento.
                    </p>
                    <p className="mt-4">
                        <strong>Operador:</strong> Dentis OS atua como operador, processando dados conforme instruções da clínica.
                    </p>
                    <ul className="list-none mt-4">
                        <li><strong>Encarregado (DPO):</strong> dpo@dentis.com.br</li>
                        <li><strong>Contato:</strong> privacy@dentis.com.br</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Dados Coletados</h2>

                    <h3 className="text-xl font-semibold mt-6 mb-3">2.1. Dados de Profissionais (Dentistas/Equipe)</h3>
                    <ul className="list-disc pl-6">
                        <li>Nome completo, CPF, e-mail, telefone</li>
                        <li>Credenciais de acesso (senha criptografada)</li>
                        <li>Dados de uso da plataforma (logs de acesso)</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-3">2.2. Dados de Pacientes</h3>
                    <ul className="list-disc pl-6">
                        <li><strong>Dados Pessoais:</strong> Nome, CPF, RG, CNS, data de nascimento, endereço, telefone, e-mail</li>
                        <li><strong>Dados Sensíveis (Saúde):</strong> Histórico médico, alergias, medicamentos, prontuários odontológicos,
                            exames, prescrições, consentimentos</li>
                        <li><strong>Dados Financeiros:</strong> Histórico de pagamentos, planos de tratamento</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-3">2.3. Dados Técnicos</h3>
                    <ul className="list-disc pl-6">
                        <li>Endereço IP, navegador, dispositivo</li>
                        <li>Cookies e tecnologias similares</li>
                        <li>Logs de auditoria e segurança</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Finalidades do Tratamento</h2>
                    <p>
                        Coletamos e processamos dados para:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li><strong>Prestação de Serviços:</strong> Gestão de consultas, prontuários eletrônicos, agendamentos</li>
                        <li><strong>Conformidade Legal:</strong> Cumprimento de obrigações legais (CFO, Receita Federal, LGPD)</li>
                        <li><strong>Segurança:</strong> Prevenção de fraudes, proteção de dados, auditoria</li>
                        <li><strong>Melhoria do Serviço:</strong> Análise de uso, desenvolvimento de funcionalidades</li>
                        <li><strong>Comunicação:</strong> Notificações de consultas, lembretes, suporte</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Base Legal (LGPD Art. 7º e 11º)</h2>
                    <table className="min-w-full border border-gray-300 mt-4">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left">Finalidade</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Base Legal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">Prestação de serviços de saúde</td>
                                <td className="border border-gray-300 px-4 py-2">Execução de contrato (Art. 7º, V) + Tutela da saúde (Art. 11º, II, f)</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">Armazenamento de prontuários</td>
                                <td className="border border-gray-300 px-4 py-2">Obrigação legal (CFO 153/2013 - 20 anos)</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">Comunicação com pacientes</td>
                                <td className="border border-gray-300 px-4 py-2">Consentimento (Art. 7º, I)</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">Segurança e auditoria</td>
                                <td className="border border-gray-300 px-4 py-2">Legítimo interesse (Art. 7º, IX)</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Compartilhamento de Dados</h2>
                    <p>
                        Seus dados podem ser compartilhados com:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li><strong>Prestadores de Serviço:</strong> Hospedagem (AWS/Cloudflare), autenticação (Clerk),
                            pagamentos (Stripe) - sob contratos de confidencialidade</li>
                        <li><strong>Autoridades:</strong> Quando exigido por lei ou ordem judicial</li>
                        <li><strong>Laboratórios:</strong> Apenas dados necessários para execução de serviços (com consentimento)</li>
                    </ul>
                    <p className="mt-4">
                        <strong>Não vendemos ou alugamos seus dados a terceiros.</strong>
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Retenção de Dados</h2>
                    <table className="min-w-full border border-gray-300 mt-4">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left">Tipo de Dado</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Período de Retenção</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">Prontuários odontológicos</td>
                                <td className="border border-gray-300 px-4 py-2"><strong>Mínimo 20 anos</strong> (CFO 153/2013)</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">Dados financeiros</td>
                                <td className="border border-gray-300 px-4 py-2">5 anos (Código Civil)</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">Logs de auditoria</td>
                                <td className="border border-gray-300 px-4 py-2">6 meses (LGPD Art. 37)</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">Dados de cadastro (sem prontuário)</td>
                                <td className="border border-gray-300 px-4 py-2">Até solicitação de exclusão</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Seus Direitos (LGPD Art. 18)</h2>
                    <p>
                        Você tem direito a:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li><strong>Acesso:</strong> Confirmar e acessar seus dados</li>
                        <li><strong>Correção:</strong> Corrigir dados incompletos ou desatualizados</li>
                        <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                        <li><strong>Exclusão:</strong> Solicitar exclusão de dados (exceto quando houver obrigação legal de retenção)</li>
                        <li><strong>Revogação de Consentimento:</strong> Retirar consentimento a qualquer momento</li>
                        <li><strong>Oposição:</strong> Opor-se a tratamentos baseados em legítimo interesse</li>
                    </ul>
                    <p className="mt-4">
                        <strong>Como exercer:</strong> Entre em contato com dpo@dentis.com.br ou através da plataforma em "Configurações → Privacidade"
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Segurança</h2>
                    <p>
                        Implementamos medidas técnicas e organizacionais para proteger seus dados:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>Criptografia em trânsito (HTTPS/TLS) e em repouso</li>
                        <li>Autenticação multifator (MFA) disponível</li>
                        <li>Controle de acesso baseado em funções (RBAC)</li>
                        <li>Logs de auditoria para rastreabilidade</li>
                        <li>Backups regulares e plano de recuperação de desastres</li>
                        <li>Testes de segurança e atualizações periódicas</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">9. Cookies</h2>
                    <p>
                        Utilizamos cookies para:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li><strong>Essenciais:</strong> Autenticação, segurança (não requerem consentimento)</li>
                        <li><strong>Funcionais:</strong> Preferências de idioma, tema (requerem consentimento)</li>
                        <li><strong>Analíticos:</strong> Análise de uso (requerem consentimento)</li>
                    </ul>
                    <p className="mt-4">
                        Você pode gerenciar cookies através do banner de consentimento ou nas configurações do navegador.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">10. Transferência Internacional</h2>
                    <p>
                        Alguns de nossos prestadores de serviço (ex: AWS, Clerk) podem armazenar dados fora do Brasil.
                        Garantimos que essas transferências atendem aos requisitos da LGPD (Art. 33), incluindo:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>Cláusulas contratuais padrão</li>
                        <li>Certificações de adequação (ex: ISO 27001)</li>
                        <li>Garantias de nível de proteção equivalente ao brasileiro</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">11. Menores de Idade</h2>
                    <p>
                        O tratamento de dados de menores de 18 anos requer consentimento de pelo menos um dos pais ou responsável legal,
                        conforme LGPD Art. 14. A plataforma solicita informações do responsável legal durante o cadastro.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">12. Alterações nesta Política</h2>
                    <p>
                        Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas por e-mail
                        ou através de aviso na plataforma. A data de "Última atualização" será sempre atualizada.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">13. Contato</h2>
                    <ul className="list-none mt-4">
                        <li><strong>Encarregado (DPO):</strong> dpo@dentis.com.br</li>
                        <li><strong>Privacidade:</strong> privacy@dentis.com.br</li>
                        <li><strong>Suporte:</strong> suporte@dentis.com.br</li>
                        <li><strong>Endereço:</strong> [ENDEREÇO COMPLETO]</li>
                    </ul>
                </section>

                <div className="mt-12 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                        <strong>⚠️ Aviso Importante:</strong> Esta Política de Privacidade é um modelo e DEVE ser revisada
                        por um advogado especializado em LGPD e direito digital antes de ser publicada. Ajuste os campos
                        marcados com [PLACEHOLDER] com informações reais da sua organização.
                    </p>
                </div>
            </div>
        </div>
    );
};
