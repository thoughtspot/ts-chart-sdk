---
allowed-tools: mcp__github_inline_comment__create_inline_comment,Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),Bash(git*),Bash(sed),Bash(echo),Bash(cat),Bash(ls)
description: Review a pull request
---

Perform a comprehensive code review for the code diff generated in the current PR using subagents for key areas:

-   code-quality-reviewer
-   documentation-accuracy-reviewer
-   security-code-reviewer
-   test-coverage-reviewer

Instruct each to only provide noteworthy feedback. Once they finish, review the feedback and post only the feedback that you also deem noteworthy.

Provide feedback using inline comments for specific issues.
Use top-level comments for general observations or praise.
Keep feedback concise.

---
