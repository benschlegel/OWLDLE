'use client';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { WinPercentage } from '@/lib/databaseAccess';
export const description = 'A bar chart with a custom label';

const chartConfig = {
	dataset: {
		label: 'Dataset',
		color: 'hsl(var(--chart-1))',
	},
	winPercentage: {
		label: 'Win %',
		color: 'hsl(var(--chart-1))',
	},
	label: {
		color: 'hsl(var(--foreground)',
	},
} satisfies ChartConfig;

type Props = { data?: WinPercentage[]; sortBySeason?: boolean };

const formatNumber = (value: number) => {
	return `${value.toFixed(1).toLocaleString()}%`;
};

export default function WinPercentStats({ data, sortBySeason }: Props) {
	if (!data) return <></>;

	data.sort((a, b) => b.winPercentage - a.winPercentage);
	// if (sortBySeason) {
	// 	data.sort((a, b) => a.dataset.localeCompare(b.dataset));
	// }
	console.log('Data: ', data);
	return (
		<ChartContainer config={chartConfig} className="min-w-[200px] min-h-[100px] w-full">
			<BarChart
				accessibilityLayer
				data={data}
				// Temp hack to make animation work
				key={Math.random()}
				layout="vertical"
				margin={{
					right: 10,
				}}>
				<CartesianGrid horizontal={false} />
				<YAxis dataKey="dataset" type="category" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} hide />
				<XAxis dataKey="winPercentage" type="number" hide />
				<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
				<Bar dataKey="winPercentage" layout="vertical" fill="var(--color-dataset)" radius={4}>
					<LabelList dataKey="dataset" position="insideLeft" offset={12} className="fill-white" fontSize={16} />
					<LabelList dataKey="winPercentage" position="right" formatter={formatNumber} offset={8} className="fill-white" fontSize={14} />
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
