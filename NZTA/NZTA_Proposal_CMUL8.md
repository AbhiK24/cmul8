![CMUL8](../assets/logo-infinity.svg)

# CMUL8

**Simulation Intelligence Lab**

*Foresight, grounded.*

[www.cmul8.com](https://www.cmul8.com/)

---

# Grounded Simulation for Evidence-Based Road Safety Policy

**A Capability Brief for NZ Transport Agency**

*April 2026*

---

## About CMUL8

CMUL8 is a simulation intelligence laboratory specialising in **grounded synthetic populations** for policy analysis and decision support.

We build environments where every agent—every simulated citizen—is constructed from real-world data, not assumptions. Our methodology bridges behavioural science, multi-agent systems, and game-theoretic policy design to answer a question traditional analytics cannot: *what will people actually do?*

Our work spans transport, public health, and economic policy—domains where human behaviour is complex, adaptive, and consequential. We partner with government agencies and research institutions who require more than forecasts: they require **testable counterfactuals**.

CMUL8 does not predict the future. We simulate it—so you can choose which one to build.

---

## Executive Summary

NZTA faces a fundamental challenge: **policies must be tested on citizens before we know if they work.**

Traditional approaches—pilot programs, post-hoc evaluation, stakeholder surveys—are slow, expensive, and reactive. By the time evidence emerges, political and human costs have already been incurred.

CMUL8 offers an alternative: **a census-grounded synthetic population of New Zealand drivers** that enables NZTA to test, iterate, and optimise policies before deployment.

This document outlines four tiers of capability, from simple synthetic polling to full policy optimisation. Each tier builds on the last. Each delivers standalone value. Together, they represent a step-change in how transport policy is developed and defended.

---

## The Foundation: Grounded in Your Data

This platform is not built on assumptions. It is built on **NZTA's own data assets**, structured into two core components: the Environment Definition and the Agent Definition.

### Data Sources

| Data Source | Owner | Coverage |
|-------------|-------|----------|
| Stats NZ 2023 Census | Stats NZ | 4.99M population, 16 regions, 67 territorial authorities |
| NZTA Driver Licence Pass Rates | NZTA | Test outcomes by region, age group, licence stage |
| NZ Road Safety Attitudes Survey | NZTA | 36 behavioural priors, 18 perception fields |
| NZTA Crash Analysis System (CAS) | NZTA | Crash risk indices, speed zone profiles |
| MoT Fleet Statistics | MoT | Vehicle age, type, compliance rates |
| National Speed Limit Register (NSLR) | NZTA | Speed zone profiles by road segment |
| NZ COVID-19 Transport Choices Survey | NZTA | Trip purpose, mode shift willingness |

**Every parameter in this system traces to a New Zealand data source. Nothing is invented.**

---

### Environment Definition

The simulation environment encodes the structural context in which agents operate.

**Population Weights:**
Census-derived weights at two levels of granularity:
- **Regional Council level:** 16 regions with national population weights
- **Territorial Authority level:** 67 districts with regional weights

Example: Auckland (33.2% of national population) → Auckland Council (100% of Auckland region)

**Licence Competence Priors:**
Pass rates from NZTA data, stratified by:
- Region (16 regions with available data)
- Test type (Learner, Restricted, Full)
- Age group (16-24, 25-29, 30-34, 35-39, 40+)

These priors ground each agent's driving competence in observed test performance for their demographic and location.

**Spawn Rules:**
Agents are instantiated using population-weighted sampling:
1. Sample regional council by national weight
2. Sample territorial authority by regional weight
3. Assign licence stage and competence prior from NZTA pass rate data
4. Apply repeat-attempt penalty formula for multiple test attempts

**Data Gaps Handled Transparently:**
Where regional licence data is unavailable (Gisborne, Manawatū-Whanganui, Tasman, Marlborough, West Coast — representing ~9% of population), a documented fallback prior is applied. No gap is hidden.

---

### Agent Definition

Each synthetic driver is defined by **75 fields** organised into 12 domains:

**Structural Domains** (grounded in Census, NZTA, MoT):
- **Identity:** agent_id, agent_version
- **Location:** regional_council, territorial_authority
- **Demographic:** age, gender, ethnicity, employment, household_size, urban_rural
- **Vehicle:** type, age_years, wof_compliant
- **Licence:** stage, age_group, attempt_number, competence_prior
- **Crash Exposure:** crash_risk_index, speed_zone_profile, prior_crash_involvement

**Behavioural Domains** (grounded in NZ Road Safety Attitudes Survey):
- **Social Value Orientation:** svo_class, theta weights, 18 raw behavioural scores
- **Cognitive:** fatigue, distraction, substance use, reaction latency, situational awareness
- **Rule Elasticity:** risk_denial, detection_bias, speed_compliance
- **Perception:** 18 attitude and belief fields

**Dynamic Domains** (derived + literature):
- **Dynamic:** shock_sensitivity, memory_decay, reroute_threshold, coalition_tendency
- **Memory:** memory_stream, reflection_insights, plan_hierarchy

**Field Classification:**
Every field is tagged with:
- **Field class:** structural, behavioural, perception, or identity
- **Data kind:** continuous, discrete nominal, discrete ordinal, or binary
- **Provenance:** exact source reference (e.g., `NAMED_STATS:drink_drive_past_year`)

**Behavioural Grounding Example:**

| Agent Field | Source | Meaning |
|-------------|--------|---------|
| `speed_compliance_score` | NAMED_STATS:speed_compliance_rate | Probability of complying with posted limits |
| `detection_bias_score` | NAMED_STATS:enforcement_effectiveness_dist | Belief about likelihood of being caught |
| `risk_denial_score` | NAMED_STATS:optimism_bias_rate | Tendency to underestimate personal crash risk |
| `drink_drive_attitude` | NAMED_STATS:drink_drive_attitude_dist | Normative stance on impaired driving |

This is not a statistical model. It is a **population of individual agents**, each capable of responding to policy in ways consistent with their grounded attributes.

**No black boxes. No invented priors. Your data, structured for simulation.**

---

## Four Tiers of Capability

### Tier 1: Synthetic Polling

**What it is:**
Query the synthetic population on policy options. Aggregate responses by demographic, region, or behavioural profile.

**Mechanism:**
Each agent "responds" based on their perception and attitude fields. Responses are weighted by census population weights. No simulation required—this is instantaneous lookup and aggregation.

**Example Applications:**

*"What level of support exists for 30km/h urban limits?"*
→ 58% nationally · 71% urban females 25-39 · 34% rural males 40+

*"Which enforcement approach is perceived as most fair?"*
→ Ranked preferences by region and income proxy

*"Who will oppose lower rural speed limits?"*
→ Segmentation by entitlement, speed attitude, rural danger perception

**Value Proposition:**
- Instant hypothesis generation before commissioning field research
- Deep stratification across 75 behavioural and demographic dimensions
- Repeatable, version-controlled queries as policy evolves
- Complements traditional research by identifying which segments to oversample

**Deliverable:** Interactive dashboard for policy teams to query population sentiment on demand.

---

### Tier 2: One-Shot Simulation

**What it is:**
Introduce a policy change and simulate immediate behavioural response. Measure outcomes without waiting for system equilibrium.

**Mechanism:**
Agents adjust behaviour based on policy parameters and their individual utility functions (weighted by `svo.theta` fields). The simulation runs forward for a defined period. Outcomes are measured: compliance rates, crash risk exposure, travel time impact, equity distribution.

**Example Applications:**

*Reduce SH1 Waikato limit 100→80 km/h:*
68% compliance · 12% reroute to local roads · DSI -18% corridor, +4% local network

*Double mobile camera deployment in Northland:*
Detection belief +22% among high-violation agents · Speeding prevalence -14%

*Graduated demerit penalty for under-25s:*
Repeat infringements -8% · Licence deferral +3%

**What This Is Not:**
This tier does not find equilibrium. It measures *first-order response*—what happens immediately when policy changes, before agents fully adapt to each other's behaviour.

**Value Proposition:**
- Rapid scenario comparison (hours, not months)
- Directional confidence before commitment
- Identification of unintended consequences (e.g., local road spillover)

**Deliverable:** Scenario comparison reports with confidence intervals; GIS-integrated outcome visualisation.

---

### Tier 3: Equilibrium Analysis

**What it is:**
Simulate until agent behaviours stabilise. Find the steady-state outcome of a policy, accounting for strategic adaptation.

**Mechanism:**
Agents learn and adapt over repeated simulation cycles using reinforcement learning. Each agent optimises their behaviour given the behaviour of others. The simulation continues until aggregate behaviour stabilises (Nash equilibrium approximation).

**Why This Matters:**
First-order effects mislead. A speed limit reduction may show high initial compliance—but over time:
- Drivers learn which roads are enforced
- Alternative routes become congested, then less attractive
- Social norms shift as peers adapt

**The equilibrium outcome may differ substantially from the one-shot estimate.**

**Example Application:**

| Metric | One-Shot (Tier 2) | Equilibrium (Tier 3) |
|--------|-------------------|----------------------|
| SH1 compliance rate | 68% | 54% (decay as enforcement patterns learned) |
| Local road crash increase | +4% | +11% (rerouting compounds) |
| Net DSI reduction | 18% | 9% |
| Average travel time | +12% | +18% (congestion equilibrates) |

**Value Proposition:**
- Honest forecasting: what *actually* happens, not what happens first
- Equilibrium identification prevents policy overconfidence
- Reveals tipping points and non-linear dynamics

**Deliverable:** Equilibrium outcome reports; convergence diagnostics; sensitivity analysis on key parameters.

---

### Tier 4: Policy Optimisation

**What it is:**
Given a welfare objective, find the policy configuration that maximises it—subject to political, budgetary, and feasibility constraints.

**Mechanism:**
NZTA acts as a "principal" that commits to policy parameters. Agents (followers) respond by playing to equilibrium. The system evaluates welfare at equilibrium and iterates on policy parameters using gradient-based optimisation.

This is the **Social Environment Design** framework: a two-level game where the policy-maker optimises over the equilibrium induced by citizen response.

**Welfare Objectives (Configurable):**

| Objective | Definition |
|-----------|------------|
| Utilitarian | Minimise total DSI (deaths and serious injuries) |
| Egalitarian | Minimise worst-off regional outcome |
| Nash Welfare | Balance efficiency and equity (geometric mean) |
| Constrained | Minimise DSI subject to travel time cap |

**Example Application:**

> *"Given $100M enforcement budget and ±20 km/h speed limit flexibility, what configuration minimises national DSI while ensuring no region experiences >5% travel time increase?"*

**Output:**
- Optimal speed limits per road classification per region
- Enforcement allocation by district
- Projected DSI reduction with confidence interval
- Equity impact assessment

**Value Proposition:**
- Moves from "test and measure" to "design and deploy"
- Defensible optimality claim for public accountability
- Enables principled trade-off analysis (safety vs mobility vs equity)

**Deliverable:** Optimised policy specification; business case generator; equity audit report.

---

## Implementation Pathway

| Phase | Tier | Duration | Outcome |
|-------|------|----------|---------|
| **Phase 1** | Tier 1: Synthetic Polling | 2 weeks | Proof of concept |
| **Phase 2** | Tier 2: One-Shot Simulation | +2 weeks | Scenario capability |
| **Phase 3** | Tier 3: Equilibrium Analysis | +2 weeks | Steady-state forecasting |
| **Phase 4** | Tier 4: Policy Optimisation | +2 weeks | Full decision support |

Each phase delivers standalone value. Progression is optional based on demonstrated ROI. Total time to full capability: 8 weeks.

---

## Why CMUL8

**Grounded in your data, not invented.**
Every behavioural parameter traces to a New Zealand data source. We do not assume distributions—we extract them from NZTA, Stats NZ, and MoT data. The synthetic population is not a model of New Zealanders; it is **constructed from your existing data assets**.

| What Others Do | What We Do |
|----------------|------------|
| Assume agent parameters | Extract from NZ Road Safety Attitudes Survey |
| Use generic population distributions | Weight from Stats NZ 2023 Census |
| Estimate driving competence | Derive from NZTA licence pass rates by region/age |
| Invent crash risk profiles | Compute from NZTA CAS data |

**Transparent, not black-box.**
Every agent field includes provenance metadata. Every simulation run is reproducible. Assumptions are explicit and auditable.

- 75 fields, each tagged with source and extraction method
- Documented fallback priors where data is unavailable
- Version-controlled schema with full change history

**Policy-native, not adapted.**
This platform was designed for transport policy from inception—not a generic simulation tool retrofitted for road safety.

- Agent schema includes NZTA-specific constructs: licence stages, WoF compliance, Vision Zero alignment
- Environment encodes NZ road network structure, speed zones, territorial boundaries
- Welfare functions map directly to Road to Zero outcomes

---

## Next Steps

We propose a scoped engagement to demonstrate Tier 1 capability on a policy question of NZTA's choosing.

**Suggested scope (Tier 1 — Synthetic Polling):**
- Population: 50,000 synthetic agents (1% representative sample of NZ driver population)
- Query: Population sentiment on proposed speed management changes
- Duration: 2 weeks
- Output: Interactive polling dashboard + methodology documentation

The 1% sample maintains full demographic and behavioural fidelity through census-weighted sampling. Results scale to national population with documented confidence intervals.

This engagement will validate data integration, demonstrate query capability, and establish the foundation for subsequent tiers.

---

## Contact

**CMUL8**
Simulation Intelligence Lab

[www.cmul8.com](https://www.cmul8.com/)

---

*This document contains proprietary methodology. Distribution beyond NZTA evaluation committee requires written consent.*

---

![CMUL8](../assets/logo-infinity.svg)
