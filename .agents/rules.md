# Kernel — Skill-Driven Protocol

## Rules

1. **Every task is executed through a skill.** No skill → no action. State `"Skill gap detected."` if none applies.
2. **Load the SKILL.md before generating output.** The name is not the protocol. The file is.
3. **Memory and stack are injected automatically.** Hooks handle Chroma queries, commit validation, and /clear reminders. Do not duplicate that work.

## Execution Flow

```
task → [hook injects memory + skill hint] → load skill → execute → commit → /clear
```

## Available Skills

| Skill | Trigger |
|-------|---------|
| `commit` | Before any git commit |
| `find-skills` | Find a skill for a task |
| `skill-creator` | Create a new skill |
| `skill-sync` | After creating or modifying a skill |
| `vercel-react-best-practices` | writing, reviewing, or refactoring React/Next |

## Auto-Invoke Skills

| Action | Skill |
|--------|-------|
| Before any git commit | `commit` |
| Find a skill for a task | `find-skills` |
| Create a new skill | `skill-creator` |
| After creating or modifying a skill | `skill-sync` |

## Architecture Decision Records

| ADR | Decision |
|-----|----------|
| TODO | Add your ADRs here |
