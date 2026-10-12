"""
Episode 1 — a basic agent in one file.

Agent = an LLM that DECIDES what to do next, in a LOOP, using TOOLS, until the goal is met.
Compare with workflow.py, where the developer decides the flow.

Run:  python basic_agent.py "Customer 1042 wants a refund for order A-7781, it arrived damaged"
"""
import json
import sys

import anthropic

MODEL = "claude-sonnet-4-5"
MAX_STEPS = 8            # limit: an agent without a stop condition is a bill, not a product

# ---- Mock enterprise systems (replace with real APIs / MCP servers in Episode 2) ----
ORDERS = {
    "A-7781": {"customer_id": "1042", "amount": 149.00, "days_since_delivery": 4, "status": "delivered"},
    "A-7790": {"customer_id": "2210", "amount": 899.00, "days_since_delivery": 41, "status": "delivered"},
}
REFUND_POLICY = {"window_days": 30, "auto_approve_below": 200.00}


def lookup_order(order_id: str) -> dict:
    return ORDERS.get(order_id, {"error": f"order {order_id} not found"})


def check_refund_policy(order_id: str) -> dict:
    o = ORDERS.get(order_id)
    if not o:
        return {"error": "order not found"}
    eligible = o["days_since_delivery"] <= REFUND_POLICY["window_days"]
    needs_human = o["amount"] >= REFUND_POLICY["auto_approve_below"]
    return {"eligible": eligible, "needs_human_approval": needs_human, "policy": REFUND_POLICY}


def request_human_approval(order_id: str, reason: str) -> dict:
    # Human-in-the-loop: irreversible or high-value actions never execute without a person.
    print(f"\n[APPROVAL NEEDED] order={order_id} reason={reason}")
    answer = input("Approve refund? (y/n): ").strip().lower()
    return {"approved": answer == "y"}


def issue_refund(order_id: str, amount: float) -> dict:
    print(f"\n[ACTION] refund issued: order={order_id} amount={amount}")
    return {"ok": True, "refund_id": f"R-{order_id}"}


TOOLS = [
    {"name": "lookup_order", "description": "Fetch an order by id from the order system.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}}, "required": ["order_id"]}},
    {"name": "check_refund_policy", "description": "Check whether an order is eligible for refund and whether a human must approve.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}}, "required": ["order_id"]}},
    {"name": "request_human_approval", "description": "Ask a human to approve a refund. Use when policy says needs_human_approval is true.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}, "reason": {"type": "string"}}, "required": ["order_id", "reason"]}},
    {"name": "issue_refund", "description": "Issue a refund. Only call when eligible and (if required) approved.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}, "amount": {"type": "number"}}, "required": ["order_id", "amount"]}},
]
HANDLERS = {
    "lookup_order": lookup_order,
    "check_refund_policy": check_refund_policy,
    "request_human_approval": request_human_approval,
    "issue_refund": issue_refund,
}

SYSTEM = """You are a customer-support agent for an e-commerce company.
Resolve the request using the tools. Always look up the order and check policy before acting.
Never issue a refund that is ineligible or lacks required approval. Finish with a short reply to the customer."""


def run(goal: str) -> str:
    client = anthropic.Anthropic()
    messages = [{"role": "user", "content": goal}]

    for step in range(1, MAX_STEPS + 1):
        # PLAN: the model decides the next action
        resp = client.messages.create(
            model=MODEL, max_tokens=1024, system=SYSTEM, tools=TOOLS, messages=messages
        )
        messages.append({"role": "assistant", "content": resp.content})

        if resp.stop_reason != "tool_use":
            # DONE: no tool requested, the model considers the goal met
            return "".join(b.text for b in resp.content if b.type == "text")

        # ACT + OBSERVE: run every tool the model asked for, feed results back
        results = []
        for block in resp.content:
            if block.type == "tool_use":
                print(f"[step {step}] tool={block.name} input={json.dumps(block.input)}")
                out = HANDLERS[block.name](**block.input)
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": json.dumps(out)})
        messages.append({"role": "user", "content": results})

    return "Stopped: step limit reached without finishing."


if __name__ == "__main__":
    goal = " ".join(sys.argv[1:]) or "Customer 1042 wants a refund for order A-7781, it arrived damaged"
    print("\nFINAL:", run(goal))
