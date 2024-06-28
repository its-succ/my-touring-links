import type { StoredGateway } from '$lib/adapters/stored-gateway';
import type { TouringEntity } from '$lib/models/entity';

export class TouringService {
  constructor(private store: StoredGateway<TouringEntity>) {}
}
