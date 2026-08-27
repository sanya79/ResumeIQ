import https from "node:https";

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
    const cacheKey = getCacheKey(normalized);

    const cached = CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TTL_MS) {
      return cached.value;
    }

    let userData;
    try {
      userData = await fetchJson(`https://api.github.com/users/${encodeURIComponent(normalized)}`);
    } catch (err) {
      throw new Error(`GitHub profile "${normalized}" not found or API request failed.`);
    }

    if (!userData || userData.message === "Not Found") {
      throw new Error(`GitHub user "${normalized}" not found.`);
    }

    let repoData = [];
    try {
      const repos = await fetchJson(`https://api.github.com/users/${encodeURIComponent(normalized)}/repos?per_page=100&sort=updated`);
      repoData = Array.isArray(repos) ? repos : [];
    } catch (err) {
      console.warn(`Repos fetch warning for ${normalized}:`, err.message);
      repoData = [];
    }

    const analysis = this._analyze(normalized, repoData, userData);
    CACHE.set(cacheKey, { value: analysis, timestamp: Date.now() });
    return analysis;
  }

  _analyze(username, repoData, userData) {
    const totalRepos = Math.max(userData.public_repos || 0, repoData.length);
    const nonForks = repoData.filter((repo) => !repo.fork);
    const targetRepos = nonForks.length > 0 ? nonForks : repoData;

    const languageDistribution = targetRepos.reduce((acc, repo) => {
      if (!repo.language) return acc;
      acc[repo.language] = (acc[repo.language] || 0) + 1;
      return acc;
    }, {});

    const topLanguages = Object.entries(languageDistribution).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const readmeScore = Math.min(100, 50 + (targetRepos.filter((repo) => repo.description || repo.homepage).length * 4));
    const repoQualityScore = Math.min(100, 45 + Math.min(25, targetRepos.length) + Math.min(15, totalRepos > 0 ? 10 : 0));
    const commitActivity = Math.min(100, 35 + Math.min(35, targetRepos.length * 3) + (userData.followers ? 10 : 0));
    const projectDiversity = Math.min(100, 25 + Math.min(40, topLanguages.length * 8) + Math.min(20, targetRepos.length > 3 ? 10 : 0));

    const summaryParts = [
      `${totalRepos} public repositories detected for ${username}.`,
    ];

    if (topLanguages.length > 0) {
      summaryParts.push(`Most active work appears in ${topLanguages.slice(0, 2).map(([language]) => language).join(" / ")}.`);
    }

    summaryParts.push(`The portfolio shows ${targetRepos.length} active projects, indicating personal developer activity.`);

    const contributionSummary = summaryParts.join(" ");
    const portfolioScore = Math.round((repoQualityScore * 0.35 + readmeScore * 0.25 + commitActivity * 0.2 + projectDiversity * 0.2));

    return {
      repoQualityScore: Math.round(repoQualityScore),
      readmeScore: Math.round(readmeScore),
      commitActivity: Math.round(commitActivity),
      languageDistribution: topLanguages.map(([language, count]) => ({ name: language, value: count })),
      projectDiversity: Math.round(projectDiversity),
      contributionSummary,
      portfolioScore: Math.round(portfolioScore),
      repositories: targetRepos.slice(0, 12).map((repo) => ({
        name: repo.name,
        description: repo.description || "Public developer repository",
        language: repo.language || "Code / Web",
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        url: repo.html_url || `https://github.com/${username}/${repo.name}`,
        updatedAt: repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : "Recently",
      })),
    };
  }
}

export default GitHubPortfolioService;

