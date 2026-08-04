import https from "node:https";
import { URL } from "node:url";

const TTL_MS = 5 * 60 * 1000;
const CACHE = new Map();

function getCacheKey(username) {
  return `github:${username.toLowerCase()}`;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "ResumeIQ/1.0",
          Accept: "application/vnd.github+json",
        },
      },
      (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode && response.statusCode >= 400) {
            reject(new Error(`GitHub API request failed with status ${response.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);
  });
}

export class GitHubPortfolioService {
  async connect(username) {
    if (!username || !username.trim()) {
      throw new Error("githubUsername is required.");
    }

    const normalized = username.trim();
    const cached = CACHE.get(getCacheKey(normalized));
    if (cached && Date.now() - cached.timestamp < TTL_MS) {
      return cached.value;
    }

    let userData;
    let repoData = [];

    try {
      userData = await fetchJson(`https://api.github.com/users/${encodeURIComponent(normalized)}`);
      if (!userData || userData.message) {
        throw new Error("GitHub user not found.");
      }

      const repos = await fetchJson(`https://api.github.com/users/${encodeURIComponent(normalized)}/repos?per_page=100&sort=updated`);
      repoData = Array.isArray(repos) ? repos : [];
    } catch (error) {
      const fallbackAnalysis = this._analyze(
        normalized,
        [],
        {
          public_repos: 0,
          followers: 0,
        }
      );

      CACHE.set(getCacheKey(normalized), { value: fallbackAnalysis, timestamp: Date.now() });
      return fallbackAnalysis;
    }

    const analysis = this._analyze(normalized, repoData, userData);
    CACHE.set(getCacheKey(normalized), { value: analysis, timestamp: Date.now() });
    return analysis;
  }

  _analyze(username, repoData, userData) {
    const totalRepos = repoData.length;
    const nonForks = repoData.filter((repo) => !repo.fork);
    const languageDistribution = nonForks.reduce((acc, repo) => {
      if (!repo.language) return acc;
      acc[repo.language] = (acc[repo.language] || 0) + 1;
      return acc;
    }, {});

    const topLanguages = Object.entries(languageDistribution).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const readmeScore = Math.min(100, 50 + (nonForks.filter((repo) => repo.description || repo.homepage).length * 4));
    const repoQualityScore = Math.min(100, 45 + Math.min(25, nonForks.length) + Math.min(15, (userData.public_repos || 0) > 0 ? 8 : 0));
    const commitActivity = Math.min(100, 35 + Math.min(35, nonForks.length * 3) + (userData.followers ? 10 : 0));
    const projectDiversity = Math.min(100, 25 + Math.min(40, topLanguages.length * 8) + Math.min(20, nonForks.length > 3 ? 10 : 0));
    const contributionSummary = [
      `${totalRepos} public repositories detected for ${username}.`,
      `Most active work appears in ${topLanguages.slice(0, 2).map(([language]) => language).join(" / ") || "multiple languages"}.`,
      `The portfolio shows ${nonForks.length} non-fork projects, indicating a substantial personal project footprint.`
    ].join(" ");
    const portfolioScore = Math.round((repoQualityScore * 0.35 + readmeScore * 0.25 + commitActivity * 0.2 + projectDiversity * 0.2));

    return {
      repoQualityScore: Math.round(repoQualityScore),
      readmeScore: Math.round(readmeScore),
      commitActivity: Math.round(commitActivity),
      languageDistribution: topLanguages.map(([language, count]) => ({ name: language, value: count })),
      projectDiversity: Math.round(projectDiversity),
      contributionSummary,
      portfolioScore: Math.round(portfolioScore),
    };
  }
}

export default GitHubPortfolioService;
