"""
Episode 1 — the same task as a WORKFLOW, not an agent.
The developer decides the flow; the LLM fills one step (classification). No loop, no tool choice.
"""
import sys
import anthropic
from basic_agent import lookup_order, check_refund_policy, issue_refund, MODEL

client = anthropic.Anthropic()


def classify(text: str) -> str:
    r = client.messages.create(
        model=MODEL, max_tokens=20,
        messages=[{"role": "user", "content": f"Classify as REFUND, SHIPPING or OTHER. Reply with one word.\n\n{text}"}],
    )
    return r.content[0].text.strip().upper()


def handle(text: str, order_id: str) -> str:
    kind = classify(text)                      # LLM step
    if kind != "REFUND":                       # developer-defined branch
        return "Routed to general support."
    order = lookup_order(order_id)             # fixed step
    policy = check_refund_policy(order_id)     # fixed step
    if not policy["eligible"]:
        return "Refund window has passed."
    if policy["needs_human_approval"]:
        return "Escalated to a human agent."
    issue_refund(order_id, order["amount"])    # fixed step
    return f"Refund of {order['amount']} issued."


if __name__ == "__main__":
    print(handle(" ".join(sys.argv[1:]) or "Order arrived damaged, want my money back", "A-7781"))
