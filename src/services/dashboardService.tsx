const mockStatistics = {
	total_customers: 1284,
	total_branches: 42,
	total_agents: 156,
	total_imports: 89,
	successful_imports: 76,
	failed_imports: 13,
	pending_imports: 8,
};

const mockChartData = {
	monthly: [
		{ month: 'Jan', imports: 12, success: 10 },
		{ month: 'Feb', imports: 18, success: 15 },
		{ month: 'Mar', imports: 22, success: 19 },
		{ month: 'Apr', imports: 15, success: 13 },
		{ month: 'May', imports: 20, success: 17 },
		{ month: 'Jun', imports: 24, success: 21 },
	],
	branch_distribution: { North: 12, South: 15, East: 8, West: 7 },
	agent_distribution: { Active: 120, Inactive: 36 },
};

const mockActivities = [
	{ id: 1, action: 'Branch created', user: 'Admin', time: '2 hours ago', status: 'success' },
	{ id: 2, action: 'Import completed', user: 'System', time: '5 hours ago', status: 'success' },
	{ id: 3, action: 'Import failed', user: 'System', time: '1 day ago', status: 'failed' },
];

export const dashboardService = {
	getStatistics: async () => ({ data: mockStatistics }),
	getChartData: async () => ({ data: mockChartData }),
	getRecentActivities: async (_limit = 10) => ({ data: mockActivities.slice(0, _limit) }),
};
