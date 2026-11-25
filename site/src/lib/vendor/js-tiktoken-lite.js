/**
 * Stand-in for `js-tiktoken/lite`.
 *
 * `@joorchin/client-sdk@0.3.x` imports `js-tiktoken` (a lite tokenizer plus the
 * o200k_base rank table) without declaring it as a dependency. ESM resolves that
 * import at load time, so the package cannot be imported at all unless something
 * provides it — and bundling the real package would add ~22 MB of rank tables to
 * a visitor-facing bundle.
 *
 * The SDK only reaches the tokenizer from agent prompt counting, which this site
 * never calls. Fail loudly if that ever changes instead of returning a wrong count.
 */
export class Tiktoken {
  constructor() {
    throw new Error(
      "js-tiktoken is stubbed in this build (see site/src/lib/vendor/js-tiktoken-lite.js): agent prompt counting is unavailable.",
    );
  }
}

export default { Tiktoken };
