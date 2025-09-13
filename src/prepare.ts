import { exists, mkdir, rm } from "node:fs/promises"

export async function prepare() {
	if (await exists("out/")) {
		await rm("out/", { recursive: true })
	}

	await mkdir("out/screenshots", { recursive: true })
	await mkdir("out/comments", { recursive: true })
	await mkdir("out/audios", { recursive: true })
	await mkdir("out/cache")
}
