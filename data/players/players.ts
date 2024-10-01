import type { Player } from '@/types/players';

// * Season 1
export const s1Players: Player[] = [
	// Eastern teams
	{ name: 'Mistakes', country: 'RU', role: 'Damage', team: 'BostonUprising' },
	{ name: 'Striker', country: 'KR', role: 'Damage', team: 'BostonUprising' },
	{ name: 'Kalios', country: 'KR', role: 'Tank', team: 'BostonUprising', isFlex: true },
	{ name: 'NotE', country: 'CA', role: 'Tank', team: 'BostonUprising', isFlex: true },
	{ name: 'Gamsu', country: 'KR', role: 'Tank', team: 'BostonUprising' },
	{ name: 'AimGod', country: 'KR', role: 'Support', team: 'BostonUprising' },
	{ name: 'Avast', country: 'US', role: 'Support', team: 'BostonUprising' },
	{ name: 'Kellex', country: 'DK', role: 'Support', team: 'BostonUprising' },
	{ name: 'Neko', country: 'KR', role: 'Support', team: 'BostonUprising' },
	{ name: 'Snow', country: 'ET', role: 'Support', team: 'BostonUprising' },
	{ name: 'TviQ', country: 'SE', role: 'Damage', team: 'FloridaMayhem' },
	{ name: 'Logix', country: 'BE', role: 'Damage', team: 'FloridaMayhem' },
	{ name: 'Sayaplayer', country: 'KR', role: 'Damage', team: 'FloridaMayhem' },
	{ name: 'Manneten', country: 'SE', role: 'Tank', team: 'FloridaMayhem', isFlex: true },
	{ name: 'zappis', country: 'FI', role: 'Tank', team: 'FloridaMayhem', isFlex: true },
	{ name: 'aWesomeGuy', country: 'KR', role: 'Tank', team: 'FloridaMayhem' },
	{ name: 'CWoosH', country: 'SE', role: 'Tank', team: 'FloridaMayhem' },
	{ name: 'Zebbosai', country: 'SE', role: 'Support', team: 'FloridaMayhem' },
	{ name: 'Zuppeh', country: 'FI', role: 'Support', team: 'FloridaMayhem' },
	{ name: 'ArHaN', country: 'KR', role: 'Damage', team: 'HoustonOutlaws' },
	{ name: 'Clockwork', country: 'US', role: 'Damage', team: 'HoustonOutlaws' },
	{ name: 'JAKE', country: 'US', role: 'Damage', team: 'HoustonOutlaws' },
	{ name: 'LiNkzr', country: 'FI', role: 'Damage', team: 'HoustonOutlaws' },
	{ name: 'Mendokusaii', country: 'SE', role: 'Damage', team: 'HoustonOutlaws' },
	{ name: 'coolmatt', country: 'US', role: 'Tank', team: 'HoustonOutlaws', isFlex: true },
	{ name: 'SPREE', country: 'BE', role: 'Tank', team: 'HoustonOutlaws', isFlex: true },
	{ name: 'FCTFCTN', country: 'US', role: 'Tank', team: 'HoustonOutlaws' },
	{ name: 'Muma', country: 'US', role: 'Tank', team: 'HoustonOutlaws' },
	{ name: 'Bani', country: 'CA', role: 'Support', team: 'HoustonOutlaws' },
	{ name: 'Boink', country: 'US', role: 'Support', team: 'HoustonOutlaws' },
	{ name: 'Rawkus', country: 'US', role: 'Support', team: 'HoustonOutlaws' },
	{ name: 'birdring', country: 'KR', role: 'Damage', team: 'LondonSpitfire' },
	{ name: 'Profit', country: 'KR', role: 'Damage', team: 'LondonSpitfire' },
	{ name: 'Hooreg', country: 'KR', role: 'Damage', team: 'LondonSpitfire' },
	{ name: 'Fury', country: 'KR', role: 'Tank', team: 'LondonSpitfire', isFlex: true },
	{ name: 'WooHyaL', country: 'KR', role: 'Tank', team: 'LondonSpitfire', isFlex: true },
	{ name: 'Gesture', country: 'KR', role: 'Tank', team: 'LondonSpitfire' },
	{ name: 'TiZi', country: 'KR', role: 'Tank', team: 'LondonSpitfire' },
	{ name: 'HaGoPeun', country: 'KR', role: 'Support', team: 'LondonSpitfire' },
	{ name: 'Closer', country: 'KR', role: 'Support', team: 'LondonSpitfire' },
	{ name: 'Bdosin', country: 'KR', role: 'Support', team: 'LondonSpitfire' },
	{ name: 'NUS', country: 'KR', role: 'Support', team: 'LondonSpitfire' },
	{ name: 'Saebyeolbe', country: 'KR', role: 'Damage', team: 'NewYorkExcelsior' },
	{ name: 'Libero', country: 'KR', role: 'Damage', team: 'NewYorkExcelsior' },
	{ name: 'Pine', country: 'KR', role: 'Damage', team: 'NewYorkExcelsior' },
	{ name: 'MekO', country: 'KR', role: 'Tank', team: 'NewYorkExcelsior', isFlex: true },
	{ name: 'Janus', country: 'KR', role: 'Tank', team: 'NewYorkExcelsior' },
	{ name: 'Mano', country: 'KR', role: 'Tank', team: 'NewYorkExcelsior' },
	{ name: 'JJoNak', country: 'KR', role: 'Support', team: 'NewYorkExcelsior' },
	{ name: 'ArK', country: 'KR', role: 'Support', team: 'NewYorkExcelsior' },
	{ name: 'Anamo', country: 'KR', role: 'Support', team: 'NewYorkExcelsior' },
	{ name: 'Carpe', country: 'KR', role: 'Damage', team: 'PhiladelphiaFusion' },
	{ name: 'ShaDowBurn', country: 'RU', role: 'Damage', team: 'PhiladelphiaFusion' },
	{ name: 'Eqo', country: 'IL', role: 'Damage', team: 'PhiladelphiaFusion' },
	{ name: 'snillo', country: 'SE', role: 'Damage', team: 'PhiladelphiaFusion' },
	{ name: 'HOTBA', country: 'KR', role: 'Tank', team: 'PhiladelphiaFusion', isFlex: true },
	{ name: 'Poko', country: 'FR', role: 'Tank', team: 'PhiladelphiaFusion', isFlex: true },
	{ name: 'SADO', country: 'KR', role: 'Tank', team: 'PhiladelphiaFusion' },
	{ name: 'Fragi', country: 'FI', role: 'Tank', team: 'PhiladelphiaFusion' },
	{ name: 'Boombox', country: 'UK', role: 'Support', team: 'PhiladelphiaFusion' },
	{ name: 'Dayfly', country: 'KR', role: 'Support', team: 'PhiladelphiaFusion' },
	{ name: 'neptuNo', country: 'ES', role: 'Support', team: 'PhiladelphiaFusion' },
	{ name: 'Joemeister', country: 'CA', role: 'Support', team: 'PhiladelphiaFusion' },

	// Western teams
	{ name: 'Seagull', country: 'US', role: 'Damage', team: 'DallasFuel' },
	{ name: 'Taimou', country: 'FI', role: 'Damage', team: 'DallasFuel' },
	{ name: 'EFFECT', country: 'KR', role: 'Damage', team: 'DallasFuel' },
	{ name: 'aKm', country: 'FR', role: 'Damage', team: 'DallasFuel' },
	{ name: 'Mickie', country: 'TH', role: 'Tank', team: 'DallasFuel', isFlex: true },
	{ name: 'cocco', country: 'SE', role: 'Tank', team: 'DallasFuel' },
	{ name: 'OGE', country: 'KR', role: 'Tank', team: 'DallasFuel' },
	{ name: 'chipshajen', country: 'SE', role: 'Support', team: 'DallasFuel' },
	{ name: 'HarryHook', country: 'ES', role: 'Support', team: 'DallasFuel' },
	{ name: 'Asher', country: 'KR', role: 'Damage', team: 'LosAngelesGladiators' },
	{ name: 'Hydration', country: 'US', role: 'Damage', team: 'LosAngelesGladiators' },
	{ name: 'silkthread', country: 'US', role: 'Damage', team: 'LosAngelesGladiators' },
	{ name: 'Surefour', country: 'CA', role: 'Damage', team: 'LosAngelesGladiators' },
	{ name: 'Bischu', country: 'KR', role: 'Tank', team: 'LosAngelesGladiators', isFlex: true },
	{ name: 'Void', country: 'KR', role: 'Tank', team: 'LosAngelesGladiators', isFlex: true },
	{ name: 'Fissure', country: 'KR', role: 'Tank', team: 'LosAngelesGladiators' },
	{ name: 'iRemiix', country: 'PR', role: 'Tank', team: 'LosAngelesGladiators' },
	{ name: 'BigGoose', country: 'FI', role: 'Support', team: 'LosAngelesGladiators' },
	{ name: 'Shaz', country: 'FI', role: 'Support', team: 'LosAngelesGladiators' },
	{ name: 'Agilities', country: 'CA', role: 'Damage', team: 'LosAngelesValiant' },
	{ name: 'Bunny', country: 'KR', role: 'Damage', team: 'LosAngelesValiant' },
	{ name: 'KSF', country: 'US', role: 'Damage', team: 'LosAngelesValiant' },
	{ name: 'SoOn', country: 'FR', role: 'Damage', team: 'LosAngelesValiant' },
	{ name: 'Finnsi', country: 'IS', role: 'Tank', team: 'LosAngelesValiant', isFlex: true },
	{ name: 'SPACE', country: 'US', role: 'Tank', team: 'LosAngelesValiant', isFlex: true },
	{ name: 'Fate', country: 'KR', role: 'Tank', team: 'LosAngelesValiant' },
	{ name: 'numlocked', country: 'UK', role: 'Tank', team: 'LosAngelesValiant' },
	{ name: 'Custa', country: 'AU', role: 'Support', team: 'LosAngelesValiant' },
	{ name: 'Izayaki', country: 'KR', role: 'Support', team: 'LosAngelesValiant' },
	{ name: 'KariV', country: 'KR', role: 'Support', team: 'LosAngelesValiant' },
	{ name: 'Verbo', country: 'CA', role: 'Support', team: 'LosAngelesValiant' },
	{ name: 'Architect', country: 'KR', role: 'Damage', team: 'SanFranciscoShock' },
	{ name: 'babybay', country: 'US', role: 'Damage', team: 'SanFranciscoShock' },
	{ name: 'Danteh', country: 'US', role: 'Damage', team: 'SanFranciscoShock' },
	{ name: 'iddqd', country: 'SE', role: 'Damage', team: 'SanFranciscoShock' },
	// sintra
	{ name: 'ChoiHyoBin', country: 'KR', role: 'Tank', team: 'SanFranciscoShock', isFlex: true },
	{ name: 'Nevix', country: 'SE', role: 'Tank', team: 'SanFranciscoShock', isFlex: true },
	{ name: 'nomy', country: 'MX', role: 'Tank', team: 'SanFranciscoShock' },
	{ name: 'super', country: 'US', role: 'Tank', team: 'SanFranciscoShock' },
	{ name: 'dhaK', country: 'ES', role: 'Support', team: 'SanFranciscoShock' },
	{ name: 'moth', country: 'US', role: 'Support', team: 'SanFranciscoShock' },
	{ name: 'sleepy', country: 'US', role: 'Support', team: 'SanFranciscoShock' },
	{ name: 'Fleta', country: 'KR', role: 'Damage', team: 'SeoulDynasty' },
	{ name: 'Munchkin', country: 'KR', role: 'Damage', team: 'SeoulDynasty' },
	{ name: 'Wekeed', country: 'KR', role: 'Damage', team: 'SeoulDynasty' },
	{ name: 'xepheR', country: 'KR', role: 'Tank', team: 'SeoulDynasty', isFlex: true },
	{ name: 'zunba', country: 'KR', role: 'Tank', team: 'SeoulDynasty', isFlex: true },
	{ name: 'Miro', country: 'KR', role: 'Tank', team: 'SeoulDynasty' },
	{ name: 'KuKi', country: 'KR', role: 'Tank', team: 'SeoulDynasty' },
	{ name: 'tobi', country: 'KR', role: 'Support', team: 'SeoulDynasty' },
	{ name: 'ryujehong', country: 'KR', role: 'Support', team: 'SeoulDynasty' },
	{ name: 'Gido', country: 'KR', role: 'Support', team: 'SeoulDynasty' },
	{ name: 'Gambler', country: 'KR', role: 'Support', team: 'SeoulDynasty' },
	{ name: 'Ado', country: 'KR', role: 'Damage', team: 'ShanghaiDragons' },
	{ name: 'Daemin', country: 'KR', role: 'Damage', team: 'ShanghaiDragons' },
	{ name: 'Diya', country: 'CN', role: 'Damage', team: 'ShanghaiDragons' },
	{ name: 'Geguri', country: 'KR', role: 'Tank', team: 'ShanghaiDragons', isFlex: true },
	{ name: 'MG', country: 'CN', role: 'Tank', team: 'ShanghaiDragons', isFlex: true },
	{ name: 'Xushu', country: 'CN', role: 'Tank', team: 'ShanghaiDragons', isFlex: true },
	{ name: 'Fearless', country: 'KR', role: 'Tank', team: 'ShanghaiDragons' },
	{ name: 'Roshan', country: 'CN', role: 'Tank', team: 'ShanghaiDragons' },
	{ name: 'Altering', country: 'CN', role: 'Support', team: 'ShanghaiDragons' },
	{ name: 'Fiveking', country: 'CN', role: 'Support', team: 'ShanghaiDragons' },
	{ name: 'Freefeel', country: 'CN', role: 'Support', team: 'ShanghaiDragons' },
	{ name: 'Sky', country: 'CN', role: 'Support', team: 'ShanghaiDragons' },
	{ name: 'xQc', country: 'CA', role: 'Tank', team: 'DallasFuel' },
] as const;

// * Season 2
export const s2Players: Player<'season2'>[] = [
	// Eastern teams
	{ name: 'babybay', country: 'US', role: 'Damage', team: 'AtlantaReign' },
	{ name: 'Erster', country: 'KR', role: 'Damage', team: 'AtlantaReign' },
	{ name: 'NLaaeR', country: 'RU', role: 'Damage', team: 'AtlantaReign' },
	{ name: 'DACO', country: 'KR', role: 'Tank', team: 'AtlantaReign' },
	{ name: 'frd', country: 'US', role: 'Tank', team: 'AtlantaReign' },
	{ name: 'Gator', country: 'US', role: 'Tank', team: 'AtlantaReign' },
	{ name: 'Pokpo', country: 'KR', role: 'Tank', team: 'AtlantaReign' },
	{ name: 'Masaa', country: 'FI', role: 'Support', team: 'AtlantaReign' },
	{ name: 'Dogman', country: 'US', role: 'Support', team: 'AtlantaReign' },
	{ name: 'FunnyAstro', country: 'UK', role: 'Support', team: 'AtlantaReign' },

	{ name: 'Colourhex', country: 'NZ', role: 'Damage', team: 'BostonUprising' },
	{ name: 'Stellar', country: 'KR', role: 'Damage', team: 'BostonUprising' },
	{ name: 'blasé', country: 'US', role: 'Damage', team: 'BostonUprising', isFlex: true },
	{ name: 'rCk', country: 'FI', role: 'Tank', team: 'BostonUprising' },
	{ name: 'Axxiom', country: 'KR', role: 'Tank', team: 'BostonUprising' },
	{ name: 'Fusions', country: 'UK', role: 'Tank', team: 'BostonUprising' },
	{ name: 'AimGod', country: 'KR', role: 'Support', team: 'BostonUprising' },
	{ name: 'Persia', country: 'KR', role: 'Support', team: 'BostonUprising' },
	{ name: 'alemao', country: 'BR', role: 'Support', team: 'BostonUprising' },
	{ name: 'Kellex', country: 'DK', role: 'Support', team: 'BostonUprising' },

	{ name: 'Sayaplayer', country: 'KR', role: 'Damage', team: 'FloridaMayhem' },
	{ name: 'BQB', country: 'KR', role: 'Damage', team: 'FloridaMayhem' },
	{ name: 'DPI', country: 'KR', role: 'Tank', team: 'FloridaMayhem', isFlex: true },
	{ name: 'xepheR', country: 'KR', role: 'Tank', team: 'FloridaMayhem' },
	{ name: 'Gargoyle', country: 'KR', role: 'Tank', team: 'FloridaMayhem' },
	{ name: 'Fate', country: 'KR', role: 'Tank', team: 'FloridaMayhem' },
	{ name: 'Swon', country: 'KR', role: 'Tank', team: 'FloridaMayhem' },
	{ name: 'Karayan', country: 'KR', role: 'Tank', team: 'FloridaMayhem' },
	{ name: 'HaGoPeun', country: 'KR', role: 'Support', team: 'FloridaMayhem' },
	{ name: 'Byrem', country: 'KR', role: 'Support', team: 'FloridaMayhem' },
	{ name: 'Kris', country: 'KR', role: 'Support', team: 'FloridaMayhem' },
	{ name: 'RaiN', country: 'KR', role: 'Support', team: 'FloridaMayhem' },

	{ name: 'ArHaN', country: 'KR', role: 'Damage', team: 'HoustonOutlaws' },
	{ name: 'JAKE', country: 'US', role: 'Damage', team: 'HoustonOutlaws' },
	{ name: 'LiNkzr', country: 'FI', role: 'Damage', team: 'HoustonOutlaws' },
	{ name: 'Danteh', country: 'US', role: 'Damage', team: 'HoustonOutlaws' },
	{ name: 'coolmatt', country: 'US', role: 'Tank', team: 'HoustonOutlaws' },
	{ name: 'SPREE', country: 'BE', role: 'Tank', team: 'HoustonOutlaws' },
	{ name: 'Muma', country: 'US', role: 'Tank', team: 'HoustonOutlaws' },
	{ name: 'Bani', country: 'CA', role: 'Support', team: 'HoustonOutlaws' },
	{ name: 'Boink', country: 'US', role: 'Support', team: 'HoustonOutlaws' },
	{ name: 'Rawkus', country: 'US', role: 'Support', team: 'HoustonOutlaws' },

	{ name: 'birdring', country: 'KR', role: 'Damage', team: 'LondonSpitfire' },
	{ name: 'Profit', country: 'KR', role: 'Damage', team: 'LondonSpitfire' },
	{ name: 'Guard', country: 'KR', role: 'Damage', team: 'LondonSpitfire' },
	{ name: 'Fury', country: 'KR', role: 'Tank', team: 'LondonSpitfire' },
	{ name: 'Gesture', country: 'KR', role: 'Tank', team: 'LondonSpitfire' },
	{ name: 'Bdosin', country: 'KR', role: 'Support', team: 'LondonSpitfire' },
	{ name: 'NUS', country: 'KR', role: 'Support', team: 'LondonSpitfire' },
	{ name: 'Krillin', country: 'KR', role: 'Support', team: 'LondonSpitfire' },
	{ name: 'Quatermain', country: 'KR', role: 'Support', team: 'LondonSpitfire' },

	{ name: 'Saebyeolbe', country: 'KR', role: 'Damage', team: 'NewYorkExcelsior' },
	{ name: 'Libero', country: 'KR', role: 'Damage', team: 'NewYorkExcelsior' },
	{ name: 'Pine', country: 'KR', role: 'Damage', team: 'NewYorkExcelsior' },
	{ name: 'Fl0w3R', country: 'KR', role: 'Damage', team: 'NewYorkExcelsior' },
	{ name: 'Nenne', country: 'KR', role: 'Damage', team: 'NewYorkExcelsior' },
	{ name: 'MekO', country: 'KR', role: 'Tank', team: 'NewYorkExcelsior' },
	{ name: 'Mano', country: 'KR', role: 'Tank', team: 'NewYorkExcelsior' },
	{ name: 'JJoNak', country: 'KR', role: 'Support', team: 'NewYorkExcelsior' },
	{ name: 'ANAMO', country: 'KR', role: 'Support', team: 'NewYorkExcelsior' },

	{ name: 'SoOn', country: 'FR', role: 'Damage', team: 'ParisEternal' },
	{ name: 'ShaDowBurn', country: 'RU', role: 'Damage', team: 'ParisEternal' },
	{ name: 'NiCOgdh', country: 'FR', role: 'Damage', team: 'ParisEternal' },
	{ name: 'Danye', country: 'PL', role: 'Damage', team: 'ParisEternal' },
	{ name: 'Finnsi', country: 'IS', role: 'Tank', team: 'ParisEternal' },
	{ name: 'BenBest', country: 'FR', role: 'Tank', team: 'ParisEternal' },
	{ name: 'LhCloudy', country: 'FI', role: 'Tank', team: 'ParisEternal' },
	{ name: 'HyP', country: 'FR', role: 'Support', team: 'ParisEternal' },
	{ name: 'Kruise', country: 'UK', role: 'Support', team: 'ParisEternal' },
	{ name: 'Greyy', country: 'PT', role: 'Support', team: 'ParisEternal' },

	{ name: 'Carpe', country: 'KR', role: 'Damage', team: 'PhiladelphiaFusion' },
	{ name: 'Eqo', country: 'IL', role: 'Damage', team: 'PhiladelphiaFusion' },
	{ name: 'Kyb', country: 'UK', role: 'Damage', team: 'PhiladelphiaFusion' },
	{ name: 'snillo', country: 'SE', role: 'Damage', team: 'PhiladelphiaFusion' },
	{ name: 'Poko', country: 'FR', role: 'Tank', team: 'PhiladelphiaFusion' },
	{ name: 'SADO', country: 'KR', role: 'Tank', team: 'PhiladelphiaFusion' },
	{ name: 'Boombox', country: 'UK', role: 'Support', team: 'PhiladelphiaFusion' },
	{ name: 'neptuNo', country: 'ES', role: 'Support', team: 'PhiladelphiaFusion' },
	{ name: 'Elk', country: 'US', role: 'Support', team: 'PhiladelphiaFusion' },

	{ name: 'Ivy', country: 'KR', role: 'Damage', team: 'TorontoDefiant' },
	{ name: 'im37', country: 'KR', role: 'Damage', team: 'TorontoDefiant' },
	{ name: 'Logix', country: 'BE', role: 'Damage', team: 'TorontoDefiant' },
	{ name: 'Mangachu', country: 'CA', role: 'Damage', team: 'TorontoDefiant' },
	{ name: 'Gods', country: 'US', role: 'Tank', team: 'TorontoDefiant' },
	{ name: 'Yakpung', country: 'KR', role: 'Tank', team: 'TorontoDefiant' },
	{ name: 'sharyk', country: 'LV', role: 'Tank', team: 'TorontoDefiant' },
	{ name: 'Neko', country: 'KR', role: 'Support', team: 'TorontoDefiant' },
	{ name: 'Aid', country: 'KR', role: 'Support', team: 'TorontoDefiant' },
	{ name: 'RoKy', country: 'KR', role: 'Support', team: 'TorontoDefiant' },

	{ name: 'Ado', country: 'KR', role: 'Damage', team: 'WashingtonJustice' },
	{ name: 'Corey', country: 'US', role: 'Damage', team: 'WashingtonJustice' },
	{ name: 'Stratus', country: 'US', role: 'Damage', team: 'WashingtonJustice' },
	{ name: 'SanSam', country: 'KR', role: 'Tank', team: 'WashingtonJustice' },
	{ name: 'ELLIVOTE', country: 'SE', role: 'Tank', team: 'WashingtonJustice' },
	{ name: 'Janus', country: 'KR', role: 'Tank', team: 'WashingtonJustice' },
	{ name: 'LullSiSH', country: 'SE', role: 'Tank', team: 'WashingtonJustice' },
	{ name: 'Gido', country: 'KR', role: 'Support', team: 'WashingtonJustice' },
	{ name: 'ArK', country: 'KR', role: 'Support', team: 'WashingtonJustice' },
	{ name: 'Hyeonu', country: 'KR', role: 'Support', team: 'WashingtonJustice' },
	{ name: 'sleepy', country: 'US', role: 'Support', team: 'WashingtonJustice' },

	// Western
	{ name: 'Baconjack', country: 'TW', role: 'Damage', team: 'ChengduHunters' },
	{ name: 'JinMu', country: 'CN', role: 'Damage', team: 'ChengduHunters' },
	{ name: 'YangXiaoLong', country: 'CN', role: 'Damage', team: 'ChengduHunters' },
	{ name: 'Elsa', country: 'CN', role: 'Tank', team: 'ChengduHunters' },
	{ name: 'LateYoung', country: 'CN', role: 'Tank', team: 'ChengduHunters' },
	{ name: 'Ameng', country: 'CN', role: 'Tank', team: 'ChengduHunters' },
	{ name: 'Jiqiren', country: 'CN', role: 'Tank', team: 'ChengduHunters' },
	{ name: 'Garry', country: 'CN', role: 'Support', team: 'ChengduHunters' },
	{ name: 'Kyo', country: 'CN', role: 'Support', team: 'ChengduHunters' },
	{ name: 'Yveltal', country: 'CN', role: 'Support', team: 'ChengduHunters' },

	{ name: 'Taimou', country: 'FI', role: 'Damage', team: 'DallasFuel' },
	{ name: 'aKm', country: 'FR', role: 'Damage', team: 'DallasFuel' },
	{ name: 'ZachaREEE', country: 'US', role: 'Damage', team: 'DallasFuel' },
	{ name: 'Mickie', country: 'TH', role: 'Tank', team: 'DallasFuel' },
	{ name: 'NotE', country: 'CA', role: 'Tank', team: 'DallasFuel' },
	{ name: 'OGE', country: 'KR', role: 'Tank', team: 'DallasFuel' },
	{ name: 'Trill', country: 'AU', role: 'Tank', team: 'DallasFuel' },
	{ name: 'HarryHook', country: 'ES', role: 'Support', team: 'DallasFuel' },
	{ name: 'uNKOE', country: 'FR', role: 'Support', team: 'DallasFuel' },
	{ name: 'Closer', country: 'KR', role: 'Support', team: 'DallasFuel' },

	{ name: 'Eileen', country: 'CN', role: 'Damage', team: 'GuangzhouCharge' },
	{ name: 'Happy', country: 'KR', role: 'Damage', team: 'GuangzhouCharge' },
	{ name: 'nero', country: 'US', role: 'Damage', team: 'GuangzhouCharge' },
	{ name: 'Bischu', country: 'KR', role: 'Tank', team: 'GuangzhouCharge' },
	{ name: 'HOTBA', country: 'KR', role: 'Tank', team: 'GuangzhouCharge' },
	{ name: 'Fragi', country: 'FI', role: 'Tank', team: 'GuangzhouCharge' },
	{ name: 'Rio', country: 'KR', role: 'Tank', team: 'GuangzhouCharge' },
	{ name: 'Chara', country: 'KR', role: 'Support', team: 'GuangzhouCharge' },
	{ name: 'OnlyWish', country: 'CN', role: 'Support', team: 'GuangzhouCharge' },
	{ name: 'Shu', country: 'KR', role: 'Support', team: 'GuangzhouCharge' },
	{ name: 'Rise', country: 'KR', role: 'Support', team: 'GuangzhouCharge' },

	{ name: 'Adora', country: 'KR', role: 'Damage', team: 'HangzhouSpark' },
	{ name: 'Bazzi', country: 'KR', role: 'Damage', team: 'HangzhouSpark' },
	{ name: 'GodsB', country: 'KR', role: 'Damage', team: 'HangzhouSpark' },
	{ name: 'Krystal', country: 'CN', role: 'Damage', team: 'HangzhouSpark' },
	{ name: 'SASIN', country: 'KR', role: 'Tank', team: 'HangzhouSpark', isFlex: true },
	{ name: 'Ria', country: 'KR', role: 'Tank', team: 'HangzhouSpark' },
	{ name: 'guxue', country: 'CN', role: 'Tank', team: 'HangzhouSpark' },
	{ name: 'NoSmite', country: 'KR', role: 'Tank', team: 'HangzhouSpark' },
	{ name: 'BeBe', country: 'KR', role: 'Support', team: 'HangzhouSpark' },
	{ name: 'iDK', country: 'KR', role: 'Support', team: 'HangzhouSpark' },
	{ name: 'Revenge', country: 'KR', role: 'Support', team: 'HangzhouSpark' },

	{ name: 'Surefour', country: 'CA', role: 'Damage', team: 'LosAngelesGladiators' },
	{ name: 'Decay', country: 'KR', role: 'Damage', team: 'LosAngelesGladiators' },
	{ name: 'Hydration', country: 'US', role: 'Damage', team: 'LosAngelesGladiators', isFlex: true },
	{ name: 'Void', country: 'KR', role: 'Tank', team: 'LosAngelesGladiators' },
	{ name: 'rOar', country: 'KR', role: 'Tank', team: 'LosAngelesGladiators' },
	{ name: 'Panker', country: 'KR', role: 'Tank', team: 'LosAngelesGladiators' },
	{ name: 'BigGoose', country: 'FI', role: 'Support', team: 'LosAngelesGladiators' },
	{ name: 'Shaz', country: 'FI', role: 'Support', team: 'LosAngelesGladiators' },
	{ name: 'Ripa', country: 'FI', role: 'Support', team: 'LosAngelesGladiators' },

	{ name: 'Agilities', country: 'CA', role: 'Damage', team: 'LosAngelesValiant' },
	{ name: 'KSF', country: 'US', role: 'Damage', team: 'LosAngelesValiant' },
	{ name: 'Shax', country: 'DK', role: 'Damage', team: 'LosAngelesValiant' },
	{ name: 'SPACE', country: 'US', role: 'Tank', team: 'LosAngelesValiant' },
	{ name: 'McGravy', country: 'US', role: 'Tank', team: 'LosAngelesValiant' },
	{ name: 'FCTFCTN', country: 'US', role: 'Tank', team: 'LosAngelesValiant' },
	{ name: 'Custa', country: 'AU', role: 'Support', team: 'LosAngelesValiant' },
	{ name: 'KariV', country: 'KR', role: 'Support', team: 'LosAngelesValiant' },

	{ name: 'Architect', country: 'KR', role: 'Damage', team: 'SanFranciscoShock' },
	{ name: 'Striker', country: 'KR', role: 'Damage', team: 'SanFranciscoShock' },
	{ name: 'Rascal', country: 'KR', role: 'Damage', team: 'SanFranciscoShock', isFlex: true },
	{ name: 'ChoiHyoBin', country: 'KR', role: 'Tank', team: 'SanFranciscoShock' },
	{ name: 'Nevix', country: 'SE', role: 'Tank', team: 'SanFranciscoShock' },
	{ name: 'super', country: 'US', role: 'Tank', team: 'SanFranciscoShock' },
	{ name: 'smurf', country: 'KR', role: 'Tank', team: 'SanFranciscoShock' },
	{ name: 'moth', country: 'US', role: 'Support', team: 'SanFranciscoShock' },
	{ name: 'Viol2t', country: 'KR', role: 'Support', team: 'SanFranciscoShock' },

	{ name: 'FITS', country: 'KR', role: 'Damage', team: 'SeoulDynasty' },
	{ name: 'Fleta', country: 'KR', role: 'Damage', team: 'SeoulDynasty' },
	{ name: 'ILLICIT', country: 'KR', role: 'Damage', team: 'SeoulDynasty' },
	{ name: 'Michelle', country: 'KR', role: 'Tank', team: 'SeoulDynasty' },
	{ name: 'zunba', country: 'KR', role: 'Tank', team: 'SeoulDynasty' },
	{ name: 'Marve1', country: 'KR', role: 'Tank', team: 'SeoulDynasty' },
	{ name: 'Jecse', country: 'KR', role: 'Support', team: 'SeoulDynasty' },
	{ name: 'tobi', country: 'KR', role: 'Support', team: 'SeoulDynasty' },
	{ name: 'ryujehong', country: 'KR', role: 'Support', team: 'SeoulDynasty' },
	{ name: 'Highly', country: 'KR', role: 'Support', team: 'SeoulDynasty' },

	{ name: 'Diya', country: 'CN', role: 'Damage', team: 'ShanghaiDragons' },
	{ name: 'diem', country: 'KR', role: 'Damage', team: 'ShanghaiDragons' },
	{ name: 'DDing', country: 'KR', role: 'Damage', team: 'ShanghaiDragons' },
	{ name: 'YOUNGJIN', country: 'KR', role: 'Damage', team: 'ShanghaiDragons', isFlex: true },
	{ name: 'Geguri', country: 'KR', role: 'Tank', team: 'ShanghaiDragons' },
	{ name: 'envy', country: 'KR', role: 'Tank', team: 'ShanghaiDragons' },
	{ name: 'Gamsu', country: 'KR', role: 'Tank', team: 'ShanghaiDragons' },
	{ name: 'CoMa', country: 'KR', role: 'Support', team: 'ShanghaiDragons' },
	{ name: 'Luffy', country: 'KR', role: 'Support', team: 'ShanghaiDragons' },
	{ name: 'Izayaki', country: 'KR', role: 'Support', team: 'ShanghaiDragons' },

	{ name: 'Haksal', country: 'KR', role: 'Damage', team: 'VancouverTitans' },
	{ name: 'Hooreg', country: 'KR', role: 'Damage', team: 'VancouverTitans' },
	{ name: 'Stitch', country: 'KR', role: 'Damage', team: 'VancouverTitans' },
	{ name: 'SeoMinSoo', country: 'KR', role: 'Damage', team: 'VancouverTitans', isFlex: true },
	{ name: 'JJANU', country: 'KR', role: 'Tank', team: 'VancouverTitans' },
	{ name: 'Bumper', country: 'KR', role: 'Tank', team: 'VancouverTitans' },
	{ name: 'TiZi', country: 'KR', role: 'Tank', team: 'VancouverTitans' },
	{ name: 'Rapel', country: 'KR', role: 'Support', team: 'VancouverTitans' },
	{ name: 'SLIME', country: 'KR', role: 'Support', team: 'VancouverTitans' },
	{ name: 'Twilight', country: 'KR', role: 'Support', team: 'VancouverTitans' },
] as const;

// * Season 3
