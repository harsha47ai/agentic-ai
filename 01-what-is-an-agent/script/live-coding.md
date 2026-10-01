# Arthashastra Learning · Episode 1 — live-coding run sheet

Target: 12–15 min. Slides for the first 5 min, live code for 6 min, enterprise breakpoints for 3 min, recap 1 min.

## Before you hit record

- [ ] `cd 01-what-is-an-agent/code && source .venv/bin/activate` (create it once: `python3 -m venv .venv && pip install -r requirements.txt`)
- [ ] `export ANTHROPIC_API_KEY=...` in the terminal you will show — never on camera
- [ ] Open `agent_starter.py` in the editor, `basic_agent.py` in a hidden tab (your safety net)
- [ ] Terminal font ≥ 18pt, editor font ≥ 16pt, light theme off, notifications off
- [ ] Dry-run both commands below once so the first API call is warm
- [ ] Slides open in presenter view with notes

## Segment plan

| Time | Slide | What you do |
| --- | --- | --- |
| 0:00 | 1–2 | Hook: "most agents are a chatbot with a new logo". State the 3 outcomes. |
| 0:45 | 3 | Say the definition twice. Point at decides / loop / tools. |
| 1:30 | 4 | Spectrum. Ask: who decides the control flow? |
| 2:30 | 5 | Draw the loop. Stress stop conditions. |
| 3:30 | 6–7 | Five parts; what is NOT an agent. |
| 5:00 | 8 | **Switch to screen.** Run `python workflow.py` — fixed steps. |
| 5:45 | 9 | **Live code** the loop in `agent_starter.py` (checkpoints below). |
| 10:30 | 9 | Run `python basic_agent.py` on A-7781, then A-7790. Narrate the tool calls. |
| 11:30 | 10–12 | Identity, tenancy, accountability — one minute each. |
| 14:00 | 13–14 | Recap, next episode, repo. |

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
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": json.dumps(out)})
        messages.append({"role": "user", "content": results})
```
Say: "This is the loop closing. Tool result goes back in as the next turn, and we go around again."

**Checkpoint 4 — point, don't type:** scroll to `MAX_STEPS = 8`. "This line is the difference between a product and a bill."

## Demo runs

```bash
python workflow.py "Order arrived damaged, want my money back"
python agent_starter.py "Customer 1042 wants a refund for order A-7781, it arrived damaged"
python agent_starter.py "Customer 2210 wants a refund for order A-7790, changed their mind"
```

- A-7781: inside window, under 200 → agent looks up, checks policy, refunds. Point at step 2 — the model *chose* `check_refund_policy`.
- A-7790: outside window → agent refuses politely. No refund tool call. That's the policy holding.
- Optional third run: temporarily set `auto_approve_below` to 100 and re-run A-7781 → the agent calls `request_human_approval` and waits for your `y`. This is the human-in-the-loop moment for slide 12.

## If something breaks on camera

- API error → say "this is why we cap retries too", switch to the `basic_agent.py` tab, run it, keep going.
- Model skips a tool → run again; mention nondeterminism is exactly why Episode 9 is about evals.
- Typo → fix it on camera. Don't cut it. Builders trust people who debug in public.

## After recording

- [ ] Commit `agent_starter.py` with the TODOs restored (`git checkout -- code/agent_starter.py`)
- [ ] Cut 3 clips: the definition (slide 3), step 2 "the model chose" moment, the identity question (slide 10)
- [ ] LinkedIn post: the spectrum slide as the image
