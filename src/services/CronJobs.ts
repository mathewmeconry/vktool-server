export default class CronJobs {
	public static async register(func: Function, interval: number): Promise<void> {
		await func();
		setInterval(CronJobs.staticFuncHandler(func, interval), interval);
	}

	private static staticFuncHandler(func: Function, interval: number): Function {
		return async () => {
			await func();
			setInterval(CronJobs.staticFuncHandler(func, interval), interval);
		};
	}
}
