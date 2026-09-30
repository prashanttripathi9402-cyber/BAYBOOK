import React from 'react';
import { CheckCircle2, Clock, Wrench, Car, PackageCheck, AlertCircle } from 'lucide-react';

const STAGES = [
  { key: 'Pending', label: 'Order Placed', icon: Clock },
  { key: 'Confirmed', label: 'Slot Confirmed', icon: CheckCircle2 },
  { key: 'Vehicle Received', label: 'Vehicle Received', icon: Car },
  { key: 'In Service', label: 'In Service', icon: Wrench },
  { key: 'Ready for Delivery', label: 'Ready for Pickup', icon: PackageCheck },
  { key: 'Completed', label: 'Service Completed', icon: CheckCircle2 }
];

export default function StatusTimeline({ currentStatus }) {
  const currentIndex = STAGES.findIndex(s => s.key === currentStatus);
  const isCancelled = currentStatus === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-sm flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-400" />
        <span>This booking was cancelled.</span>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 z-0 transition-all duration-500"
          style={{
            width: `${(Math.max(0, currentIndex) / (STAGES.length - 1)) * 100}%`
          }}
        />

        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? 'bg-blue-600 border-white text-white shadow-lg shadow-blue-500/50 scale-110 animate-pulse'
                    : isDone
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[11px] mt-2 font-medium text-center max-w-[70px] ${
                isCurrent ? 'text-blue-400 font-bold' : isDone ? 'text-slate-200' : 'text-slate-500'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
