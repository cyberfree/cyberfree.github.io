
import React from 'react';

interface StatusBadgeProps {
  expiryDate: string;
  label: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ expiryDate, label }) => {
  const getStatus = () => {
    if (!expiryDate) return { color: 'bg-gray-100 text-gray-600', text: 'N/A' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: 'bg-red-100 text-red-700', text: 'Scaduto' };
    if (diffDays <= 30) return { color: 'bg-amber-100 text-amber-700', text: 'In scadenza' };
    return { color: 'bg-green-100 text-green-700', text: 'Ok' };
  };

  const status = getStatus();

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</span>
      <div className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${status.color}`}>
        {status.text} • {expiryDate || '---'}
      </div>
    </div>
  );
};

export default StatusBadge;
