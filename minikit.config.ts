const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjcwMzEwNSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGM3ZUIyQUJkMzZFZjI1NkI3ZEU1MkFjMTAzMkI5RDc3NEFFNGREQjEifQ",
    payload: "eyJkb21haW4iOiJ0aXBzLWdhbW1hLnZlcmNlbC5hcHAifQ",
    signature:
      "8dG7pJfofyzv6bSmjNe71VlpODxy6GFvGNGgJnDNPCB4KaPGJtlQ5nX7Sr1QDoFVGP+X+0iQsQ/MO+cy+H4fFhs=",
  },
  miniapp: {
    version: "1",
    name: "Cubey",
    subtitle: "Your AI Ad Companion",
    description: "Ads",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
  baseBuilder: {
    ownerAddress: "0xcD96B94cb983aBA4AeEdA2DAE8ed3A72975a43f1",
  },
} as const;
