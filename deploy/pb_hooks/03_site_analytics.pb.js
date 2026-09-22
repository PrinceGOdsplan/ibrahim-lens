/// Site analytics: Cloudflare Web Analytics visits + top public paths for Studio.

var SITE_ANALYTICS_CACHE = { at: 0, key: "", payload: null }
var SITE_ANALYTICS_CACHE_MS = 5 * 60 * 1000

function siteAnalyticsEmpty(period) {
  return { available: false, visits: 0, pageViews: 0, topPaths: [], period: period }
}

function siteAnalyticsIso(ms) {
  var s = new Date(ms).toISOString()
  if (s.indexOf(".") > 0) return s.split(".")[0] + "Z"
  return s
}

function isPublicMarketingPath(path) {
  var p = String(path || "").split("?")[0]
  if (!p || p.charAt(0) !== "/") return false
  if (p.indexOf("/studio") === 0) return false
  if (p.indexOf("/g/") === 0 || p === "/g") return false
  if (p.indexOf("/api") === 0) return false
  if (p.indexOf("/_") === 0) return false
  if (p.indexOf("/assets") === 0) return false
  if (p === "/") return true
  if (p.indexOf("/about") === 0) return true
  if (p.indexOf("/portfolio") === 0) return true
  if (p.indexOf("/work") === 0) return true
  if (p.indexOf("/contact") === 0) return true
  if (p.indexOf("/privacy") === 0) return true
  if (p.indexOf("/terms") === 0) return true
  return false
}

function fetchCloudflareSiteAnalytics(period) {
  var token = String($os.getenv("CLOUDFLARE_API_TOKEN") || "").trim()
  var account = String($os.getenv("CLOUDFLARE_ACCOUNT_ID") || "").trim()
  var siteTag = String($os.getenv("CLOUDFLARE_RUM_SITE_TAG") || "").trim()
  if (!token || !account || !siteTag) return siteAnalyticsEmpty(period)

  var cacheKey = period + "|" + account + "|" + siteTag
  var now = Date.now()
  if (
    SITE_ANALYTICS_CACHE.payload &&
    SITE_ANALYTICS_CACHE.key === cacheKey &&
    now - SITE_ANALYTICS_CACHE.at < SITE_ANALYTICS_CACHE_MS
  ) {
    return SITE_ANALYTICS_CACHE.payload
  }

  var days = 7
  if (period === "30d") days = 30
  if (period === "all") days = 90
  var endMs = now
  var startMs = endMs - days * 86400000
  var start = siteAnalyticsIso(startMs)
  var end = siteAnalyticsIso(endMs)

  var q =
    "query($accountTag: string!, $siteTag: string!, $start: Time!, $end: Time!) {" +
    " viewer { accounts(filter: { accountTag: $accountTag }) {" +
    " total: rumPageloadEventsAdaptiveGroups(limit: 1, filter: { datetime_geq: $start, datetime_leq: $end, siteTag: $siteTag }) { count sum { visits } }" +
    " byPath: rumPageloadEventsAdaptiveGroups(limit: 40, filter: { datetime_geq: $start, datetime_leq: $end, siteTag: $siteTag }, orderBy: [count_DESC]) { count dimensions { requestPath } }" +
    " } } }"

  var body = JSON.stringify({
    query: q,
    variables: { accountTag: account, siteTag: siteTag, start: start, end: end },
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

  if (!res || res.statusCode < 200 || res.statusCode >= 300) return siteAnalyticsEmpty(period)

  var parsed = res.json
  if (!parsed) {
    try {
      parsed = JSON.parse(String(res.raw || "{}"))
    } catch (_) {
      return siteAnalyticsEmpty(period)
    }
  }
  if (parsed.errors) return siteAnalyticsEmpty(period)

  var visits = 0
  var pageViews = 0
  var topPaths = []
  try {
    var accountRow = parsed.data.viewer.accounts[0]
    var totalRow = accountRow.total[0]
    visits = Number(totalRow.sum.visits) || 0
    pageViews = Number(totalRow.count) || 0
    var paths = accountRow.byPath || []
    var i
    for (i = 0; i < paths.length; i++) {
      var path = String(paths[i].dimensions.requestPath || "")
      if (!isPublicMarketingPath(path)) continue
      var views = Number(paths[i].count) || 0
      if (views <= 0) continue
      topPaths.push({ path: path, views: views })
      if (topPaths.length >= 5) break
    }
  } catch (_) {
    return siteAnalyticsEmpty(period)
  }

  var payload = {
    available: true,
    visits: visits,
    pageViews: pageViews,
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
    var period = "7d"
    try {
      var info = e.requestInfo() || {}
      period = String((info.query && info.query.period) || "7d").trim()
    } catch (_) {}
    if (period !== "7d" && period !== "30d" && period !== "all") period = "7d"

    try {
      return e.json(200, fetchCloudflareSiteAnalytics(period))
    } catch (_) {
      return e.json(200, siteAnalyticsEmpty(period))
    }
  },
  $apis.requireAuth(),
)
