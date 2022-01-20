const { assert } = require("console");
const { getToken } = require("../config");
const request = require("../request");

describe("Github Public Repo", function () {
  this.timeout(0);
  let token = undefined;
  before(async function () {
    token = await getToken();
  });
  it("get() should be ok", async function () {
    const r = await request.post("/get_github_repos", {
      token,
    });
    assert(r.status === 200);
    assert(r.data.length >= 1); // We ensure this user have 1 repo at least.
    // assert important repo property
    assert(r.data[0].id);
    assert(r.data[0].name);
    assert(r.data[0].owner);
  });
});
