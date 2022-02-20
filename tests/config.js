const request = require("./request");

async function getToken() {
  const r = await request.post("get_token_for_test");
  return r.data;
}

async function getDevToken() {
  const r = await request.post("get_developer_token_for_test");
  return r.data;
}

module.exports = {
  getToken,
  getDevToken,
  test_user_id: 37979965,
  test_dev_id: 23449728,
  test_user_login: "sulnong",
  test_org_name: "bytepayment",
  test_repo_name: "bytepaytest",
  test_repo_id: 138711724,
  test_user_polka_address: "5GbNZj4ntEt25oMrZTfpXHfwVQhvJmb8vBX33mj7L7v7P3EK",
  test_recv_address: "5FjiXjMHLNFNn4M6LAhENnKq3qa5wA4uGCd5BFSwEPQJe5vL",
  test_bind_own_address: "5FjiXjMHLNFNn4M6LAhENnKq3qa5wA4uGCd5BFSwEPQJe5vL",
};
