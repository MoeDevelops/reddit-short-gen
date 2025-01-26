import { mkdir, rm, writeFile } from "node:fs"
import puppeteer, { type ElementHandle, type Browser } from "puppeteer"

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
            {
                name: "eu_cookie",
                value: "{%22opted%22:true%2C%22nonessential%22:false}",
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

type Comment = {
    text: string
    elementHandle: ElementHandle<Element>
}

async function filterComments(comments: ElementHandle<Element>[]) {
    const acceptedComments: Comment[] = []

    for (const comment of comments) {
        const result = await comment.evaluate((element) => {
            // Runs in browser
            let children = 0

            function childrenTree(el: Element) {
                for (let i = 0; i < el.children.length; i++) {
                    const child = el.children.item(i)
                    if (child) {
                        children++
                        childrenTree(child)
                    }
                }
            }

            childrenTree(element)

            const text =
                element.children
                    .item(2)
                    ?.children.item(0)
                    ?.children.item(0)
                    ?.textContent?.trim() ?? ""

            return { children: children, text: text }
        })

        if (result.children > 100 || result.text.length > 300) {
            continue
        }

        acceptedComments.push({ elementHandle: comment, text: result.text })
    }

    return acceptedComments
}

export async function takeScreenshots(sessionid: string, url: string) {
    rm("out/", { recursive: true }, () => {})

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

    mkdir("out/screenshots", { recursive: true }, () => {})
    mkdir("out/comments", { recursive: true }, () => {})
    mkdir("out/audios", { recursive: true }, () => {})

    const comments = await page.$$("shreddit-comment[depth='0']")

    const acceptedComments = await filterComments(comments)

    // First few screenshots can be glitchy
    await acceptedComments[0].elementHandle.screenshot()
    await acceptedComments[0].elementHandle.screenshot()
    await acceptedComments[0].elementHandle.screenshot()

    const title = await page.$("shreddit-post")

    if (!title) {
        return
    }

    await title.screenshot({
        path: "out/screenshots/screenshotMaster.png",
    })
    const titleText = (await page.title()).split(" : ").at(0) ?? ""
    writeFile("out/comments/commentMaster.txt", titleText, () => {})

    for (let i = 0; i < acceptedComments.length && i < 10; i++) {
        const comment = acceptedComments[i]
        await comment.elementHandle.screenshot({
            path: `out/screenshots/screenshot${i}.png`,
        })
        writeFile(`out/comments/comment${i}.txt`, comment.text, () => {})
    }

    await browser.close()
}
