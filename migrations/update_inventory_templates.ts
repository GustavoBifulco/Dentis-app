import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const updateInventoryTemplates = async () => {
    console.log('🔄 Updating template inventory with new materials...');

    try {
        // Clear existing template inventory
        await db.execute(sql`DELETE FROM template_inventory`);
        console.log('✅ Cleared old template inventory');

        // Insert new comprehensive inventory with categories
        await db.execute(sql`
            INSERT INTO template_inventory (name, quantity, unit, category, price, min_quantity) VALUES
            -- Suturas e Materiais Cirúrgicos
            ('Fio de Sutura Seda', 2, 'Caixa (24un)', 'Cirúrgico', 35.00, 1),
            ('Fio de Sutura Nylon', 2, 'Caixa (24un)', 'Cirúrgico', 35.00, 1),
            ('Lâmina de Bisturi (11/12/15/15C)', 10, 'un', 'Cirúrgico', 1.50, 5),
            ('Esponja Hemostática', 5, 'un', 'Cirúrgico', 8.00, 3),
            ('Fio Retrator Gengival', 100, 'cm', 'Cirúrgico', 0.30, 50),
            ('Alveolótomo', 1, 'un', 'Cirúrgico', 180.00, 1),
            ('Enxerto Ósseo Bovino', 2, 'Frasco', 'Cirúrgico', 150.00, 1),
            ('Membrana Colágeno', 3, 'Unidade', 'Cirúrgico', 10.00, 2),
            
            -- Moldagem e Impressão
            ('Alginato (454g)', 3, 'un (pacote)', 'Moldagem', 65.00, 2),
            ('Alginato', 5, 'Pacote', 'Moldagem', 15.00, 3),
            ('Silicone de Condensação (Kit)', 2, 'Kit', 'Moldagem', 120.00, 1),
            ('Silicone de Adição (Kit)', 2, 'Kit', 'Moldagem', 120.00, 1),
            ('Silicone Adição / Condensação', 50, 'ml', 'Moldagem', 2.50, 30),
            ('Silicone de Adição', 50, 'ml', 'Moldagem', 2.80, 30),
            
            -- Anestésicos
            ('Anestésico Tópico (Benzocaína)', 3, 'Pote', 'Anestesia', 20.00, 2),
            ('Anestésico Articaína 4%', 5, 'Caixa (50 tubetes)', 'Anestesia', 4.80, 3),
            ('Seringa Carpule', 3, 'unidade', 'Anestesia', 160.00, 2),
            
            -- Ortodontia
            ('Bráquetes Metálicos (Caso)', 10, 'Cartela', 'Ortodontia', 10.00, 5),
            ('Arcos Ortodônticos (NiTi/Aço)', 20, 'un', 'Ortodontia', 15.00, 10),
            ('Resina Ortodôntica (Transbond)', 2, 'un', 'Ortodontia', 150.00, 1),
            ('Mini-implante Ortodôntico', 5, 'un', 'Ortodontia', 120.00, 3),
            ('Fio/Arco NiTi', 5, 'Pacote', 'Ortodontia', 15.00, 3),
            ('Fio/Arco Aço', 5, 'Pacote', 'Ortodontia', 15.00, 3),
            ('Torno Expansor', 2, 'unidade', 'Ortodontia', 65.00, 1),
            ('Placa de Acetato', 10, 'unidade', 'Ortodontia', 12.00, 5),
            
            -- Prevenção e Profilaxia
            ('Pasta Profilática', 10, 'Bisnaga', 'Prevenção', 1.00, 5),
            ('Flúor Verniz', 5, 'Frasco/Dose', 'Prevenção', 10.00, 3),
            ('Verniz Fluoretado', 50, 'ml', 'Prevenção', 13.00, 30),
            ('Selante Resinoso', 3, 'seringa', 'Prevenção', 110.00, 2),
            ('Selante Resinoso', 50, 'ml', 'Prevenção', 80.00, 30),
            ('Fio Dental Profissional', 100, 'm', 'Prevenção', 0.10, 50),
            ('Taça de Borracha / Escova Robson', 10, 'un', 'Prevenção', 1.50, 5),
            ('Taça de Borracha', 10, 'Unidade', 'Prevenção', 10.00, 5),
            ('Taça de Borracha', 10, 'unidade', 'Prevenção', 2.50, 5),
            
            -- Dentística e Restauração
            ('Resina Composta (Esm/Dent/Flow)', 50, 'g', 'Dentística', 45.00, 30),
            ('Resina Esmalte A1', 10, 'Tubo 4g', 'Dentística', 1.00, 5),
            ('Resina Dentina DA2', 10, 'Tubo 4g', 'Dentística', 1.00, 5),
            ('Resina Flow A2', 5, 'Seringa 2g', 'Dentística', 1.00, 3),
            ('Resina Esmalte', 50, 'grama', 'Dentística', 24.00, 30),
            ('Adesivo Universal', 100, 'Frasco (5ml)', 'Dentística', 0.10, 50),
            ('Ácido Fosfórico 37%', 5, 'un (seringa)', 'Dentística', 25.00, 3),
            ('Ácido Fosfórico 37%', 2, 'Kit (3 seringas)', 'Dentística', 120.00, 1),
            ('Silano', 50, 'ml', 'Dentística', 95.00, 30),
            ('Silano', 5, 'Frasco', 'Dentística', 10.00, 3),
            ('Silano', 50, 'ml', 'Dentística', 22.00, 30),
            ('Matriz de Poliéster', 5, 'Caixa (50un)', 'Dentística', 35.00, 3),
            ('Matriz Metálica / Poliéster', 20, 'un', 'Dentística', 0.90, 10),
            ('Tira de Lixa (Aço/Poliéster)', 20, 'un', 'Dentística', 0.80, 10),
            ('Tira de Lixa de Aço', 10, 'unidade', 'Dentística', 3.70, 5),
            ('Pino de Fibra de Vidro (Nº 0.5 a 3)', 10, 'un', 'Dentística', 45.00, 5),
            ('Dessensibilizante Dentário', 50, 'ml', 'Dentística', 15.00, 30),
            ('Cimento Ionômero de Vidro (Cimentação)', 2, 'Kit', 'Dentística', 120.00, 1),
            
            -- Endodontia
            ('Hipoclorito de Sódio 2.5% e 5%', 100, 'ml', 'Endodontia', 0.08, 50),
            ('Hipoclorito de Sódio 2.5%', 5, 'Frasco (1L)', 'Endodontia', 9.00, 3),
            ('Limas (Manual/Rotatória/Reciproc.)', 20, 'un', 'Endodontia', 45.00, 10),
            ('Cone de Papel', 5, 'Caixa', 'Endodontia', 35.00, 3),
            ('Cimento Endodôntico (Ah Plus/Eugenol)', 2, 'Kit', 'Endodontia', 120.00, 1),
            ('Formocresol', 50, 'ml', 'Endodontia', 35.00, 30),
            ('Cariostático', 50, 'ml', 'Endodontia', 90.00, 30),
            ('Agulha de Irrigação Endo', 5, 'Pacote', 'Endodontia', 15.00, 3),
            ('Broca Endo-Z', 5, 'Unidade', 'Endodontia', 12.00, 3),
            
            -- Radiologia
            ('Filme Periapical (Adulto/Infantil)', 50, 'un', 'Radiologia', 6.50, 30),
            ('Filme Periapical Adulto', 2, 'Caixa', 'Radiologia', 180.00, 1),
            ('Posicionador Radiográfico', 2, 'Kit', 'Radiologia', 140.00, 1),
            ('Líquido Fixador', 3, 'Frasco', 'Radiologia', 22.00, 2),
            
            -- Brocas e Instrumentos
            ('Broca Diamantada Cilíndrica', 10, 'Unidade', 'Instrumentos', 12.00, 5),
            ('Broca Transmetal', 10, 'Unidade', 'Instrumentos', 12.00, 5),
            
            -- Clareamento
            ('Peróxido (Hidrogênio/Carbamida)', 50, 'ml', 'Clareamento', 35.00, 30),
            
            -- Estética e Harmonização
            ('Ácido Hialurônico', 3, 'Seringa', 'Estética', 1.00, 2),
            ('Toxina Botulínica (50U/100U)', 5, 'Frasco', 'Estética', 10.00, 3),
            ('Bioestimulador de Colágeno', 2, 'un (frasco)', 'Estética', 1200.00, 1),
            ('Cânulas de Preenchimento (22G/25G)', 10, 'un', 'Estética', 25.00, 5),
            ('Ácido Deoxicólico (Enzima de Papada)', 5, 'ml', 'Estética', 150.00, 3),
            
            -- Descartáveis e EPI
            ('Gaze Estéril', 100, 'un', 'Descartáveis', 0.15, 50),
            ('Luva Cirúrgica Estéril', 50, 'par', 'Descartáveis', 4.50, 30),
            ('Luva de Procedimento (PP/P/M/G)', 100, 'par', 'Descartáveis', 1.10, 50),
            ('Máscara N95/PFF2', 50, 'Unidade', 'Descartáveis', 4.50, 30),
            ('Bolinha de Algodão', 5, 'Pacote (500g)', 'Descartáveis', 12.00, 3),
            ('Rolete de Algodão', 100, 'unidade', 'Descartáveis', 0.07, 50),
            ('Rolete de Algodão', 10, 'Pacote (100un)', 'Descartáveis', 12.00, 5),
            ('Sugador Descartável (Convencional)', 10, 'Pacote (40un)', 'Descartáveis', 15.00, 5),
            ('Sugador (Convenc./Cirúrgico)', 50, 'un', 'Descartáveis', 0.50, 30),
            ('Copo Descartável', 10, 'Pacote (100un)', 'Descartáveis', 12.00, 5),
            ('Avental Descartável Manga Longa', 5, 'Pacote (10un)', 'Descartáveis', 15.00, 3),
            ('Óculos de Proteção', 5, 'Unidade', 'Descartáveis', 10.00, 3),
            ('Papel Grau Cirúrgico 10cm', 5, 'Rolo', 'Descartáveis', 10.00, 3),
            
            -- Seringas e Aplicação
            ('Seringa Insulina', 50, 'unidade', 'Aplicação', 1.10, 30),
            ('Seringa Insulina/Aplicação', 10, 'Pacote', 'Aplicação', 15.00, 5),
            ('Seringas (1/3/5/10/20ml)', 50, 'un', 'Aplicação', 1.50, 30),
            
            -- Soluções e Líquidos
            ('Soro Fisiológico 0.9%', 500, 'ml', 'Soluções', 0.02, 300),
            ('Soro Fisiológico 0.9% (Bolsa 250ml)', 10, 'Bolsa', 'Soluções', 6.00, 5),
            ('Clorexidina (0,12% / 2%)', 200, 'ml', 'Soluções', 0.05, 100),
            ('Água Destilada', 500, 'ml', 'Soluções', 0.05, 300),
            ('Detergente Enzimático 5 Enzimas', 5, 'Galão (5L)', 'Soluções', 1.00, 3),
            
            -- Diversos
            ('Papel Articular', 10, 'Bloco', 'Diversos', 10.00, 5),
            ('Indicador Biológico (Teste Autoclave)', 3, 'Caixa (10un)', 'Diversos', 35.00, 2),
            ('Gás Ozônio (Cilindro O3)', 1, 'un', 'Diversos', 500.00, 1),
            ('Fita Indicadora de pH Salivar', 5, 'un', 'Diversos', 45.00, 3),
            ('Vaselina Sólida', 100, 'g', 'Diversos', 15.00, 50),
            ('Resina Acrílica (Duralay)', 50, 'grama', 'Diversos', 3.50, 30)
        `);

        console.log('✅ Template inventory updated with 100+ materials');
        console.log('✅ Materials organized by categories');

    } catch (error) {
        console.error('❌ Error updating template inventory:', error);
        throw error;
    }
};

updateInventoryTemplates()
    .then(() => {
        console.log('✅ Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
