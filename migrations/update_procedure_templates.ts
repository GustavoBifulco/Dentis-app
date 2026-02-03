import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const updateProcedureTemplates = async () => {
    console.log('🔄 Updating template procedures with complete list of 101 procedures...');

    try {
        // First, add missing columns if they don't exist
        await db.execute(sql`
            ALTER TABLE template_procedures 
            ADD COLUMN IF NOT EXISTS category TEXT,
            ADD COLUMN IF NOT EXISTS subcategory TEXT,
            ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60
        `);
        console.log('✅ Columns verified/added to template_procedures');

        // Clear existing template procedures
        await db.execute(sql`DELETE FROM template_procedures`);
        console.log('✅ Cleared old template procedures');

        // Insert ALL 101 procedures
        await db.execute(sql`
            INSERT INTO template_procedures (name, category, subcategory, price, duration, description) VALUES
            ('Ajuste Oclusal por Acréscimo', 'Especializados', 'Periodontia', '200.00', 60, 'Exame de imagem para avaliação e planejamento odontológico: Ajuste Oclusal por Acréscimo.'),
            ('Ajuste Oclusal por desgaste', 'Especializados', 'Periodontia', '200.00', 60, 'Exame de imagem para avaliação e planejamento odontológico: Ajuste Oclusal por desgaste.'),
            ('Alveoloplastia', 'Cirúrgicos', 'Cirurgias', '300.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Alveoloplastia.'),
            ('Aplicação de Cariostático', 'Clínicos Gerais', 'Prevenção', '100.00', 60, 'Procedimento preventivo para controle de placa, cárie e saúde bucal: Aplicação de Cariostático.'),
            ('Aplicação de Ozônio Intra-articular com PRP Gel', 'Clínicos Gerais', 'Consulta', '200.00', 60, 'Avaliação clínica, anamnese e orientação/planejamento conforme necessidade: Aplicação de Ozônio Intra-articular com PRP Gel (1 sessão).'),
            ('Aplicação de Ozônio Intradérmico', 'Clínicos Gerais', 'Consulta', '100.00', 60, 'Avaliação clínica, anamnese e orientação/planejamento conforme necessidade: Aplicação de Ozônio Intradérmico (1 Região) (1 sessão).'),
            ('Aplicação de Selante (por elemento)', 'Especializados', 'Odontopediatria', '200.00', 60, 'Procedimento odontopediátrico, adequado ao atendimento infantil: Aplicação de Selante (por elemento).'),
            ('Aplicação de Selante de Fóssulas e Fissuras', 'Clínicos Gerais', 'Prevenção', '100.00', 60, 'Procedimento preventivo para controle de placa, cárie e saúde bucal: Aplicação de Selante de Fóssulas e Fissuras.'),
            ('Aplicação Sistêmica de Ozônio', 'Clínicos Gerais', 'Consulta', '100.00', 60, 'Avaliação clínica, anamnese e orientação/planejamento conforme necessidade: Aplicação Sistêmica de Ozônio ( 1 sessão).'),
            ('Aplicação Tópica de Flúor', 'Clínicos Gerais', 'Prevenção', '100.00', 60, 'Procedimento preventivo para controle de placa, cárie e saúde bucal: Aplicação Tópica de Flúor.'),
            ('Aplicação Tópica de Verniz Fluoretado', 'Clínicos Gerais', 'Prevenção', '300.00', 60, 'Procedimento preventivo para controle de placa, cárie e saúde bucal: Aplicação Tópica de Verniz Fluoretado.'),
            ('Aumento de Coroa Clínica', 'Especializados', 'Periodontia', '200.00', 60, 'Procedimento periodontal para tratamento dos tecidos de suporte (gengiva/osso): Aumento de Coroa Clínica.'),
            ('Auto-hemoterapia', 'Clínicos Gerais', 'Consulta', '500.00', 60, 'Avaliação clínica, anamnese e orientação/planejamento conforme necessidade: Auto-hemoterapia .'),
            ('Avaliação Estética Facial', 'Estéticos', 'Facetas', '350.00', 60, 'Procedimento estético para melhora de harmonia e aparência do sorriso/face: Avaliação Estética Facial.'),
            ('Avaliação Ortodôntica', 'Especializados', 'Ortodontia', '350.00', 60, 'Procedimento ortodôntico para alinhamento e correção da mordida: Avaliação Ortodôntica.'),
            ('Bichectomia', 'Estéticos', 'Facetas', '3000.00', 60, 'Procedimento estético para melhora de harmonia e aparência do sorriso/face: Bichectomia.'),
            ('Bioestimulador de colágeno', 'Estéticos', 'Facetas', '1000.00', 60, 'Procedimento estético para melhora de harmonia e aparência do sorriso/face: Bioestimulador de colágeno.'),
            ('Bionator de Balters', 'Especializados', 'Ortodontia', '500.00', 60, 'Procedimento ortodôntico para alinhamento e correção da mordida: Bionator de Balters.'),
            ('Biópsia de Boca', 'Cirúrgicos', 'Cirurgias', '200.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Biópsia de Boca.'),
            ('Biópsia de Glândula Salivar', 'Cirúrgicos', 'Cirurgias', '200.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Biópsia de Glândula Salivar.'),
            ('Biópsia de Lábio', 'Cirúrgicos', 'Cirurgias', '200.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Biópsia de Lábio.'),
            ('Biópsia de Língua', 'Cirúrgicos', 'Cirurgias', '200.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Biópsia de Língua.'),
            ('Biópsia de Mandíbula', 'Cirúrgicos', 'Cirurgias', '200.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Biópsia de Mandíbula.'),
            ('Biópsia de Maxila', 'Cirúrgicos', 'Cirurgias', '200.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Biópsia de Maxila.'),
            ('Bridectomia', 'Cirúrgicos', 'Cirurgias', '200.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Bridectomia.'),
            ('Bridotomia', 'Cirúrgicos', 'Cirurgias', '300.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Bridotomia.'),
            ('Cirurgia com Retalho', 'Cirúrgicos', 'Cirurgias', '300.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Cirurgia com Retalho.'),
            ('Cirurgia para Torus Mandibular Bilateral', 'Cirúrgicos', 'Cirurgias', '1000.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Cirurgia para Torus Mandibular Bilateral.'),
            ('Cirurgia para Torus Mandibular Unilateral', 'Cirúrgicos', 'Cirurgias', '1000.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Cirurgia para Torus Mandibular Unilateral.'),
            ('Cirurgia para Torus Palatinio', 'Cirúrgicos', 'Cirurgias', '500.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Cirurgia para Torus Palatinio.'),
            ('Cirurgia Periodontal com Retalho', 'Especializados', 'Periodontia', '500.00', 60, 'Procedimento periodontal para tratamento dos tecidos de suporte (gengiva/osso): Cirurgia Periodontal com Retalho.'),
            ('Clareamento Dentário Caseiro (3 meses)', 'Clínicos Gerais', 'Dentística', '1000.00', 60, 'Procedimento restaurador/estético para recuperação de forma e função dental: Clareamento Dentário Caseiro (3 meses).'),
            ('Clareamento em Consultório 35%', 'Clínicos Gerais', 'Dentística', '1000.00', 60, 'Procedimento restaurador/estético para recuperação de forma e função dental: Clareamento em Consultório 35%.'),
            ('Consulta Inicial', 'Clínicos Gerais', 'Consulta', '150.00', 30, ''),
            ('Consulta Odontológica de Urgência', 'Clínicos Gerais', 'Urgência', '150.00', 60, 'Atendimento de urgência para alívio de dor e resolução inicial do caso: Consulta Odontológica de Urgência.'),
            ('Contenção Fixa', 'Especializados', 'Ortodontia', '500.00', 60, 'Procedimento ortodôntico para alinhamento e correção da mordida: Contenção Fixa.'),
            ('Controle de Biofilme (Placa Bacteriana)', 'Clínicos Gerais', 'Prevenção', '100.00', 60, 'Procedimento preventivo para controle de placa, cárie e saúde bucal: Controle de Biofilme (Placa Bacteriana).'),
            ('Controle Pós-operatório em Odontologia', 'Cirúrgicos', 'Cirurgias', '100.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Controle Pós-operatório em Odontologia.'),
            ('Coroa de Acetato', 'Especializados', 'Prótese', '100.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa de Acetato.'),
            ('Coroa de Acetato em Dente Decíduo', 'Especializados', 'Prótese', '100.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa de Acetato em Dente Decíduo.'),
            ('Coroa de Aço', 'Especializados', 'Prótese', '300.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa de Aço.'),
            ('Coroa de Aço em Dente Decíduo', 'Especializados', 'Prótese', '200.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa de Aço em Dente Decíduo.'),
            ('Coroa de Policarbonato', 'Especializados', 'Prótese', '100.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa de Policarbonato.'),
            ('Coroa de Policarbonato em Dente Decíduo', 'Especializados', 'Prótese', '100.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa de Policarbonato em Dente Decíduo.'),
            ('Coroa em Resina', 'Clínicos Gerais', 'Consulta', '300.00', 60, 'Avaliação clínica, anamnese e orientação/planejamento conforme necessidade: Coroa em Resina.'),
            ('Coroa Provisória com Pino', 'Especializados', 'Prótese', '200.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa Provisória com Pino.'),
            ('Coroa Provisória sem Pino', 'Especializados', 'Prótese', '100.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa Provisória sem Pino.'),
            ('Coroa Provisória sobre Implante', 'Especializados', 'Implantodontia', '200.00', 60, 'Procedimento de implantodontia para reabilitação com implantes e componentes: Coroa Provisória sobre Implante.'),
            ('Coroa Total Acrílica Prensada', 'Especializados', 'Prótese', '300.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa Total Acrílica Prensada.'),
            ('Coroa Total em Cerâmica Pura', 'Especializados', 'Prótese', '1000.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa Total em Cerâmica Pura.'),
            ('Coroa Total em Cerômero', 'Especializados', 'Prótese', '500.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa Total em Cerômero.'),
            ('Coroa Total Livre de Metal (metal free) sobre Iimplante', 'Especializados', 'Implantodontia', '1500.00', 60, 'Procedimento de implantodontia para reabilitação com implantes e componentes: Coroa Total Livre de Metal (metal free) sobre Iimplante.'),
            ('Coroa Total Metálica', 'Especializados', 'Prótese', '500.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa Total Metálica.'),
            ('Coroa Total Metalo Cerâmica', 'Especializados', 'Prótese', '800.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa Total Metalo Cerâmica.'),
            ('Coroa Total Metalo Cerâmica sobre Implante', 'Especializados', 'Implantodontia', '1500.00', 60, 'Procedimento de implantodontia para reabilitação com implantes e componentes: Coroa Total Metalo Cerâmica sobre Implante.'),
            ('Coroa Total Metalo-Plástica', 'Especializados', 'Prótese', '500.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Coroa Total Metalo-Plástica.'),
            ('Cunha Proximal', 'Especializados', 'Periodontia', '400.00', 60, 'Procedimento periodontal para tratamento dos tecidos de suporte (gengiva/osso): Cunha Proximal.'),
            ('Curativo de Demora', 'Especializados', 'Endodontia', '200.00', 60, 'Procedimento endodôntico (canal) para tratar polpa/infecção e preservar o dente: Curativo de Demora.'),
            ('Dessensibilização Dentária', 'Clínicos Gerais', 'Prevenção', '200.00', 60, 'Procedimento preventivo para controle de placa, cárie e saúde bucal: Dessensibilização Dentária.'),
            ('Enxerto com Osso Liofilizado', 'Especializados', 'Periodontia', '1000.00', 60, 'Procedimento periodontal para tratamento dos tecidos de suporte (gengiva/osso): Enxerto com Osso Liofilizado.'),
            ('Enxerto Conjuntivo Subepitelial', 'Cirúrgicos', 'Cirurgias', '1000.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Enxerto Conjuntivo Subepitelial.'),
            ('Enxerto em bloco mandíbula posterior', 'Especializados', 'Implantodontia', '5000.00', 60, 'Procedimento de implantodontia para reabilitação com implantes e componentes: Enxerto em bloco mandíbula posterior.'),
            ('Enxerto Gengival Livre', 'Especializados', 'Periodontia', '1000.00', 60, 'Procedimento periodontal para tratamento dos tecidos de suporte (gengiva/osso): Enxerto Gengival Livre.'),
            ('Enxerto Pediculado', 'Especializados', 'Periodontia', '400.00', 60, 'Procedimento periodontal para tratamento dos tecidos de suporte (gengiva/osso): Enxerto Pediculado.'),
            ('Exérese ou Excisão de Cálculo Salivar', 'Cirúrgicos', 'Cirurgias', '400.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exérese ou Excisão de Cálculo Salivar.'),
            ('Exérese ou Excisão de Cistos Odontológicos', 'Cirúrgicos', 'Cirurgias', '1000.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exérese ou Excisão de Cistos Odontológicos.'),
            ('Exérese ou Excisão de Mucocele', 'Cirúrgicos', 'Cirurgias', '500.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exérese ou Excisão de Mucocele.'),
            ('Exérese ou Excisão de Rânula', 'Cirúrgicos', 'Cirurgias', '1000.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exérese ou Excisão de Rânula.'),
            ('Exodontia canino incluso', 'Cirúrgicos', 'Cirurgias', '500.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia canino incluso.'),
            ('Exodontia com Odonto-Secção', 'Cirúrgicos', 'Cirurgias', '500.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia com Odonto-Secção.'),
            ('Exodontia com Retalho', 'Cirúrgicos', 'Cirurgias', '250.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia com Retalho.'),
            ('Exodontia de dentes Decíduos', 'Especializados', 'Odontopediatria', '250.00', 60, 'Procedimento odontopediátrico, adequado ao atendimento infantil: Exodontia de dentes Decíduos.'),
            ('Exodontia de Dentes Inclusos / Impactados', 'Cirúrgicos', 'Cirurgias', '500.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia de Dentes Inclusos / Impactados.'),
            ('Exodontia de Dentes Semi-inclusos / impactados', 'Cirúrgicos', 'Cirurgias', '500.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia de Dentes Semi-inclusos / impactados.'),
            ('Exodontia de Permanente por Indicação Ortodôntica/protética', 'Cirúrgicos', 'Cirurgias', '500.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia de Permanente por Indicação Ortodôntica/protética.'),
            ('Exodontia de Raiz Residual', 'Cirúrgicos', 'Cirurgias', '250.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia de Raiz Residual.'),
            ('Exodontia múltipla por doença periodontal por arcada', 'Cirúrgicos', 'Cirurgias', '1000.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia múltipla por doença periodontal por arcada.'),
            ('Exodontia pré-molar com finalidade ortodôntica', 'Cirúrgicos', 'Cirurgias', '500.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia pré-molar com finalidade ortodôntica.'),
            ('Exodontia Simples', 'Cirúrgicos', 'Extração', '300.00', 60, ''),
            ('Exodontia Simples de Decíduo', 'Cirúrgicos', 'Cirurgias', '250.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia Simples de Decíduo.'),
            ('Exodontia Simples de Permanente', 'Cirúrgicos', 'Cirurgias', '250.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia Simples de Permanente.'),
            ('Exodontia siso inferior erupcionado', 'Cirúrgicos', 'Terceiros Molares', '500.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia siso inferior erupcionado.'),
            ('Exodontia siso inferior incluso', 'Cirúrgicos', 'Terceiros Molares', '1000.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia siso inferior incluso.'),
            ('Exodontia siso inferior semi-incluso', 'Cirúrgicos', 'Terceiros Molares', '750.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia siso inferior semi-incluso.'),
            ('Exodontia siso superior erupcionado', 'Cirúrgicos', 'Terceiros Molares', '500.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia siso superior erupcionado.'),
            ('Exodontia siso superior incluso', 'Cirúrgicos', 'Terceiros Molares', '1000.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia siso superior incluso.'),
            ('Exodontia siso superior semi-incluso', 'Cirúrgicos', 'Terceiros Molares', '750.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia siso superior semi-incluso.'),
            ('Exodontia Terceiro Molar', 'Cirúrgicos', 'Terceiros Molares', '500.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia Terceiro Molar.'),
            ('Faceta em Cerâmica Pura', 'Especializados', 'Prótese', '1000.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Faceta em Cerâmica Pura.'),
            ('Faceta em Cerômero', 'Especializados', 'Prótese', '500.00', 60, 'Procedimento protético para reabilitação estética e funcional (dentes/próteses): Faceta em Cerômero.'),
            ('Faceta em Resina Fotopolimerizável', 'Clínicos Gerais', 'Dentística', '250.00', 60, 'Procedimento restaurador/estético para recuperação de forma e função dental: Faceta em Resina Fotopolimerizável.'),
            ('Fios de PDO liso (1 fio)', 'Estéticos', 'Facetas', '200.00', 60, 'Procedimento estético para melhora de harmonia e aparência do sorriso/face: Fios de PDO liso (1 fio).'),
            ('Fios de sustentação (espiculado) (1 fio)', 'Estéticos', 'Facetas', '350.00', 60, 'Procedimento estético para melhora de harmonia e aparência do sorriso/face: Fios de sustentação (espiculado) (1 fio) .'),
            ('Fotografia - Unidade', 'Clínicos Gerais', 'Testes e exames laboratoriais', '15.00', 60, 'Procedimento odontológico: Fotografia - Unidade.'),
            ('Frenulectomia Lingual (Frenectomia)', 'Cirúrgicos', 'Frenectomia', '250.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Frenulectomia Lingual (Frenectomia).'),
            ('Frenulectonia Labial (Frenectomia)', 'Cirúrgicos', 'Frenectomia', '165.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Frenulectonia Labial (Frenectomia).'),
            ('Frenulotomia Labial (Frenotomia)', 'Cirúrgicos', 'Frenectomia', '165.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Frenulotomia Labial (Frenotomia).'),
            ('Frenulotomia Lingual (Frenotomia)', 'Cirúrgicos', 'Frenectomia', '165.00', 60, 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Frenulotomia Lingual (Frenotomia).'),
            ('Gengivectomia', 'Especializados', 'Periodontia', '500.00', 60, 'Procedimento periodontal para tratamento dos tecidos de suporte (gengiva/osso): Gengivectomia.'),
            ('Gengivoplastia', 'Especializados', 'Periodontia', '500.00', 60, 'Procedimento periodontal para tratamento dos tecidos de suporte (gengiva/osso): Gengivoplastia.'),
            ('Profilaxia (Limpeza)', 'Clínicos Gerais', 'Prevenção', '250.00', 60, 'Remoção de placa bacteriana e tártaro + polimento coronário.'),
            ('Restauração em Resina (1 face)', 'Clínicos Gerais', 'Dentística', '300.00', 60, 'Restauração estética em dente posterior ou anterior.')
        `);

        console.log('✅ Template procedures updated with ALL 101 procedures');
        console.log('✅ Procedures organized by categories and subcategories');

    } catch (error) {
        console.error('❌ Error updating template procedures:', error);
        throw error;
    }
};

updateProcedureTemplates()
    .then(() => {
        console.log('✅ Procedure migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
