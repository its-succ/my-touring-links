import type { RoutesEntity, BaseEntity } from "$lib/models/entity";
import type { DocumentData, Firestore, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from "firebase/firestore";
import { Timestamp, addDoc, collection, doc, getDoc, setDoc  } from "firebase/firestore";
import { DateTime } from "luxon";

export type DATABASES = 'users' | 'routes';

export interface StoredGateway<T extends BaseEntity> {
  save(entity: T): Promise<T>;
  findById(id: string): Promise<T | undefined>;
}

export const createStoredGateway = (db: Firestore, database: DATABASES) => {
  switch (database) {
    case 'routes':
      return new FirestoreGateway<RoutesEntity>(db, database);
    default:
      throw Error(`unknown databse ${database}`);
  }
}

export const converter = <T extends BaseEntity>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>) => {
    return data;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<T>, options?: SnapshotOptions) => {
    const data = snapshot.data(options);
    if (data.createdAt instanceof Timestamp) data.createdAt = data.createdAt.toDate();
    if (data.updatedAt instanceof Timestamp) data.updatedAt = data.updatedAt.toDate();
    return data;
  },
});

class FirestoreGateway<T extends BaseEntity> implements StoredGateway<T> {
  constructor(private db: Firestore, private database: DATABASES) {}

  async save(entity: T): Promise<T> {
    if (entity.id === undefined) {
      entity.createdAt = entity.updatedAt = DateTime.now().toJSDate();
      const docRef = await addDoc(collection(this.db, this.database).withConverter(converter<T>()), entity);
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
