import os
import sys
import anthropic
import requests

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
PR_NUMBER = os.environ["PR_NUMBER"]
REPO = os.environ["REPO"]

GITHUB_API = "https://api.github.com"
HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "X-GitHub-Api-Version": "2022-11-28",
}


def get_pr_diff() -> str:
    url = f"{GITHUB_API}/repos/{REPO}/pulls/{PR_NUMBER}"
    resp = requests.get(url, headers={**HEADERS, "Accept": "application/vnd.github.v3.diff"})
    resp.raise_for_status()
    return resp.text


def post_comment(body: str) -> None:
    url = f"{GITHUB_API}/repos/{REPO}/issues/{PR_NUMBER}/comments"
    resp = requests.post(url, headers=HEADERS, json={"body": body})
    resp.raise_for_status()


def review_diff(diff: str) -> str:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": (
                    "You are a senior code reviewer. Review the following git diff.\n\n"
                    "Your review should:\n"
                    "- Find critical issues (bugs, security vulnerabilities)\n"
                    "- Add remarks on readability and architecture where relevant\n"
                    "- Mention what is done well\n"
                    "- Be specific — reference file names and line numbers\n"
                    "- If the diff is clean, say so directly\n\n"
                    f"```diff\n{diff}\n```"
                ),
            }
        ],
    )
    return message.content[0].text


def main() -> None:
    diff = get_pr_diff()
    if not diff.strip():
        print("Empty diff — skipping review.")
        sys.exit(0)

    truncated = "\n".join(diff.splitlines()[:200])
    review = review_diff(truncated)
    post_comment(f"## Claude Code Review\n\n{review}")
    print("Review posted.")


if __name__ == "__main__":
    main()
