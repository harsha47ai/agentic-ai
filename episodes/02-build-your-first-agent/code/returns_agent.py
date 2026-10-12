"""
Episode 2 — build your first AI agent: a sales-returns agent for the ERP.

Agent = an LLM that DECIDES what to do next, in a LOOP, using TOOLS, until the goal is met.
The tools live in erp_tools.py. This file is only the loop.

Run:
  python returns_agent.py "Customer C-1042 wants to return 2 units of WH-204 from SO-7781, arrived damaged"
  python returns_agent.py "Nova Distributors want to return all 10 monitors on SO-7790, changed their mind"
"""
import json
import sys

import anthropic

from erp_tools import HANDLERS, TOOLS, dumps

MODEL = "claude-sonnet-4-5"
MAX_STEPS = 8  # an agent without a stop condition is a bill, not a product

SYSTEM = """You are the returns agent inside a company's ERP.
Resolve the request using the tools: always fetch the sales order, then check the return policy, before booking anything.
If policy says a human must approve, request approval and stop if it is declined.
Never book a return that is ineligible. Finish with a two-sentence reply to the customer-service rep, citing document numbers."""


def run(goal: str) -> str:
    client = anthropic.Anthropic()
    messages = [{"role": "user", "content": goal}]

    for step in range(1, MAX_STEPS + 1):
        # PLAN — the model sees the goal, the tools and every result so far, and picks the next action
        resp = client.messages.create(model=MODEL, max_tokens=1024, system=SYSTEM, tools=TOOLS, messages=messages)
        messages.append({"role": "assistant", "content": resp.content})

        # DONE — no tool requested means the model thinks the goal is met
        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")

        # ACT + OBSERVE — run what it asked for, feed the results back, go around again
        results = []
        for block in resp.content:
            if block.type == "tool_use":
                print(f"[step {step}] tool={block.name} input={json.dumps(block.input)}")
                out = HANDLERS[block.name](**block.input)
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": dumps(out)})
        messages.append({"role": "user", "content": results})

    return "Stopped: step limit reached without finishing."


if __name__ == "__main__":
    goal = " ".join(sys.argv[1:]) or "Customer C-1042 wants to return 2 units of WH-204 from SO-7781, arrived damaged"
    print("\nFINAL:", run(goal))
