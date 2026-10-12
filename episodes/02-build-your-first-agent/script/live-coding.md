# Arthashastra Learning · Episode 2 — live-coding run sheet: build your first agent

Target: 12–15 min. Slides for the first 5 min, live code for 6 min, enterprise breakpoints for 3 min, recap 1 min.

## Before you hit record

- [ ] `docker compose up -d && python -m erp.seed` from the repo root (see INSTRUCTIONS.md); `python -m pytest -q` in the episode folder passes

- [ ] `cd episodes/02-build-your-first-agent/code && source .venv/bin/activate` (create it once: `python3 -m venv .venv && pip install -r requirements.txt`)
- [ ] `export ANTHROPIC_API_KEY=...` in the terminal you will show — never on camera
- [ ] Open `agent_starter.py` in the editor, `returns_agent.py` in a hidden tab (your safety net)
- [ ] Terminal font ≥ 18pt, editor font ≥ 16pt, light theme off, notifications off
- [ ] Dry-run both commands below once so the first API call is warm
- [ ] Slides open in presenter view with notes

## Segment plan

| Time | Slide | What you do |
| --- | --- | --- |
| 0:00 | 1–2 | Hook: last time what an agent is; today one file, one key, a working agent. Three outcomes. |
| 0:45 | 3 | The ERP in 30 seconds: six modules, boring stack, two seeded companies. Say "company_id on every table". |
| 1:15 | 4 | Workspace setup: clone, venv, docker compose + seed, .env + pytest. Show the `14 passed`. |
| 0:45 | 3 | Say the definition twice. Point at decides / loop / tools. |
| 1:30 | 4 | Spectrum. Ask: who decides the control flow? |
| 2:30 | 5 | Draw the loop. Stress stop conditions. |
| 3:30 | 6–7 | Five parts; what is NOT an agent. |
| 5:00 | 8 | **Switch to screen.** Run `python workflow.py` — fixed steps. |
| 5:45 | 9 | "Building your first agent" — four steps; we type only step 3. |
| 6:15 | 10 | **Live code** the loop in `agent_starter.py` (checkpoints below). |
| 10:30 | 10 | Run `python returns_agent.py` on SO-7781, SO-7790, then SO-7795. Narrate the tool calls. |
| 11:30 | 11–13 | Identity, tenancy, accountability — one minute each. |
| 14:00 | 14–15 | Recap, next episode, repo. |

## Live-coding checkpoints (type these, in this order)

Say out loud what each block IS before you type it. Viewers follow the words, not the keystrokes.

**Checkpoint 1 — PLAN (the model decides)**
```python
        resp = client.messages.create(
            model=MODEL, max_tokens=1024, system=SYSTEM, tools=TOOLS, messages=messages
        )
        messages.append({"role": "assistant", "content": resp.content})
```
Say: "Everything the model knows is in `messages`. It sees the goal, the tools, and every result so far — and picks."

**Checkpoint 2 — DONE (the model decides it's finished)**
```python
        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")
```
Say: "No tool requested means the model thinks the job is done. That's the exit."

**Checkpoint 3 — ACT + OBSERVE (run what it asked for, feed it back)**
```python
        results = []
        for block in resp.content:
            if block.type == "tool_use":
                print(f"[step {step}] tool={block.name} input={json.dumps(block.input)}")
                out = HANDLERS[block.name](**block.input)
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": dumps(out)})
        messages.append({"role": "user", "content": results})
```
Say: "This is the loop closing. Tool result goes back in as the next turn, and we go around again."

**Checkpoint 4 — point, don't type:** scroll to `MAX_STEPS = 8`. "This line is the difference between a product and a bill."

## Demo runs

```bash
python workflow.py "Order arrived damaged, want my money back"
python agent_starter.py "Customer C-1042 wants to return 2 units of WH-204 from SO-7781, arrived damaged"
python agent_starter.py "Nova Distributors want to return all 10 monitors on SO-7790, changed their mind"
```

- SO-7781: 4 days old, INR 6,400 → agent fetches the order, checks policy, books the return: credit note + stock move + case. Point at step 2 — the model *chose* `check_return_policy`.
- SO-7790: 41 days old → agent refuses politely. No `create_return` call. That's the policy holding.
- Third run: `python returns_agent.py "C-1042 says all 3 monitors on SO-7795 are defective"` → INR 73,500 is over the threshold → the agent calls `request_approval` and waits for your `y`. Human-in-the-loop, live.

## If something breaks on camera

- API error → say "this is why we cap retries too", switch to the `returns_agent.py` tab, run it, keep going.
- Model skips a tool → run again; mention nondeterminism is exactly why Episode 9 is about evals.
- Typo → fix it on camera. Don't cut it. Builders trust people who debug in public.

## After recording

- [ ] Commit `agent_starter.py` with the TODOs restored (`git checkout -- code/agent_starter.py`)
- [ ] Cut 3 clips: the definition (slide 3), step 2 "the model chose" moment, the identity question (slide 11)
- [ ] LinkedIn post: the spectrum slide as the image
