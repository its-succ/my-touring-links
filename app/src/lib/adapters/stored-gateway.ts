import type { RoutesEntity, BaseEntity } from '$lib/models/entity';
import type {
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue
} from 'firebase/firestore';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import { DateTime } from 'luxon';

export type DATABASES = 'users' | 'routes';

export interface StoredGateway<T extends BaseEntity> {
  save(entity: T): Promise<T>;
  findById(id: string): Promise<T | undefined>;
}

export interface RoutesStoredGateway extends StoredGateway<RoutesEntity> {
  findAllByUserId(userId: string): Promise<RoutesEntity[]>;
}

export const createStoredGateway = (db: Firestore, database: DATABASES) => {
  switch (database) {
    case 'routes':
      return new FirestoreRoutesGateway(db, database);
    default:
      throw Error(`unknown databse ${database}`);
  }
};

export const converter = <T extends BaseEntity>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>) => {
    return data;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<T>, options?: SnapshotOptions) => {
    const data = snapshot.data(options);
    if (data.createdAt instanceof Timestamp) data.createdAt = data.createdAt.toDate();
    if (data.updatedAt instanceof Timestamp) data.updatedAt = data.updatedAt.toDate();
    return data;
  }
});

class FirestoreGateway<T extends BaseEntity> implements StoredGateway<T> {
  constructor(
    protected db: Firestore,
    protected database: DATABASES
  ) {}

  async save(entity: T): Promise<T> {
    if (entity.id === undefined) {
      entity.createdAt = entity.updatedAt = DateTime.now().toJSDate();
      const docRef = await addDoc(
        collection(this.db, this.database).withConverter(converter<T>()),
        entity
      );
      entity.id = docRef.id;
    } else {
      entity.updatedAt = DateTime.now().toJSDate();
      const { id, ...updateEntity } = entity;
      await setDoc(doc(this.db, this.database, id).withConverter(converter<T>()), updateEntity);
    }
    return entity;
  }

  async findById(id: string): Promise<T | undefined> {
    const result = await getDoc(doc(this.db, this.database, id).withConverter(converter<T>()));
    if (!result.exists()) return undefined;
    return { ...result.data(), id };
  }
}

class FirestoreRoutesGateway extends FirestoreGateway<RoutesEntity> implements RoutesStoredGateway {
  async findAllByUserId(userId: string): Promise<RoutesEntity[]> {
    const querySnapshot = await getDocs(
      query(collection(this.db, this.database), where('userId', '==', userId)).withConverter(
        converter<RoutesEntity>()
      )
    );
    const routes: RoutesEntity[] = [];
    querySnapshot.forEach((doc) => routes.push({ ...doc.data(), id: doc.id }));
    return routes;
  }
}
