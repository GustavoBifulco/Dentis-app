
// import { db } from '../db';
import { procedures, inventory, patients, templateProcedures, templateInventory } from '../db/schema';
import { eq } from 'drizzle-orm';

// Hardcoded defaults in case template tables are empty
const DEFAULT_PROCEDURES = [
    { name: 'Ajuste Oclusal por Acréscimo', code: '001', price: '200.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Ajuste Oclusal por Acréscimo.', duration: 60, category: 'Profilaxia & Periodontia' },
    { name: 'Ajuste Oclusal por desgaste', code: '002', price: '200.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Ajuste Oclusal por desgaste.', duration: 60, category: 'Profilaxia & Periodontia' },
    // Truncated for brevity, applying pattern to all...

    { name: 'Alveoloplastia', code: '003', price: '300.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Alveoloplastia.', duration: 60, category: 'Cirurgia' },
    { name: 'Aplicação de Cariostático', code: '004', price: '100.00', cost: '0.00', description: 'Procedimento preventivo para controle de placa, cárie e saúde bucal: Aplicação de Cariostático.', duration: 60, category: 'Preventivo' },
    { name: 'Aplicação de Ozônio Intra-articular com PRP Gel', code: '005', price: '200.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Aplicação de Ozônio Intra-articular com PRP Gel.', duration: 60, category: 'Diagnóstico' },
    { name: 'Aplicação de Ozonoterapia em ATM', code: '006', price: '200.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Aplicação de Ozonoterapia em ATM.', duration: 60, category: 'Diagnóstico' },
    { name: 'Aplicação de selante', code: '007', price: '250.00', cost: '0.00', description: 'Procedimento preventivo para controle de placa, cárie e saúde bucal: Aplicação de selante.', duration: 60, category: 'Preventivo' },
    { name: 'Aplicação de Verniz Fluoretado', code: '008', price: '150.00', cost: '0.00', description: 'Procedimento preventivo para controle de placa, cárie e saúde bucal: Aplicação de Verniz Fluoretado.', duration: 60, category: 'Preventivo' },
    { name: 'Aprofundamento de vestíbulo', code: '009', price: '300.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Aprofundamento de vestíbulo.', duration: 60, category: 'Cirurgia' },
    { name: 'Aprofundamento de sulco', code: '010', price: '300.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Aprofundamento de sulco.', duration: 60, category: 'Cirurgia' },
    { name: 'Aumentar coroa clínica', code: '011', price: '300.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Aumentar coroa clínica.', duration: 60, category: 'Cirurgia' },
    { name: 'Biópsia', code: '012', price: '450.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Biópsia.', duration: 60, category: 'Cirurgia' },
    { name: 'Bruxismo - placa miorelaxante', code: '013', price: '650.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: Bruxismo - placa miorelaxante.', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'Bruxismo - Aplicação Toxina Botulínica', code: '014', price: '1500.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Bruxismo - Aplicação Toxina Botulínica.', duration: 60, category: 'Diagnóstico' },
    { name: 'Bruxismo - Avaliação', code: '015', price: '150.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Bruxismo - Avaliação.', duration: 60, category: 'Diagnóstico' },
    { name: 'Capeamento pulpar', code: '016', price: '250.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Capeamento pulpar.', duration: 60, category: 'Restaurador' },
    { name: 'Carvão ativado - Clareamento', code: '017', price: '250.00', cost: '0.00', description: 'Procedimento estético odontológico conforme indicação: Carvão ativado - Clareamento.', duration: 60, category: 'Estética' },
    { name: 'Cirurgia de retração gengival', code: '018', price: '450.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Cirurgia de retração gengival.', duration: 60, category: 'Profilaxia & Periodontia' },
    { name: 'Cirurgia de retalho', code: '019', price: '450.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Cirurgia de retalho.', duration: 60, category: 'Cirurgia' },
    { name: 'Cirurgia periodontal', code: '020', price: '450.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Cirurgia periodontal.', duration: 60, category: 'Profilaxia & Periodontia' },
    { name: 'Clareamento consultório', code: '021', price: '650.00', cost: '0.00', description: 'Procedimento estético odontológico conforme indicação: Clareamento consultório.', duration: 60, category: 'Estética' },
    { name: 'Clareamento caseiro', code: '022', price: '550.00', cost: '0.00', description: 'Procedimento estético odontológico conforme indicação: Clareamento caseiro.', duration: 60, category: 'Estética' },
    { name: 'Coroa cerâmica', code: '023', price: '1600.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: Coroa cerâmica.', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'Coroa provisória', code: '024', price: '250.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: Coroa provisória.', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'Coroa total metalocerâmica', code: '025', price: '1200.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: Coroa total metalocerâmica.', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'Coroa total metalopástica', code: '026', price: '950.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: Coroa total metalopástica.', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'Coroa total zircônia', code: '027', price: '1800.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: Coroa total zircônia.', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'Curativo endodôntico', code: '028', price: '150.00', cost: '0.00', description: 'Procedimento endodôntico realizado conforme indicação: Curativo endodôntico.', duration: 60, category: 'Endodontia' },
    { name: 'Dente do siso - extração', code: '029', price: '450.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Dente do siso - extração.', duration: 60, category: 'Cirurgia' },
    { name: 'Dente do siso incluso - extração', code: '030', price: '650.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Dente do siso incluso - extração.', duration: 60, category: 'Cirurgia' },
    { name: 'Dentística - restauração com resina 1 face', code: '031', price: '250.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Dentística - restauração com resina 1 face.', duration: 60, category: 'Restaurador' },
    { name: 'Dentística - restauração com resina 2 faces', code: '032', price: '300.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Dentística - restauração com resina 2 faces.', duration: 60, category: 'Restaurador' },
    { name: 'Dentística - restauração com resina 3 faces', code: '033', price: '350.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Dentística - restauração com resina 3 faces.', duration: 60, category: 'Restaurador' },
    { name: 'Dentística - restauração com resina 4 faces', code: '034', price: '400.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Dentística - restauração com resina 4 faces.', duration: 60, category: 'Restaurador' },
    { name: 'Dentística - restauração com resina 5 faces', code: '035', price: '450.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Dentística - restauração com resina 5 faces.', duration: 60, category: 'Restaurador' },
    { name: 'Dentística - restauração com resina 6 faces', code: '036', price: '500.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Dentística - restauração com resina 6 faces.', duration: 60, category: 'Restaurador' },
    { name: 'Dentística - restauração com resina anterior', code: '037', price: '350.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Dentística - restauração com resina anterior.', duration: 60, category: 'Restaurador' },
    { name: 'Dentística - restauração com resina posterior', code: '038', price: '350.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Dentística - restauração com resina posterior.', duration: 60, category: 'Restaurador' },
    { name: 'Dentística - restauração provisória', code: '039', price: '150.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Dentística - restauração provisória.', duration: 60, category: 'Restaurador' },
    { name: 'Diagnóstico de Bruxismo', code: '040', price: '250.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Diagnóstico de Bruxismo.', duration: 60, category: 'Diagnóstico' },
    { name: 'Endodontia - retratamento (incisivo/canino)', code: '041', price: '750.00', cost: '0.00', description: 'Procedimento endodôntico realizado conforme indicação: Endodontia - retratamento (incisivo/canino).', duration: 60, category: 'Endodontia' },
    { name: 'Endodontia - retratamento (pré-molar)', code: '042', price: '850.00', cost: '0.00', description: 'Procedimento endodôntico realizado conforme indicação: Endodontia - retratamento (pré-molar).', duration: 60, category: 'Endodontia' },
    { name: 'Endodontia - retratamento (molar)', code: '043', price: '950.00', cost: '0.00', description: 'Procedimento endodôntico realizado conforme indicação: Endodontia - retratamento (molar).', duration: 60, category: 'Endodontia' },
    { name: 'Endodontia - tratamento (incisivo/canino)', code: '044', price: '650.00', cost: '0.00', description: 'Procedimento endodôntico realizado conforme indicação: Endodontia - tratamento (incisivo/canino).', duration: 60, category: 'Endodontia' },
    { name: 'Endodontia - tratamento (pré-molar)', code: '045', price: '750.00', cost: '0.00', description: 'Procedimento endodôntico realizado conforme indicação: Endodontia - tratamento (pré-molar).', duration: 60, category: 'Endodontia' },
    { name: 'Endodontia - tratamento (molar)', code: '046', price: '850.00', cost: '0.00', description: 'Procedimento endodôntico realizado conforme indicação: Endodontia - tratamento (molar).', duration: 60, category: 'Endodontia' },
    { name: 'Enxerto ósseo', code: '047', price: '1200.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Enxerto ósseo.', duration: 60, category: 'Cirurgia' },
    { name: 'Exodontia simples', code: '048', price: '300.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia simples.', duration: 60, category: 'Cirurgia' },
    { name: 'Exodontia complexa', code: '049', price: '450.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia complexa.', duration: 60, category: 'Cirurgia' },
    { name: 'Faceta em resina', code: '050', price: '450.00', cost: '0.00', description: 'Procedimento estético odontológico conforme indicação: Faceta em resina.', duration: 60, category: 'Estética' },
    { name: 'Faceta em porcelana', code: '051', price: '1800.00', cost: '0.00', description: 'Procedimento estético odontológico conforme indicação: Faceta em porcelana.', duration: 60, category: 'Estética' },
    { name: 'Frenectomia labial', code: '052', price: '450.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Frenectomia labial.', duration: 60, category: 'Cirurgia' },
    { name: 'Frenectomia lingual', code: '053', price: '450.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Frenectomia lingual.', duration: 60, category: 'Cirurgia' },
    { name: 'Gengivoplastia', code: '054', price: '450.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Gengivoplastia.', duration: 60, category: 'Profilaxia & Periodontia' },
    { name: 'Hemissecção', code: '055', price: '450.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Hemissecção.', duration: 60, category: 'Cirurgia' },
    { name: 'Implante unitário', code: '056', price: '3500.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Implante unitário.', duration: 60, category: 'Cirurgia' },
    { name: 'Implante protocolo', code: '057', price: '15000.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Implante protocolo.', duration: 60, category: 'Cirurgia' },
    { name: 'Implante múltiplo', code: '058', price: '6500.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Implante múltiplo.', duration: 60, category: 'Cirurgia' },
    { name: 'Limpeza (profilaxia)', code: '059', price: '200.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Limpeza (profilaxia).', duration: 60, category: 'Profilaxia & Periodontia' },
    { name: 'Manutenção de aparelho', code: '060', price: '150.00', cost: '0.00', description: 'Procedimento ortodôntico realizado conforme indicação: Manutenção de aparelho.', duration: 60, category: 'Ortodontia' },
    { name: 'Manutenção de contenção', code: '061', price: '150.00', cost: '0.00', description: 'Procedimento ortodôntico realizado conforme indicação: Manutenção de contenção.', duration: 60, category: 'Ortodontia' },
    { name: 'Manutenção periodontal', code: '062', price: '250.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Manutenção periodontal.', duration: 60, category: 'Profilaxia & Periodontia' },
    { name: 'Odontopediatria - consulta', code: '063', price: '200.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Odontopediatria - consulta.', duration: 60, category: 'Odontopediatria' },
    { name: 'Odontopediatria - aplicação flúor', code: '064', price: '150.00', cost: '0.00', description: 'Procedimento preventivo para controle de placa, cárie e saúde bucal: Odontopediatria - aplicação flúor.', duration: 60, category: 'Odontopediatria' },
    { name: 'Odontopediatria - selante', code: '065', price: '250.00', cost: '0.00', description: 'Procedimento preventivo para controle de placa, cárie e saúde bucal: Odontopediatria - selante.', duration: 60, category: 'Odontopediatria' },
    { name: 'Odontopediatria - restauração', code: '066', price: '250.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Odontopediatria - restauração.', duration: 60, category: 'Odontopediatria' },
    { name: 'Ortodontia - documentação', code: '067', price: '450.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Ortodontia - documentação.', duration: 60, category: 'Ortodontia' },
    { name: 'Ortodontia - instalação aparelho', code: '068', price: '1200.00', cost: '0.00', description: 'Procedimento ortodôntico realizado conforme indicação: Ortodontia - instalação aparelho.', duration: 60, category: 'Ortodontia' },
    { name: 'Ortodontia - aparelho móvel', code: '069', price: '950.00', cost: '0.00', description: 'Procedimento ortodôntico realizado conforme indicação: Ortodontia - aparelho móvel.', duration: 60, category: 'Ortodontia' },
    { name: 'Ortodontia - contenção', code: '070', price: '650.00', cost: '0.00', description: 'Procedimento ortodôntico realizado conforme indicação: Ortodontia - contenção.', duration: 60, category: 'Ortodontia' },
    { name: 'Ortodontia - alinhadores', code: '071', price: '6500.00', cost: '0.00', description: 'Procedimento ortodôntico realizado conforme indicação: Ortodontia - alinhadores.', duration: 60, category: 'Ortodontia' },
    { name: 'PPR (prótese parcial removível)', code: '072', price: '1600.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: PPR (prótese parcial removível).', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'PPF (prótese fixa)', code: '073', price: '1800.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: PPF (prótese fixa).', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'Placa de clareamento', code: '074', price: '250.00', cost: '0.00', description: 'Procedimento estético odontológico conforme indicação: Placa de clareamento.', duration: 60, category: 'Estética' },
    { name: 'Placa de bruxismo', code: '075', price: '650.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: Placa de bruxismo.', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'Ponte fixa', code: '076', price: '3500.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: Ponte fixa.', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'Prótese total', code: '077', price: '2500.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: Prótese total.', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'Raspagem subgengival (por quadrante)', code: '078', price: '350.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Raspagem subgengival (por quadrante).', duration: 60, category: 'Profilaxia & Periodontia' },
    { name: 'Raspagem supragengival', code: '079', price: '250.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Raspagem supragengival.', duration: 60, category: 'Profilaxia & Periodontia' },
    { name: 'Remoção de cálculo', code: '080', price: '200.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Remoção de cálculo.', duration: 60, category: 'Profilaxia & Periodontia' },
    { name: 'Retratamento endodôntico', code: '081', price: '850.00', cost: '0.00', description: 'Procedimento endodôntico realizado conforme indicação: Retratamento endodôntico.', duration: 60, category: 'Endodontia' },
    { name: 'Restauração em ionômero', code: '082', price: '250.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Restauração em ionômero.', duration: 60, category: 'Restaurador' },
    { name: 'Restauração em resina', code: '083', price: '250.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Restauração em resina.', duration: 60, category: 'Restaurador' },
    { name: 'Restauração provisória', code: '084', price: '150.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Restauração provisória.', duration: 60, category: 'Restaurador' },
    { name: 'Reembasamento de prótese', code: '085', price: '450.00', cost: '0.00', description: 'Procedimento odontológico relacionado a prótese/reabilitação e moldagem: Reembasamento de prótese.', duration: 60, category: 'Prótese & Moldagem' },
    { name: 'Remoção de tártaro', code: '086', price: '200.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Remoção de tártaro.', duration: 60, category: 'Profilaxia & Periodontia' },
    { name: 'Urgência - consulta', code: '087', price: '250.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Urgência - consulta.', duration: 60, category: 'Diagnóstico' },
    { name: 'Urgência - curativo', code: '088', price: '200.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Urgência - curativo.', duration: 60, category: 'Diagnóstico' },
    { name: 'Urgência - drenagem', code: '089', price: '300.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Urgência - drenagem.', duration: 60, category: 'Diagnóstico' },
    { name: 'Urgência - medicação', code: '090', price: '150.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Urgência - medicação.', duration: 60, category: 'Diagnóstico' },
    { name: 'Urgência - abertura endodôntica', code: '091', price: '350.00', cost: '0.00', description: 'Procedimento endodôntico realizado conforme indicação: Urgência - abertura endodôntica.', duration: 60, category: 'Endodontia' },
    { name: 'Urgência - restauração provisória', code: '092', price: '200.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Urgência - restauração provisória.', duration: 60, category: 'Restaurador' },
    { name: 'Urgência - ajuste oclusal', code: '093', price: '200.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Urgência - ajuste oclusal.', duration: 60, category: 'Profilaxia & Periodontia' },
    { name: 'Urgência - exodontia', code: '094', price: '350.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Urgência - exodontia.', duration: 60, category: 'Cirurgia' },
    { name: 'Urgência - sutura', code: '095', price: '250.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Urgência - sutura.', duration: 60, category: 'Cirurgia' },
    { name: 'Urgência - remoção de ponto', code: '096', price: '100.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Urgência - remoção de ponto.', duration: 60, category: 'Cirurgia' },
    { name: 'Exame Laboratorial (solicitação/avaliação)', code: '097', price: '150.00', cost: '0.00', description: 'Exames e testes para apoio diagnóstico odontológico: Exame Laboratorial (solicitação/avaliação).', duration: 60, category: 'Diagnóstico' },
    { name: 'Teste de sensibilidade pulpar', code: '098', price: '100.00', cost: '0.00', description: 'Exames e testes para apoio diagnóstico odontológico: Teste de sensibilidade pulpar.', duration: 60, category: 'Diagnóstico' },
    { name: 'Teste de oclusão', code: '099', price: '100.00', cost: '0.00', description: 'Exames e testes para apoio diagnóstico odontológico: Teste de oclusão.', duration: 60, category: 'Diagnóstico' },
    { name: 'Teste de saliva', code: '100', price: '100.00', cost: '0.00', description: 'Exames e testes para apoio diagnóstico odontológico: Teste de saliva.', duration: 60, category: 'Diagnóstico' },
];

const DEFAULT_INVENTORY = [
    { name: 'Fio de Sutura Seda', category: 'Cirurgia', quantity: 0, unit: 'Caixa (24un)', minLevel: 0, price: 120 },
    { name: 'Papel Articular', category: 'Restaurador', quantity: 0, unit: 'Bloco', minLevel: 0, price: 35 },
    { name: 'Alveolótomo', category: 'Cirurgia', quantity: 0, unit: 'un', minLevel: 0, price: 180 },
    { name: 'Alginato (454g)', category: 'Prótese & Moldagem', quantity: 0, unit: 'un (pacote)', minLevel: 0, price: 45 },
    { name: 'Gaze Estéril', category: 'Descartáveis', quantity: 0, unit: 'un', minLevel: 0, price: 2.5 },
    { name: 'Luva Cirúrgica Estéril', category: 'Biossegurança', quantity: 0, unit: 'par', minLevel: 0, price: 4.5 },
    { name: 'Cariostático', category: 'Preventivo', quantity: 0, unit: 'ml', minLevel: 0, price: 3 },
    { name: 'Anestésico Tópico (Benzocaína)', category: 'Anestesia', quantity: 0, unit: 'Pote', minLevel: 0, price: 25 },
    { name: 'Selante Resinoso', category: 'Restaurador', quantity: 0, unit: 'seringa', minLevel: 0, price: 70 },
    { name: 'Indicador Biológico (Teste Autoclave)', category: 'Esterilização', quantity: 0, unit: 'Caixa (10un)', minLevel: 0, price: 45 },
    { name: 'Broca Diamantada Cilíndrica', category: 'Instrumentais Rotatórios', quantity: 0, unit: 'Unidade', minLevel: 0, price: 8 },
    { name: 'Mini-implante Ortodôntico', category: 'Ortodontia', quantity: 0, unit: 'un', minLevel: 0, price: 35 },
    { name: 'Alginato', category: 'Prótese & Moldagem', quantity: 0, unit: 'Pacote', minLevel: 0, price: 60 },
    { name: 'Bráquetes Metálicos (Caso)', category: 'Ortodontia', quantity: 0, unit: 'Cartela', minLevel: 0, price: 120 },
    { name: 'Fio Dental Profissional', category: 'Profilaxia & Periodontia', quantity: 0, unit: 'm', minLevel: 0, price: 0.4 },
    { name: 'Hipoclorito de Sódio 2.5% e 5%', category: 'Endodontia', quantity: 0, unit: 'ml', minLevel: 0, price: 0.03 },
    { name: 'Selante Resinoso', category: 'Restaurador', quantity: 0, unit: 'ml', minLevel: 0, price: 12 },
    { name: 'Soro Fisiológico 0.9%', category: 'Soluções', quantity: 0, unit: 'ml', minLevel: 0, price: 0.01 },
    { name: 'Taça de Borracha / Escova Robson', category: 'Profilaxia & Periodontia', quantity: 0, unit: 'un', minLevel: 0, price: 2.5 },
    { name: 'Ácido Fosfórico 37%', category: 'Restaurador', quantity: 0, unit: 'un (seringa)', minLevel: 0, price: 25 },
    { name: 'Broca Transmetal', category: 'Instrumentais Rotatórios', quantity: 0, unit: 'Unidade', minLevel: 0, price: 30 },
    { name: 'Gás Ozônio (Cilindro O3)', category: 'Equipamentos & Gases', quantity: 0, unit: 'un', minLevel: 0, price: 450 },
    { name: 'Silicone de Condensação (Kit)', category: 'Prótese & Moldagem', quantity: 0, unit: 'Kit', minLevel: 0, price: 90 },
    { name: 'Filme Periapical (Adulto/Infantil)', category: 'Radiologia', quantity: 0, unit: 'un', minLevel: 0, price: 3.5 },
    { name: 'Pasta Profilática', category: 'Profilaxia & Periodontia', quantity: 0, unit: 'Bisnaga', minLevel: 0, price: 18 },
    { name: 'Máscara N95/PFF2', category: 'Biossegurança', quantity: 0, unit: 'Unidade', minLevel: 0, price: 6 },
    { name: 'Seringa Insulina', category: 'Descartáveis', quantity: 0, unit: 'unidade', minLevel: 0, price: 1 },
    { name: 'Matriz de Poliéster', category: 'Restaurador', quantity: 0, unit: 'Caixa (50un)', minLevel: 0, price: 25 },
    { name: 'Posicionador Radiográfico', category: 'Radiologia', quantity: 0, unit: 'Kit', minLevel: 0, price: 80 },
    { name: 'Silano', category: 'Restaurador', quantity: 0, unit: 'ml', minLevel: 0, price: 18 },
    { name: 'Arcos Ortodônticos (NiTi/Aço)', category: 'Ortodontia', quantity: 0, unit: 'un', minLevel: 0, price: 12 },
    { name: 'Fio de Sutura Nylon', category: 'Cirurgia', quantity: 0, unit: 'Caixa (24un)', minLevel: 0, price: 95 },
    { name: 'Resina Ortodôntica (Transbond)', category: 'Ortodontia', quantity: 0, unit: 'un', minLevel: 0, price: 320 },
    { name: 'Silano', category: 'Restaurador', quantity: 0, unit: 'Frasco', minLevel: 0, price: 95 },
    { name: 'Fita Indicadora de pH Salivar', category: 'Diagnóstico', quantity: 0, unit: 'un', minLevel: 0, price: 1.5 },
    { name: 'Bolinha de Algodão', category: 'Descartáveis', quantity: 0, unit: 'Pacote (500g)', minLevel: 0, price: 20 },
    { name: 'Cânulas de Preenchimento (22G/25G)', category: 'HOF', quantity: 0, unit: 'un', minLevel: 0, price: 12 },
    { name: 'Toxina Botulínica (50U/100U)', category: 'HOF', quantity: 0, unit: 'Frasco', minLevel: 0, price: 1200 },
    { name: 'Fio Retrator Gengival', category: 'Profilaxia & Periodontia', quantity: 0, unit: 'cm', minLevel: 0, price: 0.15 },
    { name: 'Filme Periapical Adulto', category: 'Radiologia', quantity: 0, unit: 'Caixa', minLevel: 0, price: 180 },
    { name: 'Resina Esmalte A1', category: 'Restaurador', quantity: 0, unit: 'Tubo 4g', minLevel: 0, price: 55 },
    { name: 'Silicone de Adição (Kit)', category: 'Prótese & Moldagem', quantity: 0, unit: 'Kit', minLevel: 0, price: 140 },
    { name: 'Papel Grau Cirúrgico 10cm', category: 'Esterilização', quantity: 0, unit: 'Rolo', minLevel: 0, price: 60 },
    { name: 'Seringas (1/3/5/10/20ml)', category: 'Descartáveis', quantity: 0, unit: 'un', minLevel: 0, price: 0.9 },
    { name: 'Peróxido (Hidrogênio/Carbamida)', category: 'Estética', quantity: 0, unit: 'ml', minLevel: 0, price: 1.2 },
    { name: 'Silano', category: 'Restaurador', quantity: 0, unit: 'ml', minLevel: 0, price: 18 },
    { name: 'Seringa Insulina/Aplicação', category: 'Descartáveis', quantity: 0, unit: 'Pacote', minLevel: 0, price: 25 },
    { name: 'Rolete de Algodão', category: 'Descartáveis', quantity: 0, unit: 'unidade', minLevel: 0, price: 0.03 },
    { name: 'Tira de Lixa (Aço/Poliéster)', category: 'Restaurador', quantity: 0, unit: 'un', minLevel: 0, price: 0.6 },
    { name: 'Vaselina Sólida', category: 'Auxiliares', quantity: 0, unit: 'g', minLevel: 0, price: 0.08 },
    { name: 'Luva de Procedimento (PP/P/M/G)', category: 'Biossegurança', quantity: 0, unit: 'par', minLevel: 0, price: 1.2 },
    { name: 'Resina Composta (Esm/Dent/Flow)', category: 'Restaurador', quantity: 0, unit: 'g', minLevel: 0, price: 14 },
    { name: 'Dessensibilizante Dentário', category: 'Restaurador', quantity: 0, unit: 'ml', minLevel: 0, price: 6 },
    { name: 'Silicone Adição / Condensação', category: 'Prótese & Moldagem', quantity: 0, unit: 'ml', minLevel: 0, price: 0.25 },
    { name: 'Ácido Deoxicólico (Enzima de Papada)', category: 'HOF', quantity: 0, unit: 'ml', minLevel: 0, price: 35 },
    { name: 'Silicone de Adição', category: 'Prótese & Moldagem', quantity: 0, unit: 'ml', minLevel: 0, price: 0.35 },
    { name: 'Agulha de Irrigação Endo', category: 'Endodontia', quantity: 0, unit: 'Pacote', minLevel: 0, price: 25 },
    { name: 'Ácido Hialurônico', category: 'HOF', quantity: 0, unit: 'Seringa', minLevel: 0, price: 650 },
    { name: 'Esponja Hemostática', category: 'Cirurgia', quantity: 0, unit: 'un', minLevel: 0, price: 18 },
    { name: 'Flúor Verniz', category: 'Preventivo', quantity: 0, unit: 'Frasco/Dose', minLevel: 0, price: 10 },
    { name: 'Taça de Borracha', category: 'Profilaxia & Periodontia', quantity: 0, unit: 'Unidade', minLevel: 0, price: 1.8 },
    { name: 'Resina Flow A2', category: 'Restaurador', quantity: 0, unit: 'Seringa 2g', minLevel: 0, price: 45 },
    { name: 'Soro Fisiológico 0.9% (Bolsa 250ml)', category: 'Soluções', quantity: 0, unit: 'Bolsa', minLevel: 0, price: 6 },
    { name: 'Adesivo Universal', category: 'Restaurador', quantity: 0, unit: 'Frasco (5ml)', minLevel: 0, price: 160 },
    { name: 'Resina Dentina DA2', category: 'Restaurador', quantity: 0, unit: 'Tubo 4g', minLevel: 0, price: 55 },
    { name: 'Placa de Acetato', category: 'Prótese & Moldagem', quantity: 0, unit: 'unidade', minLevel: 0, price: 8 },
    { name: 'Pino de Fibra de Vidro (Nº 0.5 a 3)', category: 'Restaurador', quantity: 0, unit: 'un', minLevel: 0, price: 22 },
    { name: 'Rolete de Algodão', category: 'Descartáveis', quantity: 0, unit: 'Pacote (100un)', minLevel: 0, price: 3 },
    { name: 'Broca Endo-Z', category: 'Instrumentais Rotatórios', quantity: 0, unit: 'Unidade', minLevel: 0, price: 22 },
    { name: 'Avental Descartável Manga Longa', category: 'Biossegurança', quantity: 0, unit: 'Pacote (10un)', minLevel: 0, price: 35 },
    { name: 'Ácido Fosfórico 37%', category: 'Restaurador', quantity: 0, unit: 'Kit (3 seringas)', minLevel: 0, price: 60 },
    { name: 'Sugador Descartável (Convencional)', category: 'Descartáveis', quantity: 0, unit: 'Pacote (40un)', minLevel: 0, price: 7 },
    { name: 'Resina Acrílica (Duralay)', category: 'Prótese & Moldagem', quantity: 0, unit: 'grama', minLevel: 0, price: 0.6 },
    { name: 'Óculos de Proteção', category: 'Biossegurança', quantity: 0, unit: 'Unidade', minLevel: 0, price: 18 },
    { name: 'Resina Esmalte', category: 'Restaurador', quantity: 0, unit: 'grama', minLevel: 0, price: 14 },
    { name: 'Cone de Papel', category: 'Endodontia', quantity: 0, unit: 'Caixa', minLevel: 0, price: 35 },
    { name: 'Taça de Borracha', category: 'Profilaxia & Periodontia', quantity: 0, unit: 'unidade', minLevel: 0, price: 1.8 },
    { name: 'Copo Descartável', category: 'Descartáveis', quantity: 0, unit: 'Pacote (100un)', minLevel: 0, price: 6 },
    { name: 'Fio/Arco NiTi', category: 'Ortodontia', quantity: 0, unit: 'Pacote', minLevel: 0, price: 80 },
    { name: 'Membrana Colágeno', category: 'Cirurgia', quantity: 0, unit: 'Unidade', minLevel: 0, price: 220 },
    { name: 'Tira de Lixa de Aço', category: 'Restaurador', quantity: 0, unit: 'unidade', minLevel: 0, price: 0.7 },
    { name: 'Anestésico Articaína 4%', category: 'Anestesia', quantity: 0, unit: 'Caixa (50 tubetes)', minLevel: 0, price: 260 },
    { name: 'Bioestimulador de Colágeno', category: 'HOF', quantity: 0, unit: 'un (frasco)', minLevel: 0, price: 1600 },
    { name: 'Seringa Carpule', category: 'Anestesia', quantity: 0, unit: 'unidade', minLevel: 0, price: 75 },
    { name: 'Torno Expansor', category: 'Ortodontia', quantity: 0, unit: 'unidade', minLevel: 0, price: 180 },
    { name: 'Enxerto Ósseo Bovino', category: 'Cirurgia', quantity: 0, unit: 'Frasco', minLevel: 0, price: 280 },
    { name: 'Matriz Metálica / Poliéster', category: 'Restaurador', quantity: 0, unit: 'un', minLevel: 0, price: 1.2 },
    { name: 'Fio/Arco Aço', category: 'Ortodontia', quantity: 0, unit: 'Pacote', minLevel: 0, price: 45 },
    { name: 'Lâmina de Bisturi (11/12/15/15C)', category: 'Cirurgia', quantity: 0, unit: 'un', minLevel: 0, price: 0.8 },
    { name: 'Detergente Enzimático 5 Enzimas', category: 'Esterilização', quantity: 0, unit: 'Galão (5L)', minLevel: 0, price: 120 },
    { name: 'Clorexidina (0,12% / 2%)', category: 'Profilaxia & Periodontia', quantity: 0, unit: 'ml', minLevel: 0, price: 0.05 },
    { name: 'Limas (Manual/Rotatória/Reciproc.)', category: 'Endodontia', quantity: 0, unit: 'un', minLevel: 0, price: 7 },
    { name: 'Líquido Fixador', category: 'Radiologia', quantity: 0, unit: 'Frasco', minLevel: 0, price: 12 },
    { name: 'Verniz Fluoretado', category: 'Preventivo', quantity: 0, unit: 'ml', minLevel: 0, price: 2.5 },
    { name: 'Hipoclorito de Sódio 2.5%', category: 'Endodontia', quantity: 0, unit: 'Frasco (1L)', minLevel: 0, price: 18 },
    { name: 'Formocresol', category: 'Endodontia', quantity: 0, unit: 'ml', minLevel: 0, price: 4 },
    { name: 'Cimento Endodôntico (Ah Plus/Eugenol)', category: 'Endodontia', quantity: 0, unit: 'Kit', minLevel: 0, price: 220 },
    { name: 'Cimento Ionômero de Vidro (Cimentação)', category: 'Restaurador', quantity: 0, unit: 'Kit', minLevel: 0, price: 160 },
    { name: 'Sugador (Convenc./Cirúrgico)', category: 'Descartáveis', quantity: 0, unit: 'un', minLevel: 0, price: 0.25 },
    { name: 'Água Destilada', category: 'Soluções', quantity: 0, unit: 'ml', minLevel: 0, price: 0.005 },
];

export const seedDefaultData = async (organizationId: string) => {
    const { db } = await import("../db");

    try {
        // Check if data already exists to avoid duplication
        const existingProcedures = await db.select().from(procedures).where(eq(procedures.organizationId, organizationId)).limit(1);

        if (existingProcedures.length > 0) {
            console.log(`⚠️ Data already exists for org ${organizationId}, skipping seed.`);
            return { success: true, skipped: true };
        }

        // 1. Procedimentos via Template OU Fallback
        let procsToInsert: any[] = [];

        try {
            const tProcs = await db.select().from(templateProcedures);
            if (tProcs.length > 0) {
                procsToInsert = tProcs.map(t => ({
                    name: t.name,
                    description: t.description,
                    category: t.category,
                    price: t.price,
                    duration: t.duration,
                    organizationId,
                }));
                console.log(`✅ Fetched ${procsToInsert.length} procedures from DB templates`);
            }
        } catch (err) {
            console.warn('⚠️ Could not fetch from template_procedures table, using fallback.', err);
        }

        // Se vazia, usa hardcoded
        if (procsToInsert.length === 0) {
            console.log('Using hardcoded default procedures.');
            procsToInsert = DEFAULT_PROCEDURES.map(p => ({
                name: p.name,
                description: p.description,
                category: p.category,
                price: p.price,
                duration: p.duration,
                code: (p as any).code,
                cost: (p as any).cost,
                organizationId
            }));
        }

        if (procsToInsert.length > 0) {
            await db.insert(procedures).values(procsToInsert);
            console.log(`✅ ${procsToInsert.length} procedures inserted.`);
        }

        // 2. Estoque via Template OU Fallback
        let invToInsert: any[] = [];

        try {
            const tInv = await db.select().from(templateInventory);
            if (tInv.length > 0) {
                invToInsert = tInv.map(t => ({
                    name: t.name,
                    category: t.category,
                    quantity: t.quantity,
                    minQuantity: t.minQuantity,
                    unit: t.unit,
                    price: t.price,
                    supplier: t.supplier,
                    link: t.link,
                    organizationId,
                }));
                console.log(`✅ Fetched ${invToInsert.length} inventory items from DB templates`);
            }
        } catch (err) {
            console.warn('⚠️ Could not fetch from template_inventory table, using fallback.', err);
        }

        // Fallback
        if (invToInsert.length === 0) {
            console.log('Using hardcoded default inventory.');
            invToInsert = DEFAULT_INVENTORY.map(i => ({
                name: i.name,
                category: i.category,
                quantity: i.quantity,
                minQuantity: (i as any).minLevel || (i as any).minQuantity || 0,
                unit: i.unit,
                price: (i as any).price,
                organizationId
            }));
        }

        if (invToInsert.length > 0) {
            await db.insert(inventory).values(invToInsert);
            console.log(`✅ ${invToInsert.length} inventory items inserted.`);
        }


        return { success: true };
    } catch (error) {
        console.error('❌ Error seeding default data:', error);
        // Não lança erro para não bloquear o onboarding se o seed falhar
        return { success: false, error };
    }
};
