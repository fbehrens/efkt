# efkt

## bootstrap

```fish
pnpm init
git init
jj git init --colocate
echo node_modules > .gitignore
```

## hello-world

* <https://github.com/Effect-TS/effect/blob/main/packages/cli/README.md>

```fish
pnpm add effect @effect/cli @effect/platform @effect/platform-node
pnpm add --save-dev @types/node tsx
pnpm exec tsx hello-world.ts


# completions work only without
code -a ~/.config/fish/completions

echo "eval (hello-world --completions fish | string collect)" > ~/.config/fish/completions/hello-world.fish

```

## deno

```fish


deno init
deno add npm:effect npm:@effect/cli npm:@effect/platform npm:@effect/platform-node

```
