/**
 * Delete the cookies whose names match `patterns` (exact, or a prefix when the pattern ends in `*`). A cookie can
 * only be deleted with the domain it was set with, so each one is expired with no domain and with every parent
 * domain of `hostname` (analytics cookies are usually set on the registrable domain). Only `path=/` is covered, and
 * HttpOnly cookies are out of reach of the browser. Returns the names that matched.
 */
export function deleteCookies(patterns: string[], doc: Pick<Document, 'cookie'> = document, hostname = location.hostname): string[] {
  if (!patterns.length) return []
  const names = doc.cookie.split(';').map(pair => pair.split('=')[0]!.trim()).filter(Boolean)
  const matched = names.filter(name => patterns.some(pattern =>
    pattern.endsWith('*') ? name.startsWith(pattern.slice(0, -1)) : name === pattern,
  ))
  const domains = [undefined, ...parentDomains(hostname)]
  for (const name of matched) {
    for (const domain of domains)
      doc.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`
  }
  return matched
}

// 'www.shop.example.com' → ['www.shop.example.com', 'shop.example.com', 'example.com']. A single label
// (`localhost`) or an IP address takes no domain attribute.
function parentDomains(hostname: string): string[] {
  if (!hostname.includes('.') || /^[\d.]+$/.test(hostname) || hostname.includes(':')) return []
  const labels = hostname.split('.')
  const domains: string[] = []
  for (let i = 0; i < labels.length - 1; i++) domains.push(labels.slice(i).join('.'))
  return domains
}
