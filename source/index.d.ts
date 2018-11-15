declare type RoutePair = [string, any];

declare function DirectoryRoutes(directoryPath: string, callback?: (err: Error, result: RoutePair[]) => void) : Promise<RoutePair[]>;

export = DirectoryRoutes;