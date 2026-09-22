/// Site analytics: Cloudflare Web Analytics visits + top public paths for Studio.

var SITE_ANALYTICS_CACHE = { at: 0, key: "", payload: null }
var SITE_ANALYTICS_CACHE_MS = 5 * 60 * 1000

function siteAnalyticsConfigured() {
  var token = String($os.getenv("CLOUDFLARE_API_TOKEN") || "").trim()
  var account = String($os.getenv("CLOUDFLARE_ACCOUNT_ID") || "").trim()
  var siteTag = String($os.getenv("CLOUDFLARE_RUM_SITE_TAG") || "").trim()
  return !!(token && account && siteTag)
}

function siteAnalyticsPeriodStart(period) {
  var end = new Date()
  var start = new Date(end.getTime())
  if (period === "30d") {
    start.setUTCDate(start.getUTCDate() - 30)
  } else if (period === "all") {
    start.setUTCDate(start.getUTCDate() - 90)
  } else {
    start.setUTCDate(start.getUTCDate() - 7)
  }
  return { start: start, end: end }
}

function toRfc3339(d) {
  return d.toISOString().replace(/\.\d{3}Z$/, "Z")
}

function isPublicMarketingPath(path) {
  var p = String(path || "").split("?")[0]
  if (!p || p.charAt(0) !== "/") return false
  if (p.indexOf("/studio") === 0) return false
  if (p.indexOf("/g/") === 0 || p === "/g") return false
  if (p.indexOf("/api") === 0) return false
  if (p.indexOf("/_") === 0) return false
  if (p.indexOf("/assets") === 0) return false
  if (p === "/" || p === "") return true
  var base = p.replace(/\/$/, "")
  if (
    base === "/about" ||
    base === "/portfolio" ||
    base === "/contact" ||
    base === "/privacy" ||
    base === "/terms" ||
    base === "/work"
  ) {
    return true
  }
  if (base.indexOf("/work/") === 0 && base.length > "/work/".length) return true
  return false
}

function fetchCloudflareSiteAnalytics(period) {
  var token = String($os.getenv("CLOUDFLARE_API_TOKEN") || "").trim()
  var account = String($os.getenv("CLOUDFLARE_ACCOUNT_ID") || "").trim()
  var siteTag = String($os.getenv("CLOUDFLARE_RUM_SITE_TAG") || "").trim()
  if (!token || !account || !siteTag) {
    return { available: false, visits: 0, pageViews: 0, topPaths: [], period: period }
  }

  var cacheKey = period + "|" + account + "|" + siteTag
  var now = Date.now()
  if (
    SITE_ANALYTICS_CACHE.payload &&
    SITE_ANALYTICS_CACHE.key === cacheKey &&
    now - SITE_ANALYTICS_CACHE.at < SITE_ANALYTICS_CACHE_MS
  ) {
    return SITE_ANALYTICS_CACHE.payload
  }

  var range = siteAnalyticsPeriodStart(period)
  var query =
    "query($accountTag: string!, $siteTag: string!, $start: Time!, $end: Time!) {" +
    "  viewer {" +
    "    accounts(filter: { accountTag: $accountTag }) {" +
    "      total: rumPageloadEventsAdaptiveGroups(" +
    "        limit: 1" +
    "        filter: { datetime_geq: $start, datetime_leq: $end, siteTag: $siteTag }" +
    "      ) { count sum { visits } }" +
    "      byPath: rumPageloadEventsAdaptiveGroups(" +
    "        limit: 40" +
    "        filter: { datetime_geq: $start, datetime_leq: $end, siteTag: $siteTag }" +
    "        orderBy: [count_DESC]" +
    "      ) { count sum { visits } dimensions { requestPath } }" +
    "    }" +
    "  }" +
    "}"

  var body = JSON.stringify({
    query: query,
    variables: {
      accountTag: account,
      siteTag: siteTag,
      start: toRfc3339(range.start),
      end: toRfc3339(range.end),
    },
  })

  var res = $http.send({
    url: "https://api.cloudflare.com/client/v4/graphql",
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: body,
    timeout: 20,
  })

  var parsed = res.json || {}
  try {
    if (!res.json && res.raw) parsed = JSON.parse(String(res.raw))
  } catch (_) {
    parsed = {}
  }

  if (res.statusCode < 200 || res.statusCode >= 300 || (parsed.errors && parsed.errors.length)) {
    return { available: false, visits: 0, pageViews: 0, topPaths: [], period: period }
  }

  var accounts = (((parsed.data || {}).viewer || {}).accounts) || []
  var accountRow = accounts[0] || {}
  var totalRow = (accountRow.total && accountRow.total[0]) || {}
  var visits = Number((totalRow.sum && totalRow.sum.visits) || 0)
  if (visits !== visits) visits = 0

  var byPath = accountRow.byPath || []
  var topPaths = []
  var i
  for (i = 0; i < byPath.length; i++) {
    var row = byPath[i]
    var path = String(((row.dimensions || {}).requestPath) || "")
    if (!isPublicMarketingPath(path)) continue
    var views = Number(row.count || 0)
    if (views !== views || views <= 0) continue
    topPaths.push({ path: path === "" ? "/" : path, views: views })
    if (topPaths.length >= 5) break
  }

  var payload = {
    available: true,
    visits: visits,
    pageViews: Number(totalRow.count || 0) || 0,
    topPaths: topPaths,
    period: period,
  }
  SITE_ANALYTICS_CACHE = { at: now, key: cacheKey, payload: payload }
  return payload
}

routerAdd(
  "GET",
  "/api/ibrahim/site-analytics",
  (e) => {
    var info = e.requestInfo() || {}
    var period = String((info.query && info.query.period) || "7d").trim()
    if (period !== "7d" && period !== "30d" && period !== "all") period = "7d"

    if (!siteAnalyticsConfigured()) {
      return e.json(200, {
        available: false,
        visits: 0,
        pageViews: 0,
        topPaths: [],
        period: period,
      })
    }

    try {
      return e.json(200, fetchCloudflareSiteAnalytics(period))
    } catch (_) {
      return e.json(200, {
        available: false,
        visits: 0,
        pageViews: 0,
        topPaths: [],
        period: period,
      })
    }
  },
  $apis.requireAuth(),
)
