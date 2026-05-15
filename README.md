# monday-cli

Personal CLI for the Monday.com GraphQL API.

## Install

Requires `git`, `node` (≥18), and `npm` already installed.

**One-liner** (clones to `~/.monday-cli`, builds, links the `monday` binary onto your PATH):

```bash
curl -fsSL https://raw.githubusercontent.com/brendanfmartin/monday-cli/main/install.sh | bash
```

Override the install location with `MONDAY_CLI_HOME=/some/path bash` if you want it elsewhere.

**Or clone first** (lets you read the script before running it, and gives you a working tree to hack on):

```bash
git clone https://github.com/brendanfmartin/monday-cli.git
cd monday-cli
./install.sh
```

**Updating:** re-run the same one-liner, or `bash ~/.monday-cli/install.sh`. The script detects an existing checkout, pulls `main`, rebuilds, and re-links.

## Auth

The CLI reads `MONDAY_API_TOKEN` from the shell environment. Export it from whichever shell config file you use — common spots:

- zsh → `~/.zshenv` (recommended; loaded by interactive *and* non-interactive shells) or `~/.zshrc`
- bash → `~/.bashrc` or `~/.bash_profile`

```sh
export MONDAY_API_TOKEN='...'
```

Restart your shell (or `source` the file) after adding it.

## First-time setup

Set up aliases for the boards and groups you use often. Aliases let you type `monday list marketing --group in-progress` instead of memorising numeric IDs.

```bash
monday boards                                    # list active boards on your account
monday config set-board marketing 18412089239    # alias the marketing board
monday config set-group in-progress group_mm347gec
monday config show                               # see what's configured
```

Aliases live in `~/.config/monday-cli/config.json` — edit it directly or via the `config` subcommands. Numeric IDs always work too, so aliases are pure ergonomics.

## Commands

```
monday list <board> [--group <id|alias>] [--limit <n>]
monday lookup <board> <queries...> [--exact] [--group <id|alias>] [--limit <n>]
monday columns <board>
monday boards [--all] [--limit <n>]
monday move <item> <group>
monday update <item> <col=value>... --board <board>
monday create <board> <group> <name> [--col <col=value>]...
monday note <item> "<body>"
monday updates <item>
monday archive <item>
monday delete <item>
monday raw '<graphql>' [--vars '<json>']
monday config show
monday config set-board <name> <id>
monday config set-group <name> <id>
monday config unset-board <name>
monday config unset-group <name>
```

### `lookup` semantics

Default: case-insensitive substring match against item names (pulls a page, filters client-side). `--exact` switches to server-side `items_page_by_column_values` for exact matches. `--group` narrows the substring scan to a single group.

### Column value parsing

In `update` / `create --col`, each `key=value`:

1. Try `JSON.parse(value)`. If it parses, use the parsed value.
2. Otherwise, treat as a raw string.

Examples:
- `status='{"label":"In Progress"}'` → status column with `{label: "In Progress"}`
- `date4='{"date":"2026-05-15"}'` → date column with `{date: ...}`
- `text_col=hello` → raw string `"hello"`
- `numbers_col=42` → number `42`

### Output

Everything goes to stdout as pretty JSON. Errors go to stderr with exit code 1. Pipe to `jq` to slice.

## Examples

Assuming you've aliased `marketing` and `in-progress` per First-time setup:

```bash
monday list marketing --group in-progress
monday columns marketing | jq '.columns'
monday create marketing topics "P0-099" --col 'status={"label":"To Do"}'
monday move 9876543210 in-progress
monday update 9876543210 --board marketing 'status={"label":"In Progress"}'
monday note 9876543210 "Done — see PR #123"
monday raw 'query { me { name email } }'
```

## Dev

```bash
npm run dev -- list marketing --group in-progress   # run from source via tsx
```
