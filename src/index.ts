import "dotenv/config"
import { takeScreenshots } from "./crawler.js"

const sessionid = process.env.SESSION_ID ?? ""
const redditurl = process.env.REDDIT_URL ?? ""

takeScreenshots(sessionid, redditurl)
