const assert = require("assert");
const generator = require("project-name-generator");
const {
  getToken,
  getDevToken,
  test_user_id,
  test_org_name,
  test_repo_name,
} = require("../config");
const axios = require("axios");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * For This Test Workflow, we will do following things
 * 1. Create an issue in test repo: sulnong/DotpayTest.
 * 2. Use our test account sulnong to create an task in issue just created above.
 * 3. Use our test developer account to apply this task.
 * 4. Use our test developer account to finish this task.
 * 5. Task owner paid for this task.
 * Note: test developer has already bind his own polka account.
 */

describe("Interact With Repo", function () {
  this.timeout(0);
  let token = undefined;
  let dev_token = undefined;
  let createIssue = undefined;
  before(async function () {
    token = await getToken();
    dev_token = await getDevToken();
  });
  it("Issue:create() should be ok", async function () {
    const r = await axios({
      url: `https://api.github.com/repos/${test_org_name}/${test_repo_name}/issues`,
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        title: `Test Issue By Bytepay: ${generator().spaced}`,
        body: "This issue is for bytepay test",
      },
    });
    assert(r.status === 201);
    createIssue = r.data;
    assert(createIssue.hasOwnProperty("id"));
    assert(createIssue.hasOwnProperty("number"));
    assert(createIssue.hasOwnProperty("title"));
    assert(createIssue.hasOwnProperty("body"));
  });

  it("Task:create() sould be ok", async function () {
    await sleep(2000); // sleep 2 seconds
    const url = `https://api.github.com/repos/${test_org_name}/${test_repo_name}/issues/${createIssue.number}/comments`;
    const r = await axios({
      url,
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        body: "/bytepay task 0.001DOT",
      },
    });
    assert(r.status === 201);
    result = r.data;
    assert(result.body === "/bytepay task 0.001DOT");
  });

  it("Task:apply() should be ok", async function () {
    await sleep(2000); // sleep 2 seconds
    const url = `https://api.github.com/repos/${test_org_name}/${test_repo_name}/issues/${createIssue.number}/comments`;
    const r = await axios({
      url,
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${dev_token}`,
      },
      data: {
        body: "/bytepay apply",
      },
    });
    assert(r.status === 201);
    result = r.data;
    assert(result.body === "/bytepay apply");
  });

  it("Task:bind() should be ok", async function () {
    await sleep(2000); // sleep 2 seconds
    const url = `https://api.github.com/repos/${test_org_name}/${test_repo_name}/issues/${createIssue.number}/comments`;
    const r = await axios({
      url,
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${dev_token}`,
      },
      data: {
        body: "/bytepay bind 5FjiXjMHLNFNn4M6LAhENnKq3qa5wA4uGCd5BFSwEPQJe5vL",
      },
    });
    assert(r.status === 201);
    result = r.data;
    assert(result.body === "/bytepay bind 5FjiXjMHLNFNn4M6LAhENnKq3qa5wA4uGCd5BFSwEPQJe5vL");
  });

  it("Task:pay() should be ok", async function () {
    await sleep(2000); // sleep 2 seconds
    const url = `https://api.github.com/repos/${test_org_name}/${test_repo_name}/issues/${createIssue.number}/comments`;
    const r = await axios({
      url,
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        body: "/bytepay pay",
      },
    });
    assert(r.status === 201);
    result = r.data;
    assert(result.body === "/bytepay pay");
  });

  it("Task:check() should be ok", async function () {
    setTimeout(() => {
      console.log(
        `Please visit https://github.com/${test_org_name}/${test_repo_name}/issues/${createIssue.number} check this full workflow...`
      );
    }, 2000);
  });
});
