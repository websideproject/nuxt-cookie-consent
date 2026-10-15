// Stand-in for an analytics snippet: the playground loads it through useScript with the `analytics` consent trigger,
// so it runs only after that category is granted.
window.__analyticsDemoLoaded = true
window.dispatchEvent(new Event('analytics-demo-loaded'))
