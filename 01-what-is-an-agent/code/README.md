# Episode 1 code

- `basic_agent.py` — the agent: model decides, loops, calls tools, stops on a limit or when done. Includes human-in-the-loop for high-value refunds.
- `workflow.py` — the same job as a fixed workflow for side-by-side comparison in the demo.

Try both with order `A-7781` (small, inside window → auto) and `A-7790` (large, outside window → refused).
