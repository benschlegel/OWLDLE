'use client';
import TeamLogo from '@/components/game-container/TeamLogo';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatasetContext } from '@/context/DatasetContext';
import { ENDLESS_PATHNAME, type CombinedDatasetMetadata, isOwcsDataset } from '@/data/datasets';
import { atlanticPacificTeams, getAtlantic, getCn, getEmea, getKr, getNa, getPacific, PARTNERED_TEAMS_OWCS_S3 } from '@/data/teams/teams';
import { getDisabledTeams } from '@/data/disabledTeams';
import { useDialogParams } from '@/hooks/use-dialog-param';
import { useEndlessStore, type EndlessFilters } from '@/store/endless-store';
import { useSettings } from '@/store/settings-store';
import { CircleHelpIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useContext } from 'react';

type Props = {
	setOpen: (value: boolean) => void;
};

const DEFAULT_FILTERS: EndlessFilters = { regions: [], partnerOnly: false };

function TeamGroup({ title, teams, disabledTeams = [] }: { title: string; teams: string[]; disabledTeams?: readonly string[] }) {
	const sortedTeams = disabledTeams.length > 0 ? [...teams].sort((a, b) => Number(disabledTeams.includes(a)) - Number(disabledTeams.includes(b))) : teams;
	return (
		<div className="flex flex-col">
			<h3 className="flex gap-2 items-center scroll-m-20 pb-2 text-xl font-semibold tracking-tight font-owl opacity-90">{title}</h3>
			<div className="flex w-full gap-0 sm:gap-1 flex-wrap">
				{sortedTeams.map((team) => (
					<div className="w-14 sm:w-18 h-14 sm:h-18" key={team}>
						<TeamLogo teamName={team} useTabIndex className="shadow-[0_8px_30px_rgb(0,0,0,0.12)]" dailyDisabled={disabledTeams.includes(team)} />
					</div>
				))}
			</div>
		</div>
	);
}

function OWLTeams({ dataset, isEndless }: { dataset: CombinedDatasetMetadata; isEndless: boolean }) {
	const atlanticTeams = getAtlantic(dataset.dataset);
	const pacificTeams = getPacific(dataset.dataset);
	const disabledTeams = isEndless ? [] : getDisabledTeams(dataset.dataset);

	const atlanticText = atlanticPacificTeams.includes(dataset.dataset) ? 'Atlantic Division (Eastern)' : 'Eastern';
	const pacificText = atlanticPacificTeams.includes(dataset.dataset) ? 'Pacific Division (Western)' : 'Western';

	return (
		<div className="flex flex-col gap-3">
			<TeamGroup title={atlanticText} teams={atlanticTeams ?? []} disabledTeams={disabledTeams} />
			<TeamGroup title={pacificText} teams={pacificTeams ?? []} disabledTeams={disabledTeams} />
		</div>
	);
}

function OWCSTeams({ dataset, isEndless }: { dataset: CombinedDatasetMetadata; isEndless: boolean }) {
	const filtersFromStore = useEndlessStore((s) => s.datasets[dataset.dataset]?.filters);
	const disabledTeams = isEndless ? [] : getDisabledTeams(dataset.dataset);

	const isLatestSeason = isEndless && dataset.dataset === 'owcs-s3';
	const filters: EndlessFilters = isLatestSeason && filtersFromStore ? filtersFromStore : DEFAULT_FILTERS;

	const isRegionActive = (region: string) => !isLatestSeason || (filters.regions ?? []).length === 0 || (filters.regions ?? []).includes(region);

	const partnerSet = new Set<string>(isLatestSeason && filters.partnerOnly ? (PARTNERED_TEAMS_OWCS_S3 as ReadonlyArray<string>) : []);
	const filterTeams = (teams: readonly string[]) => (partnerSet.size > 0 ? teams.filter((t) => partnerSet.has(t)) : [...teams]);

	const emeaTeams = filterTeams(getEmea(dataset.dataset) ?? []);
	const naTeams = filterTeams(getNa(dataset.dataset) ?? []);
	const koreaTeams = filterTeams(getKr(dataset.dataset) ?? []);
	const cnTeams = filterTeams(getCn(dataset.dataset) ?? []);

	return (
		<div className="flex flex-col gap-3">
			{isRegionActive('EMEA') && <TeamGroup title="EMEA" teams={emeaTeams} disabledTeams={disabledTeams} />}
			{isRegionActive('NA') && <TeamGroup title="North America" teams={naTeams} disabledTeams={disabledTeams} />}
			{isRegionActive('Korea') && <TeamGroup title="Korea" teams={koreaTeams} disabledTeams={disabledTeams} />}
			{cnTeams.length > 0 && isRegionActive('CN') && <TeamGroup title="China" teams={cnTeams} disabledTeams={disabledTeams} />}
		</div>
	);
}

export default function TeamsContent({ setOpen }: Props) {
	const [dataset] = useContext(DatasetContext);
	const pathname = usePathname();
	const isEndless = pathname === ENDLESS_PATHNAME;
	const preferTeams = useSettings((s) => s.preferTeamsDialog);
	const setPreferTeams = useSettings((s) => s.setPreferTeamsDialog);
	const [, setDialog] = useDialogParams();

	const handleClose = useCallback(() => {
		setOpen(false);
	}, [setOpen]);

	const handleShowHelp = useCallback(() => {
		setPreferTeams(false);
		setDialog('help');
	}, [setPreferTeams, setDialog]);

	return (
		<DialogContent className="sm:max-w-3xl max-h-full py-6 px-3 md:px-7" aria-describedby="Participating teams.">
			<DialogHeader>
				<DialogTitle className="flex flex-row gap-2 items-center text-left font-owl">
					<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
					Teams
				</DialogTitle>
			</DialogHeader>
			<ScrollArea type="scroll" className="max-h-128">
				<main className="h-full w-full flex flex-col gap-6 px-2 pb-2 text-wrap wrap-break-word ">
					<p className="scroll-m-20 text-base tracking-normal">
						<span className="text-primary-foreground">{dataset.name}</span> has the following teams:
					</p>
					{!isOwcsDataset(dataset.dataset) ? <OWLTeams dataset={dataset} isEndless={isEndless} /> : <OWCSTeams dataset={dataset} isEndless={isEndless} />}
				</main>
			</ScrollArea>
			<DialogFooter className="gap-2 flex-row justify-end">
				{preferTeams && (
					<Button variant="outline" onClick={handleShowHelp}>
						Show help
					</Button>
				)}
				<Button type="submit" variant="outline" autoFocus onClick={handleClose}>
					Close
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
