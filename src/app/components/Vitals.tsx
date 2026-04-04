import { Heart, Activity, Thermometer, Droplets, Plus } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const heartRateData = [
  { id: 0, d: "Mon", v: 68 }, { id: 1, d: "Tue", v: 72 }, { id: 2, d: "Wed", v: 70 },
  { id: 3, d: "Thu", v: 75 }, { id: 4, d: "Fri", v: 71 }, { id: 5, d: "Sat", v: 69 }, { id: 6, d: "Sun", v: 72 },
];

const bpData = [
  { id: 0, d: "Mon", s: 118, di: 78 }, { id: 1, d: "Tue", s: 122, di: 80 },
  { id: 2, d: "Wed", s: 120, di: 79 }, { id: 3, d: "Thu", s: 125, di: 82 },
  { id: 4, d: "Fri", s: 119, di: 77 }, { id: 5, d: "Sat", s: 121, di: 80 },
  { id: 6, d: "Sun", s: 120, di: 80 },
];

const cards = [
  { title: "Heart Rate", value: "72", unit: "bpm", icon: Heart, color: "#d4183d" },
  { title: "SpO2", value: "98", unit: "%", icon: Droplets, color: "#577399" },
  { title: "Temp", value: "36.6", unit: "°C", icon: Thermometer, color: "#465e83" },
];

export function Vitals() {
  return (
    <div className="px-5 pt-14 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[#1e2533]" style={{ fontSize: 22, fontWeight: 600 }}>Vitals</h1>
        <button className="w-10 h-10 rounded-xl bg-[#577399] flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.title} className="bg-white rounded-2xl p-3 border border-[#d1d9e6]">
            <c.icon className="w-4 h-4 mb-2" style={{ color: c.color }} />
            <p className="text-[#1e2533]" style={{ fontSize: 20, fontWeight: 600 }}>{c.value}<span className="text-[#a9b9d0] ml-0.5" style={{ fontSize: 11, fontWeight: 400 }}>{c.unit}</span></p>
            <p className="text-[#a9b9d0]" style={{ fontSize: 11 }}>{c.title}</p>
          </div>
        ))}
      </div>

      {/* Heart Rate Chart */}
      <div className="bg-white rounded-2xl p-4 border border-[#d1d9e6]">
        <p className="text-[#1e2533] mb-3" style={{ fontSize: 15, fontWeight: 500 }}>Heart Rate - Week</p>
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={heartRateData}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4183d" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#d4183d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="id" stroke="#a9b9d0" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => heartRateData[val]?.d ?? ""} />
              <Area type="monotone" dataKey="v" stroke="#d4183d" fill="url(#hrGrad)" strokeWidth={2} dot={{ fill: "#d4183d", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Blood Pressure Chart */}
      <div className="bg-white rounded-2xl p-4 border border-[#d1d9e6]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 500 }}>Blood Pressure</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#577399]" />
              <span className="text-[#a9b9d0]" style={{ fontSize: 11 }}>Sys</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#a9b9d0]" />
              <span className="text-[#a9b9d0]" style={{ fontSize: 11 }}>Dia</span>
            </div>
          </div>
        </div>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bpData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eaedf4" vertical={false} />
              <XAxis dataKey="id" stroke="#a9b9d0" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => bpData[val]?.d ?? ""} />
              <YAxis stroke="#a9b9d0" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 140]} width={30} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #d1d9e6", fontSize: 12 }} />
              <Line type="monotone" dataKey="s" name="Systolic" stroke="#577399" strokeWidth={2} dot={{ fill: "#577399", r: 3 }} />
              <Line type="monotone" dataKey="di" name="Diastolic" stroke="#a9b9d0" strokeWidth={2} dot={{ fill: "#a9b9d0", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}