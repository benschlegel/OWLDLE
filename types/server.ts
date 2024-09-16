export type GuessResponse = {
	isRoleCorrect: boolean;
	isCountryCorrect: boolean;
	isTeamCorrect: boolean;
	isNameCorrect: boolean;
	isRegionCorrect: boolean;
};

export type ValidateResponse = {
	nextReset: Date;
	correctPlayer?: string;
};
