import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartRequest } from '@/lib/llm-service';
import { ensureColors } from '@/lib/chart-colors';

interface PieChartProps {
  data: ChartRequest;
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const colors = ensureColors(data.data.length, data.colors);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data.data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={130}
            fill="#8884d8"
            dataKey="value"
            animationDuration={800}
            animationBegin={0}
          >
            {data.data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index]} 
                strokeWidth={2}
                stroke="hsl(var(--background))"
              />
            ))}
          </Pie>
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
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

