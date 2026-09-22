/// Site analytics: Cloudflare Web Analytics visits + top public paths for Studio.

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

    var empty = { available: false, visits: 0, pageViews: 0, topPaths: [], period: period }

    var token = String($os.getenv("CLOUDFLARE_API_TOKEN") || "").trim()
    var account = String($os.getenv("CLOUDFLARE_ACCOUNT_ID") || "").trim()
    var siteTag = String($os.getenv("CLOUDFLARE_RUM_SITE_TAG") || "").trim()
    if (!token || !account || !siteTag) {
      return e.json(200, empty)
    }

    var days = 7
    if (period === "30d") days = 30
    if (period === "all") days = 90
    var endMs = Date.now()
    var startMs = endMs - days * 86400000
    var start = new Date(startMs).toISOString()
    var end = new Date(endMs).toISOString()
    if (start.indexOf(".") > 0) start = start.split(".")[0] + "Z"
    if (end.indexOf(".") > 0) end = end.split(".")[0] + "Z"

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

    var res
    try {
      res = $http.send({
        url: "https://api.cloudflare.com/client/v4/graphql",
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: body,
        timeout: 20,
      })
    } catch (_) {
      return e.json(200, empty)
    }

    if (!res || res.statusCode < 200 || res.statusCode >= 300) {
      return e.json(200, empty)
    }

    var parsed = res.json
    if (!parsed) {
      try {
        parsed = JSON.parse(String(res.raw || "{}"))
      } catch (_) {
        return e.json(200, empty)
      }
    }
    if (parsed.errors) return e.json(200, empty)

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
        if (path.indexOf("/studio") === 0) continue
        if (path.indexOf("/g/") === 0) continue
        if (path.indexOf("/api") === 0) continue
        if (path.indexOf("/_") === 0) continue
        if (path.indexOf("/assets") === 0) continue
        if (
          !(
            path === "/" ||
            path.indexOf("/about") === 0 ||
            path.indexOf("/portfolio") === 0 ||
            path.indexOf("/work") === 0 ||
            path.indexOf("/contact") === 0 ||
            path.indexOf("/privacy") === 0 ||
            path.indexOf("/terms") === 0
          )
        ) {
          continue
        }
        var views = Number(paths[i].count) || 0
        if (views <= 0) continue
        topPaths.push({ path: path, views: views })
        if (topPaths.length >= 5) break
      }
    } catch (_) {
      return e.json(200, empty)
    }

    return e.json(200, {
      available: true,
      visits: visits,
      pageViews: pageViews,
      topPaths: topPaths,
      period: period,
    })
  },
  $apis.requireAuth(),
)
