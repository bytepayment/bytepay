const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const mongodb = require("mongodb");

class FunctionLoader {
  rootPath = path.join(__dirname, "functions");

  /**
   * Get directory list of functions
   * @returns {string[]}
   */
  getFunctionDirectoryList() {
    const dirs = fs.readdirSync(this.rootPath);
    return dirs ?? [];
  }

  /**
   * Load functions
   * @returns {Promise<any[]>}
   */
  getFunctions() {
    const dirs = this.getFunctionDirectoryList();
    const funcPaths = dirs.map((dir) => path.join(this.rootPath, dir));
    const results = [];
    for (const fp of funcPaths) {
      const r = this.loadFunction(fp);
      results.push(r);
    }
    return results;
  }

  /**
   * Load a function
   * @param {string}} func_path
   * @returns
   */
  loadFunction(func_path) {
    const codePath = path.join(func_path, "index.ts");
    const code = this.loadFunctionCode(codePath);

    const metaPath = path.join(func_path, "meta.json");
    const func = this.loadFunctionMeta(metaPath);
    const data = {
      name: func.name,
      code: code,
      label: func.label || func.name,
      hash: func.hash,
      tags: func.tags || [],
      description: func.description || "",
      enableHTTP: func.enableHTTP || false,
      status: func.status || 0,
      triggers: func.triggers,
      debugParams: func.debugParams,
      version: func.version || 0,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: undefined,
      compiledCode: this.compileTs2js(code),
      appid: undefined,
      _id: undefined,
    };
    return data;
  }

  /**
   * Load function's code
   * @param {Promise<string>} file_path
   */
  loadFunctionCode(file_path) {
    const data = fs.readFileSync(file_path, "utf-8");
    return data;
  }

  /**
   * Load meta of function
   * @param {string} file_path
   */
  loadFunctionMeta(file_path) {
    const data = fs.readFileSync(file_path, "utf-8");
    return JSON.parse(data);
  }

  compileTs2js(source) {
    const jscode = ts.transpile(source, {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2017,
      removeComments: true,
    });

    return jscode;
  }
}

async function save(data) {
  const db_uri = process.env.DB_URI;
  const conn = new mongodb.MongoClient(db_uri);
  await conn.connect();
  const db = conn.db();

  const res = await db.collection("__published__functions").insertMany(data);

  return res;
}

async function main() {
  // load functions
  const loader = new FunctionLoader();
  const functions = loader.getFunctions();

  // save to db
  const res = await save(functions);
  console.log(res);
  return 0
}

main()
  .then(code => {
    process.exit(code)
  })
  .catch(err => {
    logger.error(err)
    process.exit(2)
  })