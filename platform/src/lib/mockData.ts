export const workspaces = [
  { id: "ws1", name: "NZTA Road Policy" },
  { id: "ws2", name: "Urban Housing Sim" },
]

export type Agent = {
  id: string
  name: string
  confidence: number
  response: string
  reasoning: string
  drivers: string[]
  isOutlier: boolean
  cohort: string
  version: string
}

export type Cohort = {
  id: string
  name: string
  agentCount: number
  versions: string[]
  agents: Agent[]
}

export const cohorts: Cohort[] = [
  {
    id: "c1",
    name: "NZTA Drivers",
    agentCount: 6,
    versions: ["V1", "V2"],
    agents: [
      {
        id: "a1",
        name: "Daily Commuter",
        confidence: 88,
        response:
          "I already pay through the nose for fuel. Unless the buses actually run on time, I'm not paying more.",
        reasoning:
          "Prioritises cost certainty, low trust in transit reliability.",
        drivers: ["income_pressure", "transit_distrust", "daily_car_dependency"],
        isOutlier: true,
        cohort: "NZTA Drivers",
        version: "V1",
      },
      {
        id: "a2",
        name: "Rural Tradesperson",
        confidence: 79,
        response:
          "No public transit reaches my worksite. This charge would just cost me money with zero benefit.",
        reasoning:
          "Car-dependent by necessity, not preference. Policy has no upside for this persona.",
        drivers: ["rural_dependency", "zero_transit_access", "cost_sensitivity"],
        isOutlier: false,
        cohort: "NZTA Drivers",
        version: "V1",
      },
      {
        id: "a4",
        name: "Suburban Parent",
        confidence: 82,
        response:
          "I need my car to drop kids at school and get to work. A charge would squeeze our family budget.",
        reasoning:
          "Multiple commitments require car. Values flexibility over cost savings.",
        drivers: ["family_logistics", "time_pressure", "suburban_distance"],
        isOutlier: false,
        cohort: "NZTA Drivers",
        version: "V1",
      },
      {
        id: "a5",
        name: "Shift Worker",
        confidence: 75,
        response:
          "Public transport doesn't run when my shifts end at 2am. This policy ignores workers like me.",
        reasoning: "Transit schedules incompatible with work hours.",
        drivers: ["irregular_hours", "safety_concerns", "no_alternatives"],
        isOutlier: false,
        cohort: "NZTA Drivers",
        version: "V1",
      },
      {
        id: "a6",
        name: "Young Professional",
        confidence: 68,
        response:
          "I'd consider it if the transit was actually reliable. Right now it's not worth the risk of being late.",
        reasoning: "Open to change but needs proof of service quality first.",
        drivers: ["career_priority", "conditional_support", "reliability_focus"],
        isOutlier: false,
        cohort: "NZTA Drivers",
        version: "V1",
      },
      {
        id: "a7",
        name: "Small Business Owner",
        confidence: 84,
        response:
          "My business depends on deliveries and site visits. A congestion charge is basically a tax on my livelihood.",
        reasoning: "Commercial vehicle use non-negotiable for business operations.",
        drivers: ["business_dependency", "cost_pass_through", "service_area"],
        isOutlier: false,
        cohort: "NZTA Drivers",
        version: "V1",
      },
    ],
  },
  {
    id: "c2",
    name: "NZTA Non-Drivers",
    agentCount: 4,
    versions: ["V1"],
    agents: [
      {
        id: "a3",
        name: "Retired Resident",
        confidence: 72,
        response:
          "Better buses would mean I don't need my son to drive me around. I'd pay a small charge for that.",
        reasoning:
          "Transit-dependent. Values independence. Willing to accept cost if service quality improves.",
        drivers: ["transit_dependency", "independence_value", "income_fixed"],
        isOutlier: false,
        cohort: "NZTA Non-Drivers",
        version: "V1",
      },
      {
        id: "a8",
        name: "University Student",
        confidence: 85,
        response:
          "I rely on buses anyway. If a congestion charge funds better routes, I'm all for it.",
        reasoning: "Already transit-dependent. Direct beneficiary of improvements.",
        drivers: ["budget_constrained", "transit_user", "environmentally_aware"],
        isOutlier: false,
        cohort: "NZTA Non-Drivers",
        version: "V1",
      },
      {
        id: "a9",
        name: "City Centre Worker",
        confidence: 78,
        response:
          "Less traffic would make my walk to work safer. Worth it if the money actually goes to pedestrian infrastructure.",
        reasoning: "Benefits from reduced congestion directly. Skeptical of fund allocation.",
        drivers: ["pedestrian_safety", "walkability_priority", "accountability_focus"],
        isOutlier: false,
        cohort: "NZTA Non-Drivers",
        version: "V1",
      },
      {
        id: "a10",
        name: "Cycling Advocate",
        confidence: 91,
        response:
          "Absolutely support it. Fewer cars means safer bike lanes. Just make sure cyclists aren't charged too.",
        reasoning: "Strong ideological alignment. Wants explicit cyclist protections.",
        drivers: ["cycling_infrastructure", "safety_priority", "policy_detail_focus"],
        isOutlier: true,
        cohort: "NZTA Non-Drivers",
        version: "V1",
      },
    ],
  },
]

export type Dataset = {
  id: string
  name: string
  type: "DEMO" | "ECON" | "GEO"
  status: "indexed" | "processing"
  records: number
}

export const datasets: Dataset[] = [
  {
    id: "d1",
    name: "NZ Census 2024",
    type: "DEMO",
    status: "indexed",
    records: 142000,
  },
  {
    id: "d2",
    name: "NZTA Traffic Flow Q1-25",
    type: "GEO",
    status: "indexed",
    records: 8400,
  },
  {
    id: "d3",
    name: "Household Income Survey",
    type: "ECON",
    status: "processing",
    records: 22000,
  },
]

export const mockEnvResponse = {
  text: "Median income in District 7 is $48,200, sitting 12% below the national average. Zone 4 has the highest car dependency at 74%.",
  chart: {
    type: "bar" as const,
    data: [
      { zone: "Zone 4", value: 74 },
      { zone: "Zone 7", value: 52 },
      { zone: "Zone 2", value: 48 },
    ],
  },
  source: "NZ Census 2024 · District 7",
}

export const mockSynthesis =
  "6/10 agents opposed. Primary friction: cost + low transit trust. Non-drivers more supportive (7/10). Key fault line: belief that transit will actually improve."

export type ConversationMode = "POLL" | "ASK" | "SIM" | "EXTRACT"

export type Conversation = {
  id: string
  title: string
  mode: ConversationMode
  date: string
}

export const conversationHistory: Conversation[] = [
  { id: "ch1", title: "Congestion charge response", mode: "POLL", date: "Today" },
  { id: "ch2", title: "Income distribution Zone 4", mode: "ASK", date: "Today" },
  { id: "ch3", title: "Housing subsidy scenario", mode: "SIM", date: "Yesterday" },
  { id: "ch4", title: "Rural transport needs", mode: "POLL", date: "Yesterday" },
  { id: "ch5", title: "Demographic breakdown", mode: "ASK", date: "Last 7 days" },
]

export type Mode = {
  id: string
  label: string
  description: string
  color: string
}

export const modes: Mode[] = [
  {
    id: "poll",
    label: "Survey",
    description: "Ask a question to simulated personas",
    color: "amber",
  },
  {
    id: "ask",
    label: "Query Environment",
    description: "Search indexed datasets",
    color: "jade",
  },
  {
    id: "sim",
    label: "Simulation",
    description: "Run a policy scenario",
    color: "violet",
  },
  {
    id: "extract",
    label: "Extract",
    description: "Pull structured data",
    color: "slate",
  },
]
