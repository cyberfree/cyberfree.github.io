
import React from 'react';
import { Car } from '../types';

interface DashboardProps {
  cars: Car[];
  onSelectCar: (car: Car) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ cars, onSelectCar }) => {
  const getUpcomingExpiries = () => {
    const allExpiries: { car: Car, type: string, date: string, daysLeft: number }[] = [];
    const today = new Date();

    cars.forEach(car => {
      const dates = [
        { type: 'Bollo', date: car.taxExpiry },
        { type: 'Assicurazione', date: car.insuranceExpiry },
        { type: 'Revisione', date: car.revisionExpiry },
        { type: 'Tagliando', date: car.serviceExpiry }
      ];

      dates.forEach(d => {
        if (d.date) {
          const exp = new Date(d.date);
          const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diff < 60) {
            allExpiries.push({ car, type: d.type, date: d.date, daysLeft: diff });
          }
        }
      });
    });

    return allExpiries.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4);
  };

  const upcoming = getUpcomingExpiries();

  return (
    <div className="p-4 pb-24 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Il mio garage</h1>
          <p className="text-slate-500 text-sm">{cars.length} veicoli registrati</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-50">
           {/* Icona Auto aggiornata */}
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
           </svg>
        </div>
      </header>

      {/* Expiry Alerts */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider">Avvisi Scadenze</h3>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => onSelectCar(item.car)}
                className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-amber-500 flex justify-between items-center active:scale-95 transition cursor-pointer"
              >
                <div>
                  <p className="font-bold text-slate-800">{item.car.plate} - {item.type}</p>
                  <p className="text-xs text-slate-500">{item.car.owner}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.daysLeft < 0 ? 'text-red-500' : 'text-amber-600'}`}>
                    {item.daysLeft < 0 ? 'Scaduto' : `Fra ${item.daysLeft} gg`}
                  </p>
                  <p className="text-[10px] text-slate-400">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-slate-100">
            <p className="text-slate-400 italic">Nessuna scadenza imminente</p>
          </div>
        )}
      </section>

      {/* Quick Access Grid */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider">Veicoli Recenti</h3>
        {cars.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {cars.slice(0, 4).map(car => (
              <div 
                key={car.id} 
                onClick={() => onSelectCar(car)}
                className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition cursor-pointer overflow-hidden flex flex-col"
              >
                <img src={car.photoUrl} alt={car.plate} className="w-full h-24 object-cover rounded-xl mb-2" />
                <div className="flex justify-between items-start gap-1">
                  <p className="font-bold text-slate-800 text-sm truncate flex-1">{car.plate}</p>
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1 rounded shrink-0 whitespace-nowrap self-center">
                    {car.tires}
                  </span>
                </div>
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 truncate flex-1">{car.owner}</p>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
                    {car.tireSize || '---'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Nessun veicolo nel garage</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
