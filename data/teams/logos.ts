import type { Player } from '@/types/players';

type TeamLogoData = {
	teamName: Player['team'];
	backgroundColor: string;
	imgUrl: string;
};

// TODO: consider hosting locally in /public
// Next.js local image docs: https://nextjs.org/docs/pages/building-your-application/optimizing/images
// Vercel image optimization pricing: https://vercel.com/docs/image-optimization/limits-and-pricing

export const TEAM_LOGOS_S1: TeamLogoData[] = [
	{
		teamName: 'BostonUprising',
		backgroundColor: '#25487e',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/0/05/Boston_Uprising_darkmode.png/285px-Boston_Uprising_darkmode.png',
	},
	{
		teamName: 'DallasFuel',
		backgroundColor: '#152841',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/3/38/Dallas_Fuel_allmode.png/266px-Dallas_Fuel_allmode.png',
	},
	{
		teamName: 'FloridaMayhem',
		backgroundColor: '#fdda00',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/c/cc/Florida_Mayhem_2017_allmode.png/285px-Florida_Mayhem_2017_allmode.png',
	},
	{
		teamName: 'HoustonOutlaws',
		backgroundColor: '#000000',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/7/78/Houston_Outlaws_darkmode.png/285px-Houston_Outlaws_darkmode.png',
	},
	{
		teamName: 'LondonSpitfire',
		backgroundColor: '#5bcae9',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/0/08/London_Spitfire_allmode.png/285px-London_Spitfire_allmode.png',
	},
	{
		teamName: 'LosAngelesGladiators',
		backgroundColor: '#3a165b',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/1/12/Los_Angeles_Gladiators_darkmode.png/285px-Los_Angeles_Gladiators_darkmode.png',
	},
	{
		teamName: 'LosAngelesValiant',
		backgroundColor: '#2f7139',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/9/9d/Los_Angeles_Valiant_2017_allmode.png/285px-Los_Angeles_Valiant_2017_allmode.png',
	},
	{
		teamName: 'NewYorkExcelsior',
		backgroundColor: '#1d213d',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/a/a5/New_York_Excelsior_allmode.png/285px-New_York_Excelsior_allmode.png',
	},
	{
		teamName: 'PhiladelphiaFusion',
		backgroundColor: '#ffffff',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/2/2a/Philadelphia_Fusion_lightmode.png/285px-Philadelphia_Fusion_lightmode.png',
	},
	{
		teamName: 'SanFranciscoShock',
		backgroundColor: '#ffffff',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/3/3e/San_Francisco_Shock_2018_allmode.png/285px-San_Francisco_Shock_2018_allmode.png',
	},
	{
		teamName: 'SeoulDynasty',
		backgroundColor: '#000000',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/b/b7/Seoul_Dynasty_allmode.png/285px-Seoul_Dynasty_allmode.png',
	},
	{
		teamName: 'ShanghaiDragons',
		backgroundColor: '#b71b20',
		imgUrl: 'https://liquipedia.net/commons/images/thumb/b/b7/Shanghai_Dragons_lightmode.png/285px-Shanghai_Dragons_lightmode.png',
	},
];
