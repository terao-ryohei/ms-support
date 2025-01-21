type Env = {
  Bindings: {
    DB: D1Database;
    R2: R2Bucket;
    RSA: KVNamespace;
  };
  Variables: {
    MY_VAR_IN_VARIABLES: string;
  };
};
