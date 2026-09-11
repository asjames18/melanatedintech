-- Fix malformed H1 heading and broken scorecard table in Human Approval Patterns for Agents article

UPDATE public.articles
SET body = $article$# Human Approval Patterns for Agents  

## The Core Problem  

AI agents increasingly perform autonomous actions—calling APIs, modifying data, triggering workflows. Left unchecked, these actions pose security, compliance, and reputational risks. Yet forcing a human‑in‑the‑loop for every micro‑task creates unacceptable latency, frustrates users, and stalls productivity. The challenge is to **select an approval gate that matches the risk and impact of each agent action while preserving speed for low‑risk operations**.

## Why Approval Patterns Matter  

- **Risk‑based gating** prevents over‑automation of high‑impact decisions.  
- **Consistent patterns** reduce cognitive load on reviewers and enable auditability.  
- **Pattern reuse** lets teams scale governance without rebuilding gate logic for every new agent.

## Approval Gate Taxonomy  

| Gate Type | Trigger Condition | Human Involvement | Typical Latency | Best‑Fit Use Cases |
|-----------|-------------------|-------------------|-----------------|--------------------|
| **Pre‑action Approval** | Action exceeds risk threshold *before* execution | Mandatory review & sign‑off | Seconds to minutes (depends on reviewer availability) | Financial transfers, data deletion, model retraining |
| **Post‑action Notification** | Action completes; risk is low‑to‑moderate | Informational only (optional acknowledgment) | Near‑real‑time (push notification/email) | Logging changes, non‑critical config updates |
| **Break‑glass Override** | Action fails automated checks; requires immediate human intervention | Emergency approval (often with escalation path) | Sub‑second to a few seconds (chat‑ops) | Production incident response, safety‑critical shutdowns |
| **Adaptive Throttling** | Action frequency spikes beyond baseline | Human review after N occurrences (e.g., >5/min) | Minutes (batch review) | API burst protection, anomalous query detection |
| **Delegated Approval** | Action falls within a pre‑approved policy envelope | Designated approver (role‑based) | Seconds (if approver is online) | Routine user provisioning, standard report generation |

### Choosing the Right Gate  

Use the following **decision matrix** to map an agent action to a gate type. Score each criterion (1 = low, 5 = high) and sum the total; higher totals indicate stricter gating.

| Criterion | Description | Weight |
|-----------|-------------|--------|
| **Impact** | Potential business or compliance damage if action goes wrong | 0.3 |
| **Frequency** | How often the action is expected to run per hour/day | 0.2 |
| **Predictability** | Degree to which outcome can be forecasted by models or rules | 0.2 |
| **Regulatory Scope** | Presence of explicit legal or policy mandates (e.g., GDPR, SOX) | 0.2 |
| **User Tolerance** | Acceptable delay for end‑users experiencing the action | 0.1 |

**Scoring Example** – Deleting a user record:  
Impact = 5, Frequency = 1, Predictability = 4, Regulatory Scope = 5, User Tolerance = 2 →  
(5×0.3)+(1×0.2)+(4×0.2)+(5×0.2)+(2×0.1)=1.5+0.2+0.8+1.0+0.2=**3.7** → falls into **Pre‑action Approval** (≥3.5).

Implement a simple spreadsheet or script that computes this score and returns the recommended gate.

## Implementation Checklist  

- [ ] **Define risk taxonomy** (impact, frequency, predictability, regulatory, tolerance).  
- [ ] **Assign weights** reflecting organizational priorities; revisit quarterly.  
- [ ] **Build scoring function** (see code block below).  
- [ ] **Map score ranges to gate types** (adjust thresholds as needed).  
- [ ] **Integrate gate decision point** into agent orchestration layer (e.g., before API call).  
- [ ] **Create reviewer workflow** (ticketing system, chat‑ops, or dedicated approval portal).  
- [ ] **Instrument logging** (action ID, score, gate chosen, reviewer, timestamp, outcome).  
- [ ] **Establish SLA** for each gate type (e.g., pre‑action ≤ 5 min, break‑glass ≤ 30 s).  
- [ ] **Run tabletop exercises** quarterly to validate latency and false‑positive/negative rates.  
- [ ] **Iterate**: adjust weights or thresholds based on audit findings and user feedback.

## Sample Scoring Function (Python‑like Pseudocode)

```python
def approval_gate_score(action_meta):
    """
    action_meta: dict with keys:
        impact (1-5), frequency (1-5), predictability (1-5),
        regulatory (1-5), user_tolerance (1-5)
    Returns: (score, recommended_gate)
    """
    weights = {
        "impact": 0.3,
        "frequency": 0.2,
        "predictability": 0.2,
        "regulatory": 0.2,
        "user_tolerance": 0.1,
    }
    score = sum(action_meta[k] * weights[k] for k in weights)
    # Thresholds can be tuned; these are starting points
    if score >= 4.0:
        gate = "Pre-action Approval"
    elif score >= 3.0:
        gate = "Post-action Notification"
    elif score >= 2.0:
        gate = "Adaptive Throttling"
    else:
        gate = "No Gate (auto‑execute)"
    return round(score, 2), gate

# Example usage
meta = {
    "impact": 5,
    "frequency": 1,
    "predictability": 4,
    "regulatory": 5,
    "user_tolerance": 2,
}
print(approval_gate_score(meta))  # → (3.7, 'Pre-action Approval')
```

Replace the dict with data pulled from your agent’s metadata store or feature service.

## Scorecard for Ongoing Gate Effectiveness

Ongoing gate effectiveness can be measured with a lightweight scorecard reviewed each sprint.

| Gate | Target | Measurement |
|------|--------|-------------|
| Pre‑action Approval | Mean time to approval (MTTA) ≤ 5 min | Track timestamps from request to reviewer sign‑off |
| Post‑action Notification | Acknowledgment rate ≥ 90 % | % of notifications where reviewer clicks “acknowledged” |
| Break‑glass Override | False‑positive rate ≤ 2 % | # of unnecessary overrides / total overrides |
| Adaptive Throttling | Review backlog ≤ 10 items | Number of pending throttle reviews at sprint end |
| Delegated Approval | SLA compliance ≥ 95 % | % of delegated approvals met within role‑specific SLA |

Populate the scorecard automatically from your logging pipeline (e.g., Elasticsearch → Kibana dashboard).

## Common Pitfalls & Mitigations  

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| **Over‑scoring** | Every action lands in Pre‑action Approval → bottlenecks | Re‑evaluate weights; increase tolerance for low‑impact, high‑frequency tasks. |
| **Gate drift** | Reviewers start auto‑approving without reading | Introduce random spot‑checks; require a brief justification field. |
| **Latency blindness** | Teams ignore MTTA SLA because “it’s just a few minutes” | Surface MTTA in team dashboards; tie to OKRs. |
| **Missing audit trail** | No record of who approved what | Enforce immutable log (append‑only store) and tie each entry to a reviewer ID. |
| **Static thresholds** | Scores become outdated as risk landscape shifts | Schedule quarterly weight review; incorporate feedback from incident post‑mortems. |

## Putting It All Together – A Minimal Viable Playbook  

1. **Catalog** all agent‑initiated actions in a central registry (name, description, API endpoint).  
2. **Populate** the risk taxonomy for each action (baseline values from historical data).  
3. **Run** the scoring function nightly to produce a gate assignment report.  
4. **Deploy** a lightweight middleware that, before an action executes, looks up its gate and either:  
   - blocks and creates an approval ticket (Pre‑action),  
   - lets it run and fires a notification (Post‑action),  
   - triggers a break‑glass channel if automated checks fail,  
   - increments a counter for throttling review, or  
   - routes to a role‑based approver (Delegated).  
5. **Monitor** the scorecard; adjust weights or thresholds when drift exceeds 10 % of baseline SLA.  

By following this playbook, you keep high‑risk agent behavior under human oversight while letting the majority of low‑risk tasks flow at machine speed—exactly the balance needed for secure, scalable AI automation.

---  

*End of article.*$article$
WHERE slug = 'human-approval-patterns-for-agents';
