import { db } from '../db';
import { inventory, procedures } from '../db/schema';

export const setupNewUserEnvironment = async (userId: string, role: string) => {
  console.log(`🚀 Iniciando setup para: ${userId}`);
  if (role === 'patient') return;

  try {
    await db.insert(inventory).values([
      { name: 'Resina Composta A2', category: 'Restaurador', quantity: 15, unit: 'tubo', minLevel: 5, userId },
      { name: 'Anestésico Lidocaína', category: 'Anestesia', quantity: 50, unit: 'ampola', minLevel: 20, userId }
    ]);

    await db.insert(procedures).values([
      { name: 'Consulta Inicial', code: '001', price: '150.00', duration: 30, category: 'Diagnóstico', userId },
      { name: 'Limpeza', code: '002', price: '250.00', duration: 45, category: 'Prevenção', userId }
    ]);
    
    console.log('✅ Dados padrão criados com sucesso!');
  } catch (err) {
    console.error('❌ Erro no setup:', err);
  }
};
