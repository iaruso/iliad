export const env = {
  MONGODB_URI: process.env.MONGODB_URI as string,
};

if (!env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}
