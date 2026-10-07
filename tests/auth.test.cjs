const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, dependencies, extra = "") {
  const output = ts.transpileModule(fs.readFileSync(file, "utf8") + extra, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    require: (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected import ${name}`);
      return dependencies[name];
    },
    process: { env: {} },
    URL,
    URLSearchParams,
  });
  return exports;
}

function auth(client) {
  return load("src/lib/auth.ts", {
    "@/lib/supabase": { getSupabase: () => client },
    "expo-linking": {},
    "expo-web-browser": {},
    "react-native": { Platform: { OS: "ios" } },
  });
}

test("email and password validation reject invalid input without modifying passwords", () => {
  const api = auth({});
  assert.equal(api.normalizeEmail(" USER@example.com "), "user@example.com");
  assert.throws(() => api.normalizeEmail("not-an-email"));
  assert.throws(() => api.validatePassword("short", "short"));
  assert.throws(() =>
    api.validatePassword("long-password", "different-password"),
  );
  api.validatePassword("long-password", "long-password");
  api.validatePassword("abcdef", "abcdef");
  api.validatePassword("123456", "123456");
});

test("callbacks reject errors and incomplete sessions; duplicate callbacks create one session", async () => {
  let calls = 0;
  const api = auth({
    auth: {
      setSession: async (values) => {
        calls++;
        assert.deepEqual(JSON.parse(JSON.stringify(values)), {
          access_token: "access",
          refresh_token: "refresh",
        });
        return { error: null };
      },
    },
  });
  await assert.rejects(
    api.completeAuthUrl("fooddelivery://auth-callback#error=access_denied"),
  );
  await assert.rejects(
    api.completeAuthUrl("fooddelivery://auth-callback#access_token=access"),
  );
  const url =
    "fooddelivery://auth-callback#access_token=access&refresh_token=refresh&type=recovery";
  assert.equal(await api.completeAuthUrl(url), true);
  assert.equal(await api.completeAuthUrl(url), true);
  assert.equal(calls, 1);
});

test("native storage round-trips large Unicode sessions and removes obsolete chunks", async () => {
  const values = new Map();
  const api = load(
    "src/lib/supabase.ts",
    {
      "react-native-url-polyfill/auto": {},
      "@supabase/supabase-js": {},
      "react-native": { Platform: { OS: "ios" } },
      "expo-secure-store": {
        getItemAsync: async (key) => values.get(key) ?? null,
        setItemAsync: async (key, value) => {
          assert.ok(Buffer.byteLength(value) <= 1800);
          values.set(key, value);
        },
        deleteItemAsync: async (key) => {
          values.delete(key);
        },
      },
    },
    "\nexport { storage as testStorage };",
  );
  const storage = api.testStorage;
  const session = JSON.stringify({
    token: "x".repeat(12000),
    name: "বাংলা 🍔",
  });
  assert.equal(await storage.getItem("auth"), null);
  await storage.setItem("auth", session);
  assert.equal(await storage.getItem("auth"), session);
  await storage.setItem("auth", "small");
  assert.equal(await storage.getItem("auth"), "small");
  assert.equal(values.size, 2);
  await storage.removeItem("auth");
  assert.equal(await storage.getItem("auth"), null);
  assert.equal(values.size, 0);
});
