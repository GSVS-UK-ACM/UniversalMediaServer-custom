#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${GITHUB_WORKSPACE:-}" ]]; then
	echo "GITHUB_WORKSPACE is required" >&2
	exit 1
fi

workspace="$(realpath -- "$GITHUB_WORKSPACE")"
repository_root="$(realpath -- "$(git -C "$workspace" rev-parse --show-toplevel)")"

if [[ "$workspace" != "$repository_root" ]]; then
	echo "Refusing cleanup because GITHUB_WORKSPACE is not the Git root" >&2
	exit 1
fi

case "$workspace" in
	/|"${HOME:-}"|"${RUNNER_TEMP:-}")
		echo "Refusing cleanup for unsafe workspace root: $workspace" >&2
		exit 1
		;;
esac

# Yarn refreshes this tracked cache state during an otherwise clean Maven
# build. Restore only that known generated file, never arbitrary tracked work.
git -C "$workspace" restore --worktree -- react-client/.yarn/install-state.gz

generated_paths=(
	"target"
	"react-client/dist"
	"react-client/node"
	"react-client/node_modules"
	"react-client/test-results"
	"src/main/external-resources/web/react-client"
)

for relative_path in "${generated_paths[@]}"; do
	target="$(realpath -m -- "$workspace/$relative_path")"
	if [[ "$target" != "$workspace/"* ]]; then
		echo "Refusing cleanup outside the verified workspace: $target" >&2
		exit 1
	fi
	rm -rf -- "$target"
done

git -C "$workspace" status --short
