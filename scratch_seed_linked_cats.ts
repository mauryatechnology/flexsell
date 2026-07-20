import dbConnect from "./src/lib/dbConnect";
import Collection from "./src/models/Collection";

async function run() {
  console.log("Connecting to DB...");
  await dbConnect();
  console.log("Updating collection...");
  const result = await Collection.findOneAndUpdate(
    { slug: "test-collection" },
    { $set: { linkedCategoryIds: ["60c72b2f9b1d8e001c8e1a10", "60c72b2f9b1d8e001c8e1a11"] } },
    { new: true }
  );
  console.log("UPDATED RECORD:");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
