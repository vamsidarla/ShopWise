const cheerio = require("cheerio");
const headers = {
  "user-agent": "Mozilla/5.0 (compatible; ShopWise/0.1)",
  "accept-language": "en-IN,en;q=0.9",
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const amount = (text = "") => {
  const value = text.replace(/[^0-9.]/g, "");
  return value ? Number(value) : null;
};
const absolute = (url, base) => {
  try {
    return new URL(url, base).href;
  } catch {
    return null;
  }
};
const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
async function fetchPage(url) {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Store returned ${response.status}`);
  return response.text();
}
function amazon(html) {
  const $ = cheerio.load(html);
  return $("div.s-result-item[data-asin]")
    .map((_, node) => {
      const card = $(node),
        titleLink = card.find("a.a-link-normal.s-line-clamp-2").first(),
        name = titleLink.text().trim(),
        price = amount(card.find(".a-price .a-offscreen").first().text()),
        original = amount(
          card.find(".a-text-price .a-offscreen").first().text(),
        ),
        rating =
          Number(
            card
              .find(".a-icon-alt")
              .first()
              .text()
              .match(/[\d.]+/)?.[0],
          ) || null,
        reviews = card.find('[aria-label$="ratings"]').first().text().trim(),
        href = titleLink.attr("href"),
        image = card.find("img.s-image").first().attr("src");
      if (!name || !price || !href) return null;
      return {
        id: `amazon-${card.attr("data-asin")}`,
        name,
        price,
        original: original || price,
        rating,
        reviews,
        delivery: "Check delivery on Amazon",
        store: "amazon",
        url: absolute(href, "https://www.amazon.in"),
        image,
      };
    })
    .get()
    .filter(Boolean)
    .slice(0, 30);
}
function flipkart(html) {
  const $ = cheerio.load(html),
    seen = new Set(),
    results = [];
  $('[data-id] a[href*="/p/"]').each((_, link) => {
    const card = $(link).closest("[data-id]"),
      name =
        $(link).attr("title") ||
        card.find("[title]").first().attr("title") ||
        $(link).text().trim(),
      text = card.text(),
      price = amount(text.match(/₹\s?([\d,]+)/)?.[0]),
      rating = Number(text.match(/([0-5](?:\.\d)?)\s*★/)?.[1]) || null,
      href = $(link).attr("href"),
      image = card.find("img").first().attr("src");
    if (!name || !price || !href || seen.has(href)) return;
    seen.add(href);
    results.push({
      id: `flipkart-${slug(href)}`,
      name: name.replace(/\s+/g, " "),
      price,
      original: price,
      rating,
      reviews: "",
      delivery: "Check delivery on Flipkart",
      store: "flipkart",
      url: absolute(href, "https://www.flipkart.com"),
      image,
    });
  });
  return results.slice(0, 30);
}
async function scrape(store, query) {
  const q = encodeURIComponent(query);
  return store === "amazon"
    ? amazon(await fetchPage(`https://www.amazon.in/s?k=${q}`))
    : flipkart(await fetchPage(`https://www.flipkart.com/search?q=${q}`));
}
function reviewCount(text = "") {
  const value = text.replace(/[(),]/g, "").trim().toLowerCase();
  const number = Number(value.replace("k", ""));
  return Number.isFinite(number)
    ? Math.round(number * (value.includes("k") ? 1000 : 1))
    : 0;
}
function rank(products, query) {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);
  const asksForHeadphones = /headphones|headphone/.test(query.toLowerCase());
  return products
    .map((product) => {
      const title = product.name.toLowerCase(),
        matched = words.filter((word) => title.includes(word)).length,
        mismatch =
          asksForHeadphones &&
          /earbuds|earphone|tws/.test(title) &&
          !/headphone/.test(title)
            ? 3
            : 0,
        discount =
          product.original > product.price
            ? (product.original - product.price) / product.original
            : 0,
        reviews = reviewCount(product.reviews);
      return {
        ...product,
        relevance:
          (product.rating || 0) * Math.log10(reviews + 1) * 10 - mismatch * 20,
        valueScore:
          ((product.rating || 0) * 10 +
            Math.log10(reviews + 1) * 12 +
            discount * 8) /
          Math.log10(product.price + 100),
      };
    })
    .filter((product) => product.relevance > -5)
    .sort((x, y) => y.relevance - x.relevance);
}
function insight(product) {
  return (
    product && {
      id: product.id,
      name: product.name,
      price: product.price,
      rating: product.rating,
      store: product.store,
      image: product.image,
      url: product.url,
    }
  );
}
function getTokens(text) {
  return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2));
}

function jaccardSimilarity(text1, text2) {
  const set1 = getTokens(text1);
  const set2 = getTokens(text2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function assignGroupsAndScores(products) {
  const groups = [];
  
  // Assign Smart Scores based on normalized valueScore
  const maxVS = Math.max(...products.map(p => p.valueScore || 0));
  const minVS = Math.min(...products.map(p => p.valueScore || 0));
  
  products.forEach(p => {
    if (maxVS === minVS || !isFinite(maxVS)) {
      p.smartScore = 85;
    } else {
      const normalized = (p.valueScore - minVS) / (maxVS - minVS);
      p.smartScore = Math.round(70 + (normalized * 28));
    }
  });

  // Cross-Retailer Matching
  for (const product of products) {
    let matchedGroup = null;
    
    for (const group of groups) {
      const rep = group.items[0];
      const similarity = jaccardSimilarity(product.name, rep.name);
      const priceDiff = Math.abs(product.price - rep.price) / Math.max(product.price, rep.price);
      
      // If titles share > 40% significant tokens and price is within 25%
      if (similarity > 0.40 && priceDiff < 0.25) {
        matchedGroup = group;
        break;
      }
    }
    
    if (matchedGroup) {
      product.groupId = matchedGroup.id;
      matchedGroup.items.push(product);
    } else {
      const newGroupId = `group-${product.id}`;
      product.groupId = newGroupId;
      groups.push({ id: newGroupId, items: [product] });
    }
  }
  
  return products;
}

async function searchProducts(query, minPrice = 0, maxPrice = 150000, minRating = 0) {
  const [a, f] = await Promise.allSettled([
    scrape("amazon", query),
    wait(250).then(() => scrape("flipkart", query)),
  ]);
  
  const filterFn = p => p.price >= minPrice && p.price <= maxPrice && (p.rating || 0) >= minRating;
  
  const amazonProducts =
      a.status === "fulfilled" ? rank(a.value.filter(filterFn), query).slice(0, 8) : [],
    flipkartProducts =
      f.status === "fulfilled" ? rank(f.value.filter(filterFn), query).slice(0, 8) : [];
      
  let products = rank([...amazonProducts, ...flipkartProducts], query);
  products = assignGroupsAndScores(products);
  
  const cheapest = [...products].sort((x, y) => x.price - y.price)[0],
    bestValue = [...products].sort((x, y) => y.valueScore - x.valueScore)[0],
    bestRated = [...products].sort(
      (x, y) =>
        (y.rating || 0) - (x.rating || 0) ||
        reviewCount(y.reviews) - reviewCount(x.reviews),
    )[0];
  return {
    products,
    insights: {
      cheapest: insight(cheapest),
      bestValue: insight(bestValue),
      bestRated: insight(bestRated),
    },
    sources: {
      amazon: a.status === "fulfilled",
      flipkart: f.status === "fulfilled",
    },
    errors: [a, f].flatMap((item, i) =>
      item.status === "rejected"
        ? [{ store: i ? "flipkart" : "amazon", message: item.reason.message }]
        : [],
    ),
  };
}
module.exports = { searchProducts };
