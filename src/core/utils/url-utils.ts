export function startsWithProtocol(text: string) {
	const protocolMatcher = /^(.*?:\/\/)/i
	return protocolMatcher.test(text)
}

export function stripProtocol(link: string) {
	const protocolMatcher = /^(.*?:\/\/)/i
	const matches = protocolMatcher.exec(link)
	if (!matches || matches.length <= 1) {
		return link
	}

	const protocol = matches[1]
	return link.substring(protocol.length)
}

export function addHttps(link: string) {
	const linkWithoutProtocol = stripProtocol(link)
	return `https://${linkWithoutProtocol}`
}
