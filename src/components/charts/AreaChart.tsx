import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartRequest } from '@/lib/llm-service';
import { ensureColors } from '@/lib/chart-colors';

interface AreaChartProps {
  data: ChartRequest;
}

export const AreaChart: React.FC<AreaChartProps> = ({ data }) => {
  const colors = ensureColors(1, data.colors);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id={`colorValue-${colors[0]}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            className="text-muted-foreground"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: data.xAxisLabel, position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            className="text-muted-foreground"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: data.yAxisLabel, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--card-foreground))',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={colors[0]} 
            fill={`url(#colorValue-${colors[0]})`}
            strokeWidth={3}
            animationDuration={800}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

