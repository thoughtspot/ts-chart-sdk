---
allowed-tools: mcp__github_inline_comment__create_inline_comment,Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),Bash(git*),Bash(sed),Bash(echo),Bash(cat),Bash(ls)
description: Review a pull request
---

Perform a comprehensive code review for the code diff( only review on the diff generated using `gh pr diff` ) generated in the current PR using subagents for key areas:

-   code-quality-reviewer
-   documentation-accuracy-reviewer
-   test-coverage-reviewer

Instruct each to only provide noteworthy feedback. Once they finish, review the feedback and post only the feedback that you also deem noteworthy.

Provide feedback using inline comments for specific issues.
Keep feedback concise only post the issues that you have found the pr.
Make a top comment giving consise summary for the issue and pr is mergable or not.

---
