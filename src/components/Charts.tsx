"use client";

import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart as RechartsLine,
  Line,
} from "recharts";

// Harmonious accent colors for charts
const COLORS = [
  "#1a1a1a",
  "#4a4a4a",
  "#7a7a7a",
  "#a3a3a3",
  "#c4c4c4",
  "#d4d4d4",
  "#525252",
  "#8c8c8c",
  "#b8b8b8",
  "#3a3a3a",
];

interface DailyData {
  date: string;
  minutes: number;
}

interface PieData {
  name: string;
  minutes: number;
}

// ============ Bar Chart (直方图) ============
export function FocusBarChart({ data }: { data: DailyData[] }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="暂无数据" />;
  }

  const chartData = data.map((d) => ({
    name: d.date.slice(5), // MM-DD
    minutes: d.minutes,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RechartsBar data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#999" }}
          axisLine={{ stroke: "#e0e0e0" }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#999" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            fontSize: 12,
            fontFamily: "inherit",
          }}
          formatter={(value) => [`${value} 分钟`, "专注时长"]}
        />
        <Bar
          dataKey="minutes"
          radius={[4, 4, 0, 0]}
          fill="var(--color-text)"
          maxBarSize={24}
        />
      </RechartsBar>
    </ResponsiveContainer>
  );
}

// ============ Pie Chart (饼图) ============
export function FocusPieChart({ data }: { data: PieData[] }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="暂无数据" />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RechartsPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="minutes"
          nameKey="name"
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="none"
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            fontSize: 12,
            fontFamily: "inherit",
          }}
          formatter={(value) => [`${value} 分钟`]}
        />
      </RechartsPie>
    </ResponsiveContainer>
  );
}

// ============ Trend Chart (趋势图) ============
export function FocusTrendChart({ data }: { data: DailyData[] }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="暂无数据" />;
  }

  const chartData = data.map((d) => ({
    name: d.date.slice(5),
    minutes: d.minutes,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RechartsLine data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#999" }}
          axisLine={{ stroke: "#e0e0e0" }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#999" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            fontSize: 12,
            fontFamily: "inherit",
          }}
          formatter={(value) => [`${value} 分钟`, "专注时长"]}
        />
        <Line
          type="monotone"
          dataKey="minutes"
          stroke="var(--color-text)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "var(--color-text)" }}
        />
      </RechartsLine>
    </ResponsiveContainer>
  );
}

// ============ Legend for pie chart ============
export function PieLegend({
  data,
}: {
  data: { name: string; minutes: number }[];
}) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.minutes, 0);

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
      {data.map((d, i) => (
        <div key={d.name} className="flex items-center gap-1.5 text-xs text-[--color-text-secondary]">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          />
          <span>{d.name}</span>
          <span className="text-[--color-text-tertiary]">
            {total > 0 ? Math.round((d.minutes / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[220px] text-xs text-[--color-text-tertiary]">
      {message}
    </div>
  );
}
