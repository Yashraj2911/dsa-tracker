export interface LeetCodeProblemData {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  slug: string;
  url: string;
}

export function extractSlugFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const match = urlObj.pathname.match(/\/problems\/([^/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function fetchLeetCodeProblem(
  slug: string
): Promise<LeetCodeProblemData | null> {
  try {
    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        query: `
          query getProblem($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              title
              difficulty
              topicTags { name }
            }
          }
        `,
        variables: { titleSlug: slug },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const question = data?.data?.question;

    if (!question) return null;

    const difficulty = question.difficulty as "Easy" | "Medium" | "Hard";
    const validDifficulties = ["Easy", "Medium", "Hard"];
    if (!validDifficulties.includes(difficulty)) return null;

    return {
      title: question.title,
      difficulty,
      tags: question.topicTags?.map((t: { name: string }) => t.name) ?? [],
      slug,
      url: `https://leetcode.com/problems/${slug}/`,
    };
  } catch {
    return null;
  }
}
