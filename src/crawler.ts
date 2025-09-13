import puppeteer, { type Browser, type ElementHandle } from "puppeteer"

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
				httpOnly: true,
				secure: true,
			},
			{
				name: "eu_cookie",
				value: "{%22opted%22:true%2C%22nonessential%22:false}",
				domain: ".reddit.com",
				path: "/",
				expires: -1,
				httpOnly: true,
				secure: true,
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

			const pParent = element.children.item(2)?.children.item(0)

			let text = ""

			for (let i = 0; i < (pParent?.children.length ?? 0); i++) {
				const element = pParent?.children.item(i)
				const textContent = element?.textContent?.trim()
				if (textContent) {
					text += textContent
				}
			}

			text = text.replaceAll("  ", " ")

			return { children: children, text: text }
		})

		if (
			result.children < 100 &&
			result.text.length < 300 &&
			result.text.length > 1
		) {
			acceptedComments.push({ elementHandle: comment, text: result.text })
		}
	}

	return acceptedComments
}

export async function takeScreenshots(sessionId: string, url: string) {
	const browser = await puppeteer.launch({
		headless: true,
	})

	await login(sessionId, browser)
	const page = await browser.newPage()
	await page.setUserAgent(
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
	)
	await page.setViewport({ width: 800, height: 1920, deviceScaleFactor: 4 })
	await page.goto(url)
	await page.waitForSelector("shreddit-comment")

	const comments = await page.$$("shreddit-comment[depth='0']")

	const acceptedComments = await filterComments(comments)
	const acceptedComment = acceptedComments[0]

	if (!acceptedComment) {
		throw new Error("There is now accepted comment")
	}

	await acceptedComment.elementHandle.screenshot()
	await acceptedComment.elementHandle.screenshot()
	await acceptedComment.elementHandle.screenshot()

	const title = await page.$("shreddit-post")

	if (!title) {
		return
	}

	await title.screenshot({
		path: "out/screenshots/screenshot#Master.png",
	})
	const titleText = (await page.title()).split(" : ").at(0) ?? ""
	Bun.write("out/comments/comment#Master.txt", titleText)

	for (let i = 0; i < acceptedComments.length && i < 10; i++) {
		const comment = acceptedComments[i]

		if (!comment) {
			throw new Error("There is no comment")
		}

		await comment.elementHandle.screenshot({
			path: `out/screenshots/screenshot${i}.png`,
		})
		Bun.write(`out/comments/comment${i}.txt`, comment.text)
	}

	await browser.close()
}
