export default class Datacontainer {
	private static container: { [index: string]: any } = {};

	public static set(key: string, data: any): void {
		Datacontainer.container[key] = data;
	}

	public static get<T>(key: string): T {
		return Datacontainer.container[key] as T;
	}
}
