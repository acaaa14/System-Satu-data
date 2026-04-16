import pemerintahImage from "../assets/img/GambarPemerintah.png"
import infrastrukturImage from "../assets/img/GambarInfrastruktur.png"
import ekonomiImage from "../assets/img/GambarEkonomi.png"
import sosialImage from "../assets/img/GambarSosialBudaya.png"
import covidImage from "../assets/img/GambarCovid-19.png"

export const topicDefinitions = [
  {
    key: "pemerintah",
    title: "Pemerintah",
    fallbackImage: pemerintahImage,
    keywords: ["pemerintah"],
  },
  {
    key: "infrastruktur",
    title: "Infrastruktur",
    fallbackImage: infrastrukturImage,
    keywords: ["infrastruktur"],
  },
  {
    key: "ekonomi",
    title: "Ekonomi",
    fallbackImage: ekonomiImage,
    keywords: ["ekonomi"],
  },
  {
    key: "sosial-budaya",
    title: "Sosial dan Budaya",
    fallbackImage: sosialImage,
    keywords: ["sosial budaya", "sosial dan budaya", "sosialbudaya"],
  },
  {
    key: "covid-19",
    title: "Covid-19",
    fallbackImage: covidImage,
    keywords: ["covid-19", "covid 19", "covid"],
  },
]

function normalizeTopicValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function getTopicMatchKey(organization) {
  const haystack = normalizeTopicValue(
    [
      organization?.title,
      organization?.display_name,
      organization?.name,
    ]
      .filter(Boolean)
      .join(" "),
  )

  if (!haystack) {
    return ""
  }

  // Helper ini jadi pusat pemisahan data:
  // jika nama organisasi CKAN mengandung keyword topik tertentu,
  // organisasi itu dianggap milik halaman Topik, bukan halaman Organisasi umum.
  const match = topicDefinitions.find((topic) =>
    topic.keywords.some((keyword) => haystack.includes(normalizeTopicValue(keyword))),
  )

  return match?.key || ""
}

export function isTopicOrganization(organization) {
  return Boolean(getTopicMatchKey(organization))
}
