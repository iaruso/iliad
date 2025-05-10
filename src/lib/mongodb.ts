import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor define a variável de ambiente MONGODB_URI');
}

if (process.env.NODE_ENV === 'development') {
  // @ts-expect-error: Global type definition for _mongoClientPromise is missing
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    // @ts-expect-error: Global type definition for _mongoClientPromise is missing
    global._mongoClientPromise = client.connect();
  }
  // @ts-expect-error: Global type definition for _mongoClientPromise is missing
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
