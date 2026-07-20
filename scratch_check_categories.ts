import dbConnect from "./src/lib/dbConnect";
import Category from "./src/models/Category";

async function run() {
  await dbConnect();
  const cats = await Category.find({});
  console.log("CATEGORIES:");
  console.log(JSON.stringify(cats.map(c => ({ id: c._id, name: c.name, slug: c.slug, parentId: c.parentId })), null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
