"""
Episode 2 — the same return handled as a WORKFLOW, not an agent.
The developer wrote every step. The LLM fills in one blank (classifying the reason). No loop, no tool choice.
Compare the trace with returns_agent.py on the same two cases.
"""
import sys

import anthropic

from erp_tools import RETURN_POLICY, check_return_policy, create_return, get_sales_order, request_approval

MODEL = "claude-sonnet-4-5"
client = anthropic.Anthropic()


def classify_reason(text: str) -> str:
    r = client.messages.create(model=MODEL, max_tokens=10, messages=[{"role": "user", "content":
        f"Classify the return reason as one of {RETURN_POLICY['accepted_reasons']} or 'other'. Reply with the word only.\n\n{text}"}])
    return r.content[0].text.strip().lower()


def handle(text: str, order_id: str, sku: str, qty: int) -> str:
    reason = classify_reason(text)                      # the one LLM step
    order = get_sales_order(order_id)                   # fixed
    if "error" in order:
        return order["error"]
    policy = check_return_policy(order_id, sku, qty, reason)  # fixed
    if not policy.get("eligible"):
        return f"Return refused: {policy.get('reason', 'outside policy')}"
    if policy["needs_human_approval"] and not request_approval(order_id, f"{qty} x {sku}, INR {policy['return_value_inr']:,.0f}")["approved"]:
        return "Return declined by approver."
    out = create_return(order_id, sku, qty, reason)     # fixed
    return f"Return booked: {out['credit_note']['credit_note_no']}, {out['stock_move']['move_id']}."


if __name__ == "__main__":
    print(handle(" ".join(sys.argv[1:]) or "arrived damaged", "SO-7781", "WH-204", 2))
