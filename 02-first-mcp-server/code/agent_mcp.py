"""
Episode 2 — the Episode 1 agent, with tools coming from an MCP server instead of hardcoded Python.

The loop is identical to basic_agent.py. Only two things change:
  1. TOOLS   come from   session.list_tools()
  2. HANDLERS become     session.call_tool(name, args)

Run:  python agent_mcp.py "Which shipments to Chennai are delayed, and what duty applies to shrimp?"
"""
import asyncio
import json
import sys
from pathlib import Path

import anthropic
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

MODEL = "claude-sonnet-4-5"
MAX_STEPS = 8
SERVER = StdioServerParameters(command=sys.executable, args=[str(Path(__file__).parent / "server.py")])

SYSTEM = """You are a trade-operations assistant. Answer using the tools; never guess order or duty data.
Keep answers short and cite order/shipment ids you used."""


async def run(goal: str) -> str:
    client = anthropic.Anthropic()
    async with stdio_client(SERVER) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # 1. Tools come from the server — no glue code
            listed = await session.list_tools()
            tools = [{"name": t.name, "description": t.description or "", "input_schema": t.inputSchema} for t in listed.tools]
            print("tools from MCP server:", [t["name"] for t in tools])

            messages = [{"role": "user", "content": goal}]
            for step in range(1, MAX_STEPS + 1):
                resp = client.messages.create(model=MODEL, max_tokens=1024, system=SYSTEM, tools=tools, messages=messages)
                messages.append({"role": "assistant", "content": resp.content})
                if resp.stop_reason != "tool_use":
                    return "".join(b.text for b in resp.content if b.type == "text")

                results = []
                for block in resp.content:
                    if block.type == "tool_use":
                        print(f"[step {step}] tool={block.name} input={json.dumps(block.input)}")
                        # 2. Execution happens in the server, not here
                        out = await session.call_tool(block.name, block.input)
                        text = "".join(c.text for c in out.content if getattr(c, "type", "") == "text")
                        results.append({"type": "tool_result", "tool_use_id": block.id, "content": text})
                messages.append({"role": "user", "content": results})
    return "Stopped: step limit reached without finishing."


if __name__ == "__main__":
    goal = " ".join(sys.argv[1:]) or "Which shipments to Chennai are delayed by 4 days or more? And what duty applies to frozen shrimp?"
    print("\nFINAL:", asyncio.run(run(goal)))
