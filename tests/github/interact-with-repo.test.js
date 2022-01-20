const assert = require("assert");
const { getToken, test_user_id } = require("../config");
const request = require("../request");

/**
 * Binded Repo: This term means user authorize bytepay to add a webhook on his repo,
 * so we can listen issue comment event, and create task, apply task, pay task depends
 * on comment content.
 *
 * In this case, we will fetch all user public repo at first, then fetch all binded repo
 * in bytepay database, so we can decide which repo to bind or unbind.
 */

describe("Interact With Repo", function () {
  this.timeout(0);
  let userinfo = undefined;
  let bindedRepos = [];
  let allRepos = [];
  let optRepo = undefined;
  let token = undefined;
  before(async function () {
    token = await getToken();
  });
  it("userinfo:get() should be ok", async function () {
    const r = await request.post("/get_github_user_info", {
      token,
    });
    userinfo = r.data;
    assert(r.status === 200);
    assert(r.data.id === test_user_id);
  }).timeout(0);

  it("binded-repos:get() should be ok", async function () {
    const r = await request.post("/get_binded_repos", { id: userinfo.id });
    bindedRepos = r.data;
    assert(r.status === 200);
    assert(Array.isArray(r.data));
  }).timeout(0);

  it("all-repos:get() should be ok", async function () {
    const r = await request.post("/get_github_repos", {
      token,
    });
    assert(r.status === 200);
    assert(Array.isArray(r.data));
    allRepos = r.data.filter((item) => item.owner.id === userinfo.id);
  }).timeout(0);

  it("unbind a binded repo should be ok", async function () {
    // Select a bind repo
    optRepo = bindedRepos[0];
    // Unbind this binded repo
    const r = await request.post("/unbind_github_repo", {
      token,
      repo_id: optRepo.meta.id,
    });
    assert(r.data.error === 0);
  });

  it("bind a unbind repo should be ok", async function () {
    const r = await request.post("bind_github_repo", {
      token,
      owner_name: userinfo.login,
      repo_name: optRepo.meta.name,
      owner_id: userinfo.id,
      repo_id: optRepo.meta.id,
      meta: optRepo.meta,
    });
    assert(r.status === 200);
    assert(r.data.error === 0);
  });
});
