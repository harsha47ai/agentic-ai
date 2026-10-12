"""
LIVE-CODING STARTER — Episode 1.
Tools and mock data are pre-written so you only type the agent loop on camera.
Fill the three TODOs in run(). The finished version is basic_agent.py.
"""
import json
import sys

import anthropic

MODEL = "claude-sonnet-4-5"
MAX_STEPS = 8

# ---- Mock enterprise systems (pre-written, do not type on camera) ----
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
    return {
        "eligible": o["days_since_delivery"] <= REFUND_POLICY["window_days"],
        "needs_human_approval": o["amount"] >= REFUND_POLICY["auto_approve_below"],
        "policy": REFUND_POLICY,
    }


def request_human_approval(order_id: str, reason: str) -> dict:
    print(f"\n[APPROVAL NEEDED] order={order_id} reason={reason}")
    return {"approved": input("Approve refund? (y/n): ").strip().lower() == "y"}


def issue_refund(order_id: str, amount: float) -> dict:
    print(f"\n[ACTION] refund issued: order={order_id} amount={amount}")
    return {"ok": True, "refund_id": f"R-{order_id}"}


TOOLS = [
    {"name": "lookup_order", "description": "Fetch an order by id from the order system.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}}, "required": ["order_id"]}},
    {"name": "check_refund_policy", "description": "Check refund eligibility and whether a human must approve.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}}, "required": ["order_id"]}},
    {"name": "request_human_approval", "description": "Ask a human to approve a refund when policy requires it.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}, "reason": {"type": "string"}}, "required": ["order_id", "reason"]}},
    {"name": "issue_refund", "description": "Issue a refund. Only when eligible and (if required) approved.",
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


# ---- THE PART YOU TYPE ON CAMERA ----
def run(goal: str) -> str:
    client = anthropic.Anthropic()
    messages = [{"role": "user", "content": goal}]

    for step in range(1, MAX_STEPS + 1):
        # TODO 1 — PLAN: call the model with system, tools and messages; append its reply
        ...

        # TODO 2 — DONE: if stop_reason != "tool_use", return the text and exit the loop
        ...

        # TODO 3 — ACT + OBSERVE: run each tool_use block, collect tool_result blocks, append as a user turn
        ...

    return "Stopped: step limit reached without finishing."


if __name__ == "__main__":
    goal = " ".join(sys.argv[1:]) or "Customer 1042 wants a refund for order A-7781, it arrived damaged"
    print("\nFINAL:", run(goal))
