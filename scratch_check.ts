import dbConnect from "./src/lib/dbConnect";
import Collection from "./src/models/Collection";

async function run() {
  console.log("Connecting to DB...");
  await dbConnect();
  console.log("Fetching collections...");
  const cols = await Collection.find({});
  console.log("COLLECTIONS:");
  console.log(JSON.stringify(cols, null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
