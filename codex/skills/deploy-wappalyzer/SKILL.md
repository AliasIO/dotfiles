---
name: deploy-wappalyzer
description: Inspect Wappalyzer deployment state, propagate published canonical dependency commits into declared consumers, or explicitly deploy `v4/apis` and `v4/frontend`. Use for deployment planning/status, submodule/gitlink rollout, layer/API/ECS release, frontend production rollout, or post-deploy smoke checks. Inspection is read-only; dependency `--apply`, commits, and pushes require Publish authority; any deploy, production-triggering frontend push, or live mutation requires an explicit Operate request. Do not invoke merely to implement or locally verify code.
---

# Deploy Wappalyzer

## Select the least-authorized mode

| Mode | Actions |
| --- | --- |
| Inspect | Read status, plan a rollout, run dependency `--check`, inspect workflows/functions, and report |
| Publish | Run dependency `--apply`, make exact task-owned propagation commits, and push only when requested |
| Operate | Execute an explicitly requested API, ECS, layer, or frontend production deployment and smoke-check it |

- Implementation is not a deploy mode. Finish and validate code in the owning workflow first.
- Never deploy `v2` or a stage sharing live resources without explicit current-task permission.
- A frontend `master` push starts production deployment and therefore requires Operate authority, not merely generic permission to push.

## Load only the needed reference

- Dependency or submodule work: [dependency-propagation.md](references/dependency-propagation.md)
- API, layer, Lambda, container, or ECS work: [apis.md](references/apis.md)
- Website rollout: [frontend.md](references/frontend.md)
- Live AWS/Cognito/Cloudflare facts: `$HOME/Sites/dotfiles/codex/projects/wappalyzer/runbooks/live-infrastructure.md`

## Workflow

1. Identify the canonical repository, changed artifact, consumers, target stage, and requested authority mode.
2. Inspect every repository that will be touched. Preserve unrelated canonical and parent changes; consumer paths declared in the dependency manifest are disposable.
3. Validate the canonical change before publication. For shared dependencies, publish bottom-up and run the deterministic synchronization workflow after each published layer.
4. In Operate mode, use the supported target entrypoint and record the exact commit, stage, command/workflow, and resulting revision.
5. Perform a target-specific smoke check plus a one-shot deployment status check. Continuous waiting/monitoring requires an explicit request.
6. Report publication, dispatch, deployment, and verification as separate states. List moved gitlinks and any remaining consumer or service rollout.

## Non-negotiable boundaries

- Never patch consumer submodules. Never stage propagation with `git add -A`.
- The sync script may overwrite only declared consumer paths and their gitlinks. It never commits, pushes, or deploys.
- A layer/env update does not update consuming functions until they are redeployed.
- An ECS image push is not an ECS service rollout.
- Do not claim deployment success from a push or dispatch alone.
