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

| Skill | Description | File |
|-------|-------------|------|
| `commit` | Enforces professional git commits using the Conventional Commits specification. Trigger: Before any git commit or when requested to commit changes. | [SKILL.md](.agents/skills/commit/SKILL.md) |
| `find-skills` | Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill. | [SKILL.md](.agents/skills/find-skills/SKILL.md) |
| `shadcn` | Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI, including chat interfaces. Provides project context, component docs, and usage examples. Applies when working with shadcn/ui, component registries, presets, --preset codes, or any project with a components.json file. Also triggers for "shadcn init", "create an app with --preset", or "switch to --preset". | [SKILL.md](.agents/skills/shadcn/SKILL.md) |
| `skill-creator` | Creates new AI agent skills following the project skill spec. Trigger: When user asks to create a new skill, add agent instructions, or document patterns for AI reuse. | [SKILL.md](.agents/skills/skill-creator/SKILL.md) |
| `skill-sync` | Keeps the Available Skills and Auto-Invoke Skills tables in sync with skill metadata after any skill is created or modified. Detects CLAUDE.md and .kiro/steering/project-rules.md by file existence and updates both. Trigger: After creating or modifying any SKILL.md file. | [SKILL.md](.agents/skills/skill-sync/SKILL.md) |
| `vercel-react-best-practices` | React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements. | [SKILL.md](.agents/skills/vercel-react-best-practices/SKILL.md) |

## Auto-Invoke Skills

When performing these actions, ALWAYS load the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Add a shadcn component | `shadcn` |
| Add a slash command | `skill-creator` |
| Add agent instructions | `skill-creator` |
| After creating or modifying a skill | `skill-sync` |
| Apply a preset | `shadcn` |
| Auto-invoke table is out of sync | `skill-sync` |
| Before any git commit | `commit` |
| Bundle optimization | `vercel-react-best-practices` |
| Buscar un skill para una tarea | `find-skills` |
| Commitear, guardar cambios en git | `commit` |
| Create a new skill | `skill-creator` |
| Creating a git commit | `commit` |
| Data fetching in React | `vercel-react-best-practices` |
| Después de crear o modificar un skill | `skill-sync` |
| Document a pattern for AI reuse | `skill-creator` |
| Encontrar o instalar skills disponibles | `find-skills` |
| Escribir mensaje de commit | `commit` |
| Find a skill for a task | `find-skills` |
| Hacer commit de los cambios | `commit` |
| Initialize shadcn in the project | `shadcn` |
| Install a new skill | `find-skills` |
| Performance improvements in React | `vercel-react-best-practices` |
| Project has components.json | `shadcn` |
| Refactoring React or Next.js code | `vercel-react-best-practices` |
| Reviewing React code | `vercel-react-best-practices` |
| Search component registry | `shadcn` |
| Search for available skills | `find-skills` |
| Sincronizar tabla de skills | `skill-sync` |
| Stage and commit changes | `commit` |
| Switch preset | `shadcn` |
| Teach the agent how to do X | `skill-creator` |
| Working with shadcn/ui components | `shadcn` |
| Write a commit message | `commit` |
| Writing React components | `vercel-react-best-practices` |
| shadcn init | `shadcn` |

## Architecture Decision Records

| ADR | Decision |
|-----|----------|
| TODO | Add your ADRs here |
