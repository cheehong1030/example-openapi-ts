"use strict";
var B = require("axios");
function _interopDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
var B__default = /*#__PURE__*/ _interopDefault(B);
var w = async (t, e) => {
    let r = typeof e == "function" ? await e(t) : e;
    if (r)
      return t.scheme === "bearer"
        ? `Bearer ${r}`
        : t.scheme === "basic"
        ? `Basic ${btoa(r)}`
        : r;
  },
  z = (t, e, r) => {
    typeof r == "string" || r instanceof Blob
      ? t.append(e, r)
      : t.append(e, JSON.stringify(r));
  },
  O = (t, e, r) => {
    typeof r == "string" ? t.append(e, r) : t.append(e, JSON.stringify(r));
  },
  j = {
    bodySerializer: (t) => {
      let e = new FormData();
      return (
        Object.entries(t).forEach(([r, i]) => {
          i != null &&
            (Array.isArray(i) ? i.forEach((a) => z(e, r, a)) : z(e, r, i));
        }),
        e
      );
    },
  },
  k = {
    bodySerializer: (t) =>
      JSON.stringify(t, (e, r) => (typeof r == "bigint" ? r.toString() : r)),
  },
  $ = {
    bodySerializer: (t) => {
      let e = new URLSearchParams();
      return (
        Object.entries(t).forEach(([r, i]) => {
          i != null &&
            (Array.isArray(i) ? i.forEach((a) => O(e, r, a)) : O(e, r, i));
        }),
        e.toString()
      );
    },
  },
  q = (t) => {
    switch (t) {
      case "label":
        return ".";
      case "matrix":
        return ";";
      case "simple":
        return ",";
      default:
        return "&";
    }
  },
  v = (t) => {
    switch (t) {
      case "form":
        return ",";
      case "pipeDelimited":
        return "|";
      case "spaceDelimited":
        return "%20";
      default:
        return ",";
    }
  },
  P = (t) => {
    switch (t) {
      case "label":
        return ".";
      case "matrix":
        return ";";
      case "simple":
        return ",";
      default:
        return "&";
    }
  },
  h = ({ allowReserved: t, explode: e, name: r, style: i, value: a }) => {
    if (!e) {
      let n = (t ? a : a.map((s) => encodeURIComponent(s))).join(v(i));
      switch (i) {
        case "label":
          return `.${n}`;
        case "matrix":
          return `;${r}=${n}`;
        case "simple":
          return n;
        default:
          return `${r}=${n}`;
      }
    }
    let o = q(i),
      l = a
        .map((n) =>
          i === "label" || i === "simple"
            ? t
              ? n
              : encodeURIComponent(n)
            : f({ allowReserved: t, name: r, value: n })
        )
        .join(o);
    return i === "label" || i === "matrix" ? o + l : l;
  },
  f = ({ allowReserved: t, name: e, value: r }) => {
    if (r == null) return "";
    if (typeof r == "object")
      throw new Error(
        "Deeply-nested arrays/objects aren\u2019t supported. Provide your own `querySerializer()` to handle these."
      );
    return `${e}=${t ? r : encodeURIComponent(r)}`;
  },
  g = ({ allowReserved: t, explode: e, name: r, style: i, value: a }) => {
    if (a instanceof Date) return `${r}=${a.toISOString()}`;
    if (i !== "deepObject" && !e) {
      let n = [];
      Object.entries(a).forEach(([u, d]) => {
        n = [...n, u, t ? d : encodeURIComponent(d)];
      });
      let s = n.join(",");
      switch (i) {
        case "form":
          return `${r}=${s}`;
        case "label":
          return `.${s}`;
        case "matrix":
          return `;${r}=${s}`;
        default:
          return s;
      }
    }
    let o = P(i),
      l = Object.entries(a)
        .map(([n, s]) =>
          f({
            allowReserved: t,
            name: i === "deepObject" ? `${r}[${n}]` : n,
            value: s,
          })
        )
        .join(o);
    return i === "label" || i === "matrix" ? o + l : l;
  };
var T = /\{[^{}]+\}/g,
  E = ({ path: t, url: e }) => {
    let r = e,
      i = e.match(T);
    if (i)
      for (let a of i) {
        let o = false,
          l = a.substring(1, a.length - 1),
          n = "simple";
        l.endsWith("*") && ((o = true), (l = l.substring(0, l.length - 1))),
          l.startsWith(".")
            ? ((l = l.substring(1)), (n = "label"))
            : l.startsWith(";") && ((l = l.substring(1)), (n = "matrix"));
        let s = t[l];
        if (s == null) continue;
        if (Array.isArray(s)) {
          r = r.replace(a, h({ explode: o, name: l, style: n, value: s }));
          continue;
        }
        if (typeof s == "object") {
          r = r.replace(a, g({ explode: o, name: l, style: n, value: s }));
          continue;
        }
        if (n === "matrix") {
          r = r.replace(a, `;${f({ name: l, value: s })}`);
          continue;
        }
        let u = encodeURIComponent(n === "label" ? `.${s}` : s);
        r = r.replace(a, u);
      }
    return r;
  },
  U =
    ({ allowReserved: t, array: e, object: r } = {}) =>
    (a) => {
      let o = [];
      if (a && typeof a == "object")
        for (let l in a) {
          let n = a[l];
          if (n != null) {
            if (Array.isArray(n)) {
              o = [
                ...o,
                h({
                  allowReserved: t,
                  explode: true,
                  name: l,
                  style: "form",
                  value: n,
                  ...e,
                }),
              ];
              continue;
            }
            if (typeof n == "object") {
              o = [
                ...o,
                g({
                  allowReserved: t,
                  explode: true,
                  name: l,
                  style: "deepObject",
                  value: n,
                  ...r,
                }),
              ];
              continue;
            }
            o = [...o, f({ allowReserved: t, name: l, value: n })];
          }
        }
      return o.join("&");
    },
  A = async ({ security: t, ...e }) => {
    for (let r of t) {
      let i = await w(r, e.auth);
      if (!i) continue;
      let a = r.name ?? "Authorization";
      switch (r.in) {
        case "query":
          e.query || (e.query = {}), (e.query[a] = i);
          break;
        case "cookie": {
          let o = `${a}=${i}`;
          "Cookie" in e.headers && e.headers.Cookie
            ? (e.headers.Cookie = `${e.headers.Cookie}; ${o}`)
            : (e.headers.Cookie = o);
          break;
        }
        case "header":
        default:
          e.headers[a] = i;
          break;
      }
      return;
    }
  },
  b = (t) =>
    D({
      path: t.path,
      query: t.paramsSerializer ? undefined : t.query,
      querySerializer:
        typeof t.querySerializer == "function"
          ? t.querySerializer
          : U(t.querySerializer),
      url: t.url,
    }),
  D = ({ path: t, query: e, querySerializer: r, url: i }) => {
    let o = i.startsWith("/") ? i : `/${i}`;
    t && (o = E({ path: t, url: o }));
    let l = e ? r(e) : "";
    return l.startsWith("?") && (l = l.substring(1)), l && (o += `?${l}`), o;
  },
  C = (t, e) => {
    let r = { ...t, ...e };
    return (r.headers = y(t.headers, e.headers)), r;
  },
  H = ["common", "delete", "get", "head", "patch", "post", "put"],
  y = (...t) => {
    let e = {};
    for (let r of t) {
      if (!r || typeof r != "object") continue;
      let i = Object.entries(r);
      for (let [a, o] of i)
        if (H.includes(a) && typeof o == "object") e[a] = { ...e[a], ...o };
        else if (o === null) delete e[a];
        else if (Array.isArray(o)) for (let l of o) e[a] = [...(e[a] ?? []), l];
        else
          o !== undefined &&
            (e[a] = typeof o == "object" ? JSON.stringify(o) : o);
    }
    return e;
  },
  S = (t = {}) => ({ ...t });
var I = (t = {}) => {
  let e = C(S(), t),
    { auth: r, ...i } = e,
    a = B__default.default.create(i),
    o = () => ({ ...e }),
    l = (s) => (
      (e = C(e, s)),
      (a.defaults = {
        ...a.defaults,
        ...e,
        headers: y(a.defaults.headers, e.headers),
      }),
      o()
    ),
    n = async (s) => {
      let u = {
        ...e,
        ...s,
        axios: s.axios ?? e.axios ?? a,
        headers: y(e.headers, s.headers),
      };
      u.security && (await A({ ...u, security: u.security })),
        u.body && u.bodySerializer && (u.body = u.bodySerializer(u.body));
      let d = b(u);
      try {
        let m = u.axios,
          { auth: c, ...R } = u,
          x = await m({
            ...R,
            baseURL: u.baseURL,
            data: u.body,
            headers: u.headers,
            params: u.paramsSerializer ? u.query : void 0,
            url: d,
          }),
          { data: p } = x;
        return (
          u.responseType === "json" &&
            (u.responseValidator && (await u.responseValidator(p)),
            u.responseTransformer && (p = await u.responseTransformer(p))),
          { ...x, data: p ?? {} }
        );
      } catch (m) {
        let c = m;
        if (u.throwOnError) throw c;
        return (c.error = c.response?.data ?? {}), c;
      }
    };
  return {
    buildUrl: b,
    delete: (s) => n({ ...s, method: "DELETE" }),
    get: (s) => n({ ...s, method: "GET" }),
    getConfig: o,
    head: (s) => n({ ...s, method: "HEAD" }),
    instance: a,
    options: (s) => n({ ...s, method: "OPTIONS" }),
    patch: (s) => n({ ...s, method: "PATCH" }),
    post: (s) => n({ ...s, method: "POST" }),
    put: (s) => n({ ...s, method: "PUT" }),
    request: n,
    setConfig: l,
  };
};
exports.createClient = I;
exports.createConfig = S;
exports.formDataBodySerializer = j;
exports.jsonBodySerializer = k;
exports.urlSearchParamsBodySerializer = $; //# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map
