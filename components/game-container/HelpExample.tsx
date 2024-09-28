import CustomCell from '@/components/ui/CustomCell';

const demoCells = [
	{ isLarge: true, bgColor: '#ed8796', color: '#fff', description: 'Name incorrect', text: 'Name incorrect', detailText: '' },
	{ bgColor: '#f5a97f', color: '#3b3b44', description: 'Country', detailText: 'Nationality (represented by flag)' },
	{ bgColor: '#eed49f', color: '#3b3b44', description: 'Role', detailText: 'Role (Support, Damage or Tank)' },
	{ bgColor: '#a6da95', color: '#3b3b44', description: 'Region', detailText: 'Region (Atlantic or Pacific Division)' },
	{ bgColor: '#8aadf4', color: '#3b3b44', description: 'Team', detailText: 'Team (represented by logo)' },
];

export default function HelpExample() {
	return (
		<div className="flex flex-col">
			<div>Abc</div>
			<div className="flex flex-row sm:gap-2 gap-1 w-full md:w-[60%]">
				{demoCells.map((cell) => (
					<CustomCell cellData={cell} key={`example-${cell.description}`} />
				))}
			</div>
		</div>
	);
}
