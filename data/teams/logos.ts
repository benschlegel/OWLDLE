import type { Player } from '@/types/players';

type TeamLogoData = {
	teamName: Player['team'];
	backgroundColor: string;
	imgUrl: string;
};

export const TEAM_LOGOS_S1: TeamLogoData[] = [
	{
		teamName: 'BostonUprising',
		backgroundColor: '#25487e',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/3/30/Boston_Uprising_lightmode.png/285px-Boston_Uprising_lightmode.png',
	},
	{
		teamName: 'DallasFuel',
		backgroundColor: '#152841',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/3/38/Dallas_Fuel_allmode.png/266px-Dallas_Fuel_allmode.png',
	},
	{ teamName: 'FloridaMayhem', backgroundColor: '#fdda00', imgUrl: '' },
	{ teamName: 'HoustonOutlaws', backgroundColor: '#000000', imgUrl: '' },
	{ teamName: 'LondonSpitfire', backgroundColor: '#5bcae9', imgUrl: '' },
	{ teamName: 'LosAngelesGladiators', backgroundColor: '#3a165b', imgUrl: '' },
	{ teamName: 'LosAngelesValiant', backgroundColor: '#2f7139', imgUrl: '' },
	{ teamName: 'NewYorkExcelsior', backgroundColor: '#1d213d', imgUrl: '' },
	{ teamName: 'PhiladelphiaFusion', backgroundColor: '#f89d3f', imgUrl: '' },
	{ teamName: 'SanFranciscoShock', backgroundColor: '#000000', imgUrl: '' },
	{ teamName: 'SeoulDynasty', backgroundColor: '#000000', imgUrl: '' },
	{ teamName: 'ShanghaiDragons', backgroundColor: '#b71b20', imgUrl: '' },
];
