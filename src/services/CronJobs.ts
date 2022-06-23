export default class CronJobs {
	private static running: { [index: string]: boolean };

	public static async register(name: string, func: Function, interval: number): Promise<void> {
		await func();
		setInterval(CronJobs.staticFuncHandler(name, func, interval), interval);
	}

	private static staticFuncHandler(name: string, func: Function, interval: number): Function {
		return async () => {
			if (!CronJobs.running[name]) {
				CronJobs.running[name] = true;
				await func();
				CronJobs.running[name] = false;
			}
			setInterval(CronJobs.staticFuncHandler(name, func, interval), interval);
		};
	}
}
