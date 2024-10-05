'use client';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { PlayerOccurance, SeasonStat, WinPercentage } from '@/lib/databaseAccess';

export const description = 'A bar chart with a custom label';

const chartConfig = {
	name: {
		label: 'Dataset',
		color: 'hsl(var(--chart-1))',
	},
	count: {
		label: 'Guesses',
		color: 'hsl(var(--chart-1))',
	},
	label: {
		color: 'hsl(var(--foreground)',
	},
} satisfies ChartConfig;

type Props = { data?: PlayerOccurance; sortBySeason?: boolean; maxLength?: number };

const formatNumber = (value: number) => {
	return value.toLocaleString();
};

export default function WinnerStats({ data, sortBySeason, maxLength = 5 }: Props) {
	if (!data) return <></>;

	const formattedData = data.players.slice(0, maxLength);
	return (
		<ChartContainer config={chartConfig} className="min-w-[200px] min-h-[100px] max-h-[350px] w-full">
			<BarChart
				accessibilityLayer
				data={formattedData}
				// Temp hack to make animation work
				key={Math.random()}
				layout="vertical"
				margin={{
					right: 28,
				}}>
				<CartesianGrid horizontal={false} />
				<YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} hide />
				<XAxis dataKey="count" type="number" hide />
				<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
				<Bar dataKey="count" layout="vertical" fill="var(--color-name)" radius={4}>
					<LabelList dataKey="name" position="insideLeft" offset={24} className="fill-white opacity-95" fontSize={20} />
					<LabelList dataKey="count" position="right" formatter={formatNumber} offset={8} className="fill-white" fontSize={14} />
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
