import React, { useState, useEffect } from 'react';

export default function SchedulerForm({ scripts, onScheduleTask }) {
  const [selectedScriptId, setSelectedScriptId] = useState('');
  const [frequency, setFrequency] = useState('daily');
  
  // Dynamic settings depending on frequency
  const [minute, setMinute] = useState('00');
  const [hour, setHour] = useState('09');
  const [dayOfWeek, setDayOfWeek] = useState('1'); // Monday
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [customCron, setCustomCron] = useState('*/15 * * * *');

  const [cronExpression, setCronExpression] = useState('');
  const [nextRuns, setNextRuns] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-select first script if available
  useEffect(() => {
    if (scripts.length > 0 && !selectedScriptId) {
      setSelectedScriptId(scripts[0].id);
    }
  }, [scripts, selectedScriptId]);

  // Compute Cron and Next Execution Dates in real-time
  useEffect(() => {
    let expr = '* * * * *';
    let label = '';
    
    switch (frequency) {
      case 'hourly':
        expr = `${minute} * * * *`;
        label = `Every hour at minute ${minute}`;
        break;
      case 'daily':
        expr = `${minute} ${hour} * * *`;
        label = `Every day at ${hour}:${minute}`;
        break;
      case 'weekly':
        expr = `${minute} ${hour} * * ${dayOfWeek}`;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        label = `Every ${days[dayOfWeek]} at ${hour}:${minute}`;
        break;
      case 'monthly':
        expr = `${minute} ${hour} ${dayOfMonth} * *`;
        label = `Every month on day ${dayOfMonth} at ${hour}:${minute}`;
        break;
      case 'custom':
        expr = customCron;
        label = `Custom Cron schedule`;
        break;
      default:
        break;
    }

    setCronExpression(expr);
    calculateNextRuns(expr, frequency);
  }, [frequency, minute, hour, dayOfWeek, dayOfMonth, customCron]);

  // Generate realistic next run dates for visual preview
  const calculateNextRuns = (cron, freq) => {
    const runs = [];
    const baseDate = new Date('2026-06-11T14:53:26Z'); // Current simulation date
    
    try {
      if (freq === 'custom') {
        // Simple mock parse for standard cron cases like */15 or 0 0 * * *
        if (cron.startsWith('*/15')) {
          for (let i = 1; i <= 3; i++) {
            const date = new Date(baseDate.getTime() + i * 15 * 60000);
            runs.push(formatTelemetryDate(date));
          }
        } else if (cron.startsWith('0 2')) {
          for (let i = 1; i <= 3; i++) {
            const date = new Date(baseDate.getTime());
            date.setUTCDate(baseDate.getUTCDate() + i);
            date.setUTCHours(2, 0, 0, 0);
            runs.push(formatTelemetryDate(date));
          }
        } else {
          // General fallback
          for (let i = 1; i <= 3; i++) {
            const date = new Date(baseDate.getTime() + i * 24 * 3600000);
            runs.push(formatTelemetryDate(date));
          }
        }
      } else {
        const targetMin = parseInt(minute);
        const targetHour = parseInt(hour);
        const targetDayOfWeek = parseInt(dayOfWeek);
        const targetDayOfMonth = parseInt(dayOfMonth);

        if (freq === 'hourly') {
          for (let i = 1; i <= 3; i++) {
            const date = new Date(baseDate.getTime());
            date.setUTCHours(baseDate.getUTCHours() + i);
            date.setUTCMinutes(targetMin, 0, 0);
            runs.push(formatTelemetryDate(date));
          }
        } else if (freq === 'daily') {
          for (let i = 1; i <= 3; i++) {
            const date = new Date(baseDate.getTime());
            date.setUTCDate(baseDate.getUTCDate() + i);
            date.setUTCHours(targetHour, targetMin, 0, 0);
            runs.push(formatTelemetryDate(date));
          }
        } else if (freq === 'weekly') {
          for (let i = 1; i <= 3; i++) {
            const date = new Date(baseDate.getTime());
            // Calculate next day of week
            const currentDay = date.getUTCDay();
            let daysToAdd = targetDayOfWeek - currentDay;
            if (daysToAdd <= 0) daysToAdd += 7;
            date.setUTCDate(date.getUTCDate() + daysToAdd + (i - 1) * 7);
            date.setUTCHours(targetHour, targetMin, 0, 0);
            runs.push(formatTelemetryDate(date));
          }
        } else if (freq === 'monthly') {
          for (let i = 1; i <= 3; i++) {
            const date = new Date(baseDate.getTime());
            date.setUTCMonth(baseDate.getUTCMonth() + i);
            date.setUTCDate(targetDayOfMonth);
            date.setUTCHours(targetHour, targetMin, 0, 0);
            runs.push(formatTelemetryDate(date));
          }
        }
      }
      setNextRuns(runs);
    } catch (e) {
      setNextRuns(['[ERROR CONFIGURING PREVIEW TIMELINE]']);
    }
  };

  const formatTelemetryDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const d = String(date.getUTCDate()).padStart(2, '0');
    const m = months[date.getUTCMonth()];
    const y = date.getUTCFullYear();
    const hr = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    const sec = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${d} ${m} ${y} ${hr}:${min}:${sec} UTC`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedScriptId) return;

    const script = scripts.find(s => s.id === selectedScriptId);
    onScheduleTask({
      scriptId: selectedScriptId,
      scriptName: script.name,
      file: script.file,
      cron: cronExpression,
      frequency,
      cronText: frequency === 'custom' ? 'Custom Cron expression' : `Every ${frequency}`
    });

    setSuccessMessage(`SUCCESS: Scheduled task payload register processed. [CRON: ${cronExpression}]`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="bg-panelBg border border-panelBorder flex flex-col font-mono text-[#EAEAEA] h-full select-none">
      {/* Header Title */}
      <div className="p-4 border-b border-panelBorder bg-[#0F0F0F] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex w-2.5 h-2.5 rounded-sm bg-brandAccent" />
          <span className="text-brandAccent text-xs font-bold">[SCHEDULER_PROTOTYPE_DAEMON]</span>
        </div>
        <span className="text-[9px] text-[#71717A]">[SYS: ACTIVE]</span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-5">
          {successMessage && (
            <div className="p-3 border border-brandSuccess/30 bg-brandSuccess/10 text-brandSuccess text-xs flex items-center gap-2 animate-pulse">
              <span className="font-bold">✔</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Script Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#9CA3AF] font-bold block uppercase">
              [01] SELECT TARGET RUN FILE
            </label>
            <select
              value={selectedScriptId}
              onChange={(e) => setSelectedScriptId(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-panelBorder text-xs text-[#EAEAEA] p-2 focus:outline-none focus:border-brandAccent"
            >
              {scripts.map((script) => (
                <option key={script.id} value={script.id}>
                  {script.name} ({script.file})
                </option>
              ))}
            </select>
          </div>

          {/* Frequency Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#9CA3AF] font-bold block uppercase">
              [02] TASK TRIGGER FREQUENCY
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['hourly', 'daily', 'weekly', 'monthly', 'custom'].map((freq) => (
                <button
                  type="button"
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  className={`py-2 text-[10px] font-bold uppercase transition-colors border btn-press ${
                    frequency === freq
                      ? 'border-brandAccent bg-brandAccent/10 text-white'
                      : 'border-panelBorder bg-[#0A0A0A] text-[#71717A] hover:border-[#444] hover:text-[#EAEAEA]'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Settings Fields */}
          <div className="border border-panelBorder p-4 bg-[#0A0A0A] space-y-4">
            <div className="text-[10px] text-[#71717A] border-b border-panelBorder pb-1 uppercase">
              [TIMING CONFIGURATION READOUT]
            </div>

            {frequency === 'hourly' && (
              <div className="flex items-center gap-2 text-xs">
                <span>RUN EVERY HOUR AT MINUTE:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  onChange={(e) => setMinute(String(e.target.value).padStart(2, '0'))}
                  className="bg-panelBg border border-panelBorder w-16 p-1 text-center focus:outline-none focus:border-brandAccent"
                />
              </div>
            )}

            {frequency === 'daily' && (
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span>RUN DAILY AT HOUR:</span>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hour}
                    onChange={(e) => setHour(String(e.target.value).padStart(2, '0'))}
                    className="bg-panelBg border border-panelBorder w-16 p-1 text-center focus:outline-none focus:border-brandAccent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>MINUTE:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={(e) => setMinute(String(e.target.value).padStart(2, '0'))}
                    className="bg-panelBg border border-panelBorder w-16 p-1 text-center focus:outline-none focus:border-brandAccent"
                  />
                </div>
              </div>
            )}

            {frequency === 'weekly' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <span>DAY OF WEEK:</span>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="bg-panelBg border border-panelBorder p-1 text-xs focus:outline-none focus:border-brandAccent"
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span>AT HOUR:</span>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={hour}
                      onChange={(e) => setHour(String(e.target.value).padStart(2, '0'))}
                      className="bg-panelBg border border-panelBorder w-16 p-1 text-center focus:outline-none focus:border-brandAccent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>MINUTE:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minute}
                      onChange={(e) => setMinute(String(e.target.value).padStart(2, '0'))}
                      className="bg-panelBg border border-panelBorder w-16 p-1 text-center focus:outline-none focus:border-brandAccent"
                    />
                  </div>
                </div>
              </div>
            )}

            {frequency === 'monthly' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <span>DAY OF MONTH:</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    className="bg-panelBg border border-panelBorder w-16 p-1 text-center focus:outline-none focus:border-brandAccent"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span>AT HOUR:</span>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={hour}
                      onChange={(e) => setHour(String(e.target.value).padStart(2, '0'))}
                      className="bg-panelBg border border-panelBorder w-16 p-1 text-center focus:outline-none focus:border-brandAccent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>MINUTE:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minute}
                      onChange={(e) => setMinute(String(e.target.value).padStart(2, '0'))}
                      className="bg-panelBg border border-panelBorder w-16 p-1 text-center focus:outline-none focus:border-brandAccent"
                    />
                  </div>
                </div>
              </div>
            )}

            {frequency === 'custom' && (
              <div className="space-y-2 text-xs">
                <span>ENTER CUSTOM CRON EXPRESSION:</span>
                <input
                  type="text"
                  value={customCron}
                  onChange={(e) => setCustomCron(e.target.value)}
                  className="w-full bg-panelBg border border-panelBorder p-2 font-mono focus:outline-none focus:border-brandAccent tracking-widest text-[#EAEAEA]"
                />
                <span className="text-[9px] text-[#555] block">
                  FORMAT: [MIN] [HOUR] [DOM] [MON] [DOW] (e.g. */15 * * * * or 0 2 * * *)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Cron Readout & Telemetry Display */}
        <div className="space-y-4 pt-4 border-t border-panelBorder">
          {/* Cron Readout */}
          <div className="bg-[#0A0A0A] border border-panelBorder p-3 flex justify-between items-center text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#71717A] font-bold block">[COMPILED_CRON_EXPR]</span>
              <span className="font-bold tracking-widest text-brandAccent text-sm">{cronExpression}</span>
            </div>
            <span className="text-[9px] text-brandSuccess border border-brandSuccess/20 bg-brandSuccess/5 px-2 py-0.5">
              PARSE_OK
            </span>
          </div>

          {/* Next Executions Preview */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">[NEXT EXECUTIONS TIMELINE]</span>
            <div className="bg-[#0A0A0A] border border-panelBorder p-3 text-[11px] space-y-1.5 font-mono text-[#71717A]">
              {nextRuns.map((run, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-brandAccent">→</span>
                  <span className="text-[#EAEAEA]">{run}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full bg-[#0A0A0A] hover:bg-brandAccent text-brandFg hover:text-white font-bold border border-panelBorder py-2.5 text-xs transition-colors duration-150 btn-press flex items-center justify-center gap-2"
          >
            ▶
            [REGISTER_SCHEDULE_TASK]
          </button>
        </div>
      </form>
    </div>
  );
}
