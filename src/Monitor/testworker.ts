import { checkWebsite } from "./worker";

async function run() {
    console.log("Testing Google...");

    const google = await checkWebsite({
        id: 1,
        url: "https://google.com",
    });

    console.log(google);

    console.log("\nTesting invalid website...");

    const invalid = await checkWebsite({
        id: 2,
        url: "https://thisdoesnotexist123456789.com",
    });

    console.log(invalid);
}

run();