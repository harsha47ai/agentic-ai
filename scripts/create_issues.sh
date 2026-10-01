#!/usr/bin/env bash
# Creates one GitHub issue per planned episode. Run from the repo root after `gh auth login`.
# Usage: scripts/create_issues.sh [owner/repo]   (defaults to the current repo)
set -euo pipefail
REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

for label in "pillar:build:1d76db" "pillar:architect:5319e7" "pillar:run:d93f0b" "pillar:sell:0e8a16" "episode:fbca04"; do
  name="${label%:*}"; color="${label##*:}"
  gh label create "$name" --color "$color" --repo "$REPO" --force >/dev/null
done

while IFS='|' read -r num title pillar month; do
  [ -z "$num" ] && continue
  gh issue create --repo "$REPO" \
    --title "Ep $num — $title" \
    --label "episode,pillar:$pillar" \
    --body "**Pillar:** $pillar  
**Target month:** $month

- [ ] Learn / research
- [ ] Build code in \`$(printf '%02d' "$num")-*/code\`
- [ ] Write script
- [ ] Build slides
- [ ] Record + edit
- [ ] Publish long video
- [ ] Cut 3 clips
- [ ] LinkedIn post + newsletter mention"
done <<'ISSUES'
1|What an AI agent actually is — and isn't — in enterprise software|architect|Oct
2|Build your first MCP server for an enterprise data source|build|Oct
3|An export-compliance agent in 20 minutes|build|Oct
4|Where agents sit in a multi-tenant SaaS|architect|Oct
5|Single agent vs multi-agent — when each is the right call|architect|Nov
6|Procurement agent, Part 1: supplier search with MCP tools|build|Nov
7|Procurement agent, Parts 2–3: quote comparison and approvals with RBAC|build|Nov
8|Procurement agent, Part 4: multi-tenant deployment|build|Nov
9|How to test an AI agent before your CFO asks|run|Dec
10|Tracing agents with OpenTelemetry|run|Dec
11|Prompt injection and tool abuse — the enterprise threat model|run|Dec
12|Build vs buy for enterprise agents — a decision framework|sell|Dec
13|The Agentic Enterprise Reference Architecture (flagship)|architect|Dec
14|Agent memory: what to store, where, and for how long|architect|Reserve
15|Giving agents identity: delegated auth and least-privilege tools|run|Reserve
16|Agents on Azure AI Foundry, end to end|build|Reserve
17|A2A: getting agents from different vendors to work together|build|Reserve
18|Human-in-the-loop patterns that don't kill the ROI|run|Reserve
19|How to price an agentic SaaS feature|sell|Reserve
20|Agents over messy enterprise data: the data engineer's view|build|Reserve
21|Writing ADRs for agent systems (with a real example)|architect|Reserve
22|Why I shut down a $200K startup — and what I'd build with agents now|sell|Reserve
23|Agents for trade and supply chain: 5 use cases that pay back|sell|Reserve
24|Context engineering: the skill that replaced prompt engineering|build|Reserve
25|Guardrails, the basics: input, output and tool-call checks every agent needs|run|Reserve
26|Token costs at enterprise scale: forecasting, caps and chargeback per tenant|sell|Reserve
27|DevOps with agents: CI/CD, incident response and infra changes with a human gate|build|Reserve
28|Data engineering with agents: pipelines, data quality and schema changes|build|Reserve
ISSUES
echo "Created 28 episode issues in $REPO"
