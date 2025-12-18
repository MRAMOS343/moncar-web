import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface LazyPieChartProps {
  children?: React.ReactNode;
  height?: number;
  [key: string]: any;
}

export function LazyPieChart({ children, height = 320, ...props }: LazyPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart {...props}>
        {children}
      </PieChart>
    </ResponsiveContainer>
  );
}

export { Pie, Cell, Tooltip, ResponsiveContainer };
