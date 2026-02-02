import React from 'react';
import { MOCK_MARKETPLACE_PRODUCTS } from '../lib/mockData';

const Marketplace: React.FC = () => {
  const products = MOCK_MARKETPLACE_PRODUCTS;

  return (
    <div className="space-y-10">
      <div className="relative h-64 rounded-[3rem] overflow-hidden group">
        <img
          src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1200"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt="Dental Supplies"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-12">
          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mb-4">
            Oferta Dentis Pro
          </span>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Suprimentos com 20% OFF</h2>
          <p className="text-slate-300 max-w-md">Compras integradas com seu estoque e contas a pagar. Um clique e pronto.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <div key={p.name} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            {p.discount && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg z-10">
                -{p.discount}
              </span>
            )}
            <div className="h-40 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
              {p.img}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.brand}</p>
              <h3 className="font-bold text-slate-800 leading-tight mb-4 min-h-[40px]">{p.name}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 line-through">R$ {(p.price * 1.2).toFixed(2)}</p>
                  <p className="text-xl font-black text-slate-900">R$ {p.price.toFixed(2)}</p>
                </div>
                <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition shadow-lg shadow-slate-200">
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-[2rem] p-8 flex items-center justify-between border border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">📊</div>
          <div>
            <p className="text-sm font-black text-slate-800">Reposição Inteligente</p>
            <p className="text-xs text-slate-500">Baseado no seu agendamento, você precisará de 5 resinas e 2 caixas de luvas semana que vem.</p>
          </div>
        </div>
        <button className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-purple-100 hover:bg-purple-700 transition">
          Completar Lista Sugerida
        </button>
      </div>
    </div>
  );
};

export default Marketplace;