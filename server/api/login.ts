import { eq } from "drizzle-orm";
import { dbClient } from "..";
import bcrypt from "bcryptjs";
import { createFactory } from "hono/factory";
import { zValidator } from "@hono/zod-validator";
import { z } from "@hono/zod-openapi";
import { user, pass } from "drizzle/schema";

const factory = createFactory<Env>();

const generateKey = (): Promise<CryptoKeyPair> =>
  crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );

const importPrivateKey = async (jwk: JsonWebKey): Promise<CryptoKey> => {
  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"],
  );
};

const exportKey = async (key: CryptoKey): Promise<JsonWebKey> => {
  return await crypto.subtle.exportKey("jwk", key);
};

const decrypt = async (key: CryptoKey, encryptedData: BufferSource) => {
  const decryptedData = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    key,
    encryptedData,
  );
  return new TextDecoder().decode(decryptedData);
};

const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const binaryString = atob(str);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};

export const postPass = factory.createHandlers(
  zValidator("json", z.object({ userId: z.number(), pass: z.string() })),
  async (c) => {
    try {
      const params = c.req.valid("json");

      const [userData, passData, privateKeyJson] = await Promise.all([
        dbClient(c.env.DB)
          .select()
          .from(user)
          .where(eq(user.id, params.userId)),
        dbClient(c.env.DB)
          .select()
          .from(pass)
          .where(eq(pass.userId, params.userId)),
        c.env.RSA.get("private_key"),
      ]);

      if (!userData.length || !passData.length || !privateKeyJson) {
        return c.json({ error: "Invalid credentials" }, 401);
      }

      const privateKey = await importPrivateKey(JSON.parse(privateKeyJson));
      const encryptedPassBuffer = stringToArrayBuffer(params.pass);
      const decryptedPassword = await decrypt(privateKey, encryptedPassBuffer);

      const combinedPassword = decryptedPassword + passData[0].pepper;
      const isValid = await bcrypt.compare(combinedPassword, passData[0].pass);

      console.log(isValid, combinedPassword, passData[0].pass);

      return isValid
        ? c.json({ result: "succeed" })
        : c.json({ error: "Invalid credentials" }, 401);
    } catch (error) {
      console.error("Authentication error:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  },
);

export const getKey = factory.createHandlers(
  zValidator("query", z.object({ name: z.string() })),
  async (c) => {
    try {
      const params = c.req.valid("query");

      const userData = await dbClient(c.env.DB)
        .select()
        .from(user)
        .where(eq(user.name, params.name));

      if (!userData.length) {
        return c.json({ error: "User not found" }, 404);
      }

      const keyPair = await generateKey();
      const [publicKeyJwk, privateKeyJwk] = await Promise.all([
        exportKey(keyPair.publicKey),
        exportKey(keyPair.privateKey),
      ]);

      await Promise.all([
        c.env.RSA.put("public_key", JSON.stringify(publicKeyJwk), {
          expirationTtl: 600, // 10分間有効
        }),
        c.env.RSA.put("private_key", JSON.stringify(privateKeyJwk), {
          expirationTtl: 600,
        }),
      ]);

      return c.json({
        id: userData[0].id,
        key: JSON.stringify(publicKeyJwk),
      });
    } catch (error) {
      console.error("Key generation error:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  },
);

export const createUser = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      name: z.string().min(3, "ユーザー名は3文字以上で入力してください"),
      password: z.string().min(6, "パスワードは6文字以上で入力してください"),
      pepper: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { name, password, pepper } = c.req.valid("json");
      console.log(name);

      const existingUser = await dbClient(c.env.DB)
        .select()
        .from(user)
        .where(eq(user.name, name));

      if (existingUser.length > 0) {
        return c.json({ error: "そのユーザー名は既に使用されています" }, 409);
      }

      const res = await dbClient(c.env.DB).insert(user).values({
        name,
        salt: new Date().toISOString(),
      });
      console.log(name, password);
      console.log(res.meta.last_row_id);

      const { id } = (
        await dbClient(c.env.DB).select().from(user).where(eq(user.name, name))
      )[0];

      await dbClient(c.env.DB).insert(pass).values({
        userId: id,
        pass: password,
        pepper,
      });

      return c.json({ message: "ユーザーが正常に作成されました" }, 201);
    } catch (error) {
      console.error("User generation error:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  },
);
