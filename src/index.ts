import "dotenv/config"
import { takeScreenshots } from "./crawler.js"
import { createAudioFiles } from "./tts.js"

const sessionid = process.env.SESSION_ID ?? ""
const redditurl = process.env.REDDIT_URL ?? ""

await takeScreenshots(sessionid, redditurl)
await createAudioFiles()
