import type { Player } from '@/types/players';

type TeamLogoData = {
	teamName: Player['team'];
	backgroundColor: string;
};

export const TEAM_COLORS_S1: TeamLogoData[] = [
	{ teamName: 'BostonUprising', backgroundColor: '#ffffff' },
	{ teamName: 'DallasFuel', backgroundColor: '#152841' },
	{ teamName: 'FloridaMayhem', backgroundColor: '#fdda00' },
	{ teamName: 'HoustonOutlaws', backgroundColor: '#000000' },
	{ teamName: 'LondonSpitfire', backgroundColor: '#5bcae9' },
	{ teamName: 'LosAngelesGladiators', backgroundColor: '#3a165b' },
	{ teamName: 'LosAngelesValiant', backgroundColor: '#2f7139' },
	{ teamName: 'NewYorkExcelsior', backgroundColor: '#1d213d' },
	{ teamName: 'PhiladelphiaFusion', backgroundColor: '#f89d3f' },
	{ teamName: 'SanFranciscoShock', backgroundColor: '#000000' },
	{ teamName: 'SeoulDynasty', backgroundColor: '#000000' },
	{ teamName: 'ShanghaiDragons', backgroundColor: '#b71b20' },
];
