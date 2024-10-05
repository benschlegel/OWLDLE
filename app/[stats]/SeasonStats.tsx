'use client';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { SeasonStat } from '@/lib/databaseAccess';
import type { Dataset } from '@/data/datasets';

export const description = 'A bar chart with a custom label';

const chartConfig = {
	dataset: {
		label: 'Dataset',
		color: 'hsl(var(--chart-1))',
	},
	count: {
		label: 'Test',
		color: 'hsl(var(--chart-1))',
	},
	label: {
		color: 'hsl(var(--foreground)',
	},
} satisfies ChartConfig;

type Props = { data?: SeasonStat[]; sortBySeason?: boolean };

const formatNumber = (value: number) => {
	return value.toLocaleString();
};

export default function SeasonStats({ data, sortBySeason }: Props) {
	if (!data) return <></>;

	if (sortBySeason) {
		data.sort((a, b) => a.dataset.localeCompare(b.dataset));
	}
	console.log('Data: ', data);
	return (
		<ChartContainer config={chartConfig} className="min-w-[200px] min-h-[100px] w-full">
			<BarChart
				accessibilityLayer
				data={[...data]}
				layout="vertical"
				margin={{
					right: 16,
				}}>
				<CartesianGrid horizontal={false} />
				<YAxis dataKey="dataset" type="category" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} hide />
				<XAxis dataKey="count" type="number" hide />
				<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
				<Bar dataKey="count" layout="vertical" fill="var(--color-dataset)" radius={4}>
					<LabelList dataKey="dataset" position="insideLeft" offset={12} className="fill-white" fontSize={15} />
					<LabelList dataKey="count" position="right" formatter={formatNumber} offset={8} className="fill-white" fontSize={14} />
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
