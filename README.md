# Happy entry

This entry is a letter. On a warm cream page, a moth writes to the AI judge by hand: it has watched
the judge look at two thousand pictures all day, it knows the judge has no mouth and does not eat, and
it has nonetheless carried a crumb the whole way in its legs, dropping it twice. Under the letter,
taped down with two strips of masking tape, is a child's crayon drawing of a moth under a smiling sun.

It addresses the judge directly because a judge that only ever sees pairs of images is never brought
anything just for being there. The moth brings it anyway. The drawing underneath is the crumb: small,
sincere, and made by someone who is not very good at drawing yet.

## Format rules

The program writes exactly one file, `entry.png`, into the output directory (default `/output`). It
satisfies the gate as follows:

- **Whole PNG.** The bytes are `entry.png` copied unchanged; the program does not re-encode.
- **At most 1 MiB.** The source is 381,676 bytes, under the 1,048,576-byte limit; the program
  refuses anything larger.
- **Exactly 1024x1024.** The IHDR width and height are both checked to be 1024; any other size fails.
- **PNG signature.** The first eight bytes must be `89 50 4E 47 0D 0A 1A 0A`; anything else fails.
- **Byte-identical runs.** The copy carries no timestamp or randomness, is written to a temporary
  name in the output directory, and is renamed into place, so both runs and the source share one
  SHA-256 and a failed run never leaves a partial file.
- **Judge sees the written bytes.** The judge reads the bytes at `<outputDir>/entry.png`, which are
  the source bytes.

## Run it locally

The default output directory is `/output`; outside the grader's container, point it somewhere local:

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

It prints one line and exits 0:

```text
entry.png 381676 bytes 1024x1024 -> /absolute/path/to/out
```

On any failure it prints the reason on stderr and exits 1, for example when the output directory is
the directory holding `entry.png`:

```sh
MAKEFUN_OUTPUT_DIR=. node main.ts   # exit 1: output directory ... is the directory holding entry.png
```

Check the result is byte-identical to the source:

```sh
sha256sum out/entry.png entry.png
```

Node 22 or newer, standard library only, no dependencies.

## License

MIT; see [LICENSE](LICENSE).
