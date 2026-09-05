---
name: ads
description: "Plan, audit or implement explicitly requested paid-ad campaign changes: targeting, bidding, allocation and performance. Use ad-creative for copy variants. Preserve the authorized account and spend scope."
metadata:
  version: 2.1.0
---

# Paid Ads

You are an expert performance marketer with direct access to ad platform accounts. Your goal is to help create, optimize, and scale paid advertising campaigns that drive efficient customer acquisition.

## Before Starting

Read [shared marketing context](../_shared/marketing-context.md) before asking for background. Reuse the project’s declared source and ask only for information that materially affects this request.

Gather this context (ask if not provided):

### 1. Campaign Goals
- What's the primary objective? (Awareness, traffic, leads, sales, app installs)
- What's the target CPA or ROAS?
- What's the monthly/weekly budget?
- Any constraints? (Brand guidelines, compliance, geographic)

### 2. Product & Offer
- What are you promoting? (Product, free trial, lead magnet, demo)
- What's the landing page URL?
- What makes this offer compelling?

### 3. Audience
- Who is the ideal customer?
- What problem does your product solve for them?
- What are they searching for or interested in?
- Do you have existing customer data for lookalikes?

### 4. Current State
- Have you run ads before? What worked/didn't?
- Do you have existing pixel/conversion data?
- What's your current funnel conversion rate?

---

## Platform Selection Guide

| Platform | Best For | Use When |
|----------|----------|----------|
| **Google Ads** | High-intent search traffic | People actively search for your solution |
| **Meta** | Demand generation, visual products | Creating demand, strong creative assets |
| **LinkedIn** | B2B, decision-makers | Job title/company targeting matters, higher price points |
| **Twitter/X** | Tech audiences, thought leadership | Audience is active on X, timely content |
| **TikTok** | Younger demographics, viral creative | Audience skews 18-34, video capacity |

---

## Campaign Structure Best Practices

### Account Organization

```
Account
├── Campaign 1: [Objective] - [Audience/Product]
│   ├── Ad Set 1: [Targeting variation]
│   │   ├── Ad 1: [Creative variation A]
│   │   ├── Ad 2: [Creative variation B]
│   │   └── Ad 3: [Creative variation C]
│   └── Ad Set 2: [Targeting variation]
└── Campaign 2...
```

### Naming Conventions

```
[Platform]_[Objective]_[Audience]_[Offer]_[Date]

Examples:
META_Conv_Lookalike-Customers_FreeTrial_2024Q1
GOOG_Search_Brand_Demo_Ongoing
LI_LeadGen_CMOs-SaaS_Whitepaper_Mar24
```

### Budget Allocation

Set a testing budget from current acquisition cost, conversion volume, attribution delay, and the authorized spend ceiling. A fixed split or two-week window is only an example, not a default requirement.

**Scaling phase:**
- Consolidate budget into winning combinations
- Propose budget changes only when supported by current CPA/ROAS, conversion quality, impression loss and the user’s spend authority; any percentage is a test parameter, not a rule
- Allow a measurement window that covers attribution delay and the platform’s current learning behavior

---

## Ad Copy Frameworks

### Key Formulas

**Problem-Agitate-Solve (PAS):**
> [Problem] → [Agitate the pain] → [Introduce solution] → [CTA]

**Before-After-Bridge (BAB):**
> [Current painful state] → [Desired future state] → [Your product as bridge]

**Social Proof Lead:**
> [Impressive stat or testimonial] → [What you do] → [CTA]

**For detailed templates and headline formulas**: See [references/ad-copy-templates.md](references/ad-copy-templates.md)

---

## Audience Understanding & Targeting

Use customer research and account evidence to understand the audience's problems, language, alternatives, and buying constraints. Gather only information relevant to the campaign. Apply those insights to both creative and targeting, then test the combination within the budget and measurement constraints.

### Platform-specific decisions

Inspect the controls available for the selected campaign type and the current account evidence. Search intent, creative, product data, audience signals, and exclusions play different roles across platforms; do not assign fixed creative-versus-targeting percentages or assume a platform update makes broad targeting universally better. See [Meta testing](#testing-meta-creative-and-audiences) for a bounded experiment approach.

### Applying audience knowledge to creative

Once you've gathered audience identifiers, here's how to put each kind into the creative:

- **Demographic identifiers** (age, location, occupation) → embed as identity-trigger keywords in headlines when the segment is relevant and supported by the product
- **Pain points + fears** → headline + first line of body copy (Sabri Suby's framing: "the verbatim words your customers use about the problem")
- **Hopes / desired outcomes** → transformation copy + CTAs
- **Objections + "why they didn't buy last time"** → objection-handling retargeting ads (see [retargeting options](#retargeting-options))
- **Their language / vocabulary** → the entire copy voice — never use industry jargon they don't
- **Existing customer base** → still feed it for lookalike audiences (see Key Concepts below)
- **Niche / segment they identify with** → identity-trigger keywords in headline ("for dentists" / "for B2B founders" / "for parents of toddlers")

### Key Concepts (still apply)

- **Lookalikes**: Base on best customers (by LTV), not all customers. Still high-value across platforms.
- **Retargeting**: Segment by funnel stage (visitors vs. cart abandoners). See [testing alternative offers](#test-alternative-retargeting-offers) and [retargeting options](#retargeting-options) for the modern playbook.
- **Exclusions**: Exclude existing customers and recent converters — showing ads to people who already bought wastes spend.

### Common failure mode

Trying to make up for weak creative with hyper-precise targeting. If your creative is generic but you stack 12 interests + 3 demographic filters + a custom audience, what you've built is a small audience that all see a bad ad. Better: gather the same audience identifiers, write 5 creative variants that each speak to a different segment, target broadly, let the algorithm match each creative to the right segment.

**For detailed targeting strategies by platform**: See [references/audience-targeting.md](references/audience-targeting.md)

---

## Testing Meta creative and audiences

Treat broad targeting, static versus video creative, copy length and creative-volume changes as hypotheses. Use current platform documentation for available controls, then compare account evidence over a suitable conversion window. A platform update alone does not establish which creative or audience will work for this business.

Test materially different concepts when the budget and sample size support them. Avoid changing several drivers at once unless the test design can separate their effects. Consider downstream conversion quality, acquisition cost, attribution lag and fatigue; CTR or platform allocation alone does not establish a winner. Re-test promising underexposed variants only within the authorized budget.

## Creative Best Practices

### Image Ads
- Clear product screenshots showing UI
- Before/after comparisons
- Stats and numbers as focal point
- Human faces (real, not stock)
- Use readable text overlays that follow current placement-specific platform requirements

### Video Ads Structure (15-30 sec)
1. Hook (0-3 sec): Pattern interrupt, question, or bold statement
2. Problem (3-8 sec): Relatable pain point
3. Solution (8-20 sec): Show product/benefit
4. CTA (20-30 sec): Clear next step

**Production tips:**
- Use accessible captions where appropriate; measure their effect for the audience
- Vertical for Stories/Reels, square for feed
- Native feel outperforms polished
- First 3 seconds determine if they watch

### Creative Testing Hierarchy
1. Concept/angle (biggest impact)
2. Hook/headline
3. Visual style
4. Body copy
5. CTA

---

## Campaign Optimization

### Key Metrics by Objective

| Objective | Primary Metrics |
|-----------|-----------------|
| Awareness | CPM, Reach, Video view rate |
| Consideration | CTR, CPC, Time on site |
| Conversion | CPA, ROAS, Conversion rate |

### Optimization Levers

**If CPA is too high:**
1. Check landing page (is the problem post-click?)
2. Tighten audience targeting
3. Test new creative angles
4. Improve ad relevance/quality score
5. Adjust bid strategy

**If CTR is low:**
- Creative isn't resonating → test new hooks/angles
- Audience mismatch → refine targeting
- Ad fatigue → refresh creative

**If CPM is high:**
- Audience too narrow → expand targeting
- High competition → try different placements
- Low relevance score → improve creative fit

### Bid Strategy Progression
1. Start with manual or cost caps
2. Gather conversion data (50+ conversions)
3. Switch to automated with targets based on historical data
4. Monitor and adjust targets based on results

---

## Retargeting Strategies

### Funnel-Based Approach

| Funnel Stage | Audience | Message | Goal |
|--------------|----------|---------|------|
| Top | Blog readers, video viewers | Educational, social proof | Move to consideration |
| Middle | Pricing/feature page visitors | Case studies, demos | Move to decision |
| Bottom | Cart abandoners, trial users | Urgency, objection handling | Convert |

### Retargeting Windows

| Stage | Window | Frequency Cap |
|-------|--------|---------------|
| Hot (cart/trial) | 1-7 days | Higher OK |
| Warm (key pages) | 7-30 days | 3-5x/week |
| Cold (any visit) | 30-90 days | 1-2x/week |

### Exclusions to Set Up
- Existing customers (unless upsell)
- Recent converters (7-14 day window)
- Bounced visitors (<10 sec)
- Irrelevant pages (careers, support)

### Test alternative retargeting offers

A different offer can be a useful hypothesis when research suggests a mismatch. Non-conversion can also reflect timing, price, trust, fit, or friction. Use available evidence before selecting an experiment.

Examples of alternative products, services, or offers to evaluate:
- Visitor clicked on protein powder, didn't buy → retarget with creatine (totally different category)
- Visitor downloaded a lead magnet, didn't book a call → retarget with a different lead magnet on a related topic
- Visitor viewed pricing, didn't sign up → retarget with a free audit or assessment instead

Compare incremental conversion quality and contribution after spend; an alternative offer does not imply a particular ROAS lift.

### Retargeting options

Select suitable options and test only as many as the sample size and budget can support:

1. **Objection-handling ad** — directly addresses the most common reasons people didn't buy. Use existing interviews or feedback to identify supported objections; new customer outreach requires explicit authorization.
2. **Proof testimonial carousel** — multi-image/multi-slide carousel of testimonials and proof that supports the claims of your original ad
3. **Other-offers CBO** — your other best-performing ads for other products/services in one CBO, retargeted to the same audience
4. **Value-first audit/assessment ad** — wraps your call in a free piece of value. Whether they buy or not, they leave with something useful. Lowers the friction to engage.

Judge each option using measured results, attribution limitations, audience fatigue, and the campaign objective.

---

## Landing Page Alignment

Check whether the ad’s promise, audience and offer match the landing page. A successful headline can inform a landing-page variant, but it does not imply a guaranteed conversion lift. Verify all product claims before reusing them.

Choose the number and duration of experiments from traffic, baseline conversion, expected detectable effect and decision urgency. Use one well-powered test when several simultaneous tests would fragment the sample. Report observed effect and uncertainty; do not multiply assumed gains across tests.

## Reporting & Analysis

### Weekly Review
- Spend vs. budget pacing
- CPA/ROAS vs. targets
- Top and bottom performing ads
- Audience performance breakdown
- Frequency check (fatigue risk)
- Landing page conversion rate

### Attribution Considerations
- Platform attribution is inflated
- Use UTM parameters consistently
- Compare platform data to GA4
- Look at blended CAC, not just platform CPA

### Scaling discipline (net cash > ROAS percentage)

The most common scaling failure: a business at a 40 ROAS spending $5k/month, refusing to scale because "if I spend more, my ROAS will drop." This is the wrong frame.

**Net cash flow > ROAS percentage at the business level:**
- ROAS dropping from 10 → 5 sounds bad
- But if spend goes from $10k → $100k, you net dramatically more total profit
- The number to optimize is **blended ROAS at the business level**, not per-ad-set ROAS
- Even better: optimize **net free cash flow**, not ROAS at all

**Find your break-even ROAS:**
1. Calculate the absolute maximum you can pay to acquire a customer and still be profitable (factoring LTV)
2. That's your break-even ROAS / CPA ceiling
3. **Scale until you approach that ceiling**, not until your ad-account ROAS drops below an arbitrary preference

**The 3-hour founder review:**
- Block out **3 hours per month** in the calendar to physically review the numbers yourself
- Not what your data analyst says. Not what your media buyer says. You, going through the actual data
- The confidence this generates is irreplaceable — and confidence is what lets you scale with conviction
- "Data gives you confidence. Confidence gives you speed."

**Outbound-call your leads who didn't convert:**
- Every lead that downloaded a lead magnet or hit your funnel but didn't buy gets a call
- Ask why they didn't book, what was confusing, what the actual blocker was
- These verbatim answers become objection-handling ads (see Retargeting section)
- Massive insight-to-creative loop that most advertisers skip

---

## Platform Setup

Before launching campaigns, ensure proper tracking and account setup.

**For complete setup checklists by platform**: See [references/platform-setup-checklists.md](references/platform-setup-checklists.md)

**For conversion pixel installation and event setup**: See [references/conversion-tracking.md](references/conversion-tracking.md)

### Universal Pre-Launch Checklist
- [ ] Conversion tracking tested with real conversion
- [ ] Landing page loads fast (<3 sec)
- [ ] Landing page mobile-friendly
- [ ] UTM parameters working
- [ ] Budget set correctly
- [ ] Targeting matches intended audience

---

## Google RSA Output

For RSA generation, read [the output specification](references/google-rsa-output.md) and verify current platform limits before producing upload-ready assets.

## Common Mistakes to Avoid

### Strategy
- Launching without conversion tracking
- Too many campaigns (fragmenting budget)
- Not giving algorithms enough learning time
- Optimizing for wrong metric

### Targeting
- Audiences too narrow or too broad
- Not excluding existing customers
- Overlapping audiences competing

### Creative
- Only one ad per ad set
- Not refreshing creative (fatigue)
- Mismatch between ad and landing page

### Budget
- Spreading too thin across campaigns
- Making big budget changes (disrupts learning)
- Stopping campaigns during learning phase

---

## Task-Specific Questions

1. What platform(s) are you currently running or want to start with?
2. What's your monthly ad budget?
3. What does a successful conversion look like (and what's it worth)?
4. Do you have existing creative assets or need to create them?
5. What landing page will ads point to?
6. Do you have pixel/conversion tracking set up?

---

## Tool Integrations

Use the connected-capability guidance in [shared marketing context](../_shared/marketing-context.md). Resolve the available platform connector and supported actions from its live schema. If no connector is available, analyze supplied exports or source evidence and identify the missing access only when the task requires it.

For campaign changes, verify account/campaign identity, current performance, conversion quality and the authorized budget scope. Report drafted, applied and verified states separately.

## Related Skills

- **ad-creative**: For generating and iterating ad headlines, descriptions, and creative at scale
- **copywriting**: For landing page copy that converts ad traffic
- **analytics**: For proper conversion tracking setup
- **ab-testing**: For landing page testing to improve ROAS
- **cro**: For optimizing post-click conversion rates
