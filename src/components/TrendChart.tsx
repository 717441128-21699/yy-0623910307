import type { TrendPoint } from '@/types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface TrendChartProps {
  data: TrendPoint[];
  title?: string;
  height?: number;
  className?: string;
}

export default function TrendChart({ data, title, height = 320, className }: TrendChartProps) {
  return (
    <div className={cn('bg-white rounded-2xl p-5 shadow-card', className)}>
      {title && (
        <h3 className="text-base font-bold text-deepsea-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorForwards" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B9AAA" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1B9AAA" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B3F74" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#1B3F74" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EFF8" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#8FB0DD"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#8FB0DD"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(11, 32, 56, 0.95)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
            labelStyle={{ color: '#C7D8EE', marginBottom: 4, fontWeight: 600 }}
            itemStyle={{ padding: '2px 0' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
          />
          <Area
            type="monotone"
            dataKey="forwards"
            name="转发"
            stroke="#1B9AAA"
            strokeWidth={2.5}
            fill="url(#colorForwards)"
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="comments"
            name="评论"
            stroke="#FF6B35"
            strokeWidth={2.5}
            fill="url(#colorComments)"
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="likes"
            name="点赞"
            stroke="#1B3F74"
            strokeWidth={2.5}
            fill="url(#colorLikes)"
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
