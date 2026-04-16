"""
Data Analyst Agent Service

Implements a multi-step agent workflow for data analysis:
Plan → Inspect → Code → Execute → Validate → Report

Based on DeepAnalyze architecture: https://github.com/ruc-datalab/DeepAnalyze

Supports multiple LLM backends:
- Claude (Anthropic)
- Doubao-Seed-Code (ByteDance) - Anthropic API compatible
- Kimi/Moonshot - OpenAI API compatible
"""

import json
import traceback
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum
import anthropic
import openai

from app.config import get_settings
from app.services.vector_store import search

settings = get_settings()

# Initialize LLM clients based on config
llm_client = None
llm_type = settings.analyst_llm
LLM_MODEL = "claude-sonnet-4-20250514"  # Default

if llm_type == "doubao" and settings.doubao_api_key:
    # Doubao uses OpenAI-compatible API (BytePlus)
    llm_client = openai.OpenAI(
        api_key=settings.doubao_api_key,
        base_url=settings.doubao_base_url
    )
    LLM_MODEL = settings.doubao_model
elif llm_type == "moonshot" and settings.moonshot_api_key:
    # Moonshot uses OpenAI-compatible API
    llm_client = openai.OpenAI(
        api_key=settings.moonshot_api_key,
        base_url=settings.moonshot_base_url
    )
    LLM_MODEL = settings.moonshot_model
elif settings.anthropic_api_key:
    # Default to Claude
    llm_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    LLM_MODEL = "claude-sonnet-4-20250514"
    llm_type = "claude"
else:
    llm_type = "none"


class AgentStep(Enum):
    PLAN = "plan"
    INSPECT = "inspect"
    CODE = "code"
    EXECUTE = "execute"
    VALIDATE = "validate"
    REPORT = "report"


@dataclass
class AnalysisContext:
    """Maintains state across agent steps"""
    question: str
    environment_id: str
    plan: Optional[str] = None
    data_schema: Optional[Dict] = None
    retrieved_data: List[Dict] = field(default_factory=list)
    generated_code: Optional[str] = None
    execution_result: Optional[str] = None
    validation_result: Optional[Dict] = None
    final_report: Optional[str] = None
    steps_taken: List[Dict] = field(default_factory=list)
    max_iterations: int = 3
    current_iteration: int = 0


PLAN_PROMPT = """You are a data analyst planning an analysis task.

Given a user question about an environment dataset, create a brief analysis plan.

Question: {question}

Available data context (sample chunks from the environment):
{sample_data}

Create a concise plan with:
1. What data points are needed to answer this question
2. What analysis approach to use (aggregation, filtering, comparison, trend analysis, etc.)
3. Expected output format

Respond in JSON:
{{
    "understanding": "Brief restatement of what user wants to know",
    "data_needed": ["list", "of", "required", "data", "fields"],
    "analysis_approach": "Description of how to analyze",
    "output_type": "single_value | list | comparison | summary"
}}"""


INSPECT_PROMPT = """You are a data analyst inspecting available data.

Based on this plan:
{plan}

And these data chunks retrieved from the environment:
{data_chunks}

Analyze what data is available and identify:
1. Which fields are relevant to the question
2. Data types and value ranges
3. Any data quality issues
4. Whether we have sufficient data to answer the question

Respond in JSON:
{{
    "relevant_fields": ["field1", "field2"],
    "data_summary": "Brief summary of available data",
    "sufficient_data": true/false,
    "missing_info": ["list of missing info if any"],
    "quality_notes": "Any data quality observations"
}}"""


CODE_PROMPT = """You are a data analyst writing Python code to analyze data.

Question: {question}
Plan: {plan}
Data inspection: {inspection}

Available data (as JSON):
{data}

Write Python code to analyze this data and answer the question.
The code should:
1. Parse the provided data
2. Perform the necessary analysis
3. Print the final result as a JSON object with keys: "answer", "details", "confidence"

Only output executable Python code, no explanations.
Start with: # Analysis code
End with a print statement for the JSON result."""


VALIDATE_PROMPT = """You are a data analyst validating analysis results.

Question: {question}
Plan: {plan}
Code output: {result}

Evaluate the analysis:
1. Does the result answer the original question?
2. Is the answer reasonable given the data?
3. Are there any errors or anomalies?
4. Confidence level in the result?

Respond in JSON:
{{
    "valid": true/false,
    "issues": ["list of issues if any"],
    "confidence": "high | medium | low",
    "needs_revision": true/false,
    "revision_suggestion": "What to fix if needs_revision is true"
}}"""


REPORT_PROMPT = """You are a data analyst writing a final report.

Question: {question}
Analysis plan: {plan}
Execution result: {result}
Validation: {validation}

Write a clear, professional response that:
1. Directly answers the user's question
2. Cites specific data points when possible
3. Notes any caveats or limitations
4. Is concise but informative

Do not use markdown headers. Write in natural paragraphs."""


def _call_llm(prompt: str, system: str = "You are a helpful data analyst.") -> str:
    """Make an LLM call with the given prompt. Supports Claude, Doubao, and Moonshot."""
    if not llm_client:
        raise ValueError("No LLM API key configured")

    if llm_type in ("moonshot", "doubao"):
        # OpenAI-compatible API (Moonshot, Doubao/BytePlus)
        response = llm_client.chat.completions.create(
            model=LLM_MODEL,
            max_tokens=2048,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    else:
        # Anthropic API (Claude)
        message = llm_client.messages.create(
            model=LLM_MODEL,
            max_tokens=2048,
            system=system,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text


def _extract_json(text: str) -> Dict:
    """Extract JSON from LLM response"""
    try:
        # Try direct parse
        return json.loads(text)
    except:
        # Try to find JSON in the text
        import re
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            try:
                return json.loads(json_match.group())
            except:
                pass
    return {}


def _execute_code_safely(code: str, data: List[Dict]) -> str:
    """Execute Python code in a restricted environment"""
    # Create a restricted globals dict with only safe builtins
    safe_builtins = {
        'print': print,
        'len': len,
        'sum': sum,
        'min': min,
        'max': max,
        'abs': abs,
        'round': round,
        'sorted': sorted,
        'list': list,
        'dict': dict,
        'str': str,
        'int': int,
        'float': float,
        'bool': bool,
        'range': range,
        'enumerate': enumerate,
        'zip': zip,
        'map': map,
        'filter': filter,
        'any': any,
        'all': all,
        'set': set,
        'tuple': tuple,
        'json': json,
    }

    # Capture print output
    import io
    import sys

    output_buffer = io.StringIO()

    local_vars = {
        'data': data,
        'json': json,
    }

    old_stdout = sys.stdout
    try:
        sys.stdout = output_buffer
        exec(code, {'__builtins__': safe_builtins}, local_vars)
    except Exception as e:
        return f"Error: {str(e)}\n{traceback.format_exc()}"
    finally:
        sys.stdout = old_stdout

    return output_buffer.getvalue()


def step_plan(ctx: AnalysisContext) -> AnalysisContext:
    """Plan the analysis approach"""
    # Get sample data to understand the environment
    sample_chunks = search(ctx.environment_id, ctx.question, k=3)
    sample_data = "\n\n".join([
        f"Sample {i+1}:\n{chunk['text'][:500]}..."
        for i, chunk in enumerate(sample_chunks)
    ])

    prompt = PLAN_PROMPT.format(
        question=ctx.question,
        sample_data=sample_data
    )

    response = _call_llm(prompt)
    plan = _extract_json(response)

    ctx.plan = plan if plan else {"understanding": response}
    ctx.steps_taken.append({
        "step": "plan",
        "output": ctx.plan
    })

    return ctx


def step_inspect(ctx: AnalysisContext) -> AnalysisContext:
    """Inspect the available data"""
    # Retrieve more data based on the plan
    search_queries = [ctx.question]
    if ctx.plan and isinstance(ctx.plan, dict):
        data_needed = ctx.plan.get("data_needed", [])
        search_queries.extend(data_needed[:3])  # Limit queries

    all_chunks = []
    seen_ids = set()

    for query in search_queries:
        chunks = search(ctx.environment_id, str(query), k=5)
        for chunk in chunks:
            if chunk["id"] not in seen_ids:
                all_chunks.append(chunk)
                seen_ids.add(chunk["id"])

    ctx.retrieved_data = all_chunks[:15]  # Limit total chunks

    # Format chunks for inspection
    data_chunks = "\n\n---\n\n".join([
        f"Chunk {i+1} (score: {chunk['score']:.3f}):\n{chunk['text']}"
        for i, chunk in enumerate(ctx.retrieved_data)
    ])

    prompt = INSPECT_PROMPT.format(
        plan=json.dumps(ctx.plan, indent=2) if isinstance(ctx.plan, dict) else ctx.plan,
        data_chunks=data_chunks
    )

    response = _call_llm(prompt)
    inspection = _extract_json(response)

    ctx.data_schema = inspection if inspection else {"summary": response}
    ctx.steps_taken.append({
        "step": "inspect",
        "chunks_retrieved": len(ctx.retrieved_data),
        "output": ctx.data_schema
    })

    return ctx


def step_code(ctx: AnalysisContext) -> AnalysisContext:
    """Generate analysis code"""
    # Prepare data for code generation
    data_for_code = [
        {"text": chunk["text"], "source": chunk.get("source_name", "unknown")}
        for chunk in ctx.retrieved_data
    ]

    prompt = CODE_PROMPT.format(
        question=ctx.question,
        plan=json.dumps(ctx.plan, indent=2) if isinstance(ctx.plan, dict) else ctx.plan,
        inspection=json.dumps(ctx.data_schema, indent=2) if isinstance(ctx.data_schema, dict) else ctx.data_schema,
        data=json.dumps(data_for_code, indent=2)
    )

    response = _call_llm(prompt)

    # Extract code from response
    code = response
    if "```python" in response:
        code = response.split("```python")[1].split("```")[0]
    elif "```" in response:
        code = response.split("```")[1].split("```")[0]

    ctx.generated_code = code.strip()
    ctx.steps_taken.append({
        "step": "code",
        "code_length": len(ctx.generated_code)
    })

    return ctx


def step_execute(ctx: AnalysisContext) -> AnalysisContext:
    """Execute the analysis code"""
    data_for_execution = [
        {"text": chunk["text"], "source": chunk.get("source_name", "unknown")}
        for chunk in ctx.retrieved_data
    ]

    result = _execute_code_safely(ctx.generated_code, data_for_execution)
    ctx.execution_result = result
    ctx.steps_taken.append({
        "step": "execute",
        "success": not result.startswith("Error"),
        "output_length": len(result)
    })

    return ctx


def step_validate(ctx: AnalysisContext) -> AnalysisContext:
    """Validate the analysis results"""
    prompt = VALIDATE_PROMPT.format(
        question=ctx.question,
        plan=json.dumps(ctx.plan, indent=2) if isinstance(ctx.plan, dict) else ctx.plan,
        result=ctx.execution_result[:2000]  # Limit result length
    )

    response = _call_llm(prompt)
    validation = _extract_json(response)

    ctx.validation_result = validation if validation else {"valid": True, "confidence": "medium"}
    ctx.steps_taken.append({
        "step": "validate",
        "output": ctx.validation_result
    })

    return ctx


def step_report(ctx: AnalysisContext) -> AnalysisContext:
    """Generate the final report"""
    prompt = REPORT_PROMPT.format(
        question=ctx.question,
        plan=json.dumps(ctx.plan, indent=2) if isinstance(ctx.plan, dict) else ctx.plan,
        result=ctx.execution_result[:3000] if ctx.execution_result else "No execution result",
        validation=json.dumps(ctx.validation_result, indent=2) if isinstance(ctx.validation_result, dict) else ctx.validation_result
    )

    response = _call_llm(prompt)
    ctx.final_report = response
    ctx.steps_taken.append({
        "step": "report",
        "report_length": len(response)
    })

    return ctx


def analyze_environment(
    environment_id: str,
    question: str,
    max_iterations: int = 3
) -> Dict[str, Any]:
    """
    Run the full analysis pipeline on an environment.

    Returns:
        Dict with answer, sources, steps taken, and metadata
    """
    if not llm_client:
        raise ValueError("No LLM API key configured (Doubao, Moonshot, or Anthropic)")

    ctx = AnalysisContext(
        question=question,
        environment_id=environment_id,
        max_iterations=max_iterations
    )

    try:
        # Step 1: Plan
        ctx = step_plan(ctx)

        # Step 2: Inspect
        ctx = step_inspect(ctx)

        # Check if we have sufficient data
        if ctx.data_schema and isinstance(ctx.data_schema, dict):
            if not ctx.data_schema.get("sufficient_data", True):
                # Not enough data, skip to report with what we have
                ctx.final_report = f"Based on the available data, I found limited information about this topic. {ctx.data_schema.get('data_summary', '')}"
                return _build_response(ctx)

        # Iteration loop for code → execute → validate
        while ctx.current_iteration < ctx.max_iterations:
            ctx.current_iteration += 1

            # Step 3: Code
            ctx = step_code(ctx)

            # Step 4: Execute
            ctx = step_execute(ctx)

            # Step 5: Validate
            ctx = step_validate(ctx)

            # Check if we need to revise
            if ctx.validation_result and isinstance(ctx.validation_result, dict):
                if not ctx.validation_result.get("needs_revision", False):
                    break
                # If needs revision and we have iterations left, loop back

        # Step 6: Report
        ctx = step_report(ctx)

        return _build_response(ctx)

    except Exception as e:
        return {
            "answer": f"Analysis failed: {str(e)}",
            "sources": [],
            "steps": ctx.steps_taken,
            "error": str(e),
            "llm_usage": None
        }


def _build_response(ctx: AnalysisContext) -> Dict[str, Any]:
    """Build the final response object"""
    sources = [
        {
            "chunk_id": chunk["id"],
            "text": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
            "score": round(chunk["score"], 3),
            "dataset": chunk.get("source_name", "Unknown")
        }
        for chunk in ctx.retrieved_data[:5]  # Top 5 sources
    ]

    return {
        "answer": ctx.final_report or "No analysis result available.",
        "sources": sources,
        "steps": ctx.steps_taken,
        "plan": ctx.plan,
        "validation": ctx.validation_result,
        "iterations": ctx.current_iteration,
        "llm_usage": {
            "model": LLM_MODEL,
            "backend": llm_type,
            "steps_completed": len(ctx.steps_taken)
        }
    }
