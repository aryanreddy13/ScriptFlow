export default function MetricCards({ metrics, onCardClick }) {
  // Sparkline data representing a 7-day activity window
  const sparklines = {
    'total-scripts': [40, 40, 60, 60, 80, 80, 100], // incremental registrations
    'jobs-run': [30, 50, 20, 75, 60, 40, 90], // varying run volumes
    'success-count': [28, 48, 18, 74, 59, 39, 89], // success counts (mostly matched)
    'failed-count': [2, 2, 2, 1, 1, 1, 1], // failure incidents (low with single active indicator)
    'running-jobs': [10, 30, 20, 10, 40, 30, 15], // running job history fluctuations
  };

  const cardData = [
    {
      id: 'total-scripts',
      label: '[TOTAL REGISTERED SCRIPTS]',
      value: metrics.totalScripts,
      unit: 'UNITS',
      subtext: 'REGISTERED PYTHON SCRIPTS',
      colorClass: 'text-[#EAEAEA]',
      borderAccent: 'border-l-4 border-l-[#71717A]',
      sparklineColor: 'bg-[#444] group-hover:bg-brandFg',
    },
    {
      id: 'jobs-run',
      label: '[JOBS EXECUTED TODAY]',
      value: metrics.runsToday,
      unit: 'RUNS',
      subtext: 'EXECUTED IN LAST 24H',
      colorClass: 'text-[#EAEAEA]',
      borderAccent: 'border-l-4 border-l-brandFg',
      sparklineColor: 'bg-[#444] group-hover:bg-brandFg',
    },
    {
      id: 'success-count',
      label: '[SUCCESSFUL RUNS]',
      value: metrics.successCount,
      unit: 'OK',
      subtext: 'COMPLETED WITH NO ERRORS',
      colorClass: 'text-brandSuccess',
      borderAccent: 'border-l-4 border-l-brandSuccess',
      sparklineColor: 'bg-[#444] group-hover:bg-brandSuccess',
    },
    {
      id: 'failed-count',
      label: '[FAILED EXECUTIONS]',
      value: metrics.failedCount,
      unit: 'ERR',
      subtext: 'CLICK CARD TO INVESTIGATE',
      colorClass: 'text-brandFailure',
      borderAccent: 'border-l-4 border-l-brandFailure',
      pulse: metrics.failedCount > 0,
      sparklineColor: 'bg-[#444] group-hover:bg-brandFailure',
    },
    {
      id: 'running-jobs',
      label: '[ACTIVE RUNNING JOBS]',
      value: metrics.runningJobs,
      unit: 'PROC',
      subtext: 'CURRENT RUNNING PROCESSES',
      colorClass: metrics.runningJobs > 0 ? 'text-brandWarning' : 'text-[#71717A]',
      borderAccent: 'border-l-4 border-l-[#F59E0B]',
      pulse: metrics.runningJobs > 0,
      spin: metrics.runningJobs > 0,
      sparklineColor: 'bg-[#444] group-hover:bg-[#F59E0B]',
    },
    {
      id: 'next-run',
      label: '[NEXT SCHEDULED RUN]',
      value: metrics.nextRunTime,
      unit: 'UTC',
      subtext: 'UPCOMING RUN TRIGGER',
      colorClass: 'text-[#FFFFFF]',
      borderAccent: 'border-l-4 border-l-brandAccent',
      isTime: true,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono select-none">
      {cardData.map((card, idx) => {
        const Icon = card.icon;
        const spark = sparklines[card.id];
        return (
          <div
            key={idx}
            onClick={() => onCardClick && onCardClick(card.id)}
            className={`bg-panelBg border border-panelBorder p-5 flex flex-col justify-between h-[155px] relative group hover:border-[#444444] active:translate-y-0.5 transition-all duration-150 cursor-pointer ${card.borderAccent}`}
          >
            {/* Corner Crosshairs for Tactical Telemetry UI */}
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#333333] group-hover:border-brandAccent"></div>
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#333333] group-hover:border-brandAccent"></div>

            {/* Top row: Label and Icon */}
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-[#9CA3AF] tracking-wider font-bold">
                {card.label}
              </span>
              <div className="flex items-center gap-2">
                {card.pulse && (
                  <span className={`w-2 h-2 rounded-none ${card.id === 'failed-count' ? 'bg-brandFailure' : 'bg-[#F59E0B]'} animate-pulse-fast`}></span>
                )}
                <span className="text-[#71717A] text-[10px] uppercase tracking-wider">{card.unit}</span>
              </div>
            </div>

            {/* Middle row: Big Metric Value & Sparkline */}
            <div className="my-1.5 flex justify-between items-end">
              {card.isTime ? (
                <div className="text-sm font-bold text-brandFg font-mono truncate tracking-tight pt-1">
                  {card.value}
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl font-extrabold tracking-tighter ${card.colorClass}`}>
                      {card.value}
                    </span>
                    <span className="text-[10px] text-[#71717A] font-bold">
                      {card.unit}
                    </span>
                  </div>
                  
                  {/* Sparkline Visual - 7-day activity preview */}
                  {spark && (
                    <div className="flex items-end gap-[2px] h-6 pb-1">
                      {spark.map((val, sIdx) => (
                        <div
                          key={sIdx}
                          className={`w-[3px] transition-all duration-300 ${card.sparklineColor}`}
                          style={{ height: `${val}%` }}
                          title={`Day ${sIdx + 1}: ${val}%`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom row: Subtext description */}
            <div className="flex justify-between items-center text-[9px] text-[#71717A] border-t border-panelBorder/50 pt-1.5 mt-0.5">
              <span>{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
