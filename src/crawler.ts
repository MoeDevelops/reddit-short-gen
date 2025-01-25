import { mkdir, rmdir } from "node:fs"
import puppeteer, { type Browser } from "puppeteer"

async function wait(ms: number) {
  await new Promise((res) => {
    setTimeout(res, ms)
  })
}

async function login(sessionid: string, browser: Browser) {
  if (sessionid === "") {
    console.info("No Session ID. This may cause problems.")
  }

  await browser.setCookie(
    ...[
      {
        name: "reddit_session",
        value: sessionid,
        domain: ".reddit.com",
        path: "/",
        expires: -1,
        size: 820,
        httpOnly: true,
        secure: true,
        session: true,
      },
    ],
  )
}

export async function takeScreenshots(sessionid: string, url: string) {
  rmdir("out/", () => {})
  mkdir("out/", {}, () => {})
  const browser = await puppeteer.launch({
    headless: true,
  })

  await login(sessionid, browser)
  const page = await browser.newPage()
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
  )
  await page.setViewport({ width: 1080, height: 1920 })
  await page.goto(url)
  await page.waitForSelector("shreddit-comment")
  await wait(1000)

  const comments = await page.$$("shreddit-comment[depth='0']")

  for (let i = 0; i < comments.length && i < 10; i++) {
    await wait(100)
    const comment = comments[i]
    await comment.screenshot({
      path: `out/screenshot${i}.png`,
    })
  }

  await page.screenshot({ path: "out/screenshot.png" })

  await browser.close()
}
