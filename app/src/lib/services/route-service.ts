import type { StoredGateway } from "$lib/adapters/stored-gateway";
import type { RoutesEntity } from "$lib/models/entity";


export class RouteService {
  constructor(private store: StoredGateway<RoutesEntity>) {}
}
