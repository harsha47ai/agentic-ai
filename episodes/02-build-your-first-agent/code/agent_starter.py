"""
LIVE-CODING STARTER — Episode 2.
The ERP tools are in erp_tools.py (pre-written). You type only the loop: three TODOs.
The finished version is returns_agent.py.
"""
import json
import sys

import anthropic

from erp_tools import HANDLERS, TOOLS, dumps

MODEL = "claude-sonnet-4-5"
MAX_STEPS = 8

SYSTEM = """You are the returns agent inside a company's ERP.
Resolve the request using the tools: always fetch the sales order, then check the return policy, before booking anything.
If policy says a human must approve, request approval and stop if it is declined.
Never book a return that is ineligible. Finish with a two-sentence reply to the customer-service rep, citing document numbers."""


def run(goal: str) -> str:
    client = anthropic.Anthropic()
    messages = [{"role": "user", "content": goal}]

    for step in range(1, MAX_STEPS + 1):
        # TODO 1 — PLAN: call the model with system, tools, messages; append its reply to messages
        ...

        # TODO 2 — DONE: if resp.stop_reason != "tool_use", return the text blocks joined
        ...

        # TODO 3 — ACT + OBSERVE: for each tool_use block, run HANDLERS[name](**input),
        #          collect {"type": "tool_result", "tool_use_id": ..., "content": dumps(out)}, append as a user turn
        ...

    return "Stopped: step limit reached without finishing."


if __name__ == "__main__":
    goal = " ".join(sys.argv[1:]) or "Customer C-1042 wants to return 2 units of WH-204 from SO-7781, arrived damaged"
    print("\nFINAL:", run(goal))
