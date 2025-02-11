import "dotenv/config"
import { takeScreenshots } from "./crawler.js"
import { createAudioFiles } from "./tts.js"
import { makeVideo } from "./video.js"

const sessionid = process.env.SESSION_ID ?? ""
const redditurl = process.env.REDDIT_URL ?? ""

await takeScreenshots(sessionid, redditurl)
await createAudioFiles()
await makeVideo()

console.log("Done! Check the out/ directory for the result")
